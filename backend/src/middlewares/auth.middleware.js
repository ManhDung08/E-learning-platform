import { decodeToken } from "../utils/jwt.util.js";
import pkg from "jsonwebtoken";
const { sign } = pkg;
import { PermissionError } from "../errors/PermissionError.js";
import { TokenError, InvalidTokenError } from "../errors/TokenError.js";
import AppError from "../errors/AppError.js";

export const isAuth =
  (rolesRequire = ["student", "instructor", "admin"]) =>
  async (req, res, next) => {
    try {
      let token = req.cookies?.access_token;
      let payload = decodeToken(token);
      if (process.env.NODE_ENV === "development") {
        console.log(payload);
      }

      if (!token || !payload) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
          throw new TokenError("No access or refresh token provided");
        }

        const refreshPayload = decodeToken(refreshToken);
        if (!refreshPayload) {
          throw new InvalidTokenError("Invalid refresh token");
        }

        if (!process.env.JWT_SECRET) {
          throw new AppError("JWT_SECRET is not defined");
        }

        const newAccessToken = sign(
          { id: refreshPayload.id, role: refreshPayload.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3600000,
        });

        token = newAccessToken;
        payload = decodeToken(token);

        if (!payload) {
          throw new InvalidTokenError("Could not renew access token");
        }
      }

      console.log(
        "Decoded payload:",
        rolesRequire,
        rolesRequire.includes(payload.role)
      );

      if (!(payload.role === "admin" || rolesRequire.includes(payload.role))) {
        throw new PermissionError();
      }

      req.user = payload;
      return next();
    } catch (error) {
      return next(error);
    }
  };
