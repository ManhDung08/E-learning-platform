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

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const changePassword = [
    body('currentPassword')
      .exists().withMessage('currentPassword is required')
      .isLength({ min: 6 }).withMessage('currentPassword must be at least 6 characters'),

    body('newPassword')
      .exists().withMessage('newPassword is required') 
      .isLength({ min: 6 }).withMessage('newPassword must be at least 6 characters')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('newPassword must be different from currentPassword');
        }
        return true;
      }),
];