import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import {
  signupValidation,
  loginValidation,
} from "../validations/auth.validation.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/login", loginValidation, validate, authController.login);
router.post("/signup", signupValidation, validate, authController.signup);
router.post("/logout", authController.logout);

export default router;
