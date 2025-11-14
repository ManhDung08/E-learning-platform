import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import s3Client from "../configs/aws.config.js";
import { uploadConfig } from "../configs/upload.config.js";
import {
  S3UploadError,
  S3DeleteError,
  S3FileNotFoundError,
  S3GenerateSignedUrlError,
  S3CopyError,
} from "../errors/AwsError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import AppError from "../errors/AppError.js";

export const extractKeyFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error("Error extracting key from URL:", error);
    throw new BadRequestError("Invalid URL format");
  }
};

// upload file to S3
export const uploadToS3 = async ({
  fileBuffer,
  fileName,
  fileType,
  mimeType,
  metadata = {},
}) => {
  try {
    if (!uploadConfig.allowedMimeTypes[fileType]) {
      throw new BadRequestError(`Invalid file type: ${fileType}`);
    }

    if (!uploadConfig.allowedMimeTypes[fileType].includes(mimeType)) {
      throw new BadRequestError(
        `Invalid MIME type ${mimeType} for file type ${fileType}`
      );
    }

    const fileSize = Buffer.isBuffer(fileBuffer)
      ? fileBuffer.length
      : fileBuffer.size;
    if (fileSize > uploadConfig.maxFileSize[fileType]) {
      throw new BadRequestError(
        `File size exceeds maximum allowed size for ${fileType}`
      );
    }

    // Generate file path based on file type and metadata
    const folderPath = generateFolderPath(fileType, metadata);
    const uniqueFileName = generateUniqueFileName(fileName);
    const key = `${folderPath}/${uniqueFileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      CacheControl: uploadConfig.cacheControl[fileType] || "no-cache",
      Metadata: {
        uploadType: fileType,
        originalName: fileName,
        ...metadata,
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    return {
      key,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      bucket: process.env.AWS_S3_BUCKET,
      fileName: uniqueFileName,
      originalName: fileName,
      fileType,
      mimeType,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new S3UploadError(`Failed to upload file: ${error.message}`);
  }
};

// pre-signed URL for downloading file from S3
export const getSignedUrlForDownload = async (
  key,
  fileType = "default",
  expiresIn = null
) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const expiry =
      expiresIn ||
      uploadConfig.signedUrlExpiry[fileType] ||
      uploadConfig.signedUrlExpiry.default;

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiry,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new S3GenerateSignedUrlError(
      `Failed to generate signed URL: ${error.message}`
    );
  }
};

// pre-signed URL for uploading file to S3
export const getSignedUrlForUpload = async ({
  fileName,
  fileType,
  mimeType,
  metadata = {},
  expiresIn = 900,
}) => {
  try {
    // Validate file type and MIME type
    if (!uploadConfig.allowedMimeTypes[fileType]) {
      throw new BadRequestError(`Invalid file type: ${fileType}`);
    }

    if (!uploadConfig.allowedMimeTypes[fileType].includes(mimeType)) {
      throw new BadRequestError(
        `Invalid MIME type ${mimeType} for file type ${fileType}`
      );
    }

    // Generate file path
    const folderPath = generateFolderPath(fileType, metadata);
    const uniqueFileName = generateUniqueFileName(fileName);
    const key = `${folderPath}/${uniqueFileName}`;

    // Create PUT command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: mimeType,
      CacheControl: uploadConfig.cacheControl[fileType] || "no-cache",
      Metadata: {
        uploadType: fileType,
        originalName: fileName,
        ...metadata,
      },
    });

    // Generate signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      uploadUrl,
      key,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw new S3GenerateSignedUrlError(
      `Failed to generate upload URL: ${error.message}`
    );
  }
};

// delete file from S3
export const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new S3DeleteError(`Failed to delete file: ${error.message}`);
  }
};

// delete multiple files from S3
export const deleteMultipleFromS3 = async (keys) => {
  const results = {
    deleted: [],
    failed: [],
  };

  for (const key of keys) {
    try {
      await deleteFromS3(key);
      results.deleted.push(key);
    } catch (error) {
      results.failed.push({ key, error: error.message });
    }
  }

  return results;
};

// check if file exists in S3
export const checkFileExists = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);
    return {
      exists: true,
      size: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error) {
    if (error.name === "NotFound") {
      return null;
    }
    throw new S3FileNotFoundError(`File not found: ${error.message}`);
  }
};

// upload local file to S3
export const uploadLocalFileToS3 = async (filePath, fileType, metadata = {}) => {
  try {
    // Read file from filesystem
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // Detect MIME type (simplified - you might want to use a library like 'mime-types')
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
    };
    const mimeType = mimeTypeMap[ext] || "application/octet-stream";

    // Upload to S3
    return await uploadToS3({
      fileBuffer,
      fileName,
      fileType,
      mimeType,
      metadata,
    });
  } catch (error) {
    console.error("Error uploading local file:", error);
    throw new S3UploadError(`Failed to upload local file: ${error.message}`);
  }
};

const generateFolderPath = (fileType, metadata) => {
  const folderFn = uploadConfig.folders[fileType];

  if (!folderFn) {
    throw new BadRequestError(
      `No folder configuration for file type: ${fileType}`
    );
  }

  // Call folder function with appropriate parameters based on file type
  switch (fileType) {
    case "avatar":
      return folderFn(metadata.userId);
    case "courseImage":
      return folderFn(metadata.courseId);
    case "lessonVideo":
      return folderFn(metadata.courseId, metadata.moduleId, metadata.lessonId);
    case "material":
      return folderFn(metadata.courseId, metadata.moduleId);
    case "assignment":
      return folderFn(metadata.courseId, metadata.userId, metadata.lessonId);
    case "certificate":
      return folderFn(metadata.userId, metadata.courseId);
    case "supportAttachment":
      return folderFn(metadata.ticketId, metadata.userId);
    default:
      throw new BadRequestError(`Unknown file type: ${fileType}`);
  }
};

const generateUniqueFileName = (originalFileName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalFileName);
  const nameWithoutExt = path.basename(originalFileName, ext);

  // Sanitize filename: remove special characters
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .substring(0, 50);

  return `${sanitized}-${timestamp}-${randomString}${ext}`;
};

export const validateFileSize = (fileSize, fileType) => {
  const maxSize = uploadConfig.maxFileSize[fileType];
  if (!maxSize) {
    throw new AppError(
      `No size limit configured for file type: ${fileType}`
    );
  }
  return fileSize <= maxSize;
};

export const validateMimeType = (mimeType, fileType) => {
  const allowedTypes = uploadConfig.allowedMimeTypes[fileType];
  if (!allowedTypes) {
    throw new BadRequestError(
      `No MIME types configured for file type: ${fileType}`
    );
  }
  return allowedTypes.includes(mimeType);
};

export const copyFileInS3 = async (
  sourceKey,
  destinationKey,
  deleteSource = false
) => {
  try {
    const { CopyObjectCommand } = await import("@aws-sdk/client-s3");

    // Copy file
    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      CopySource: `${process.env.AWS_S3_BUCKET}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(copyCommand);

    // Delete source if requested
    if (deleteSource) {
      await deleteFromS3(sourceKey);
    }

    return {
      sourceKey,
      destinationKey,
      moved: deleteSource,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${destinationKey}`,
    };
  } catch (error) {
    console.error("Error copying file in S3:", error);
    throw new S3CopyError(`Failed to copy file: ${error.message}`);
  }
};
