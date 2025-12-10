import { body, param } from "express-validator";
import { query } from "express-validator";

export const createTicketValidation = [
  body("subject")
    .exists()
    .withMessage("Subject is required")
    .isString()
    .withMessage("Subject must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Subject must be 3-100 characters"),
  body("message")
    .exists()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Message must be 5-1000 characters"),
];

export const updateTicketStatusValidation = [
  body("status")
    .exists()
    .withMessage("Status is required")
    .isIn(["open", "in_progress", "resolved", "closed"])
    .withMessage("Invalid status value"),
];

export const ticketIdParamValidation = [
  param("id")
    .exists()
    .withMessage("Ticket id is required")
    .isInt({ min: 1 })
    .withMessage("Ticket id must be a positive integer")
    .toInt(),
];

export const paginationQueryValidation = [
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
];
