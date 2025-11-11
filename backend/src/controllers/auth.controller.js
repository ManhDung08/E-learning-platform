import authService from "../services/auth.service.js";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    setAuthCookies(res, result);

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
    } = req.body;

    const result = await authService.signup(
      username,
      email,
      password,
      role,
      firstName || null,
      lastName || null,
      gender || null,
      dateOfBirth || null,
      phoneNumber || null
    );
    return res
      .status(201)
      .json({ message: result.message, userId: result.userId });
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
    setAuthCookies(res, result);
    return res.status(200).json({ message: result.message });
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
    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Resend verification error:", error);
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);
    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);
    return res.status(200).json({ message: result.message });
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
