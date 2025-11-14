import AppError from "./AppError.js";

export class AwsError extends AppError {
  constructor(message, code) {
    super(message, code);
    this.name = "AwsError";
  }
}

export class S3AccessDeniedError extends AwsError {
  constructor(message = "Access denied to S3 resource") {
    super(message, "s3_access_denied");
    this.name = "S3AccessDeniedError";
  }
}

export class S3UploadError extends AwsError {
  constructor(message = "Failed to upload file to S3") {
    super(message, "s3_upload_error");
    this.name = "S3UploadError";
  }
}

export class S3GenerateSignedUrlError extends AwsError {
  constructor(message = "Failed to generate signed URL for S3 object") {
    super(message, "s3_generate_signed_url_error");
    this.name = "S3GenerateSignedUrlError";
  }
}

export class S3DeleteError extends AwsError {
  constructor(message = "Failed to delete file from S3") {
    super(message, "s3_delete_error");
    this.name = "S3DeleteError";
  }
}
export class S3FileNotFoundError extends AwsError {
  constructor(message = "File not found in S3") {
    super(message, "s3_file_not_found");
    this.name = "S3FileNotFoundError";
  }
}

export class S3CopyError extends AwsError {
  constructor(message = "Failed to copy file in S3") {
    super(message, "s3_copy_error");
    this.name = "S3CopyError";
  }
}
