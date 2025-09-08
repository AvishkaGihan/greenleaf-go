import { check, validationResult } from "express-validator";
import { AppError } from "../../utils/errorHandler.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((acc, error) => {
      const key = error.param || error.path || "unknown_field";
      acc[key] = error.msg;
      return acc;
    }, {});

    throw new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      errorMessages
    );
  }
  next();
};

const registerValidation = [
  check("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address")
    .isLength({ max: 255 })
    .withMessage("Email must be less than 255 characters"),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  check("firstName")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name is required and must be less than 100 characters")
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  check("lastName")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name is required and must be less than 100 characters")
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  check("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  check("dateOfBirth")
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

  check("preferredLanguage")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Preferred language must be less than 10 characters"),

  check("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-character code"),

  handleValidationErrors,
];

const loginValidation = [
  check("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  check("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

const socialLoginValidation = [
  check("provider")
    .isIn(["google", "apple"])
    .withMessage("Provider must be either google or apple"),

  check("providerToken").notEmpty().withMessage("Provider token is required"),

  check("providerId").notEmpty().withMessage("Provider ID is required"),

  handleValidationErrors,
];

const forgotPasswordValidation = [
  check("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  handleValidationErrors,
];

const resetPasswordValidation = [
  check("token").notEmpty().withMessage("Reset token is required"),

  check("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  handleValidationErrors,
];

export {
  registerValidation,
  loginValidation,
  socialLoginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  handleValidationErrors,
};
