import { check, validationResult } from "express-validator";
import { handleValidationErrors } from "./authValidation.js";

const itineraryValidation = [
  check("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters"),

  check("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),

  check("destinationCity")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination city is required and must be less than 100 characters"
    ),

  check("destinationCountry")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination country is required and must be less than 100 characters"
    ),

  check("startDate").isISO8601().withMessage("Start date must be a valid date"),

  check("endDate")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  check("budgetTotal")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget total must be a positive number"),

  check("budgetCurrency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Budget currency must be a 3-character code"),

  check("travelStyle")
    .isIn(["budget", "mid-range", "luxury"])
    .withMessage("Travel style must be one of: budget, mid-range, luxury"),

  check("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array"),

  check("groupSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Group size must be at least 1"),

  handleValidationErrors,
];

const generateItineraryValidation = [
  check("destinationCity")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination city is required and must be less than 100 characters"
    ),

  check("destinationCountry")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination country is required and must be less than 100 characters"
    ),

  check("startDate").isISO8601().withMessage("Start date must be a valid date"),

  check("endDate")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  check("budgetTotal")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget total must be a positive number"),

  check("budgetCurrency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Budget currency must be a 3-character code"),

  check("travelStyle")
    .isIn(["budget", "mid-range", "luxury"])
    .withMessage("Travel style must be one of: budget, mid-range, luxury"),

  check("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array"),

  check("groupSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Group size must be at least 1"),

  check("accommodationPreference")
    .optional()
    .isIn(["hotel", "hostel", "resort", "guesthouse", "apartment", "eco-lodge"])
    .withMessage("Invalid accommodation preference"),

  check("includeVolunteerActivities")
    .optional()
    .isBoolean()
    .withMessage("Include volunteer activities must be a boolean"),

  handleValidationErrors,
];

const itineraryItemValidation = [
  check("dayNumber")
    .isInt({ min: 1 })
    .withMessage("Day number must be a positive integer"),

  check("startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),

  check("endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),

  check("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters"),

  check("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  check("itemType")
    .isIn(["accommodation", "restaurant", "activity", "transport", "event"])
    .withMessage(
      "Item type must be one of: accommodation, restaurant, activity, transport, event"
    ),

  check("accommodationId")
    .optional()
    .isMongoId()
    .withMessage("Invalid accommodation ID"),

  check("restaurantId")
    .optional()
    .isMongoId()
    .withMessage("Invalid restaurant ID"),

  check("conservationEventId")
    .optional()
    .isMongoId()
    .withMessage("Invalid conservation event ID"),

  check("estimatedCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated cost must be a positive number"),

  check("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code"),

  check("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  handleValidationErrors,
];

export {
  itineraryValidation,
  generateItineraryValidation,
  itineraryItemValidation,
};
