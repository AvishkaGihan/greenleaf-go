import express from "express";
const router = express.Router();
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController";
import { authenticateAdmin } from "../middleware/auth";
import {
  getRestaurantsValidation,
  restaurantValidation,
} from "../middleware/validation/restaurantValidation";

// Public routes
router.get("/", getRestaurantsValidation, getRestaurants);
router.get("/:id", getRestaurant);

// Admin routes
router.post("/", authenticateAdmin, restaurantValidation, createRestaurant);
router.put("/:id", authenticateAdmin, restaurantValidation, updateRestaurant);
router.delete("/:id", authenticateAdmin, deleteRestaurant);

export default router;
