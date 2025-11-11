import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/login", loginValidation, validate, authController.login);
router.post("/signup", signupValidation, validate, authController.signup);

router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

router.post("/logout", authController.logout);

export default router;
