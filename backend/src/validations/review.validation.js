import { body, param, query } from "express-validator";

export const createReviewValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),
];

export const updateReviewValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  param("reviewId")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a valid positive integer"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),
];

export const deleteReviewValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  param("reviewId")
    .isInt({ min: 1 })
    .withMessage("Review ID must be a valid positive integer"),
];

export const getCourseReviewsValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating filter must be between 1 and 5"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "rating"])
    .withMessage("Sort by must be either createdAt or rating"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),
];
