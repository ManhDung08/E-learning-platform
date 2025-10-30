import { Router } from "express";
import oauthController from "../controllers/oauth2.controller.js";

const router = Router();

router.get("/google", oauthController.googleAuth);
// Google OAuth callback
router.get("/callback/google", oauthController.googleCallback);

export default router;
