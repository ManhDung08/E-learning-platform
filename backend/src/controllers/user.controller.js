import userService from "../services/user.service.js";

// Get current user profile (all)
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserProfile(userId);
    const [
      email,
      username,
      profileImageUrl,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
    ] = [
      user.email,
      user.username,
      user.profileImageUrl,
      user.firstName,
      user.lastName,
      user.gender,
      user.dateOfBirth,
      user.phoneNumber,
    ];

    return res.status(200).json({
      success: true,
      user: {
        email: email,
        username: username,
        profileImageUrl: profileImageUrl,
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        dateOfBirth: dateOfBirth,
        phoneNumber: phoneNumber,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    next(error);
  }
};

// Get user profile by ID (admin)
const getUserProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserProfile(id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile by ID error:", error);
    next(error);
  }
};

// Update user info (all)
const updateMyInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, firstName, lastName, gender, dateOfBirth, phoneNumber } =
      req.body;

    const result = await userService.updateUserInfo(userId, {
      username: username,
      firstName: firstName || null,
      lastName: lastName || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      phoneNumber: phoneNumber || null,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update profile error:", error);
    next(error);
  }
};

// Update user avatar (all)
const updateUserAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.updateUserAvatar(userId, req.file);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update avatar error:", error);
    next(error);
  }
};

// Update user info (admin)
const updateUserInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.updateUserInfo(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update user info by ID error:", error);
    next(error);
  }
};

const deleteUserAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.deleteUserAvatar(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete avatar error:", error);
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};

// Set password for OAuth users (all)
const setPassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;
    await userService.setPassword(userId, newPassword);
    return res.status(200).json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    console.error("Set password error:", error);
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const result = await userService.createUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Create user error:", error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete user error:", error);
    next(error);
  }
};

export default {
  getMe,
  getUserProfileById,
  updateMyInfo,
  updateUserInfo,
  updateUserAvatar,
  deleteUserAvatar,
  changePassword,
  setPassword,
  createUser,
  deleteUser,
};
