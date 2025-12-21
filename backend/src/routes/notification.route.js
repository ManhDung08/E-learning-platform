import { Router } from "express";
import notificationController from "../controllers/notification.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  notificationListValidation,
  notificationIdParamValidation,
} from "../validations/notification.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications retrieval and read state management
 */

/**
 * @swagger
 * /api/notification:
 *   get:
 *     summary: List notifications of current user
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: Notifications retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/",
  isAuth(),
  notificationListValidation,
  validate,
  notificationController.getNotifications
);

/**
 * @swagger
 * /api/notification/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationUnreadCountResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/unread-count", isAuth(), notificationController.getUnreadCount);

/**
 * @swagger
 * /api/notification/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationBulkUpdateResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/read-all", isAuth(), notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notification/delete-all:
 *   delete:
 *     summary: Delete all notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationBulkDeleteResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/delete-all",
  isAuth(),
  notificationController.deleteAllNotifications
);

/**
 * @swagger
 * /api/notification/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:id",
  isAuth(),
  notificationIdParamValidation,
  validate,
  notificationController.getNotificationById
);

/**
 * @swagger
 * /api/notification/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/:id/read",
  isAuth(),
  notificationIdParamValidation,
  validate,
  notificationController.markAsRead
);

/**
 * @swagger
 * /api/notification/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationDeleteResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:id",
  isAuth(),
  notificationIdParamValidation,
  validate,
  notificationController.deleteNotification
);

export default router;
