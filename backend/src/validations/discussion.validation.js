import { body, param, query } from "express-validator";

export const createDiscussionValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Content must be between 5 and 2000 characters"),
];

export const replyToDiscussionValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  param("discussionId")
    .isInt({ min: 1 })
    .withMessage("Discussion ID must be a valid positive integer"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Content must be between 5 and 2000 characters"),
];

export const updateDiscussionValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  param("discussionId")
    .isInt({ min: 1 })
    .withMessage("Discussion ID must be a valid positive integer"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Content must be between 5 and 2000 characters"),
];

export const deleteDiscussionValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a valid positive integer"),
  param("discussionId")
    .isInt({ min: 1 })
    .withMessage("Discussion ID must be a valid positive integer"),
];

export const getCourseDiscussionsValidation = [
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
  query("sortBy")
    .optional()
    .isIn(["createdAt"])
    .withMessage("Sort by must be createdAt"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),
];
