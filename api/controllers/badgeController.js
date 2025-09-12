import EcoBadge from "../models/EcoBadge.js";
import UserBadge from "../models/UserBadge.js";
import { AppError } from "../utils/errorHandler.js";
import { getUserProgress } from "../services/badgeService.js";

export const getBadges = async (req, res, next) => {
  try {
    const { category, rarity } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;

    const badges = await EcoBadge.find(query).sort({
      requirementsThreshold: 1,
    });

    let userBadges = [];
    if (req.user) {
      userBadges = await UserBadge.find({ userId: req.user._id })
        .populate("badgeId")
        .select("badgeId earnedAt");
    }

    res.json({
      success: true,
      data: {
        badges: badges.map((badge) => {
          const userBadge = userBadges.find(
            (ub) => ub.badgeId._id.toString() === badge._id.toString()
          );

          return {
            id: badge._id,
            name: badge.name,
            description: badge.description,
            emoji: badge.emoji,
            category: badge.category,
            requirementsType: badge.requirementsType,
            requirementsThreshold: badge.requirementsThreshold,
            pointsReward: badge.pointsReward,
            rarity: badge.rarity,
            earned: !!userBadge,
            earnedAt: userBadge?.earnedAt,
          };
        }),
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
      description: "Participate in 5 beach cleanup events",
      progress: 3,
      required: 5,
      emoji: "🌊",
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

export const createBadge = async (req, res, next) => {
  try {
    const badge = new EcoBadge(req.body);
    await badge.save();

    res.status(201).json({
      success: true,
      message: "Badge created successfully",
      data: badge,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBadge = async (req, res, next) => {
  try {
    const badge = await EcoBadge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!badge) {
      throw new AppError("Badge not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Badge updated successfully",
      data: badge,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBadge = async (req, res, next) => {
  try {
    const badge = await EcoBadge.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!badge) {
      throw new AppError("Badge not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Badge deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getBadgeProgress = async (req, res, next) => {
  try {
    const badgeId = req.params.id;
    const userId = req.user._id;

    const progress = await getUserProgress(userId, badgeId);

    if (!progress) {
      throw new AppError("Badge not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      data: {
        badgeId,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getNextBadges = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all badges
    const allBadges = await EcoBadge.find({ isActive: true }).sort({
      requirementsThreshold: 1,
    });

    // Get user's earned badges
    const userBadges = await UserBadge.find({ userId }).select("badgeId");
    const earnedBadgeIds = userBadges.map((ub) => ub.badgeId.toString());

    // Filter unearned badges and get progress for each
    const nextBadges = [];
    for (const badge of allBadges) {
      if (!earnedBadgeIds.includes(badge._id.toString())) {
        const progress = await getUserProgress(userId, badge._id);
        nextBadges.push({
          id: badge._id,
          name: badge.name,
          description: badge.description,
          emoji: badge.emoji,
          category: badge.category,
          rarity: badge.rarity,
          requirementsType: badge.requirementsType,
          requirementsThreshold: badge.requirementsThreshold,
          pointsReward: badge.pointsReward,
          progress,
        });
      }
    }

    // Sort by progress percentage (closest to completion first)
    nextBadges.sort((a, b) => b.progress.percentage - a.progress.percentage);

    res.json({
      success: true,
      data: {
        nextBadges: nextBadges.slice(0, 5), // Return top 5 closest badges
        totalAvailable: nextBadges.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Assign badge to user (Admin only)
export const assignBadge = async (req, res, next) => {
  try {
    const { id: badgeId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return next(new AppError("User ID is required", 400));
    }

    // Check if badge exists
    const badge = await EcoBadge.findById(badgeId);
    if (!badge) {
      return next(new AppError("Badge not found", 404));
    }

    // Check if user already has this badge
    const existingUserBadge = await UserBadge.findOne({
      userId,
      badgeId,
    });

    if (existingUserBadge) {
      return next(new AppError("User already has this badge", 400));
    }

    // Create new user badge
    const userBadge = new UserBadge({
      userId,
      badgeId,
      earnedAt: new Date(),
    });

    await userBadge.save();

    res.status(201).json({
      success: true,
      message: "Badge assigned successfully",
      data: {
        userBadge,
      },
    });
  } catch (error) {
    next(error);
  }
};
