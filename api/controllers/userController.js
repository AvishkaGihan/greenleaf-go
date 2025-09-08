import User from "../models/User.js";
import UserBadge from "../models/UserBadge.js";
import UserActivity from "../models/UserActivity.js";
import Itinerary from "../models/Itinerary.js";
import { AppError } from "../utils/errorHandler.js";
import { uploadToCloudinary } from "../services/uploadService.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        budgetRange: user.budgetRange,
        ecoInterests: user.ecoInterests,
        preferredLanguage: user.preferredLanguage,
        currency: user.currency,
        totalEcoPoints: user.totalEcoPoints,
        ecoLevel: user.ecoLevel,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400, "VALIDATION_ERROR");
    }

    // Upload to cloud storage
    const result = await uploadToCloudinary(req.file, "avatars");

    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImageUrl: result.secure_url },
      { new: true }
    ).select("-passwordHash");

    res.json({
      success: true,
      data: {
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBadges = async (req, res, next) => {
  try {
    const userBadges = await UserBadge.find({ userId: req.user._id })
      .populate("badgeId")
      .sort({ earnedAt: -1 });

    // Calculate progress for next badge (simplified)
    const nextBadge = {
      name: "Ocean Guardian",
      progress: 3,
      required: 5,
    };

    res.json({
      success: true,
      data: {
        badges: userBadges.map((ub) => ({
          id: ub.badgeId._id,
          name: ub.badgeId.name,
          description: ub.badgeId.description,
          emoji: ub.badgeId.emoji,
          category: ub.badgeId.category,
          rarity: ub.badgeId.rarity,
          earnedAt: ub.earnedAt,
        })),
        totalBadges: userBadges.length,
        nextBadge,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const activityType = req.query.activity_type;

    const query = { userId: req.user._id };
    if (activityType) {
      query.activityType = activityType;
    }

    const activities = await UserActivity.find(query)
      .populate("eventId", "title")
      .populate("accommodationId", "name")
      .populate("restaurantId", "name")
      .populate("itineraryId", "title")
      .populate("badgeId", "name emoji")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserActivity.countDocuments(query);

    // Calculate summary
    const totalPoints = await UserActivity.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: "$pointsEarned" } } },
    ]);

    const monthlyActivities = await UserActivity.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      success: true,
      data: {
        activities: activities.map((activity) => ({
          id: activity._id,
          activityType: activity.activityType,
          pointsEarned: activity.pointsEarned,
          eventTitle: activity.eventId?.title,
          accommodationName: activity.accommodationId?.name,
          restaurantName: activity.restaurantId?.name,
          itineraryTitle: activity.itineraryId?.title,
          badgeName: activity.badgeId?.name,
          badgeEmoji: activity.badgeId?.emoji,
          createdAt: activity.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
        summary: {
          totalPoints: totalPoints[0]?.total || 0,
          currentLevel: Math.floor((totalPoints[0]?.total || 0) / 500) + 1,
          pointsToNextLevel: 500 - ((totalPoints[0]?.total || 0) % 500),
          activitiesThisMonth: monthlyActivities,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserItineraries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { userId: req.user._id };
    if (status === "draft") query.isActive = false;
    if (status === "completed") query.endDate = { $lt: new Date() };

    const itineraries = await Itinerary.find(query)
      .select("-items")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Itinerary.countDocuments(query);

    res.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
