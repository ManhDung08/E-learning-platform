import { body, param } from "express-validator";

/**
 * Validation for lesson ID parameter
 */
export const lessonIdParamValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),
];

/**
 * Validation for course ID parameter
 */
export const courseIdParamValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a positive integer"),
];

/**
 * Validation for creating or updating a lesson note
 */
export const upsertLessonNoteValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 1, max: 10000 })
    .withMessage("Content must be between 1 and 10000 characters"),
];

/**
 * Validation for deleting a lesson note
 */
export const deleteLessonNoteValidation = [
  param("lessonId")
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),
];
