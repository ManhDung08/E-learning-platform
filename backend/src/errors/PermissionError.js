import AppError from "./AppError.js";

export class PermissionError extends AppError {
  constructor(message = "Forbidden", code = "forbidden") {
    super(message, 403, code);
  }
}