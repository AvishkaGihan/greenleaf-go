import { body, query, param } from "express-validator";
import { handleValidationErrors } from "./authValidation";

const accommodationValidation = [
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

  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("type")
    .isIn(["hotel", "hostel", "resort", "guesthouse", "apartment", "eco-lodge"])
    .withMessage(
      "Type must be one of: hotel, hostel, resort, guesthouse, apartment, eco-lodge"
    ),

  body("starRating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Star rating must be between 1-5"),

  body("priceRange")
    .isIn(["$", "$$", "$$$", "$$$$"])
    .withMessage("Price range must be one of: $, $$, $$$, $$$$"),

  body("energyEfficiencyScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Energy efficiency score must be between 1-5"),

  body("wasteManagementScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Waste management score must be between 1-5"),

  body("waterConservationScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Water conservation score must be between 1-5"),

  body("localSourcingScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Local sourcing score must be between 1-5"),

  body("carbonFootprintScore")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Carbon footprint score must be between 1-5"),

  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array"),

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

const updateAccommodationValidation = [
  param("id").isMongoId().withMessage("Invalid accommodation ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be less than 255 characters"),

  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),

  // Include other fields as optional with same validation as above
  ...accommodationValidation
    .slice(1)
    .map((validation) =>
      validation.optional ? validation : validation.optional()
    ),
];

const getAccommodationsValidation = [
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

  query("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  query("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  query("radius")
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage("Radius must be between 1-1000 km"),

  query("eco_rating_min")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Eco rating minimum must be between 1-5"),

  query("price_range")
    .optional()
    .isIn(["$", "$$", "$$$", "$$$$"])
    .withMessage("Price range must be one of: $, $$, $$$, $$$$"),

  query("type")
    .optional()
    .isIn(["hotel", "hostel", "resort", "guesthouse", "apartment", "eco-lodge"])
    .withMessage("Invalid accommodation type"),

  query("amenities")
    .optional()
    .custom((value) => {
      if (typeof value === "string") return true;
      if (Array.isArray(value)) return true;
      throw new Error("Amenities must be a string or array");
    }),

  query("sort_by")
    .optional()
    .isIn(["eco_rating", "price", "distance", "rating"])
    .withMessage("Sort by must be one of: eco_rating, price, distance, rating"),

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

const getAccommodationReviewsValidation = [
  param("id").isMongoId().withMessage("Invalid accommodation ID"),

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

  query("sort_by")
    .optional()
    .isIn(["newest", "oldest", "rating_high", "rating_low", "helpful"])
    .withMessage(
      "Sort by must be one of: newest, oldest, rating_high, rating_low, helpful"
    ),

  handleValidationErrors,
];

export {
  accommodationValidation,
  updateAccommodationValidation,
  getAccommodationsValidation,
  getAccommodationReviewsValidation,
};
