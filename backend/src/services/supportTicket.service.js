import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import notificationService from "./notification.service.js";

const createTicket = async ({ userId, subject, message }) => {
  if (!subject || !message) {
    throw new BadRequestError(
      "Subject and message are required",
      "missing_fields"
    );
  }

  const ticket = await prisma.supportTicket.create({
    data: { userId, subject, message },
  });

  // Notify admins about new support ticket
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });

  if (admins.length > 0) {
    await notificationService
      .createManyNotifications(
        admins.map((admin) => ({
          userId: admin.id,
          type: "system",
          title: "New Support Ticket",
          content: `New support ticket from user: "${subject}"`,
        }))
      )
      .catch((err) => {
        console.error("Failed to notify admins about new ticket:", err);
      });
  }

  return ticket;
};

const getTicketsByUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supportTicket.count({ where: { userId } }),
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

const getAllTickets = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supportTicket.count(),
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

const updateTicketStatus = async (id, status) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { user: { select: { id: true, username: true } } },
  });

  if (!ticket) throw new NotFoundError("SupportTicket", "ticket_not_found");

  const oldStatus = ticket.status;
  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status },
  });

  // Notify user if ticket status changed
  if (oldStatus !== status) {
    const statusMessages = {
      open: "Your support ticket has been received and is awaiting review.",
      in_progress: "We are currently working on your support ticket.",
      resolved:
        "Your support ticket has been resolved. Please review and let us know if you need further assistance.",
      closed: "Your support ticket has been closed.",
    };

    await notificationService
      .createNotification({
        userId: ticket.userId,
        type: "system",
        title: "Support Ticket Status Updated",
        content:
          statusMessages[status] ||
          `Your ticket status has been updated to: ${status}`,
      })
      .catch((err) => {
        console.error("Failed to notify user about ticket status change:", err);
      });
  }

  return updated;
};

const getTicketById = async (id, requesterId, requesterRole) => {
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError("SupportTicket", "ticket_not_found");

  const isOwner = ticket.userId === requesterId;
  const isAdmin = requesterRole === "admin";
  if (!isOwner && !isAdmin) {
    throw new PermissionError(
      "You do not have permission to view this ticket",
      "permission_denied"
    );
  }

  return ticket;
};

export default {
  createTicket,
  getTicketsByUser,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
};
