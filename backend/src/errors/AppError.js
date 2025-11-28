export default class AppError extends Error {
  constructor(message, statusCode = 500, code = "internal_error", field = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
  }
}