import User from "../models/User.js";
import Accommodation from "../models/Accommodation.js";
import Restaurant from "../models/Restaurant.js";
import ConservationEvent from "../models/ConservationEvent.js";
import Review from "../models/Review.js";
import EcoBadge from "../models/EcoBadge.js";
import AdminLog from "../models/AdminLog.js";
import EventRSVP from "../models/EventRSVP.js";
import Itinerary from "../models/Itinerary.js";
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
