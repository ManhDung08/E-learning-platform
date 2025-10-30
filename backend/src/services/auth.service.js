import prisma from "../configs/prisma.config.js";
import { compare, hash } from "bcrypt";
import pkg from "jsonwebtoken";
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

    // Create new user
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        passwordHash: hashedPassword,
        role: role,
      },
    });

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
    console.error("Error in signup function:", error);
    throw new Error("Signup failed");
  }
};

export default {
  login,
  signup,
};
