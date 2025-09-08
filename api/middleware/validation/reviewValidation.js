import { body, query, param } from "express-validator";
import { handleValidationErrors } from "./authValidation.js";

const reviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1-5"),

  body("ecoFriendlinessRating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Eco-friendliness rating must be between 1-5"),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Title must be less than 255 characters"),

  body("comment")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Comment is required and must be less than 2000 characters"),

  body("stayDate")
    .optional()
    .isISO8601()
    .withMessage("Stay date must be a valid date"),

  body("visitDate")
    .optional()
    .isISO8601()
    .withMessage("Visit date must be a valid date"),

  body("ecoInitiativesObserved")
    .optional()
    .isArray()
    .withMessage("Eco initiatives observed must be an array"),

  body("photos").optional().isArray().withMessage("Photos must be an array"),

  handleValidationErrors,
];

const accommodationReviewValidation = [
  param("id").isMongoId().withMessage("Invalid accommodation ID"),

  ...reviewValidation,
];

const restaurantReviewValidation = [
  param("id").isMongoId().withMessage("Invalid restaurant ID"),

  ...reviewValidation,
];

const helpfulReviewValidation = [
  param("id").isMongoId().withMessage("Invalid review ID"),

  body("is_helpful")
    .isBoolean()
    .withMessage("Helpful flag must be a boolean")
    .toBoolean(),

  handleValidationErrors,
];

export {
  accommodationReviewValidation,
  restaurantReviewValidation,
  helpfulReviewValidation,
};
