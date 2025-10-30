import oauthService from "../services/oath2.service.js";

const googleAuth = (req, res) => {
  try {
    const authUrl = oauthService.getGoogleAuthUrl();
    return res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    return res
      .status(500)
      .json({ message: "Failed to start Google authentication" });
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        message: "Authorization code is missing",
      });
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
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

export default {
  googleAuth,
  googleCallback,
};
