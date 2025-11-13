import express from "express";
import userController from "../controllers/user.controller.js";
import {
  changePasswordValidation,
  updateProfileValidation,
} from "../validations/user.validation.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.get("/me", isAuth(), userController.getMe);

// Cập nhật hồ sơ cá nhân
router.put(
  "/update-profile",
  isAuth(),
  updateProfileValidation,
  validate,
  userController.updateMyInfo
);

// Upload hoặc xóa avatar
router.post("/upload-avatar", isAuth(), userController.updateUserAvatar);
router.delete("/delete-avatar", isAuth(), userController.deleteUserAvatar);

// Đổi mật khẩu
router.put(
  "/change-password",
  isAuth(),
  changePasswordValidation,
  validate,
  userController.changePassword
);

// Set mật khẩu lần đầu (cho người đăng nhập OAuth)
router.put("/set-password", isAuth(), userController.setPassword);

// Quản lý người dùng (Admin)
router.get("/", isAuth(["admin"]), userController.getAllUsers);
router.get("/:id", isAuth(["admin"]), userController.getUserProfileById);
router.post("/", isAuth(["admin"]), userController.createUser);
router.put(
  "/:id",
  isAuth(["admin"]),
  updateProfileValidation,
  validate,
  userController.updateUserInfo
);
router.delete("/:id", isAuth(["admin"]), userController.deleteUser);

export default router;
