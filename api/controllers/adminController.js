import User from "../models/User.js";
import Accommodation from "../models/Accommodation.js";
import Restaurant from "../models/Restaurant.js";
import ConservationEvent from "../models/ConservationEvent.js";
import Review from "../models/Review.js";
import EcoBadge from "../models/EcoBadge.js";
import AdminLog from "../models/AdminLog.js";
import EventRSVP from "../models/EventRSVP.js";
import Itinerary from "../models/Itinerary.js";
import ItineraryItem from "../models/ItineraryItem.js";
import UserActivity from "../models/UserActivity.js";
import UserBadge from "../models/UserBadge.js";
import { AppError } from "../utils/errorHandler.js";

// Dashboard Analytics
export const getDashboard = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalAccommodations,
      totalRestaurants,
      totalEvents,
      activeEvents,
      totalRsvps,
      totalItineraries,
      totalReviews,
      recentRegistrations,
    ] = await Promise.all([
      User.countDocuments(),
      Accommodation.countDocuments({ isActive: true }),
      Restaurant.countDocuments({ isActive: true }),
      ConservationEvent.countDocuments(),
      ConservationEvent.countDocuments({
        isActive: true,
        isApproved: true,
        endDate: { $gte: new Date() },
      }),
      EventRSVP.countDocuments(),
      Itinerary.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalAccommodations,
          totalRestaurants,
          totalEvents,
          activeEvents,
          totalRsvps,
          totalItineraries,
          totalReviews,
        },
        recentActivities: [
          {
            type: "user_registration",
            count: recentRegistrations,
            date: new Date().toISOString().split("T")[0],
          },
        ],
        topEvents: await ConservationEvent.find({ isActive: true })
          .sort({ currentParticipants: -1 })
          .limit(5)
          .select("title currentParticipants startDate"),
      },
    });
  } catch (error) {
    next(error);
  }
};

// User Management
export const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      eco_level,
      is_active,
      registration_date_from,
      registration_date_to,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { email: new RegExp(search, "i") },
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
      ];
    }
    if (eco_level) query.ecoLevel = parseInt(eco_level);
    if (is_active !== undefined) query.isActive = is_active === "true";
    if (registration_date_from || registration_date_to) {
      query.createdAt = {};
      if (registration_date_from)
        query.createdAt.$gte = new Date(registration_date_from);
      if (registration_date_to)
        query.createdAt.$lte = new Date(registration_date_to);
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    // Get user statistics
    const [
      eventsAttended,
      eventsRsvped,
      reviewsWritten,
      itinerariesCreated,
      badgesEarned,
      totalActivityPoints,
      recentActivities,
    ] = await Promise.all([
      UserActivity.countDocuments({
        userId: user._id,
        activityType: "event_attended",
      }),
      EventRSVP.countDocuments({ userId: user._id }),
      Review.countDocuments({ userId: user._id }),
      Itinerary.countDocuments({ userId: user._id }),
      UserBadge.countDocuments({ userId: user._id }),
      UserActivity.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: "$pointsEarned" } } },
      ]),
      UserActivity.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("eventId", "title")
        .populate("accommodationId", "name")
        .populate("restaurantId", "name"),
    ]);

    res.json({
      success: true,
      data: {
        user,
        statistics: {
          eventsAttended,
          eventsRsvped,
          reviewsWritten,
          itinerariesCreated,
          badgesEarned,
          totalActivityPoints: totalActivityPoints[0]?.total || 0,
        },
        recentActivities: recentActivities.map((activity) => ({
          activityType: activity.activityType,
          pointsEarned: activity.pointsEarned,
          eventTitle: activity.eventId?.title,
          accommodationName: activity.accommodationId?.name,
          restaurantName: activity.restaurantId?.name,
          createdAt: activity.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const { reason, duration_days } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        suspensionReason: reason,
        suspensionEnd: duration_days
          ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000)
          : null,
      },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "User suspended successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: true,
        suspensionReason: null,
        suspensionEnd: null,
      },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "User activated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Content Moderation
export const getReviews = async (req, res, next) => {
  try {
    const { status, entity_type, rating, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.isApproved = status === "approved";
    if (status === "flagged") query.isFlagged = true;
    if (entity_type) query.reviewType = entity_type;
    if (rating) query.rating = parseInt(rating);

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate("userId", "firstName email")
      .populate("accommodationId", "name")
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
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

export const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        isFlagged: false,
        moderatedBy: req.user._id,
        moderationNotes: "Approved by admin",
      },
      { new: true }
    );

    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Review approved successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectReview = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        moderatedBy: req.user._id,
        moderationNotes: reason || "Rejected by admin",
      },
      { new: true }
    );

    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Review rejected successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const flagReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isFlagged: true,
        moderatedBy: req.user._id,
      },
      { new: true }
    );

    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Review flagged successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Itinerary Management
export const getItineraries = async (req, res, next) => {
  try {
    const {
      search,
      status,
      duration,
      eco_rating_min,
      eco_rating_max,
      date_from,
      date_to,
      page = 1,
      limit = 20,
      sort_by = "createdAt",
      sort_order = "desc",
    } = req.query;

    const query = { isActive: true };

    // Search by title or destination
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { destination: new RegExp(search, "i") },
      ];
    }

    // Filter by status
    if (status) {
      const now = new Date();
      switch (status) {
        case "active":
          query.startDate = { $gte: now };
          break;
        case "completed":
          query.endDate = { $lt: now };
          break;
        case "ongoing":
          query.startDate = { $lte: now };
          query.endDate = { $gte: now };
          break;
      }
    }

    // Filter by duration
    if (duration) {
      switch (duration) {
        case "short":
          query.duration = { $lte: 3 };
          break;
        case "medium":
          query.duration = { $gte: 4, $lte: 7 };
          break;
        case "long":
          query.duration = { $gte: 8 };
          break;
      }
    }

    // Filter by eco rating
    if (eco_rating_min || eco_rating_max) {
      query.averageEcoRating = {};
      if (eco_rating_min)
        query.averageEcoRating.$gte = parseFloat(eco_rating_min);
      if (eco_rating_max)
        query.averageEcoRating.$lte = parseFloat(eco_rating_max);
    }

    // Filter by date range
    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) query.createdAt.$gte = new Date(date_from);
      if (date_to) query.createdAt.$lte = new Date(date_to);
    }

    const skip = (page - 1) * limit;
    const sortOrder = sort_order === "desc" ? -1 : 1;
    const sortObj = { [sort_by]: sortOrder };

    const [itineraries, total] = await Promise.all([
      Itinerary.find(query)
        .populate("userId", "firstName lastName email ecoLevel")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Itinerary.countDocuments(query),
    ]);

    // Calculate summary for each itinerary
    const itinerariesWithSummary = await Promise.all(
      itineraries.map(async (itinerary) => {
        const items = await ItineraryItem.find({
          itineraryId: itinerary._id,
        });

        const summary = {
          totalItems: items.length,
          totalEstimatedCost: items.reduce(
            (sum, item) => sum + (item.estimatedCost || 0),
            0
          ),
          accommodations: items.filter(
            (item) => item.itemType === "accommodation"
          ).length,
          restaurants: items.filter((item) => item.itemType === "restaurant")
            .length,
          activities: items.filter((item) => item.itemType === "activity")
            .length,
          events: items.filter((item) => item.itemType === "event").length,
        };

        return {
          ...itinerary,
          summary,
        };
      })
    );

    res.json({
      success: true,
      data: {
        itineraries: itinerariesWithSummary,
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

export const getItineraryDetails = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate("userId", "firstName lastName email ecoLevel profilePicture")
      .lean();

    if (!itinerary) {
      throw new AppError("Itinerary not found", 404, "NOT_FOUND");
    }

    const items = await ItineraryItem.find({ itineraryId: itinerary._id })
      .sort({ dayNumber: 1, sortOrder: 1 })
      .populate("accommodationId", "name ecoRating priceRange location")
      .populate(
        "restaurantId",
        "name ecoRating cuisineType priceRange location"
      )
      .populate(
        "conservationEventId",
        "title eventType ecoPointsReward location"
      )
      .lean();

    // Calculate detailed summary
    const summary = {
      totalDays: Math.max(...items.map((item) => item.dayNumber), 0),
      totalItems: items.length,
      totalEstimatedCost: items.reduce(
        (sum, item) => sum + (item.estimatedCost || 0),
        0
      ),
      accommodations: items.filter((item) => item.itemType === "accommodation")
        .length,
      restaurants: items.filter((item) => item.itemType === "restaurant")
        .length,
      activities: items.filter((item) => item.itemType === "activity").length,
      events: items.filter((item) => item.itemType === "event").length,
      averageEcoRating:
        items.length > 0
          ? items.reduce((sum, item) => {
              let ecoRating = 0;
              if (item.accommodationId?.ecoRating)
                ecoRating = item.accommodationId.ecoRating;
              if (item.restaurantId?.ecoRating)
                ecoRating = item.restaurantId.ecoRating;
              return sum + ecoRating;
            }, 0) /
            items.filter(
              (item) =>
                item.accommodationId?.ecoRating || item.restaurantId?.ecoRating
            ).length
          : 0,
    };

    // Get user's other itineraries count
    const userItinerariesCount = await Itinerary.countDocuments({
      userId: itinerary.userId._id,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        ...itinerary,
        items,
        summary,
        userItinerariesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const moderateItinerary = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const itineraryId = req.params.id;

    const allowedActions = ["approve", "flag", "hide", "delete"];
    if (!allowedActions.includes(action)) {
      throw new AppError("Invalid moderation action", 400, "INVALID_ACTION");
    }

    let updateData = {
      moderatedBy: req.user._id,
      moderatedAt: new Date(),
    };

    switch (action) {
      case "approve":
        updateData.isApproved = true;
        updateData.isFlagged = false;
        break;
      case "flag":
        updateData.isFlagged = true;
        updateData.flagReason = reason;
        break;
      case "hide":
        updateData.isPublic = false;
        updateData.hiddenReason = reason;
        break;
      case "delete":
        updateData.isActive = false;
        updateData.deletedReason = reason;
        break;
    }

    const itinerary = await Itinerary.findByIdAndUpdate(
      itineraryId,
      updateData,
      { new: true }
    ).populate("userId", "firstName lastName email");

    if (!itinerary) {
      throw new AppError("Itinerary not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: `Itinerary ${action}ed successfully`,
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
};

export const getItineraryAnalytics = async (req, res, next) => {
  try {
    const { period = "30d" } = req.query;

    let dateFilter;
    const now = new Date();

    switch (period) {
      case "7d":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalItineraries,
      activeItineraries,
      completedItineraries,
      publicItineraries,
      flaggedItineraries,
      averageDuration,
      topDestinations,
      itinerariesByMonth,
      userEngagement,
    ] = await Promise.all([
      Itinerary.countDocuments({ isActive: true }),
      Itinerary.countDocuments({
        isActive: true,
        startDate: { $gte: now },
      }),
      Itinerary.countDocuments({
        isActive: true,
        endDate: { $lt: now },
      }),
      Itinerary.countDocuments({
        isActive: true,
        isPublic: true,
      }),
      Itinerary.countDocuments({
        isActive: true,
        isFlagged: true,
      }),
      Itinerary.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
      ]),
      Itinerary.aggregate([
        { $match: { isActive: true, createdAt: { $gte: dateFilter } } },
        { $group: { _id: "$destination", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Itinerary.aggregate([
        { $match: { isActive: true, createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Itinerary.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$user.ecoLevel",
            count: { $sum: 1 },
            avgDuration: { $avg: "$duration" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalItineraries,
          activeItineraries,
          completedItineraries,
          publicItineraries,
          flaggedItineraries,
          averageDuration: averageDuration[0]?.avgDuration || 0,
        },
        topDestinations,
        itinerariesByMonth,
        userEngagement,
      },
    });
  } catch (error) {
    next(error);
  }
};
