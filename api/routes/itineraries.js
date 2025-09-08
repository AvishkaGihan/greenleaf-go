import express from "express";
const router = express.Router();
import {
  getItineraries,
  getItinerary,
  createItinerary,
  generateItinerary,
  saveGeneratedItinerary,
  updateItinerary,
  deleteItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
} from "../controllers/itineraryController.js";
import { authenticate } from "../middleware/auth.js";
import {
  itineraryValidation,
  generateItineraryValidation,
  itineraryItemValidation,
} from "../middleware/validation/itineraryValidation.js";

// All routes require authentication
router.use(authenticate);

router.get("/", getItineraries);
router.get("/:id", getItinerary);
router.post("/", itineraryValidation, createItinerary);
router.post("/generate", generateItineraryValidation, generateItinerary);
router.post("/generate/:generation_id/save", saveGeneratedItinerary);
router.put("/:id", itineraryValidation, updateItinerary);
router.delete("/:id", deleteItinerary);

// Itinerary items
router.post("/:id/items", itineraryItemValidation, addItineraryItem);
router.put("/:id/items/:item_id", itineraryItemValidation, updateItineraryItem);
router.delete("/:id/items/:item_id", deleteItineraryItem);

export default router;
