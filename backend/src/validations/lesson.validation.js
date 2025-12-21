import { body, param } from "express-validator";

/**
 * Validation for creating a lesson
 */
export const createLessonValidation = [
  param("moduleId")
    .isInt({ min: 1 })
    .withMessage("Module ID must be a positive integer"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),

  body("durationSeconds")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Duration must be a non-negative integer"),

  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
];

/**
 * Validation for updating a lesson
 */
export const updateLessonValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("content")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (typeof value !== "string") {
        throw new Error("Content must be a string or null");
      }
      if (value.trim().length < 10) {
        throw new Error(
          "Content must be at least 10 characters long when provided"
        );
      }
      return true;
    }),

  body("durationSeconds")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (!Number.isInteger(value) || value < 0) {
        throw new Error("Duration must be a non-negative integer or null");
      }
      return true;
    }),

  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
];

/**
 * Validation for lesson ID parameter
 */
export const lessonIdValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),
];

/**
 * Validation for module ID parameter
 */
export const moduleIdParamValidation = [
  param("moduleId")
    .isInt({ min: 1 })
    .withMessage("Module ID must be a positive integer"),
];

/**
 * Validation for deleting a lesson
 */
export const deleteLessonValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),
];

/**
 * Validation for reordering lessons
 */
export const reorderLessonsValidation = [
  param("moduleId")
    .isInt({ min: 1 })
    .withMessage("Module ID must be a positive integer"),

  body("lessonOrders")
    .isArray({ min: 1 })
    .withMessage("lessonOrders must be a non-empty array"),

  body("lessonOrders.*.lessonId")
    .isInt({ min: 1 })
    .withMessage("Each lessonId must be a positive integer"),

  body("lessonOrders.*.order")
    .isInt({ min: 1 })
    .withMessage("Each order must be a positive integer"),
];

/**
 * Validation for updating lesson progress
 */
export const updateLessonProgressValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),

  body("isCompleted")
    .optional()
    .isBoolean()
    .withMessage("isCompleted must be a boolean"),

  body("watchedSeconds")
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (!Number.isInteger(value) || value < 0) {
        throw new Error(
          "watchedSeconds must be a non-negative integer or null"
        );
      }
      return true;
    }),
];
