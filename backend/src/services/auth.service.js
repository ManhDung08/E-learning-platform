import prisma from "../configs/prisma.config.js";
import { compare, hash } from "bcrypt";
import { generateTokens } from "../utils/jwt.util.js";
import mailUtil from "../utils/mail.util.js";
import crypto from "crypto";

const login = async (usernameOrEmail, password) => {
  try {
    const isEmail = usernameOrEmail.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });

    if (!user) {
      // Username/email không đúng
      return { error: "username" };
    }

    if (!user.passwordHash) {
      // User đăng ký bằng OAuth, không có password
      return { error: "oauth" };
    }

    if (!user.emailVerified) {
      return { error: "email_not_verified" };
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return { error: "password" };
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      role: user.role,
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  } catch (error) {
    console.error("Error in login function:", error);
    throw new Error("Login failed");
  }
};

const signup = async (username, email, password, role = "student") => {
  try {
    // Check if username already exists
    const existingUsername = await prisma.user.findFirst({
      where: { username: username },
    });

    if (existingUsername) {
      return { error: "username" };
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findFirst({
      where: { email: email },
    });

    if (existingEmail) {
      return { error: "email" };
    }

    const hashedPassword = await hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user (chưa verify email)
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        passwordHash: hashedPassword,
        role: role,
        emailVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry,
      },
    });

    await mailUtil.sendVerificationEmail(email, username, verificationToken);

    return {
      success: true,
      message: "Please check your email to verify your account",
      userId: user.id,
    };
  } catch (error) {
    console.error("Error in signup function:", error);
    throw new Error("Signup failed");
  }
};

const verifyEmail = async (token) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(), // Token chưa hết hạn
        },
      },
    });

    if (!user) {
      return { error: "invalid_token" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    await mailUtil.sendWelcomeEmail(user.email, user.username);

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      role: user.role,
    });

    return {
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("Error in verifyEmail function:", error);
    throw new Error("Email verification failed");
  }
};

const resendVerificationEmail = async (email) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      return { error: "user_not_found" };
    }

    if (user.emailVerified) {
      return { error: "already_verified" };
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry,
      },
    });

    await mailUtil.sendVerificationEmail(
      email,
      user.username,
      verificationToken
    );

    return {
      success: true,
      message: "Verification email has been resent",
    };
  } catch (error) {
    console.error("Error in resendVerificationEmail function:", error);
    throw new Error("Failed to resend verification email");
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      return { error: "user_not_found" };
    }

    // nếu user đăng ký qua OAuth
    if (!user.passwordHash) {
      return { error: "oauth_user" };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: resetTokenExpiry,
      },
    });

    // Gửi email reset password
    await mailUtil.sendForgotPasswordEmail(email, user.username, resetToken);

    return {
      success: true,
      message: "Password reset link has been sent to your email",
    };
  } catch (error) {
    console.error("Error in forgotPassword function:", error);
    throw new Error("Failed to process forgot password request");
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date(), // Token chưa hết hạn
        },
      },
    });

    if (!user) {
      return { error: "invalid_token" };
    }

    // Hash password mới
    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    // Gửi email xác nhận reset password thành công
    await mailUtil.sendPasswordResetSuccessEmail(user.email, user.username);

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  } catch (error) {
    console.error("Error in resetPassword function:", error);
    throw new Error("Failed to reset password");
  }
};

export default {
  login,
  signup,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
