import { body, query } from "express-validator";

export const createCourseValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("priceCents")
    .notEmpty()
    .withMessage("Price is required")
    .isInt({ min: 0 })
    .withMessage("Price must be a non-negative integer")
    .custom((value) => {
      if (value > 100000000) {
        // $1,000,000 in cents
        throw new Error("Price cannot exceed $1,000,000");
      }
      return true;
    }),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
];

export const updateCourseValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("priceCents")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Price must be a non-negative integer")
    .custom((value) => {
      if (value && value > 100000000) {
        // $1,000,000 in cents
        throw new Error("Price cannot exceed $1,000,000");
      }
      return true;
    }),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean value"),
];

export const courseQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term cannot exceed 100 characters"),

  query("isPublished")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isPublished must be 'true' or 'false'"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "title", "priceCents"])
    .withMessage(
      "sortBy must be one of: createdAt, updatedAt, title, priceCents"
    ),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be 'asc' or 'desc'"),
];

export const courseIdValidation = [
  body("courseId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Course ID must be a positive integer"),
];

export const slugValidation = [
  body("slug")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Slug must be between 3 and 100 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
];
