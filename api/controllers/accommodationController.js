import Accommodation from "../models/Accommodation.js";
import Review from "../models/Review.js";
import { AppError } from "../utils/errorHandler.js";
import { calculateDistance } from "../services/geoService.js";
import {
  getPlaceDetails,
  analyzeEcoScores,
  getDefaultEcoScores,
} from "../services/ecoScoreFromGoogle.js";

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
      .limit(parseInt(limit))
      .lean(); // Use lean() to return plain objects instead of Mongoose documents

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
            return { ...acc, distance };
          }
          return { ...acc, distance: null };
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

        // Calculate ecoRating from individual scores
        const scores = [
          acc.energyEfficiencyScore,
          acc.wasteManagementScore,
          acc.waterConservationScore,
          acc.localSourcingScore,
          acc.carbonFootprintScore,
        ].filter((score) => score != null);

        const ecoRating = scores.length
          ? scores.reduce((a, b) => a + b) / scores.length
          : null;

        return {
          ...acc,
          ecoRating,
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
    const accommodation = await Accommodation.findById(req.params.id).lean();

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
      .select("name type")
      .lean();

    // Calculate ecoRating from individual scores
    const scores = [
      accommodation.energyEfficiencyScore,
      accommodation.wasteManagementScore,
      accommodation.waterConservationScore,
      accommodation.localSourcingScore,
      accommodation.carbonFootprintScore,
    ].filter((score) => score != null);

    const ecoRating = scores.length
      ? scores.reduce((a, b) => a + b) / scores.length
      : null;

    res.json({
      success: true,
      data: {
        ...accommodation,
        ecoRating,
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

    // Remove any manually provided eco scores from request body to prevent tampering
    delete accommodationData.energyEfficiencyScore;
    delete accommodationData.wasteManagementScore;
    delete accommodationData.waterConservationScore;
    delete accommodationData.localSourcingScore;
    delete accommodationData.carbonFootprintScore;

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

    // Calculate eco scores automatically if Google Place ID is provided
    if (accommodationData.googlePlaceId) {
      try {
        const placeDetails = await getPlaceDetails(
          accommodationData.googlePlaceId
        );

        // Set eco scores from Google analysis
        if (placeDetails.ecoScores) {
          Object.assign(accommodationData, placeDetails.ecoScores);
        }

        // Set metadata
        accommodationData.ecoScoreMetadata = {
          ...placeDetails.ecoScoreMetadata,
          googlePlaceId: accommodationData.googlePlaceId,
        };

        // Fill in other details from Google if not provided
        if (!accommodationData.name && placeDetails.name) {
          accommodationData.name = placeDetails.name;
        }
        if (!accommodationData.address && placeDetails.address) {
          accommodationData.address = placeDetails.address;
        }
        if (!accommodationData.phone && placeDetails.phone) {
          accommodationData.phone = placeDetails.phone;
        }
        if (!accommodationData.websiteUrl && placeDetails.website) {
          accommodationData.websiteUrl = placeDetails.website;
        }
        if (!accommodationData.imageUrls && placeDetails.photos?.length > 0) {
          accommodationData.imageUrls = placeDetails.photos;
        }

        // Auto-populate coordinates from Google Places if not manually provided
        if (
          placeDetails.coordinates &&
          (!accommodationData.latitude || !accommodationData.longitude)
        ) {
          accommodationData.latitude = placeDetails.coordinates.latitude;
          accommodationData.longitude = placeDetails.coordinates.longitude;
        }
      } catch (error) {
        console.error("Error fetching Google Place details:", error);

        // Use default scores if Google Places fails, but keep the place ID for future attempts
        const defaultEcoData = getDefaultEcoScores(
          accommodationData.type || "hotel"
        );
        Object.assign(accommodationData, defaultEcoData.scores);
        accommodationData.ecoScoreMetadata = {
          ...defaultEcoData.metadata,
          googlePlaceId: accommodationData.googlePlaceId,
          error: error.message,
          lastErrorAt: new Date(),
        };

        // Log the error but don't fail the accommodation creation
        console.warn(
          `Using default eco scores due to Google Places error: ${error.message}`
        );
      }
    } else {
      // Use default scores if no Google Place ID provided
      const defaultEcoData = getDefaultEcoScores(
        accommodationData.type || "hotel"
      );
      Object.assign(accommodationData, defaultEcoData.scores);
      accommodationData.ecoScoreMetadata = defaultEcoData.metadata;
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
    console.error("Error in createAccommodation:", error);
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

// Recalculate eco scores for an accommodation
export const recalculateEcoScores = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      throw new AppError("Accommodation not found", 404, "NOT_FOUND");
    }

    let ecoData;

    // Try to recalculate from Google Places if we have a Place ID
    if (accommodation.ecoScoreMetadata?.googlePlaceId) {
      try {
        const placeDetails = await getPlaceDetails(
          accommodation.ecoScoreMetadata.googlePlaceId
        );
        ecoData = {
          scores: placeDetails.ecoScores,
          metadata: {
            ...placeDetails.ecoScoreMetadata,
            googlePlaceId: accommodation.ecoScoreMetadata.googlePlaceId,
          },
        };

        // Also update coordinates if available from Google Places and not manually set
        const updateData = {
          ...ecoData.scores,
          ecoScoreMetadata: ecoData.metadata,
        };

        if (
          placeDetails.coordinates &&
          (!accommodation.latitude || !accommodation.longitude)
        ) {
          updateData.latitude = placeDetails.coordinates.latitude;
          updateData.longitude = placeDetails.coordinates.longitude;
          console.log(
            `Auto-updated coordinates from Google Places: ${updateData.latitude}, ${updateData.longitude}`
          );
        }

        // Update the accommodation with new scores and coordinates
        const updatedAccommodation = await Accommodation.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true, runValidators: true }
        );

        res.json({
          success: true,
          message: "Eco scores recalculated successfully",
          data: {
            accommodation: updatedAccommodation,
            previousMetadata: accommodation.ecoScoreMetadata,
            newMetadata: ecoData.metadata,
            coordinatesUpdated: placeDetails.coordinates ? true : false,
          },
        });
        return;
      } catch (error) {
        console.error("Error recalculating from Google Places:", error);
        // Fall back to default scores
        ecoData = getDefaultEcoScores(accommodation.type || "hotel");
        ecoData.metadata.googlePlaceId =
          accommodation.ecoScoreMetadata.googlePlaceId;
      }
    } else {
      // Use default scores if no Google Place ID
      ecoData = getDefaultEcoScores(accommodation.type || "hotel");
    }

    // Update the accommodation with new scores (fallback case)
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      {
        ...ecoData.scores,
        ecoScoreMetadata: ecoData.metadata,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Eco scores recalculated successfully",
      data: {
        accommodation: updatedAccommodation,
        previousMetadata: accommodation.ecoScoreMetadata,
        newMetadata: ecoData.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Batch recalculate eco scores for multiple accommodations
export const batchRecalculateEcoScores = async (req, res, next) => {
  try {
    const { accommodationIds, force = false } = req.body;

    let query = { isActive: true };

    if (accommodationIds && accommodationIds.length > 0) {
      query._id = { $in: accommodationIds };
    } else if (!force) {
      // Only recalculate accommodations with low confidence or old scores
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.$or = [
        { "ecoScoreMetadata.confidenceLevel": { $lt: 3 } },
        { "ecoScoreMetadata.lastCalculated": { $lt: oneWeekAgo } },
        { "ecoScoreMetadata.lastCalculated": null },
      ];
    }

    const accommodations = await Accommodation.find(query).limit(50); // Process in batches
    const results = [];

    for (const accommodation of accommodations) {
      try {
        let ecoData;

        if (accommodation.ecoScoreMetadata?.googlePlaceId) {
          try {
            const placeDetails = await getPlaceDetails(
              accommodation.ecoScoreMetadata.googlePlaceId
            );
            ecoData = {
              scores: placeDetails.ecoScores,
              metadata: {
                ...placeDetails.ecoScoreMetadata,
                googlePlaceId: accommodation.ecoScoreMetadata.googlePlaceId,
              },
            };
          } catch (error) {
            console.error(
              `Error recalculating for ${accommodation._id}:`,
              error
            );
            ecoData = getDefaultEcoScores(accommodation.type || "hotel");
            ecoData.metadata.googlePlaceId =
              accommodation.ecoScoreMetadata.googlePlaceId;
          }
        } else {
          ecoData = getDefaultEcoScores(accommodation.type || "hotel");
        }

        await Accommodation.findByIdAndUpdate(accommodation._id, {
          ...ecoData.scores,
          ecoScoreMetadata: ecoData.metadata,
        });

        results.push({
          accommodationId: accommodation._id,
          name: accommodation.name,
          status: "success",
          confidenceLevel: ecoData.metadata.confidenceLevel,
          reviewsAnalyzed: ecoData.metadata.reviewsAnalyzed,
        });

        // Add delay to respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          accommodationId: accommodation._id,
          name: accommodation.name,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} accommodations`,
      data: {
        totalProcessed: results.length,
        successful: results.filter((r) => r.status === "success").length,
        failed: results.filter((r) => r.status === "error").length,
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};
