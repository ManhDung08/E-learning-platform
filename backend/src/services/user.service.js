import prisma from "../configs/prisma.config";
import crypto from "crypto";
import {
  uploadToS3,
  deleteFromS3,
  getSignedUrlForDownload,
} from "../utils/aws.util.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import {
  UsernameAlreadyExistsError,
  EmailAlreadyExistsError,
} from "../errors/ConflictError.js";
import { compare, hash } from "bcrypt";
import { OAuthUserError } from "../errors/AuthError.js";

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      profileImageUrl: true,
      firstName: true,
      lastName: true,
      gender: true,
      dateOfBirth: true,
      phoneNumber: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }
  // Generate signed URL for avatar if exists
  if (user.profileImageUrl) {
    const key = extractKeyFromUrl(user.profileImageUrl);
    user.profileImageUrl = await getSignedUrlForDownload(key, "avatar", 3600);
  }
  return user;
};

const updateUserInfo = async (userId, updateData) => {
  const { username } = updateData;

  if (username) {
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      throw new UsernameAlreadyExistsError();
    }
  }

  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      gender: true,
      dateOfBirth: true,
      phoneNumber: true,
      role: true,
      emailVerified: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const updateUserAvatar = async (userId, file) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImageUrl: true },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  if (user.profileImageUrl) {
    const oldKey = extractKeyFromUrl(user.profileImageUrl);
    await deleteFromS3(oldKey);
  }

  // Upload new avatar to S3
  const uploadResult = await uploadToS3({
    fileBuffer: file.buffer,
    fileName: file.originalname,
    fileType: "avatar",
    mimeType: file.mimetype,
    metadata: { userId: userId.toString() },
  });

  // Update user in database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: uploadResult.url },
    select: {
      id: true,
      username: true,
      profileImageUrl: true,
    },
  });

  return {
    ...updatedUser,
    uploadedFile: uploadResult,
  };
};

const deleteUserAvatar = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImageUrl: true },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  if (!user.profileImageUrl) {
    throw new NotFoundError("Avatar", "avatar_not_found");
  }

  // Delete from S3
  const key = extractKeyFromUrl(user.profileImageUrl);
  await deleteFromS3(key);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: null },
    select: {
      id: true,
      username: true,
      profileImageUrl: true,
    },
  });

  return updatedUser;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true, googleId: true },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }
  if (user.googleId && !user.passwordHash) {
    throw new OAuthUserError("Cannot change password for Google OAuth users");
  }

  const isValidPassword = await compare(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    throw new AuthError(
      "Current password is incorrect",
      "invalid_current_password"
    );
  }

  if (currentPassword === newPassword) {
    throw new Error("New password must be different from current password");
  }

  const hashedPassword = await hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });

  return { message: "Password changed successfully" };
};

const setPassword = async (userId, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, googleId: true },
  });
  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }
  if (!user.googleId) {
    throw new OAuthUserError("Password can only be set for OAuth users");
  }

  const hashedPassword = await hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });
  return { message: "Password set successfully" };
};

const createUser = async (
  username,
  email,
  password,
  role,
  firstName,
  lastName,
  gender,
  dateOfBirth,
  phoneNumber
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }
  const existingUsername = await prisma.user.findUnique({
    where: { username: username },
  });
  if (existingUsername) {
    throw new UsernameAlreadyExistsError();
  }

  const hashedPassword = await hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username: username,
      email: email,
      passwordHash: hashedPassword,
      role: role || "student",
      firstName: firstName || null,
      lastName: lastName || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      phoneNumber: phoneNumber || null,
      emailVerified: true,
    },
  });
  return newUser;
};

const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, profileImageUrl: true },
  });
  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  if (user.profileImageUrl) {
    const key = extractKeyFromUrl(user.profileImageUrl);
    await deleteFromS3(key);
  }

  await prisma.user.delete({
    where: { id: userId },
  });
  return { message: "User deleted successfully" };
};

export default {
  getUserProfile,
  updateUserInfo,
  updateUserAvatar,
  deleteUserAvatar,
  changePassword,
  setPassword,
  createUser,
};
