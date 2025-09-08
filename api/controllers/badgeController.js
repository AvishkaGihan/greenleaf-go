import EcoBadge from "../models/EcoBadge";
import UserBadge from "../models/UserBadge";
import { AppError } from "../utils/errorHandler";

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
