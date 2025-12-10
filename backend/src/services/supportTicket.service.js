import prisma from "../configs/prisma.config.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { PermissionError } from "../errors/PermissionError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

const createTicket = async ({ userId, subject, message }) => {
  if (!subject || !message) {
    throw new BadRequestError(
      "Subject and message are required",
      "missing_fields"
    );
  }
  return prisma.supportTicket.create({
    data: { userId, subject, message },
  });
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
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError("SupportTicket", "ticket_not_found");
  return prisma.supportTicket.update({
    where: { id },
    data: { status },
  });
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
