import { google } from "googleapis";
import prisma from "../configs/prisma.config.js";
import { generateTokens } from "../utils/jwt.util.js";
const { sign } = pkg;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const getGoogleAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
};

const handleGoogleCallback = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.id) {
      throw new Error("Failed to get user info from Google");
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: data.id }, { email: data.email }],
      },
    });

    if (!user) {
      // Generate safe username (unique fallback)
      const baseUsername =
        data.name?.replace(/\s+/g, "_") || data.email.split("@")[0];
      const existingUsername = await prisma.user.findUnique({
        where: { username: baseUsername },
      });

      const username = existingUsername
        ? `${baseUsername}_${Math.floor(Math.random() * 10000)}`
        : baseUsername;

      user = await prisma.user.create({
        data: {
          username,
          email: data.email,
          googleId: data.id,
          profileImageUrl: data.picture || null,
          role: "student",
          emailVerified: true,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: data.id,
          profileImageUrl: data.picture || user.profileImageUrl,
          emailVerified: true,
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      role: user.role,
    });

    return { accessToken, refreshToken, user };
  } catch (error) {
    console.error("Error in handleGoogleCallback:", error);
    throw new Error("Google OAuth authentication failed");
  }
};

export default {
  getGoogleAuthUrl,
  handleGoogleCallback,
};
