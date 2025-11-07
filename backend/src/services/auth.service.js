import prisma from "../configs/prisma.config.js";
import { compare, hash } from "bcrypt";
import pkg from "jsonwebtoken";
import mailUtil from "../utils/mail.util.js";
const { sign } = pkg;

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
      // Password không đúng
      return { error: "password" };
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    const access_token = sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refresh_token = sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { access_token, refresh_token };
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
      userId: user.id 
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

    // Gửi email chào mừng
    await mailUtil.sendWelcomeEmail(user.email, user.username);

    // Tạo tokens để tự động đăng nhập sau khi verify
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    const access_token = sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refresh_token = sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { 
      success: true, 
      access_token, 
      refresh_token,
      message: "Email verified successfully" 
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

    await mailUtil.sendVerificationEmail(email, user.username, verificationToken);

    return { 
      success: true, 
      message: "Verification email has been resent" 
    };
  } catch (error) {
    console.error("Error in resendVerificationEmail function:", error);
    throw new Error("Failed to resend verification email");
  }
};

export default {
  login,
  signup,
  verifyEmail,
  resendVerificationEmail,
};
