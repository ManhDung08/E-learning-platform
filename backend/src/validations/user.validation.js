import { body } from "express-validator";

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
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("newPassword must be different from currentPassword");
      }
      return true;
    }),
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
