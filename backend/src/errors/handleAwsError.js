import {
  AwsError,
  S3AccessDeniedError,
  S3UploadError,
  S3DeleteError,
  S3FileNotFoundError,
} from "./AwsError.js";

export function handleAwsError(err) {
  if (!err || !err.code) {
    return new AwsError(err?.message || "Unknown AWS error", "aws_error");
  }

  switch (err.code) {
    case "NoSuchKey":
      return new S3FileNotFoundError();
    case "AccessDenied":
      return new S3AccessDeniedError();
    case "UploadFailed":
      return new S3UploadError();
    case "DeleteFailed":
      return new S3DeleteError();
    default:
      return new AwsError(err.message, err.code);
  }
}
