import Review from "../models/Review.js";
import Accommodation from "../models/Accommodation.js";
import Restaurant from "../models/Restaurant.js";
import UserActivity from "../models/UserActivity.js";
import { AppError } from "../utils/errorHandler.js";

export const getAccommodationReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort_by = "newest" } = req.query;
    const skip = (page - 1) * limit;

    let sort = {};
    switch (sort_by) {
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "rating_high":
        sort = { rating: -1 };
        break;
      case "rating_low":
        sort = { rating: 1 };
        break;
      case "helpful":
        sort = { helpfulVotes: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find({
      accommodationId: req.params.id,
      isApproved: true,
    })
      .populate("userId", "firstName profileImageUrl ecoLevel")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      accommodationId: req.params.id,
      isApproved: true,
    });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { accommodationId: req.params.id, isApproved: true } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const distribution = ratingDistribution.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    res.json({
      success: true,
      data: {
        reviews: reviews.map((review) => ({
          id: review._id,
          user: {
            id: review.userId._id,
            firstName: review.userId.firstName,
            profileImageUrl: review.userId.profileImageUrl,
            ecoLevel: review.userId.ecoLevel,
          },
          rating: review.rating,
          ecoFriendlinessRating: review.ecoFriendlinessRating,
          title: review.title,
          comment: review.comment,
          stayDate: review.stayDate,
          ecoInitiativesObserved: review.ecoInitiativesObserved,
          photos: review.photos,
          helpfulVotes: review.helpfulVotes,
          totalVotes: review.totalVotes,
          isVerified: review.isVerified,
          createdAt: review.createdAt,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        summary: {
          averageRating: await Review.aggregate([
            { $match: { accommodationId: req.params.id, isApproved: true } },
            { $group: { _id: null, average: { $avg: "$rating" } } },
          ]).then((result) => result[0]?.average || 0),
          totalReviews: total,
          ratingDistribution: distribution,
          averageEcoRating: await Review.aggregate([
            { $match: { accommodationId: req.params.id, isApproved: true } },
            {
              $group: {
                _id: null,
                average: { $avg: "$ecoFriendlinessRating" },
              },
            },
          ]).then((result) => result[0]?.average || 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAccommodationReview = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation || !accommodation.isActive) {
      throw new AppError("Accommodation not found", 404, "NOT_FOUND");
    }

    // Check if user already reviewed this accommodation
    const existingReview = await Review.findOne({
      userId: req.user._id,
      accommodationId: req.params.id,
    });

    if (existingReview) {
      throw new AppError(
        "You have already reviewed this accommodation",
        400,
        "RESOURCE_CONFLICT"
      );
    }

    const reviewData = {
      ...req.body,
      userId: req.user._id,
      accommodationId: req.params.id,
      reviewType: "accommodation",
    };

    const review = new Review(reviewData);
    await review.save();

    // Log user activity and award points
    const activity = new UserActivity({
      userId: req.user._id,
      activityType: "review_written",
      pointsEarned: 25,
      accommodationId: req.params.id,
      metadata: {
        accommodationName: accommodation.name,
        rating: review.rating,
      },
    });
    await activity.save();

    // Update user's total points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalEcoPoints: 25 },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: {
        reviewId: review._id,
        ecoPointsEarned: 25,
        badgesUnlocked: [], // Would implement badge checking
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurantReview = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || !restaurant.isActive) {
      throw new AppError("Restaurant not found", 404, "NOT_FOUND");
    }

    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      userId: req.user._id,
      restaurantId: req.params.id,
    });

    if (existingReview) {
      throw new AppError(
        "You have already reviewed this restaurant",
        400,
        "RESOURCE_CONFLICT"
      );
    }

    const reviewData = {
      ...req.body,
      userId: req.user._id,
      restaurantId: req.params.id,
      reviewType: "restaurant",
    };

    const review = new Review(reviewData);
    await review.save();

    // Log user activity and award points
    const activity = new UserActivity({
      userId: req.user._id,
      activityType: "review_written",
      pointsEarned: 25,
      restaurantId: req.params.id,
      metadata: {
        restaurantName: restaurant.name,
        rating: review.rating,
      },
    });
    await activity.save();

    // Update user's total points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalEcoPoints: 25 },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: {
        reviewId: review._id,
        ecoPointsEarned: 25,
        badgesUnlocked: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markReviewHelpful = async (req, res, next) => {
  try {
    const { is_helpful } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }

    if (is_helpful) {
      review.helpfulVotes += 1;
    } else {
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    }
    review.totalVotes += 1;

    await review.save();

    res.json({
      success: true,
      message: `Review marked as ${is_helpful ? "helpful" : "not helpful"}`,
      data: {
        helpfulVotes: review.helpfulVotes,
        totalVotes: review.totalVotes,
      },
    });
  } catch (error) {
    next(error);
  }
};
