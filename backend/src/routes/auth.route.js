import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { changePassword } from '../validations/auth.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  signupValidation,
  loginValidation,
} from "../validations/auth.validation.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/login", loginValidation, validate, authController.login);
router.post("/signup", signupValidation, validate, authController.signup);

router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/logout", authController.logout);
router.post(
  '/change-password',
  authenticate,
  validate(changePassword),
  authController.changePassword
);

export default router;
