import AppError from "./AppError.js";

export class NotFoundError extends AppError {
  constructor(resource = "Resource", code = "not_found") {
    super(`${resource} not found`, 404, code);
  }
}
