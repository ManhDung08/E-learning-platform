import AppError from "./AppError.js";

export class AuthError extends AppError {
  constructor(message = "Authentication failed", field = null, code = "auth_error") {
    super(message, 401, code);
    this.field = field;
  }
}

export class EmailNotVerifiedError extends AuthError {
  constructor(message = "Email is not verified") {
    super(message, "email", "email_not_verified");
  }
}

export class OAuthUserError extends AuthError {
  constructor(message = "This account uses OAuth login") {
    super(message, "password", "oauth_user");
  }
}