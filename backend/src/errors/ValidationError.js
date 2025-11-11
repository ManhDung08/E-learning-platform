import AppError from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message, field, code = "validation_error") {
    super(message, 400, code);
    this.field = field;
  }
}
