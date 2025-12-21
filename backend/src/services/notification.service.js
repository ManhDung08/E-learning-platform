import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { emitToUser } from "../configs/socket.config.js";

const NOTIFICATION_TYPES = ["system", "course_update", "new_comment"];

const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_ALL_READ: "notification:all-read",
  NOTIFICATION_DELETED: "notification:deleted",
  NOTIFICATION_ALL_DELETED: "notification:all-deleted",
  UNREAD_COUNT_UPDATE: "notification:unread-count",
};

const createNotification = async ({ userId, type, title, content }) => {
  if (!userId || !type || !title || !content) {
    throw new BadRequestError(
      "userId, type, title, and content are required",
      "missing_fields"
    );
  }

  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new BadRequestError(
      `Invalid notification type. Must be one of: ${NOTIFICATION_TYPES.join(
        ", "
      )}`,
      "invalid_notification_type"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User", "user_not_found");
  }

  const notification = await prisma.notification.create({
    data: { userId, type, title, content },
  });

  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, notification);

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  emitToUser(userId, SOCKET_EVENTS.UNREAD_COUNT_UPDATE, { unreadCount });

  return notification;
};

const createManyNotifications = async (notifications) => {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    throw new BadRequestError(
      "Notifications array is required and cannot be empty",
      "invalid_notifications_array"
    );
  }

  for (const notif of notifications) {
    if (!notif.userId || !notif.type || !notif.title || !notif.content) {
      throw new BadRequestError(
        "Each notification must have userId, type, title, and content",
        "missing_fields"
      );
    }
    if (!NOTIFICATION_TYPES.includes(notif.type)) {
      throw new BadRequestError(
        `Invalid notification type. Must be one of: ${NOTIFICATION_TYPES.join(
          ", "
        )}`,
        "invalid_notification_type"
      );
    }
  }

  const userIds = [...new Set(notifications.map((n) => n.userId))];

  // Verify all users exist before creating notifications
  const existingUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });

  const existingUserIds = new Set(existingUsers.map((u) => u.id));
  const validNotifications = notifications.filter((n) =>
    existingUserIds.has(n.userId)
  );

  if (validNotifications.length === 0) {
    return { createdCount: 0 };
  }

  // Use transaction to avoid race conditions
  const beforeCreate = new Date();
  const { createdCount, createdNotifications } = await prisma.$transaction(async (tx) => {
    const result = await tx.notification.createMany({
      data: validNotifications,
      skipDuplicates: true,
    });

    // Fetch only notifications created in this transaction by timestamp and user IDs
    const created = await tx.notification.findMany({
      where: {
        userId: { in: [...existingUserIds] },
        createdAt: { gte: beforeCreate },
      },
      orderBy: { createdAt: "desc" },
      take: result.count,
    });

    return {
      createdCount: result.count,
      createdNotifications: created
    };
  });

  const notificationsByUser = {};
  createdNotifications.forEach((notif) => {
    if (!notificationsByUser[notif.userId]) {
      notificationsByUser[notif.userId] = [];
    }
    notificationsByUser[notif.userId].push(notif);
  });

  for (const userId of existingUserIds) {
    const userNotifs = notificationsByUser[userId] || [];
    userNotifs.forEach((notif) => {
      emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, notif);
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    emitToUser(userId, SOCKET_EVENTS.UNREAD_COUNT_UPDATE, { unreadCount });
  }

  return { createdCount };
};

const notifyEnrolledUsers = async (courseId, { type, title, content }) => {
  // Validate required fields
  if (!courseId || !type || !title || !content) {
    throw new BadRequestError(
      "courseId, type, title, and content are required",
      "missing_fields"
    );
  }

  // Validate notification type
  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new BadRequestError(
      `Invalid notification type. Must be one of: ${NOTIFICATION_TYPES.join(
        ", "
      )}`,
      "invalid_notification_type"
    );
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: parseInt(courseId) },
    select: { userId: true },
  });

  if (enrollments.length === 0) {
    return { createdCount: 0 };
  }

  const notifications = enrollments.map((e) => ({
    userId: e.userId,
    type,
    title,
    content,
  }));

  return createManyNotifications(notifications);
};

const getNotifications = async (
  userId,
  { page = 1, limit = 20, isRead } = {}
) => {
  const skip = (page - 1) * limit;
  const where = { userId };
  if (typeof isRead === "boolean") {
    where.isRead = isRead;
  }

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getNotificationById = async (id, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) {
    throw new NotFoundError("Notification", "notification_not_found");
  }

  if (notification.userId !== userId) {
    throw new PermissionError(
      "You do not own this notification",
      "permission_denied"
    );
  }

  return notification;
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return { unreadCount: count };
};

const markAsRead = async (id, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw new NotFoundError("Notification", "notification_not_found");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_READ, { id });
  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  emitToUser(userId, SOCKET_EVENTS.UNREAD_COUNT_UPDATE, { unreadCount });

  return updated;
};

const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_ALL_READ, { updatedCount: result.count });
  emitToUser(userId, SOCKET_EVENTS.UNREAD_COUNT_UPDATE, { unreadCount: 0 });

  return { updatedCount: result.count };
};

const deleteNotification = async (id, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw new NotFoundError("Notification", "notification_not_found");
  }

  const wasUnread = !notification.isRead;

  await prisma.notification.delete({ where: { id } });

  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_DELETED, { id });

  if (wasUnread) {
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    emitToUser(userId, SOCKET_EVENTS.UNREAD_COUNT_UPDATE, { unreadCount });
  }

  return { deleted: true, id };
};

const deleteAllNotifications = async (userId) => {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_ALL_DELETED, { deletedCount: result.count });
  emitToUser(userId, SOCKET_EVENTS.UNREAD_COUNT_UPDATE, { unreadCount: 0 });

  return { deletedCount: result.count };
};

export default {
  createNotification,
  createManyNotifications,
  notifyEnrolledUsers,
  getNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
};
