import { body } from "express-validator";

export const signupValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

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
    .withMessage("Date of birth must be a valid date (ISO 8601 format)"),

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

  body("role")
    .optional()
    .isIn(["student", "instructor", "admin"])
    .withMessage("Invalid role"),
];

export const loginValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username or email is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body("token").trim().notEmpty().withMessage("Reset token is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];
