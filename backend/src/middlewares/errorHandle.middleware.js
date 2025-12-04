import AppError from "../errors/AppError.js";
import { VNPayError } from "../errors/VNPayError.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

const handlePrismaError = (error) => {
  let message = "Database error";
  let code = "database_error";
  let field = undefined;
  let statusCode = 400;

  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const target = error.meta?.target;
      if (target && target.includes("email")) {
        message = "Email already exists";
        code = "email_already_exists";
        field = "email";
      } else if (target && target.includes("username")) {
        message = "Username already exists";
        code = "username_already_exists";
        field = "username";
      } else {
        message = "A record with this value already exists";
        code = "duplicate_entry";
      }
      statusCode = 409;
      break;
    case "P2025":
      // Record not found
      message = "Record not found";
      code = "not_found";
      statusCode = 404;
      break;
    default:
      message = "Database operation failed";
      code = "database_error";
      statusCode = 400;
  }

  return { message, code, field, statusCode };
};

export default (err, req, res, next) => {
  console.error("Error caught:", err);

  if (err instanceof VNPayError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: {
        code: "payment_error",
        responseCode: err.responseCode,
        field: undefined,
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        field: err.field || undefined,
      },
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(err);
    return res.status(prismaError.statusCode || 400).json({
      success: false,
      message: prismaError.message,
      error: {
        code: prismaError.code || "database_error",
        field: prismaError.field || undefined,
      },
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: {
      code: "internal_error",
    },
  });
};
