import express from "express";
import userController from "../controllers/user.controller.js";
import { changePasswordValidation, updateProfileValidation } from "../validations/user.validation.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

// Get current user profile
router.get("/profile", isAuth(["student", "instructor", "admin"]), userController.getProfile);

// Get user profile by username (public)
router.get("/profile/:username", userController.getProfileByUsername);

// Update user profile
router.put(
  "/profile",
  isAuth(["student", "instructor", "admin"]),
  updateProfileValidation,
  validate,
  userController.updateProfile
);

// Change password
router.post(
  "/change-password",
  isAuth(["student", "instructor", "admin"]),
  changePasswordValidation,
  validate,
  userController.changePassword
);

// Get user enrollments
router.get("/enrollments", isAuth(["student", "instructor"]), userController.getEnrollments);

// Get user notifications
router.get("/notifications", isAuth(["student", "instructor", "admin"]), userController.getNotifications);

// Mark notification as read
router.put("/notifications/:id/read", isAuth(["student", "instructor", "admin"]), userController.markNotificationRead);

// Mark all notifications as read
router.put("/notifications/read-all", isAuth(["student", "instructor", "admin"]), userController.markAllNotificationsRead);

// Deactivate account
router.delete("/account", isAuth(["student", "instructor"]), userController.deactivateAccount);

// Admin routes
router.get("/admin/users", isAuth(["admin"]), userController.getAllUsers);

export default router;