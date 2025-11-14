import { Router } from "express";
import oauthController from "../controllers/oauth2.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OAuth2
 *   description: OAuth2 authentication with third-party providers
 */

/**
 * @swagger
 * /api/oauth2/google:
 *   get:
 *     summary: Initiate Google OAuth2 authentication
 *     tags: [OAuth2]
 *     description: Redirects user to Google OAuth2 consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth2 consent screen
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "https://accounts.google.com/oauth/authorize?..."
 */
router.get("/google", oauthController.googleAuth);

/**
 * @swagger
 * /api/oauth2/callback/google:
 *   get:
 *     summary: Google OAuth2 callback endpoint
 *     tags: [OAuth2]
 *     description: Handles the callback from Google OAuth2 after user consent
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Error parameter if authentication failed
 *     responses:
 *       302:
 *         description: Redirect to frontend with authentication result
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "http://localhost:5173/dashboard"
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "token=abcde12345; Path=/; HttpOnly"
 *       400:
 *         description: OAuth2 authentication failed
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "http://localhost:5173/login?error=oauth_failed"
 */
router.get("/callback/google", oauthController.googleCallback);

export default router;
