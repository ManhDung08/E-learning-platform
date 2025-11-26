import multer from "multer";
import { uploadConfig } from "../configs/upload.config.js";
import { BadRequestError } from "../errors/BadRequestError.js";

// Configure multer with memory storage for S3 uploads
const storage = multer.memoryStorage();

// Generic multer configuration
const upload = multer({
  storage,
  limits: {
    fileSize: Math.max(...Object.values(uploadConfig.maxFileSize)), // Use the largest allowed file size
  },
});

// Generic file validation middleware
const validateFile = (fileType) => {
  return (req, res, next) => {
    const file = req.file;

    if (!file) {
      return next(new BadRequestError("No file uploaded", "file_required"));
    }

    // Validate MIME type
    const allowedMimeTypes = uploadConfig.allowedMimeTypes[fileType];
    if (!allowedMimeTypes || !allowedMimeTypes.includes(file.mimetype)) {
      return next(
        new BadRequestError(
          `Invalid file type. Allowed types: ${
            allowedMimeTypes ? allowedMimeTypes.join(", ") : "none"
          }`,
          "invalid_mime_type"
        )
      );
    }

    // Validate file size
    const maxSize = uploadConfig.maxFileSize[fileType];
    if (!maxSize || file.size > maxSize) {
      return next(
        new BadRequestError(
          `File too large. Max size: ${
            maxSize ? (maxSize / 1024 / 1024).toFixed(1) : 0
          } MB`,
          "file_too_large"
        )
      );
    }

    next();
  };
};

// Specific upload middlewares for different file types
export const uploadAvatar = [upload.single("avatar"), validateFile("avatar")];

export const uploadCourseImage = [
  upload.single("image"),
  validateFile("courseImage"),
];

export const uploadLessonVideo = [
  upload.single("video"),
  validateFile("lessonVideo"),
];

export const uploadMaterial = [
  upload.single("material"),
  validateFile("material"),
];

export const uploadAssignment = [
  upload.single("assignment"),
  validateFile("assignment"),
];

export const uploadCertificate = [
  upload.single("certificate"),
  validateFile("certificate"),
];

export const uploadSupportAttachment = [
  upload.single("attachment"),
  validateFile("supportAttachment"),
];

// Optional file upload middleware (doesn't require file)
export const optionalUploadCourseImage = [
  upload.single("image"),
  (req, res, next) => {
    // If no file, continue without validation
    if (!req.file) {
      return next();
    }
    // If file exists, validate it
    validateFile("courseImage")(req, res, next);
  },
];

export default {
  uploadAvatar,
  uploadCourseImage,
  uploadLessonVideo,
  uploadMaterial,
  uploadAssignment,
  uploadCertificate,
  uploadSupportAttachment,
  optionalUploadCourseImage,
};
