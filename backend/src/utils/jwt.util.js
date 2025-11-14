import pkg from "jsonwebtoken";
import AppError from "../errors/AppError.js";
const { sign, verify } = pkg;

export const generateTokens = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not defined");
  }

  const accessToken = sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const decodeToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new AppError("JWT_SECRET is not defined");
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
