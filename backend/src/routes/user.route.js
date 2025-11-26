import express from "express";
import userController from "../controllers/user.controller.js";
import {
  setPasswordValidation,
  changePasswordValidation,
  updateProfileValidation,
  getAllUsersValidation,
} from "../validations/user.validation.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: User profile and management operations
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", isAuth(), userController.getMe);

/**
 * @swagger
 * /api/users/update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                       nullable: true
 *                     lastName:
 *                       type: string
 *                       nullable: true
 *                     gender:
 *                       type: string
 *                       enum: ["male", "female", "other"]
 *                       nullable: true
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/update-profile",
  isAuth(),
  updateProfileValidation,
  validate,
  userController.updateMyInfo
);

/**
 * @swagger
 * /api/users/upload-avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [User Management]
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
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Avatar uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profileImageUrl:
 *                       type: string
 *                       example: "https://bucket-name.s3.amazonaws.com/avatars/user-id.jpg"
 *       400:
 *         description: Bad request - invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/upload-avatar", isAuth(), ...uploadAvatar, userController.updateUserAvatar);

/**
 * @swagger
 * /api/users/delete-avatar:
 *   delete:
 *     summary: Delete user avatar
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Avatar deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/delete-avatar", isAuth(), userController.deleteUserAvatar);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/change-password",
  isAuth(),
  changePasswordValidation,
  validate,
  userController.changePassword
);

/**
 * @swagger
 * /api/users/set-password:
 *   put:
 *     summary: Set password for OAuth users
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/set-password", 
  isAuth(), 
  setPasswordValidation,
  validate,
  userController.setPassword
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination, filtering, and search (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page (max 100)
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users by username, email, firstName, or lastName
 *         example: "john"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, instructor, admin]
 *         description: Filter users by role
 *         example: "student"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter users by active status
 *         example: true
 *     responses:
 *       200:
 *         description: Users retrieved successfully with pagination information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 *             examples:
 *               success:
 *                 summary: Successful response with users and pagination
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: 1
 *                       email: "john@example.com"
 *                       username: "john_doe"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       role: "student"
 *                       isActive: true
 *                       createdAt: "2023-01-15T08:30:00Z"
 *                       updatedAt: "2023-01-15T08:30:00Z"
 *                     - id: 2
 *                       email: "jane@example.com"
 *                       username: "jane_smith"
 *                       firstName: "Jane"
 *                       lastName: "Smith"
 *                       role: "instructor"
 *                       isActive: true
 *                       createdAt: "2023-01-16T10:15:00Z"
 *                       updatedAt: "2023-01-16T10:15:00Z"
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 5
 *                     totalCount: 50
 *                     limit: 10
 *                     hasNextPage: true
 *                     hasPreviousPage: false
 *       400:
 *         description: Bad request - invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidPage:
 *                 summary: Invalid page number
 *                 value:
 *                   success: false
 *                   message: "Page number must be at least 1"
 *               invalidLimit:
 *                 summary: Invalid limit
 *                 value:
 *                   success: false
 *                   message: "Limit must be between 1 and 100"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/",
  isAuth(["admin"]),
  getAllUsersValidation,
  validate,
  userController.getAllUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile by ID (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", isAuth(["admin"]), userController.getUserProfileById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", isAuth(["admin"]), userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:id",
  isAuth(["admin"]),
  updateProfileValidation,
  validate,
  userController.updateUserInfo
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", isAuth(["admin"]), userController.deleteUser);

export default router;
