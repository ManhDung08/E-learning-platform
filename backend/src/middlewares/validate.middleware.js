import { validationResult } from "express-validator";
import { ValidationError } from "../errors/ValidationError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return next(new ValidationError(firstError.msg, firstError.path));
  }

  next();
};
