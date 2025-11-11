import prisma from "../configs/prisma.config.js";
import { compare, hash } from "bcrypt";
import { generateTokens } from "../utils/jwt.util.js";
import mailUtil from "../utils/mail.util.js";
import crypto from "crypto";
import {
  AuthError,
  EmailNotVerifiedError,
  OAuthUserError,
} from "../errors/AuthError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import {
  VerificationTokenError,
  ResetPasswordTokenError,
} from "../errors/TokenError.js";
import {
  EmailAlreadyExistsError,
  UsernameAlreadyExistsError,
} from "../errors/ConflictError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

const login = async (usernameOrEmail, password) => {
  const isEmail = usernameOrEmail.includes("@");

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail },
  });

  if (!user) {
    // Username/email không đúng
    throw new AuthError(
      "Username or email is incorrect",
      isEmail ? "email" : "username",
      "invalid_credentials"
    );
  }

  if (!user.passwordHash) {
    // User đăng ký bằng OAuth, không có password
    throw new OAuthUserError();
  }

  if (!user.emailVerified) {
    throw new EmailNotVerifiedError();
  }

  const isPasswordValid = await compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthError(
      "Password is incorrect",
      "password",
      "invalid_password"
    );
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    role: user.role,
  });

  return { access_token: accessToken, refresh_token: refreshToken };
};

const signup = async (username, email, password, role = "student") => {
  // Check if username already exists
  const existingUsername = await prisma.user.findFirst({
    where: { username: username },
  });

  if (existingUsername) {
    throw new UsernameAlreadyExistsError();
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findFirst({
    where: { email: email },
  });

  if (existingEmail) {
    throw new EmailAlreadyExistsError();
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
};

const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiry: {
        gt: new Date(), // Token chưa hết hạn
      },
    },
  });

  if (!user) {
    throw new VerificationTokenError();
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
};

const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: { email: email },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  if (user.emailVerified) {
    throw new BadRequestError("Email is already verified", "already_verified");
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

  await mailUtil.sendVerificationEmail(email, user.username, verificationToken);

  return {
    success: true,
    message: "Verification email has been resent",
  };
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findFirst({
    where: { email: email },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  if (!user.emailVerified) {
    throw new EmailNotVerifiedError();
  }

  // nếu user đăng ký qua OAuth
  if (!user.passwordHash) {
    throw new OAuthUserError();
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
};

const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordTokenExpiry: {
        gt: new Date(), // Token chưa hết hạn
      },
    },
  });

  if (!user) {
    throw new ResetPasswordTokenError();
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
};

export default {
  login,
  signup,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
