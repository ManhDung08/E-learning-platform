import { Router } from "express";
import certificateController from "../controllers/certificate.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadCertificate } from "../middlewares/upload.middleware.js";
import {
  issueCertificateValidation,
  userCertificatesValidation,
  certificateIdValidation,
} from "../validations/certificate.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Certificate issuing and retrieval
 */

/**
 * @swagger
 * /api/certificate:
 *   post:
 *     summary: Create a certificate for current user in a course
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: integer
 *                 example: 2
 *               certificate:
 *                 type: string
 *                 format: binary
 *                 description: Certificate file (PDF/JPEG/PNG)
 *     responses:
 *       201:
 *         description: Certificate created successfully
 *       400:
 *         description: Validation error or certificate already exists
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  isAuth(),
  uploadCertificate,
  issueCertificateValidation,
  validate,
  certificateController.issueCertificate
);

/**
 * @swagger
 * /api/certificate/me:
 *   get:
 *     summary: Get certificates of current user
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of certificates
 */
router.get("/me", isAuth(), certificateController.getMyCertificates);

/**
 * @swagger
 * /api/certificate/user/{userId}:
 *   get:
 *     summary: Get certificates by user ID
 *     description: Users can view their own certificates, admins can view any user's certificates
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of certificates
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only view own certificates unless admin
 *       404:
 *         description: User not found
 */
router.get(
  "/user/:userId",
  isAuth(),
  userCertificatesValidation,
  validate,
  certificateController.getCertificatesByUser
);

/**
 * @swagger
 * /api/certificate/{id}:
 *   get:
 *     summary: Get certificate by ID
 *     description: Certificate owners, course instructors, and admins can view certificate details
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Certificate detail
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - must be certificate owner, course instructor, or admin
 *       404:
 *         description: Certificate not found
 */
router.get(
  "/:id",
  isAuth(),
  certificateIdValidation,
  validate,
  certificateController.getCertificateById
);

export default router;
