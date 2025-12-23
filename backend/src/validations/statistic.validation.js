import { query } from "express-validator";

export const dateRangeValidation = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date")
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error("Start date is not a valid date");
        }
      }
      return true;
    }),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (value) {
        const endDate = new Date(value);
        if (isNaN(endDate.getTime())) {
          throw new Error("End date is not a valid date");
        }

        if (req.query.startDate) {
          const startDate = new Date(req.query.startDate);
          if (!isNaN(startDate.getTime()) && endDate < startDate) {
            throw new Error("End date must be after or equal to start date");
          }
        }
      }
      return true;
    }),
];

export const growthTrendsValidation = [
  query("period")
    .optional()
    .isIn(["daily", "weekly", "monthly", "yearly"])
    .withMessage("Period must be one of: daily, weekly, monthly, yearly"),

  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1, max: 365 })
    .withMessage("Limit must be an integer between 1 and 365"),
];
