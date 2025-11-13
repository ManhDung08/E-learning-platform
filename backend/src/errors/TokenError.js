import AppError from "./AppError.js";

export class TokenError extends AppError {
  constructor(message = "Invalid or expired token", code = "invalid_token") {
    super(message, 401, code);
  }
}

export class InvalidTokenError extends TokenError {
  constructor(message = "Invalid token") {
    super(message, "invalid_token");
  }
}

export class AccessTokenExpiredError extends TokenError {
  constructor(message = "Access token expired") {
    super(message, "access_token_expired");
  }
}

export class RefreshTokenExpiredError extends TokenError {
  constructor(message = "Refresh token expired") {
    super(message, "refresh_token_expired");
  }
}

export class ResetPasswordTokenError extends TokenError {
  constructor(message = "Reset password token invalid or expired") {
    super(message, "reset_token_invalid");
  }
}

export class VerificationTokenError extends TokenError {
  constructor(message = "Email verification token invalid or expired") {
    super(message, "verification_token_invalid");
  }
}
