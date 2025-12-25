import { body, param } from "express-validator";

export const issueCertificateValidation = [
  body("courseId")
    .exists()
    .withMessage("courseId is required")
    .isInt({ min: 1 })
    .withMessage("courseId must be a positive integer")
    .toInt(),
];

export const userCertificatesValidation = [
  param("userId")
    .exists()
    .withMessage("userId is required")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer")
    .toInt(),
];

export const certificateIdValidation = [
  param("id")
    .exists()
    .withMessage("Certificate id is required")
    .isInt({ min: 1 })
    .withMessage("Certificate id must be a positive integer")
    .toInt(),
];
