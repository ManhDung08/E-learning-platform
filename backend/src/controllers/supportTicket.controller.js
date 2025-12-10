import supportTicketService from "../services/supportTicket.service.js";

const createTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;
    const ticket = await supportTicketService.createTicket({
      userId,
      subject,
      message,
    });
    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await supportTicketService.getTicketsByUser(userId, {
      page,
      limit,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await supportTicketService.getAllTickets({
      page,
      limit,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await supportTicketService.updateTicketStatus(Number(id), status);
    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await supportTicketService.getTicketById(
      Number(id),
      req.user.id,
      req.user.role
    );
    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export default {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
};
