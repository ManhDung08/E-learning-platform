import authService from "../services/auth.service.js";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    if (result?.error === "username") {
      return res.status(401).json({
        message: "Username or email is incorrect",
        field: "username",
      });
    }

    if (result?.error === "password") {
      return res.status(401).json({
        message: "Password is incorrect",
        field: "password",
      });
    }

    if (result?.error === "oauth") {
      return res.status(400).json({
        message:
          "This account was created via OAuth. Please log in with Google",
        field: "oauth",
      });
    }

    if (result?.error === "email_not_verified") {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        field: "email_not_verified",
      });
    }

    setAuthCookies(res, result);

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const result = await authService.signup(username, email, password, role);

    if (result?.error === "username") {
      return res.status(409).json({
        message: "Username already exists",
        field: "username",
      });
    }

    if (result?.error === "email") {
      return res.status(409).json({
        message: "Email already exists",
        field: "email",
      });
    }

    return res.status(201).json({
      message: result.message,
      userId: result.userId,
    });
  } catch (error) {
    console.error("Signup error:", error);
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const result = await authService.verifyEmail(token);

    if (result?.error === "invalid_token") {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    setAuthCookies(res, result);

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const result = await authService.resendVerificationEmail(email);

    if (result?.error === "user_not_found") {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (result?.error === "already_verified") {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Clear authentication cookies
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

const setAuthCookies = (res, { access_token, refresh_token }) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 3600000, // 1h
  });

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 604800000, // 7d
  });
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

export default {
  login,
  signup,
  verifyEmail,
  resendVerification,
  logout,
};
