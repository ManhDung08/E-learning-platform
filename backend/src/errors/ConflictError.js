import AppError from "./AppError.js";

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", field = null, code = "conflict") {
    super(message, 409, code);
    this.field = field;
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  constructor(message = "Email already exists") {
    super(message, "email", "email_exists");
  }
}

export class UsernameAlreadyExistsError extends ConflictError {
  constructor(message = "Username already exists") {
    super(message, "username", "username_exists");
  }
}