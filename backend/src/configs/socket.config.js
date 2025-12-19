import { Server } from "socket.io";
import { decodeToken } from "../utils/jwt.util.js";

let io = null;
const userSockets = new Map();

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error("Invalid token"));
      }

      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });

    socket.on("join:course", (courseId) => {
      socket.join(`course:${courseId}`);
    });

    socket.on("leave:course", (courseId) => {
      socket.leave(`course:${courseId}`);
    });
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToUsers = (userIds, event, data) => {
  if (io) {
    userIds.forEach((userId) => {
      io.to(`user:${userId}`).emit(event, data);
    });
  }
};

const emitToCourse = (courseId, event, data) => {
  if (io) {
    io.to(`course:${courseId}`).emit(event, data);
  }
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

const getOnlineUserCount = () => {
  return userSockets.size;
};

export {
  initializeSocket,
  getIO,
  emitToUser,
  emitToUsers,
  emitToCourse,
  broadcast,
  isUserOnline,
  getOnlineUserCount,
};
