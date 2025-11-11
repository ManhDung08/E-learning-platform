import AppError from "./AppError.js";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "bad_request") {
    super(message, 400, code);
  }
}