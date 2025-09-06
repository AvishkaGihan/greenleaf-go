import Accommodation from "../models/Accommodation";
import Review from "../models/Review";
import { AppError } from "../utils/errorHandler";
import { calculateDistance } from "../services/geoService";

export const getAccommodations = async (req, res, next) => {
  try {
    const {
      city,
      country,
      latitude,
      longitude,
      radius = 50,
      eco_rating_min,
      price_range,
      type,
      amenities,
      sort_by = "eco_rating",
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true, isVerified: true };

    // Build query
    if (city) query.city = new RegExp(city, "i");
    if (country) query.country = new RegExp(country, "i");
    if (eco_rating_min) query.ecoRating = { $gte: parseFloat(eco_rating_min) };
    if (price_range) query.priceRange = price_range;
    if (type) query.type = type;
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $all: amenityArray };
    }

    const skip = (page - 1) * limit;

    // Sort options
    let sort = {};
    switch (sort_by) {
      case "price":
        sort = { priceRange: 1 };
        break;
      case "distance":
        // Will handle distance sorting after query
        break;
      case "rating":
        // Need to join with reviews for average rating
        break;
      default:
        sort = { ecoRating: -1 };
    }

    let accommodations = await Accommodation.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate distances if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const searchRadius = parseFloat(radius);

      accommodations = accommodations
        .map((acc) => {
          if (acc.location && acc.location.coordinates) {
            const [lng, lat] = acc.location.coordinates;
            const distance = calculateDistance(userLat, userLng, lat, lng);
            return { ...acc.toObject(), distance };
          }
          return { ...acc.toObject(), distance: null };
        })
        .filter((acc) => !searchRadius || acc.distance <= searchRadius);

      // Sort by distance if requested
      if (sort_by === "distance") {
        accommodations.sort((a, b) => a.distance - b.distance);
      }
    }

    // Get review stats for each accommodation
    const accommodationsWithReviews = await Promise.all(
      accommodations.map(async (acc) => {
        const reviewStats = await Review.aggregate([
          { $match: { accommodationId: acc._id, isApproved: true } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
              count: { $sum: 1 },
            },
          },
        ]);

        return {
          ...acc,
          averageReviewRating: reviewStats[0]?.averageRating || 0,
          reviewCount: reviewStats[0]?.count || 0,
        };
      })
    );

    const total = await Accommodation.countDocuments(query);

    res.json({
      success: true,
      data: {
        accommodations: accommodationsWithReviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        filtersApplied: {
          city,
          country,
          eco_rating_min,
          price_range,
          type,
          amenities,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAccommodation = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation || !accommodation.isActive) {
      throw new AppError("Accommodation not found", 404, "NOT_FOUND");
    }

    // Get review summary
    const reviewStats = await Review.aggregate([
      { $match: { accommodationId: accommodation._id, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          averageEcoRating: { $avg: "$ecoFriendlinessRating" },
          count: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    // Get nearby attractions (simplified)
    const nearbyAttractions = await Accommodation.find({
      _id: { $ne: accommodation._id },
      city: accommodation.city,
      isActive: true,
      isVerified: true,
    })
      .limit(5)
      .select("name type");

    res.json({
      success: true,
      data: {
        ...accommodation.toObject(),
        reviewsSummary: {
          averageRating: reviewStats[0]?.averageRating || 0,
          totalReviews: reviewStats[0]?.count || 0,
          averageEcoRating: reviewStats[0]?.averageEcoRating || 0,
          ratingDistribution:
            reviewStats[0]?.ratingDistribution?.reduce((acc, rating) => {
              acc[rating] = (acc[rating] || 0) + 1;
              return acc;
            }, {}) || {},
        },
        nearbyAttractions: nearbyAttractions.map((attr) => ({
          name: attr.name,
          type: attr.type,
          distance: null, // Would calculate actual distance
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAccommodation = async (req, res, next) => {
  try {
    const accommodationData = req.body;

    // Add location if coordinates provided
    if (accommodationData.latitude && accommodationData.longitude) {
      accommodationData.location = {
        type: "Point",
        coordinates: [
          parseFloat(accommodationData.longitude),
          parseFloat(accommodationData.latitude),
        ],
      };
    }

    const accommodation = new Accommodation({
      ...accommodationData,
      createdBy: req.user._id,
    });

    await accommodation.save();

    res.status(201).json({
      success: true,
      message: "Accommodation created successfully",
      data: accommodation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccommodation = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!accommodation) {
      throw new AppError("Accommodation not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Accommodation updated successfully",
      data: accommodation,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccommodation = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!accommodation) {
      throw new AppError("Accommodation not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Accommodation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

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

    const distribution = ratingDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

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
