import express from "express";
const router = express.Router();
import {
  getAccommodations,
  getAccommodation,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodationReviews,
} from "../controllers/accommodationController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import {
  accommodationValidation,
  updateAccommodationValidation,
  getAccommodationsValidation,
  getAccommodationReviewsValidation,
} from "../middleware/validation/accommodationValidation.js";

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

export default router;
