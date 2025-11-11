import authService from "../services/auth.service.js";
import AppError from "../errors/AppError.js";
import { ValidationError } from "../errors/ValidationError.js";
import {
  AuthError,
  EmailNotVerifiedError,
  OAuthUserError,
} from "../errors/AuthError.js";
import {
  TokenError,
  VerificationTokenError,
  ResetPasswordTokenError,
} from "../errors/TokenError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    setAuthCookies(res, result);

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    if (err instanceof AuthError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, field: err.field });
    }
    console.error("Login error:", err);
    next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    try {
      const result = await authService.signup(username, email, password, role);
      return res
        .status(201)
        .json({ message: result.message, userId: result.userId });
    } catch (err) {
      if (err instanceof ValidationError) {
        return res
          .status(err.statusCode || 400)
          .json({ message: err.message, field: err.field });
      }
      throw err;
    }
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

    try {
      const result = await authService.verifyEmail(token);
      setAuthCookies(res, result);
      return res.status(200).json({ message: result.message });
    } catch (err) {
      if (err instanceof TokenError) {
        return res.status(err.statusCode || 400).json({ message: err.message });
      }
      throw err;
    }
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

    try {
      const result = await authService.resendVerificationEmail(email);
      return res.status(200).json({ message: result.message });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      if (err instanceof AppError && err.code === "already_verified") {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    try {
      const result = await authService.forgotPassword(email);
      return res.status(200).json({ message: result.message });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      if (err instanceof OAuthUserError) {
        return res.status(err.statusCode || 400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    try {
      const result = await authService.resetPassword(token, newPassword);
      return res.status(200).json({ message: result.message });
    } catch (err) {
      if (err instanceof TokenError) {
        return res.status(err.statusCode || 400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error("Reset password error:", error);
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

export default {
  login,
  signup,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  logout,
};
