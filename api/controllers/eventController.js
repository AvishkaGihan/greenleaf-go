import ConservationEvent from "../models/ConservationEvent.js";
import EventRSVP from "../models/EventRSVP.js";
import UserActivity from "../models/UserActivity.js";
import User from "../models/User.js";
import { AppError } from "../utils/errorHandler.js";
import { calculateDistance } from "../services/geoService.js";
import { checkAndAwardBadges } from "../services/badgeService.js";
import {
  notifyEventApproved,
  notifyEventRejected,
  notifyAdminsNewEventSubmission,
} from "../services/notificationService.js";

export const getEvents = async (req, res, next) => {
  try {
    console.log("🔍 getEvents called (public endpoint)");
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

    const query = { isActive: true, status: "approved" };
    console.log("🔍 Public getEvents query:", JSON.stringify(query, null, 2));

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

    console.log("📊 Events found:", events.length);

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
    let userId = req.user._id;

    // If admin is canceling a specific RSVP, allow it
    if (req.user.role === "admin" && req.body.rsvpId) {
      const rsvp = await EventRSVP.findById(req.body.rsvpId);
      if (!rsvp) {
        throw new AppError("RSVP not found", 404, "NOT_FOUND");
      }
      userId = rsvp.userId;
    }

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

// Admin functions
export const updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    // Add location if coordinates provided
    if (updateData.latitude && updateData.longitude) {
      updateData.location = {
        type: "Point",
        coordinates: [
          parseFloat(updateData.longitude),
          parseFloat(updateData.latitude),
        ],
      };
    }

    const event = await ConservationEvent.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    const event = await ConservationEvent.findByIdAndUpdate(
      eventId,
      { isActive: false },
      { new: true }
    );

    if (!event) {
      throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const approveEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    const event = await ConservationEvent.findByIdAndUpdate(
      eventId,
      {
        status: "approved",
        approvedBy: req.user._id,
        approvalDate: new Date(),
      },
      { new: true }
    ).populate("submittedBy", "firstName lastName email");

    if (!event) {
      throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    // Send notification to submitter about approval
    await notifyEventApproved(event);

    res.json({
      success: true,
      message: "Event approved successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// New endpoints for event submission workflow

export const submitEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      submittedBy: req.user._id,
      createdBy: req.user._id,
      status: "pending",
      isApproved: false,
      isActive: true,
    };

    // Debug: Log the location data being received
    console.log(
      "Received location data:",
      JSON.stringify(eventData.location, null, 2)
    );

    // Remove location field entirely if no proper coordinates are provided
    // This prevents MongoDB geo indexing errors when coordinates are missing
    if (
      eventData.location &&
      (!eventData.location.coordinates ||
        !Array.isArray(eventData.location.coordinates) ||
        eventData.location.coordinates.length !== 2 ||
        eventData.location.coordinates.some(
          (coord) => typeof coord !== "number"
        ))
    ) {
      console.log("Removing invalid location data");
      delete eventData.location;
    }

    // Also delete location if it only has type but no coordinates
    if (eventData.location && !eventData.location.coordinates) {
      console.log("Removing location with no coordinates");
      delete eventData.location;
    }

    console.log(
      "Final location data:",
      JSON.stringify(eventData.location, null, 2)
    );

    const event = new ConservationEvent(eventData);
    await event.save();

    await event.populate("submittedBy", "firstName lastName email");

    // Log user activity
    await UserActivity.create({
      userId: req.user._id,
      activityType: "event_submission",
      details: {
        eventId: event._id,
        eventTitle: event.title,
      },
    });

    // Notify admins about new event submission
    await notifyAdminsNewEventSubmission(event);

    res.status(201).json({
      success: true,
      message: "Event submitted successfully for admin approval",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const events = await ConservationEvent.find({
      status: "pending",
      isActive: true,
    })
      .populate("submittedBy", "firstName lastName email")
      .sort({ submissionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ConservationEvent.countDocuments({
      status: "pending",
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { reason } = req.body;

    const event = await ConservationEvent.findByIdAndUpdate(
      eventId,
      {
        status: "rejected",
        rejectionReason: reason,
        approvedBy: req.user._id,
        approvalDate: new Date(),
      },
      { new: true }
    ).populate("submittedBy", "firstName lastName email");

    if (!event) {
      throw new AppError("Event not found", 404, "NOT_FOUND");
    }

    // Send notification to submitter about rejection
    await notifyEventRejected(event);

    res.json({
      success: true,
      message: "Event rejected successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const getVolunteerEvents = async (req, res, next) => {
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

    const query = {
      isActive: true,
      status: "approved",
      startDate: { $gte: new Date() }, // Only future events
    };

    // Build query (same as getEvents but only approved events)
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
      .populate("submittedBy", "firstName lastName")
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

    // Add RSVP status and available spots
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
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    console.log("🔍 getAllEvents called by admin:", req.user?.email);

    // First, let's check total events in database
    const totalEventsInDB = await ConservationEvent.countDocuments({});
    console.log("📊 Total events in database (all):", totalEventsInDB);

    const approvedEvents = await ConservationEvent.countDocuments({
      status: "approved",
    });
    console.log("📊 Approved events in database:", approvedEvents);

    const pendingEvents = await ConservationEvent.countDocuments({
      status: "pending",
    });
    console.log("📊 Pending events in database:", pendingEvents);

    const { page = 1, limit = 20, status, eventType, search } = req.query;
    console.log("📋 Query parameters:", {
      page,
      limit,
      status,
      eventType,
      search,
    });

    const skip = (page - 1) * limit;

    // Build query - get ALL events for admin management
    const query = { isActive: true };
    console.log("🔍 Base query:", query);

    if (status && status !== "all") {
      query.status = status;
    }

    if (eventType && eventType !== "all") {
      query.eventType = eventType;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
        { organizerName: new RegExp(search, "i") },
      ];
    }

    console.log("🔍 Final query:", JSON.stringify(query, null, 2));

    const events = await ConservationEvent.find(query)
      .populate("submittedBy", "firstName lastName email")
      .populate("approvedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("📊 Found events count:", events.length);
    if (events.length > 0) {
      console.log("📋 First event sample:", {
        id: events[0]._id,
        title: events[0].title,
        status: events[0].status,
        isActive: events[0].isActive,
        startDate: events[0].startDate,
      });
    }

    const total = await ConservationEvent.countDocuments(query);
    console.log("📊 Total events in database:", total);

    const response = {
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    console.log("✅ Sending response with", events.length, "events");
    res.json(response);
  } catch (error) {
    console.error("❌ getAllEvents error:", error);
    next(error);
  }
};

export const debugEvents = async (req, res, next) => {
  try {
    console.log("🔍 Debug: Checking events in database");

    const allEvents = await ConservationEvent.find({}).limit(5);
    console.log(
      "📊 Debug: Sample events from DB:",
      allEvents.map((e) => ({
        id: e._id,
        title: e.title,
        status: e.status,
        isActive: e.isActive,
        startDate: e.startDate,
      }))
    );

    const totalCount = await ConservationEvent.countDocuments({});
    const approvedCount = await ConservationEvent.countDocuments({
      status: "approved",
    });
    const pendingCount = await ConservationEvent.countDocuments({
      status: "pending",
    });
    const activeCount = await ConservationEvent.countDocuments({
      isActive: true,
    });

    res.json({
      success: true,
      debug: {
        totalEvents: totalCount,
        approvedEvents: approvedCount,
        pendingEvents: pendingCount,
        activeEvents: activeCount,
        sampleEvents: allEvents,
      },
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
