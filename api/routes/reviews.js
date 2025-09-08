import express from "express";
const router = express.Router();
import {
  getAccommodationReviews,
  createAccommodationReview,
  createRestaurantReview,
  markReviewHelpful,
} from "../controllers/reviewController.js";
import { authenticate } from "../middleware/auth.js";
import {
  accommodationReviewValidation,
  helpfulReviewValidation,
  restaurantReviewValidation,
} from "../middleware/validation/reviewValidation.js";

// Public routes
router.get("/accommodations/:id/reviews", getAccommodationReviews);

// Authenticated user routes
router.post(
  "/accommodations/:id/reviews",
  authenticate,
  accommodationReviewValidation,
  createAccommodationReview
);
router.post(
  "/restaurants/:id/reviews",
  authenticate,
  restaurantReviewValidation,
  createRestaurantReview
);
router.put(
  "/:id/helpful",
  authenticate,
  helpfulReviewValidation,
  markReviewHelpful
);

export default router;
