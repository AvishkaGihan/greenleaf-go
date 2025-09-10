import EcoBadge from "../models/EcoBadge.js";
import UserBadge from "../models/UserBadge.js";
import UserActivity from "../models/UserActivity.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/**
 * Badge Service - Handles all badge-related logic
 */

/**
 * Check and award badges for a user based on their activities
 * @param {string} userId - User's ID
 * @param {string} activityType - Type of activity that might trigger badge awards
 */
export const checkAndAwardBadges = async (userId, activityType) => {
  try {
    // Get all active badges
    const badges = await EcoBadge.find({ isActive: true });

    // Get user's existing badges
    const userBadges = await UserBadge.find({ userId }).select("badgeId");
    const earnedBadgeIds = userBadges.map((ub) => ub.badgeId.toString());

    // Filter badges user hasn't earned yet
    const unearnedBadges = badges.filter(
      (badge) => !earnedBadgeIds.includes(badge._id.toString())
    );

    // Check each unearned badge for eligibility
    for (const badge of unearnedBadges) {
      const isEligible = await checkBadgeEligibility(userId, badge);

      if (isEligible) {
        await awardBadge(userId, badge._id);
      }
    }
  } catch (error) {
    console.error("Error checking and awarding badges:", error);
    // Don't throw error to avoid breaking main functionality
  }
};

/**
 * Check if user is eligible for a specific badge
 * @param {string} userId - User's ID
 * @param {Object} badge - Badge object
 * @returns {boolean} - Whether user is eligible
 */
export const checkBadgeEligibility = async (userId, badge) => {
  try {
    const { requirementsType, requirementsThreshold } = badge;

    switch (requirementsType) {
      case "eco_points":
        return await checkEcoPointsRequirement(userId, requirementsThreshold);

      case "events_attended":
        return await checkEventsAttendedRequirement(
          userId,
          requirementsThreshold
        );

      case "accommodations_booked":
        return await checkAccommodationsBookedRequirement(
          userId,
          requirementsThreshold
        );

      case "reviews_written":
        return await checkReviewsWrittenRequirement(
          userId,
          requirementsThreshold
        );

      case "referrals":
        return await checkReferralsRequirement(userId, requirementsThreshold);

      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking badge eligibility:", error);
    return false;
  }
};

/**
 * Award a badge to a user
 * @param {string} userId - User's ID
 * @param {string} badgeId - Badge ID
 */
export const awardBadge = async (userId, badgeId) => {
  try {
    // Check if badge already awarded (double-check)
    const existingBadge = await UserBadge.findOne({ userId, badgeId });
    if (existingBadge) {
      return;
    }

    // Award the badge
    const userBadge = new UserBadge({
      userId,
      badgeId,
      earnedAt: new Date(),
    });
    await userBadge.save();

    // Get badge details for rewards and notifications
    const badge = await EcoBadge.findById(badgeId);

    // Award points if badge has point rewards
    if (badge.pointsReward > 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalEcoPoints: badge.pointsReward },
      });
    }

    // Log badge earned activity
    const activity = new UserActivity({
      userId,
      activityType: "badge_earned",
      pointsEarned: badge.pointsReward,
      badgeId,
      metadata: {
        badgeName: badge.name,
        badgeRarity: badge.rarity,
      },
    });
    await activity.save();

    // Create notification
    await createBadgeNotification(userId, badge);

    console.log(`Badge "${badge.name}" awarded to user ${userId}`);
  } catch (error) {
    console.error("Error awarding badge:", error);
  }
};

/**
 * Get user's progress toward a specific badge
 * @param {string} userId - User's ID
 * @param {string} badgeId - Badge ID
 * @returns {Object} - Progress information
 */
export const getUserProgress = async (userId, badgeId) => {
  try {
    const badge = await EcoBadge.findById(badgeId);
    if (!badge) {
      return null;
    }

    const current = await getCurrentProgress(userId, badge.requirementsType);
    const required = badge.requirementsThreshold;

    return {
      current,
      required,
      percentage: Math.min((current / required) * 100, 100),
      isCompleted: current >= required,
    };
  } catch (error) {
    console.error("Error getting user progress:", error);
    return null;
  }
};

/**
 * Get user's current progress for a requirement type
 * @param {string} userId - User's ID
 * @param {string} requirementType - Type of requirement
 * @returns {number} - Current progress value
 */
const getCurrentProgress = async (userId, requirementType) => {
  switch (requirementType) {
    case "eco_points":
      const user = await User.findById(userId).select("totalEcoPoints");
      return user?.totalEcoPoints || 0;

    case "events_attended":
      return await UserActivity.countDocuments({
        userId,
        activityType: "event_attended",
      });

    case "accommodations_booked":
      return await UserActivity.countDocuments({
        userId,
        activityType: "accommodation_booked",
      });

    case "reviews_written":
      return await UserActivity.countDocuments({
        userId,
        activityType: "review_written",
      });

    case "referrals":
      // This would need referral tracking implementation
      return 0;

    default:
      return 0;
  }
};

// Requirement checking functions
const checkEcoPointsRequirement = async (userId, threshold) => {
  const user = await User.findById(userId).select("totalEcoPoints");
  return (user?.totalEcoPoints || 0) >= threshold;
};

const checkEventsAttendedRequirement = async (userId, threshold) => {
  const count = await UserActivity.countDocuments({
    userId,
    activityType: "event_attended",
  });
  return count >= threshold;
};

const checkAccommodationsBookedRequirement = async (userId, threshold) => {
  const count = await UserActivity.countDocuments({
    userId,
    activityType: "accommodation_booked",
  });
  return count >= threshold;
};

const checkReviewsWrittenRequirement = async (userId, threshold) => {
  const count = await UserActivity.countDocuments({
    userId,
    activityType: "review_written",
  });
  return count >= threshold;
};

const checkReferralsRequirement = async (userId, threshold) => {
  // Placeholder for referral system
  return false;
};

/**
 * Create notification for badge earned
 * @param {string} userId - User's ID
 * @param {Object} badge - Badge object
 */
const createBadgeNotification = async (userId, badge) => {
  try {
    const notification = new Notification({
      userId,
      type: "badge_earned",
      title: "New Badge Earned!",
      message: `Congratulations! You've earned the "${badge.name}" badge ${badge.emoji}`,
      data: {
        badgeId: badge._id,
        badgeName: badge.name,
        badgeEmoji: badge.emoji,
        pointsEarned: badge.pointsReward,
      },
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating badge notification:", error);
  }
};
