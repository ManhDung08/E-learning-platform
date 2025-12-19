import notificationService from "../services/notification.service.js";

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, isRead } = req.query;

    const result = await notificationService.getNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      isRead: isRead !== undefined ? isRead === "true" : undefined,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.getNotificationById(
      parseInt(id),
      userId
    );

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(
      parseInt(id),
      userId
    );

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await notificationService.deleteNotification(
      parseInt(id),
      userId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.deleteAllNotifications(userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
