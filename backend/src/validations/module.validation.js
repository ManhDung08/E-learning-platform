import { body, param } from "express-validator";

/**
 * Validation for creating a module
 */
export const createModuleValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a positive integer"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
];

/**
 * Validation for updating a module
 */
export const updateModuleValidation = [
  param("moduleId")
    .isInt({ min: 1 })
    .withMessage("Module ID must be a positive integer"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Order must be a positive integer"),
];

/**
 * Validation for module ID parameter
 */
export const moduleIdValidation = [
  param("moduleId")
    .isInt({ min: 1 })
    .withMessage("Module ID must be a positive integer"),
];

/**
 * Validation for deleting a module
 */
export const deleteModuleValidation = [
  param("moduleId")
    .isInt({ min: 1 })
    .withMessage("Module ID must be a positive integer"),
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
 * Validation for reordering modules
 */
export const reorderModulesValidation = [
  param("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a positive integer"),

  body("moduleOrders")
    .isArray({ min: 1 })
    .withMessage("moduleOrders must be a non-empty array"),

  body("moduleOrders.*.moduleId")
    .isInt({ min: 1 })
    .withMessage("Each moduleId must be a positive integer"),

  body("moduleOrders.*.order")
    .isInt({ min: 1 })
    .withMessage("Each order must be a positive integer"),
];
