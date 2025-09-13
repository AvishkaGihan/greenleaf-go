import express from "express";
const router = express.Router();
import {
  getAccommodations,
  getAccommodation,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodationReviews,
  recalculateEcoScores,
  batchRecalculateEcoScores,
} from "../controllers/accommodationController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import {
  accommodationValidation,
  updateAccommodationValidation,
  getAccommodationsValidation,
  getAccommodationReviewsValidation,
  recalculateEcoScoresValidation,
} from "../middleware/validation/accommodationValidation.js";
import {
  getPlaceDetails,
  searchPlaces,
} from "../services/ecoScoreFromGoogle.js";

// Google Places autocomplete routes (must be before /:id routes)
router.get("/autocomplete", async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ error: "Input parameter is required" });
    }

    const suggestions = await searchPlaces(input);

    res.json(suggestions);
  } catch (error) {
    console.error("Autocomplete error:", error);
    res.status(500).json({ error: "Failed to fetch autocomplete suggestions" });
  }
});

// Get place details by place ID
router.get("/autocomplete/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    const placeDetails = await getPlaceDetails(placeId);
    res.json(placeDetails);
  } catch (error) {
    console.error("Place details error:", error);
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

// Public routes
router.get("/", getAccommodationsValidation, getAccommodations);
router.get("/:id", getAccommodation);
router.get(
  "/:id/reviews",
  getAccommodationReviewsValidation,
  getAccommodationReviews
);

// Admin routes
router.post(
  "/",
  authenticateAdmin,
  accommodationValidation,
  createAccommodation
);
router.put(
  "/:id",
  authenticateAdmin,
  updateAccommodationValidation,
  updateAccommodation
);
router.delete("/:id", authenticateAdmin, deleteAccommodation);

// Eco score management routes (admin only)
router.post(
  "/:id/recalculate-eco-scores",
  authenticateAdmin,
  recalculateEcoScoresValidation,
  recalculateEcoScores
);
router.post(
  "/batch-recalculate-eco-scores",
  authenticateAdmin,
  batchRecalculateEcoScores
);

export default router;
