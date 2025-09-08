import { body, query, param } from "express-validator";
import { handleValidationErrors } from "./authValidation";

const eventValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters"),

  body("description")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage(
      "Description is required and must be less than 5000 characters"
    ),

  body("shortDescription")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Short description must be less than 500 characters"),

  body("eventType")
    .isIn([
      "beach-cleanup",
      "tree-planting",
      "wildlife-monitoring",
      "education",
      "research",
      "restoration",
    ])
    .withMessage(
      "Event type must be one of: beach-cleanup, tree-planting, wildlife-monitoring, education, research, restoration"
    ),

  body("difficultyLevel")
    .optional()
    .isIn(["easy", "moderate", "challenging"])
    .withMessage(
      "Difficulty level must be one of: easy, moderate, challenging"
    ),

  body("ageRequirement")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Age requirement must be a positive integer"),

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

  body("startDate").isISO8601().withMessage("Start date must be a valid date"),

  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),

  body("endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),

  body("durationHours")
    .isFloat({ min: 0.5, max: 24 })
    .withMessage("Duration must be between 0.5-24 hours"),

  body("maxParticipants")
    .isInt({ min: 1 })
    .withMessage("Maximum participants must be at least 1"),

  body("minParticipants")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Minimum participants must be at least 1"),

  body("equipmentProvided")
    .optional()
    .isArray()
    .withMessage("Equipment provided must be an array"),

  body("whatToBring")
    .optional()
    .isArray()
    .withMessage("What to bring must be an array"),

  body("organizerName")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage(
      "Organizer name is required and must be less than 255 characters"
    ),

  body("ecoPointsReward")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Eco points reward must be a positive integer"),

  body("imageUrls")
    .optional()
    .isArray()
    .withMessage("Image URLs must be an array"),

  handleValidationErrors,
];

const getEventsValidation = [
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

  query("event_type")
    .optional()
    .isIn([
      "beach-cleanup",
      "tree-planting",
      "wildlife-monitoring",
      "education",
      "research",
      "restoration",
    ])
    .withMessage("Invalid event type"),

  query("start_date")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  query("end_date")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  query("difficulty_level")
    .optional()
    .isIn(["easy", "moderate", "challenging"])
    .withMessage(
      "Difficulty level must be one of: easy, moderate, challenging"
    ),

  query("available_spots")
    .optional()
    .isBoolean()
    .withMessage("Available spots must be a boolean")
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

const eventRsvpValidation = [
  param("id").isMongoId().withMessage("Invalid event ID"),

  body("emergencyContactName")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Emergency contact name must be less than 255 characters"),

  body("emergencyContactPhone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid emergency contact phone number"),

  body("dietaryRestrictions")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Dietary restrictions must be less than 500 characters"),

  body("specialRequirements")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special requirements must be less than 500 characters"),

  handleValidationErrors,
];

export { eventValidation, getEventsValidation, eventRsvpValidation };
