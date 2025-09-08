import Restaurant from "../models/Restaurant.js";
import Review from "../models/Review.js";
import { AppError } from "../utils/errorHandler.js";
import { calculateDistance } from "../services/geoService.js";

export const getRestaurants = async (req, res, next) => {
  try {
    const {
      city,
      country,
      latitude,
      longitude,
      radius = 50,
      cuisine_type,
      dietary_options,
      eco_rating_min,
      price_range,
      opening_now,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true, isVerified: true };

    // Build query
    if (city) query.city = new RegExp(city, "i");
    if (country) query.country = new RegExp(country, "i");
    if (cuisine_type) query.cuisineType = new RegExp(cuisine_type, "i");
    if (eco_rating_min) query.ecoRating = { $gte: parseFloat(eco_rating_min) };
    if (price_range) query.priceRange = price_range;
    if (dietary_options) {
      const dietaryArray = Array.isArray(dietary_options)
        ? dietary_options
        : [dietary_options];
      query.dietaryOptions = { $in: dietaryArray };
    }

    const skip = (page - 1) * limit;

    let restaurants = await Restaurant.find(query)
      .sort({ ecoRating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate distances if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const searchRadius = parseFloat(radius);

      restaurants = restaurants
        .map((rest) => {
          if (rest.location && rest.location.coordinates) {
            const [lng, lat] = rest.location.coordinates;
            const distance = calculateDistance(userLat, userLng, lat, lng);
            return { ...rest.toObject(), distance };
          }
          return { ...rest.toObject(), distance: null };
        })
        .filter((rest) => !searchRadius || rest.distance <= searchRadius);
    }

    // Get review stats and opening status
    const restaurantsWithDetails = await Promise.all(
      restaurants.map(async (rest) => {
        const reviewStats = await Review.aggregate([
          { $match: { restaurantId: rest._id, isApproved: true } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
              count: { $sum: 1 },
            },
          },
        ]);

        // Simplified opening hours check
        const isOpenNow = rest.openingHours ? true : false;

        return {
          ...rest,
          averageReviewRating: reviewStats[0]?.averageRating || 0,
          reviewCount: reviewStats[0]?.count || 0,
          isOpenNow,
          nextOpening: null, // Would implement actual opening hours logic
        };
      })
    );

    // Filter by opening now if requested
    let filteredRestaurants = restaurantsWithDetails;
    if (opening_now === "true") {
      filteredRestaurants = restaurantsWithDetails.filter(
        (rest) => rest.isOpenNow
      );
    }

    const total = await Restaurant.countDocuments(query);

    res.json({
      success: true,
      data: {
        restaurants: filteredRestaurants,
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

export const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant || !restaurant.isActive) {
      throw new AppError("Restaurant not found", 404, "NOT_FOUND");
    }

    // Get review summary
    const reviewStats = await Review.aggregate([
      { $match: { restaurantId: restaurant._id, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          averageEcoRating: { $avg: "$ecoFriendlinessRating" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        ...restaurant.toObject(),
        reviewsSummary: {
          averageRating: reviewStats[0]?.averageRating || 0,
          totalReviews: reviewStats[0]?.count || 0,
          averageEcoRating: reviewStats[0]?.averageEcoRating || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (req, res, next) => {
  try {
    const restaurantData = req.body;

    // Add location if coordinates provided
    if (restaurantData.latitude && restaurantData.longitude) {
      restaurantData.location = {
        type: "Point",
        coordinates: [
          parseFloat(restaurantData.longitude),
          parseFloat(restaurantData.latitude),
        ],
      };
    }

    const restaurant = new Restaurant({
      ...restaurantData,
      createdBy: req.user._id,
    });

    await restaurant.save();

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      throw new AppError("Restaurant not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!restaurant) {
      throw new AppError("Restaurant not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
