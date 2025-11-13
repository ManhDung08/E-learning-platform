import userService from "../services/user.service.js";

// Get current user profile (all)
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserProfile(userId);
    const {
      email,
      username,
      profileImageUrl,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
    } = user;

    return res.status(200).json({
      success: true,
      data: {
        email,
        username,
        profileImageUrl,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        phoneNumber,
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
      data: user,
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
    const data = {
      username: result.username,
      firstName: result.firstName,
      lastName: result.lastName,
      gender: result.gender,
      dateOfBirth: result.dateOfBirth,
      phoneNumber: result.phoneNumber,
    };

    return res.status(200).json({
      success: true,
      data: data,
    });
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
    return res.status(200).json({ success: true, data: result });
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
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Update user info by ID error:", error);
    next(error);
  }
};

const deleteUserAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.deleteUserAvatar(userId);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Delete avatar error:", error);
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(
      userId,
      currentPassword,
      newPassword
    );
    return res.status(200).json({
      success: true,
      message: result.message,
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
    const result = await userService.setPassword(userId, newPassword);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Set password error:", error);
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const result = await userService.createUser(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Create user error:", error);
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get all users error:", error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    return res.status(200).json({ success: true, message: result.message });
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
  getAllUsers,
  deleteUser,
};
