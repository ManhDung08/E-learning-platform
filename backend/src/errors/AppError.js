export default class AppError extends Error {
  constructor(message, statusCode = 500, code = "internal_error") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}