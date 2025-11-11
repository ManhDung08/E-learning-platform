import AppError from "../errors/AppError.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

export default (err, req, res, next) => {
  console.error("Error caught:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      field: err.field || undefined,
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    return res.status(400).json({
      message: "Database error: " + err.message,
      code: "database_error",
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
    code: "internal_error",
  });
};
