import Accommodation from "../models/Accommodation.js";
import Restaurant from "../models/Restaurant.js";
import ConservationEvent from "../models/ConservationEvent.js";
import { AppError } from "../utils/errorHandler.js";
import { calculateDistance } from "../services/geoService.js";

export const globalSearch = async (req, res, next) => {
  try {
    const {
      query,
      type = "all",
      latitude,
      longitude,
      radius = 50,
      eco_rating_min,
      page = 1,
      limit = 20,
    } = req.query;

    if (!query) {
      throw new AppError("Search query is required", 400, "VALIDATION_ERROR");
    }

    const searchRegex = new RegExp(query, "i");
    const skip = (page - 1) * limit;

    let results = {
      accommodations: [],
      restaurants: [],
      events: [],
    };

    // Search accommodations
    if (type === "all" || type === "accommodation") {
      const accQuery = {
        isActive: true,
        isVerified: true,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { city: searchRegex },
          { country: searchRegex },
        ],
      };
      if (eco_rating_min)
        accQuery.ecoRating = { $gte: parseFloat(eco_rating_min) };

      let accommodations = await Accommodation.find(accQuery)
        .select("name city country ecoRating priceRange imageUrls location")
        .limit(parseInt(limit))
        .skip(skip);

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
      }

      results.accommodations = accommodations;
    }

    // Search restaurants
    if (type === "all" || type === "restaurant") {
      const restQuery = {
        isActive: true,
        isVerified: true,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { cuisineType: searchRegex },
          { city: searchRegex },
          { country: searchRegex },
        ],
      };
      if (eco_rating_min)
        restQuery.ecoRating = { $gte: parseFloat(eco_rating_min) };

      let restaurants = await Restaurant.find(restQuery)
        .select(
          "name city country cuisineType ecoRating priceRange imageUrls location"
        )
        .limit(parseInt(limit))
        .skip(skip);

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

      results.restaurants = restaurants;
    }

    // Search events
    if (type === "all" || type === "event") {
      const eventQuery = {
        isActive: true,
        isApproved: true,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { city: searchRegex },
          { country: searchRegex },
        ],
      };

      let events = await ConservationEvent.find(eventQuery)
        .select(
          "title city country eventType startDate endDate imageUrls location"
        )
        .limit(parseInt(limit))
        .skip(skip);

      if (latitude && longitude) {
        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);
        const searchRadius = parseFloat(radius);

        events = events
          .map((event) => {
            if (event.location && event.location.coordinates) {
              const [lng, lat] = event.location.coordinates;
              const distance = calculateDistance(userLat, userLng, lat, lng);
              return { ...event.toObject(), distance };
            }
            return { ...event.toObject(), distance: null };
          })
          .filter((event) => !searchRadius || event.distance <= searchRadius);
      }

      results.events = events;
    }

    // Get total counts
    const totalCounts = {
      accommodations: await Accommodation.countDocuments({
        isActive: true,
        isVerified: true,
        $or: [{ name: searchRegex }, { description: searchRegex }],
      }),
      restaurants: await Restaurant.countDocuments({
        isActive: true,
        isVerified: true,
        $or: [{ name: searchRegex }, { description: searchRegex }],
      }),
      events: await ConservationEvent.countDocuments({
        isActive: true,
        isApproved: true,
        $or: [{ title: searchRegex }, { description: searchRegex }],
      }),
    };

    res.json({
      success: true,
      data: {
        results,
        totalResults: totalCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
