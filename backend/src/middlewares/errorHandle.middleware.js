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
    const prismaError = handlePrismaError(err);
    return res.status(prismaError.statusCode || 400).json({
      message: prismaError.message,
      code: prismaError.code || "database_error",
      field: prismaError.field || undefined,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
    code: "internal_error",
  });
};
