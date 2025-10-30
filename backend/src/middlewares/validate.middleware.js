import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return next(
      createHttpError(400, firstError.msg, { field: firstError.path })
    );
  }
  
  next();
};