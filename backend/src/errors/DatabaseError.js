import AppError from "./AppError.js";

export class DatabaseError extends AppError {
  constructor(message = "Database error", code = "db_error", originalError = null) {
    super(message, 500, code);
    this.originalError = originalError;
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(field, message = "Duplicate entry") {
    super(message, "unique_constraint");
    this.field = field;
  }
}