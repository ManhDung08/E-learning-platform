import { body, query } from "express-validator";

export const changePasswordValidation = [
  body("currentPassword")
    .exists()
    .withMessage("currentPassword is required")
    .isLength({ min: 6 })
    .withMessage("currentPassword must be at least 6 characters"),

  body("newPassword")
    .exists()
    .withMessage("newPassword is required")
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters")
];

export const setPasswordValidation = [
  body("newPassword")
    .exists()
    .withMessage("newPassword is required")
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters")
];

export const updateProfileValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name must not exceed 50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must not exceed 50 characters"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be either male, female, or other"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Date of birth must be a valid ISO 8601 date"),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("Invalid phone number format"),

  body("profileImageUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Profile image must be a valid URL"),
];

export const getAllUsersValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),

  query("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Role must be one of: student, instructor, admin"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value")
    .toBoolean(),
];
