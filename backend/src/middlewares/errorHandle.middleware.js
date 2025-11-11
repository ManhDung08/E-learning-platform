import AppError from "../errors/AppError.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import handleAwsError from "../errors/handleAwsError.js";
import handlePrismaError from "../errors/handlePrismaError.js";

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

  if (
    err.name?.includes("S3") ||
    ["NoSuchKey", "AccessDenied", "UploadFailed", "DeleteFailed"].includes(
      err.code
    )
  ) {
    const awsError = handleAwsError(err);
    return res.status(awsError.statusCode || 400).json({
      message: awsError.message,
      code: awsError.code,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
    code: "internal_error",
  });
};
