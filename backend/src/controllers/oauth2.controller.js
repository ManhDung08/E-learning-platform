import oauthService from "../services/oath2.service.js";
import AppError from "../errors/AppError.js";

const googleAuth = (req, res, next) => {
  try {
    const authUrl = oauthService.getGoogleAuthUrl();
    return res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    next(new AppError("Failed to start Google authentication", 500, "oauth_failed"));
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code is missing" });
    }

    const result = await oauthService.handleGoogleCallback(code);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("access_token", result.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 3600000, // 1h
    });

    res.cookie("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 604800000, // 7d
    });

    // Redirect to frontend after successful login
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    // If it's an AppError, let error middleware handle the response but redirect user to login with error query
    const frontendUrl = process.env.FRONTEND_URL;
    if (error instanceof AppError) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.code || "oauth_failed")}`);
    }
    return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

export default {
  googleAuth,
  googleCallback,
};
