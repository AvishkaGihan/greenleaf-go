import Itinerary from "../models/Itinerary.js";
import ItineraryItem from "../models/ItineraryItem.js";
import User from "../models/User.js";
import UserActivity from "../models/UserActivity.js";
import { AppError } from "../utils/errorHandler.js";
import { generateAISuggestions } from "../services/aiService.js";

export const getItineraries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (status === "draft") query.isActive = false;
    if (status === "completed") query.endDate = { $lt: new Date() };

    const itineraries = await Itinerary.find(query)
      .select("-items")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Itinerary.countDocuments(query);

    res.json({
      success: true,
      data: {
        itineraries,
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

export const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id).populate(
      "userId",
      "firstName lastName"
    );

    if (!itinerary || !itinerary.isActive) {
      throw new AppError("Itinerary not found", 404, "NOT_FOUND");
    }

    // Check if user owns the itinerary
    if (
      itinerary.userId._id.toString() !== req.user._id.toString() &&
      !itinerary.isPublic
    ) {
      throw new AppError("Access denied", 403, "PERMISSION_DENIED");
    }

    const items = await ItineraryItem.find({ itineraryId: itinerary._id })
      .sort({ dayNumber: 1, sortOrder: 1 })
      .populate("accommodationId", "name ecoRating priceRange")
      .populate("restaurantId", "name ecoRating cuisineType priceRange")
      .populate("conservationEventId", "title eventType ecoPointsReward");

    // Calculate summary
    const summary = {
      totalDays: Math.max(...items.map((item) => item.dayNumber), 0),
      totalItems: items.length,
      totalEstimatedCost: items.reduce(
        (sum, item) => sum + (item.estimatedCost || 0),
        0
      ),
      accommodations: items.filter((item) => item.itemType === "accommodation")
        .length,
      restaurants: items.filter((item) => item.itemType === "restaurant")
        .length,
      activities: items.filter((item) => item.itemType === "activity").length,
      events: items.filter((item) => item.itemType === "event").length,
    };

    res.json({
      success: true,
      data: {
        ...itinerary.toObject(),
        items,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createItinerary = async (req, res, next) => {
  try {
    const itineraryData = {
      ...req.body,
      userId: req.user._id,
    };

    const itinerary = new Itinerary(itineraryData);
    await itinerary.save();

    // Log user activity
    const activity = new UserActivity({
      userId: req.user._id,
      activityType: "itinerary_created",
      pointsEarned: 50, // Points for creating an itinerary
      itineraryId: itinerary._id,
      metadata: { itineraryTitle: itinerary.title },
    });
    await activity.save();

    // Update user's total points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalEcoPoints: 50 },
    });

    res.status(201).json({
      success: true,
      message: "Itinerary created successfully",
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
};

export const generateItinerary = async (req, res, next) => {
  try {
    const {
      destinationCity,
      destinationCountry,
      startDate,
      endDate,
      budgetTotal,
      budgetCurrency,
      travelStyle,
      interests,
      groupSize,
      accommodationPreference,
      includeVolunteerActivities,
    } = req.body;

    // Generate AI suggestions (simplified - would integrate with actual AI service)
    const suggestions = await generateAISuggestions({
      destination_city: destinationCity,
      destination_country: destinationCountry,
      start_date: startDate,
      end_date: endDate,
      budget_total: budgetTotal,
      travel_style: travelStyle,
      interests,
      group_size: groupSize,
      accommodation_preference: accommodationPreference,
      include_volunteer_activities: includeVolunteerActivities,
    });

    const generationId = `gen_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 3), // Return top 3 suggestions
        generation_id: generationId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveGeneratedItinerary = async (req, res, next) => {
  try {
    const { suggestion_index, title, make_favorite } = req.body;
    const { generation_id } = req.params;

    // In a real implementation, you would retrieve the generated suggestion from cache/db
    // This is a simplified version
    const generatedItinerary = {
      title: title || `Generated Itinerary for ${generation_id}`,
      destination_city: "Generated City",
      destination_country: "Generated Country",
      eco_score: 4.2,
      estimated_carbon_footprint: 25.5,
      total_cost: 1200,
      highlights: [
        "Eco-friendly accommodations",
        "Local experiences",
        "Sustainable dining",
      ],
    };

    const itinerary = new Itinerary({
      userId: req.user._id,
      title: generatedItinerary.title,
      description: "AI-generated sustainable itinerary",
      destination_city: generatedItinerary.destination_city,
      destination_country: generatedItinerary.destination_country,
      start_date: new Date(),
      end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      budget_total: generatedItinerary.total_cost,
      budget_currency: "USD",
      travel_style: "mid-range",
      interests: ["nature", "culture"],
      eco_score: generatedItinerary.eco_score,
      estimated_carbon_footprint: generatedItinerary.estimated_carbon_footprint,
      is_ai_generated: true,
      is_favorite: make_favorite || false,
    });

    await itinerary.save();

    res.json({
      success: true,
      message: "Itinerary saved successfully",
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!itinerary) {
      throw new AppError("Itinerary not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Itinerary updated successfully",
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!itinerary) {
      throw new AppError("Itinerary not found", 404, "NOT_FOUND");
    }

    // Also delete all items
    await ItineraryItem.deleteMany({ itineraryId: req.params.id });

    res.json({
      success: true,
      message: "Itinerary deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const addItineraryItem = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!itinerary) {
      throw new AppError("Itinerary not found", 404, "NOT_FOUND");
    }

    const itemData = {
      ...req.body,
      itineraryId: itinerary._id,
    };

    const item = new ItineraryItem(itemData);
    await item.save();

    res.status(201).json({
      success: true,
      message: "Item added to itinerary",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateItineraryItem = async (req, res, next) => {
  try {
    const item = await ItineraryItem.findOneAndUpdate(
      { _id: req.params.item_id, itineraryId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new AppError("Item not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Item updated successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItineraryItem = async (req, res, next) => {
  try {
    const item = await ItineraryItem.findOneAndDelete({
      _id: req.params.item_id,
      itineraryId: req.params.id,
    });

    if (!item) {
      throw new AppError("Item not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Item removed from itinerary",
    });
  } catch (error) {
    next(error);
  }
};
