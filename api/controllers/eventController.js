import ConservationEvent from "../models/ConservationEvent.js";
import EventRSVP from "../models/EventRSVP.js";
import UserActivity from "../models/UserActivity.js";
import User from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";
import { calculateDistance } from "../services/geoService.js";
import { checkAndAwardBadges } from "../services/badgeService.js";

export const getEvents = async (req, res, next) => {
  try {
    const {
      city,
      country,
      latitude,
      longitude,
      radius = 50,
      event_type,
      start_date,
      end_date,
      difficulty_level,
      available_spots,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true, isApproved: true };

    // Build query
    if (city) query.city = new RegExp(city, "i");
    if (country) query.country = new RegExp(country, "i");
    if (event_type) query.eventType = event_type;
    if (difficulty_level) query.difficultyLevel = difficulty_level;

    // Date filtering
    if (start_date) {
      query.startDate = { $gte: new Date(start_date) };
    }
    if (end_date) {
      query.endDate = { $lte: new Date(end_date) };
    }

    const skip = (page - 1) * limit;

    let events = await ConservationEvent.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Calculate distances if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const searchRadius = parseFloat(radius);

      events = events
        .map((event) => {
          if (event.location && event.location.coordinates) {
            const [lng, lat] = event.location.coordinates;
            const distance = calculateDistance(userLat, userLng, lat, lng);
            return { ...event, distance };
          }
          return { ...event, distance: null };
        })
        .filter((event) => !searchRadius || event.distance <= searchRadius);
    }

    // Add user RSVP status and available spots
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        const rsvpCount = await EventRSVP.countDocuments({
          eventId: event._id,
          status: "registered",
        });

        const availableSpots = event.maxParticipants - rsvpCount;
        let userRsvpStatus = null;

        if (req.user) {
          const userRsvp = await EventRSVP.findOne({
            eventId: event._id,
            userId: req.user._id,
          });
          userRsvpStatus = userRsvp?.status || null;
        }

        return {
          ...event,
          availableSpots,
          userRsvpStatus,
        };
      })
    );

    // Filter by available spots if requested
    let filteredEvents = eventsWithDetails;
    if (available_spots === "true") {
      filteredEvents = eventsWithDetails.filter(
        (event) => event.availableSpots > 0
      );
    }

    const total = await ConservationEvent.countDocuments(query);

    res.json({
      success: true,
      data: {
        events: filteredEvents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await ConservationEvent.findById(req.params.id);

    if (!event || !event.isActive) {
      throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    const rsvpCount = await EventRSVP.countDocuments({
      eventId: event._id,
      status: "registered",
    });

    let userRsvp = null;
    if (req.user) {
      userRsvp = await EventRSVP.findOne({
        eventId: event._id,
        userId: req.user._id,
      });
    }

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        availableSpots: event.maxParticipants - rsvpCount,
        userRsvpStatus: userRsvp?.status || null,
        userRsvpData: userRsvp || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const eventData = req.body;

    // Add location if coordinates provided
    if (eventData.latitude && eventData.longitude) {
      eventData.location = {
        type: "Point",
        coordinates: [
          parseFloat(eventData.longitude),
          parseFloat(eventData.latitude),
        ],
      };
    }

    const event = new ConservationEvent({
      ...eventData,
      createdBy: req.user._id,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const rsvpEvent = async (req, res, next) => {
  try {
    const {
      emergencyContactName,
      emergencyContactPhone,
      dietaryRestrictions,
      specialRequirements,
    } = req.body;
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await ConservationEvent.findById(eventId);
    if (!event || !event.isActive || !event.isApproved) {
      throw new AppError("Event not found or not available", 404, "NOT_FOUND");
    }

    // Check if event is full
    const rsvpCount = await EventRSVP.countDocuments({
      eventId,
      status: "registered",
    });

    if (rsvpCount >= event.maxParticipants) {
      throw new AppError("Event is full", 400, "RESOURCE_CONFLICT");
    }

    // Check if user already RSVP'd
    const existingRsvp = await EventRSVP.findOne({ eventId, userId });
    if (existingRsvp) {
      throw new AppError(
        "You have already RSVP'd for this event",
        400,
        "RESOURCE_CONFLICT"
      );
    }

    const rsvp = new EventRSVP({
      eventId,
      userId,
      emergencyContactName,
      emergencyContactPhone,
      dietaryRestrictions,
      specialRequirements,
      status: "registered",
    });

    await rsvp.save();

    // Log user activity
    const activity = new UserActivity({
      userId,
      activityType: "event_rsvp",
      pointsEarned: 0, // Points earned when attending, not RSVPing
      eventId,
      metadata: { eventTitle: event.title },
    });
    await activity.save();

    res.status(201).json({
      success: true,
      message: "Successfully registered for the event",
      data: {
        rsvpId: rsvp._id,
        status: rsvp.status,
        confirmationCode: `EVT-${rsvp._id.toString().slice(-6).toUpperCase()}`,
        ecoPointsEarned: 0,
        ecoPointsPotential: event.ecoPointsReward,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRsvp = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const rsvp = await EventRSVP.findOneAndUpdate(
      { eventId, userId },
      { status: "cancelled" },
      { new: true }
    );

    if (!rsvp) {
      throw new AppError("RSVP not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "RSVP cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const checkInEvent = async (req, res, next) => {
  try {
    const { confirmation_code } = req.body;
    const eventId = req.params.id;
    const userId = req.user._id;

    const rsvp = await EventRSVP.findOne({
      eventId,
      userId,
      status: "registered",
    });

    if (!rsvp) {
      throw new AppError(
        "No active registration found for this event",
        404,
        "NOT_FOUND"
      );
    }

    // Simple confirmation code check (in real app, use proper verification)
    const expectedCode = `EVT-${rsvp._id.toString().slice(-6).toUpperCase()}`;
    if (confirmation_code !== expectedCode) {
      throw new AppError("Invalid confirmation code", 400, "VALIDATION_ERROR");
    }

    rsvp.checkedInAt = new Date();
    rsvp.checkedInBy = userId;
    await rsvp.save();

    const event = await ConservationEvent.findById(eventId);

    // Award eco points
    const userActivity = new UserActivity({
      userId,
      activityType: "event_attended",
      pointsEarned: event.ecoPointsReward,
      eventId,
      metadata: {
        eventTitle: event.title,
        pointsAwarded: event.ecoPointsReward,
      },
    });
    await userActivity.save();

    // Update user's total points
    await User.findByIdAndUpdate(userId, {
      $inc: { totalEcoPoints: event.ecoPointsReward },
    });

    // Check and award badges
    await checkAndAwardBadges(userId, "event_attended");

    res.json({
      success: true,
      message: "Check-in successful",
      data: {
        ecoPointsEarned: event.ecoPointsReward,
        badgesUnlocked: [], // Badge notifications are handled separately
      },
    });
  } catch (error) {
    next(error);
  }
};
