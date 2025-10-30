import createHttpError from "http-errors";
import { decodeToken } from "../utils/jwt.util.js";
import pkg from "jsonwebtoken";
const { sign } = pkg;

export const isAuth = (
  rolesRequire = ["student", "instructor", "admin"]
) =>
  async (req, res, next) => {
    try {
      let token = req.cookies?.access_token;
      let payload = decodeToken(token);
      console.log(payload);

      if (!token || !payload) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
          throw createHttpError(401, "Unauthorized - No token and no refresh token");
        }

        const refreshPayload = decodeToken(refreshToken);
        if (!refreshPayload) {
          throw createHttpError(401, "Unauthorized - Invalid refresh token");
        }

        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined");
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
          throw createHttpError(401, "Unauthorized - Could not renew access token");
        }
      }

      console.log("Decoded payload:", rolesRequire, rolesRequire.includes(payload.role));

      if (!(payload.role === "admin" || rolesRequire.includes(payload.role))) {
        throw createHttpError(403, "Forbidden - Insufficient permissions");
      }

      req.user = payload;
      return next();
    } catch (error) {
      return next(error);
    }
  };
