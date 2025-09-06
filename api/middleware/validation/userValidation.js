import { body, query } from "express-validator";
import { handleValidationErrors } from "./authValidation";

const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name must be between 1-100 characters")
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name must be between 1-100 characters")
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        throw new Error("You must be at least 13 years old");
      }
      return true;
    }),

  body("budgetRange")
    .optional()
    .isIn(["budget", "mid-range", "luxury"])
    .withMessage("Budget range must be one of: budget, mid-range, luxury"),

  body("ecoInterests")
    .optional()
    .isArray()
    .withMessage("Eco interests must be an array")
    .custom((interests) => {
      const validInterests = [
        "nature",
        "culture",
        "food",
        "wildlife",
        "renewable-energy",
      ];
      if (interests.some((interest) => !validInterests.includes(interest))) {
        throw new Error("Invalid eco interest provided");
      }
      return true;
    }),

  body("preferredLanguage")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Preferred language must be less than 10 characters"),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code"),

  handleValidationErrors,
];

const getUserActivitiesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1-100")
    .toInt(),

  query("activity_type")
    .optional()
    .isIn([
      "event_rsvp",
      "event_attended",
      "accommodation_booked",
      "restaurant_visited",
      "review_written",
      "itinerary_created",
      "badge_earned",
    ])
    .withMessage("Invalid activity type"),

  handleValidationErrors,
];

const getUserItinerariesValidation = [
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

  query("status")
    .optional()
    .isIn(["draft", "active", "completed"])
    .withMessage("Status must be one of: draft, active, completed"),

  handleValidationErrors,
];

export {
  updateProfileValidation,
  getUserActivitiesValidation,
  getUserItinerariesValidation,
};
