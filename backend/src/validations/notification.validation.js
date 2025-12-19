import { param, query } from "express-validator";

export const notificationListValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  query("isRead")
    .optional()
    .isBoolean()
    .withMessage("isRead must be boolean")
    .toBoolean(),
];

export const notificationIdParamValidation = [
  param("id")
    .exists()
    .withMessage("Notification id is required")
    .isInt({ min: 1 })
    .withMessage("Notification id must be a positive integer")
    .toInt(),
];
