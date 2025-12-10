import { Router } from "express";
import supportTicketController from "../controllers/supportTicket.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createTicketValidation,
  updateTicketStatusValidation,
  ticketIdParamValidation,
  paginationQueryValidation,
} from "../validations/supportTicket.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: SupportTickets
 *   description: Support ticket creation and management
 */

/**
 * @swagger
 * /api/supportTicket:
 *   post:
 *     summary: Create a support ticket
 *     tags: [SupportTickets]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicketCreateRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicketResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  isAuth(),
  createTicketValidation,
  validate,
  supportTicketController.createTicket
);

/**
 * @swagger
 * /api/supportTicket/me:
 *   get:
 *     summary: Get tickets of current user
 *     tags: [SupportTickets]
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
 *     responses:
 *       200:
 *         description: Tickets retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicketListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/me",
  isAuth(),
  paginationQueryValidation,
  validate,
  supportTicketController.getMyTickets
);

/**
 * @swagger
 * /api/supportTicket:
 *   get:
 *     summary: Get all tickets (admin)
 *     tags: [SupportTickets]
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
 *     responses:
 *       200:
 *         description: Tickets retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicketListResponse'
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
 */
router.get(
  "/",
  isAuth(["admin"]),
  paginationQueryValidation,
  validate,
  supportTicketController.getAllTickets
);

/**
 * @swagger
 * /api/supportTicket/{id}/status:
 *   patch:
 *     summary: Update ticket status (admin)
 *     tags: [SupportTickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicketStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Ticket updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicketResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/:id/status",
  isAuth(["admin"]),
  ticketIdParamValidation,
  updateTicketStatusValidation,
  validate,
  supportTicketController.updateTicketStatus
);

/**
 * @swagger
 * /api/supportTicket/{id}:
 *   get:
 *     summary: Get ticket by id (owner or admin)
 *     tags: [SupportTickets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicketResponse'
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
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:id",
  isAuth(),
  ticketIdParamValidation,
  validate,
  supportTicketController.getTicketById
);

export default router;
