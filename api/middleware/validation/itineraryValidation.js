import { body, query, param } from "express-validator";
import { handleValidationErrors } from "./authValidation.js";

const itineraryValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters"),

  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),

  body("destinationCity")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination city is required and must be less than 100 characters"
    ),

  body("destinationCountry")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination country is required and must be less than 100 characters"
    ),

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

  body("budgetTotal")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget total must be a positive number"),

  body("budgetCurrency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Budget currency must be a 3-character code"),

  body("travelStyle")
    .isIn(["budget", "mid-range", "luxury"])
    .withMessage("Travel style must be one of: budget, mid-range, luxury"),

  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array"),

  body("groupSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Group size must be at least 1"),

  handleValidationErrors,
];

const generateItineraryValidation = [
  body("destinationCity")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination city is required and must be less than 100 characters"
    ),

  body("destinationCountry")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Destination country is required and must be less than 100 characters"
    ),

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

  body("budgetTotal")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget total must be a positive number"),

  body("budgetCurrency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Budget currency must be a 3-character code"),

  body("travelStyle")
    .isIn(["budget", "mid-range", "luxury"])
    .withMessage("Travel style must be one of: budget, mid-range, luxury"),

  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array"),

  body("groupSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Group size must be at least 1"),

  body("accommodationPreference")
    .optional()
    .isIn(["hotel", "hostel", "resort", "guesthouse", "apartment", "eco-lodge"])
    .withMessage("Invalid accommodation preference"),

  body("includeVolunteerActivities")
    .optional()
    .isBoolean()
    .withMessage("Include volunteer activities must be a boolean"),

  handleValidationErrors,
];

const itineraryItemValidation = [
  body("dayNumber")
    .isInt({ min: 1 })
    .withMessage("Day number must be a positive integer"),

  body("startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),

  body("endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),

  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters"),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("itemType")
    .isIn(["accommodation", "restaurant", "activity", "transport", "event"])
    .withMessage(
      "Item type must be one of: accommodation, restaurant, activity, transport, event"
    ),

  body("accommodationId")
    .optional()
    .isMongoId()
    .withMessage("Invalid accommodation ID"),

  body("restaurantId")
    .optional()
    .isMongoId()
    .withMessage("Invalid restaurant ID"),

  body("conservationEventId")
    .optional()
    .isMongoId()
    .withMessage("Invalid conservation event ID"),

  body("estimatedCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated cost must be a positive number"),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code"),

  body("sortOrder")
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
