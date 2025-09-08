import { body, query, param } from "express-validator";
import { handleValidationErrors } from "./authValidation.js";

const restaurantValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Name is required and must be less than 255 characters"),

  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),

  body("address")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Address is required and must be less than 500 characters"),

  body("city")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("City is required and must be less than 100 characters"),

  body("country")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Country is required and must be less than 100 characters"),

  body("cuisineType")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Cuisine type is required and must be less than 100 characters"
    ),

  body("priceRange")
    .isIn(["$", "$$", "$$$", "$$$$"])
    .withMessage("Price range must be one of: $, $$, $$$, $$$$"),

  body("localSourcingScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Local sourcing score must be between 1-5"),

  body("organicIngredientsScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Organic ingredients score must be between 1-5"),

  body("wasteReductionScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Waste reduction score must be between 1-5"),

  body("energyEfficiencyScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Energy efficiency score must be between 1-5"),

  body("packagingSustainabilityScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Packaging sustainability score must be between 1-5"),

  body("dietaryOptions")
    .optional()
    .isArray()
    .withMessage("Dietary options must be an array"),

  body("certifications")
    .optional()
    .isArray()
    .withMessage("Certifications must be an array"),

  body("imageUrls")
    .optional()
    .isArray()
    .withMessage("Image URLs must be an array"),

  handleValidationErrors,
];

const getRestaurantsValidation = [
  query("city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City must be less than 100 characters"),

  query("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country must be less than 100 characters"),

  query("cuisine_type")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Cuisine type must be less than 100 characters"),

  query("dietary_options")
    .optional()
    .custom((value) => {
      if (typeof value === "string") return true;
      if (Array.isArray(value)) return true;
      throw new Error("Dietary options must be a string or array");
    }),

  query("eco_rating_min")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Eco rating minimum must be between 1-5"),

  query("price_range")
    .optional()
    .isIn(["$", "$$", "$$$", "$$$$"])
    .withMessage("Price range must be one of: $, $$, $$$, $$$$"),

  query("opening_now")
    .optional()
    .isBoolean()
    .withMessage("Opening now must be a boolean")
    .toBoolean(),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1-50")
    .toInt(),

  handleValidationErrors,
];

export { restaurantValidation, getRestaurantsValidation };
