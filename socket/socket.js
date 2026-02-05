import {Server} from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/Users.model.js";

let io;
const userSocketMap = new Map(); // userId -> socketId

export const initializeSocket = (server) => {
 io = new Server(server, {
   cors: {
     origin: process.env.CLIENT_URL || "http://localhost:5173",
     credentials: true,
   },
 });


  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.userId})`);

    // Store socket connection
    userSocketMap.set(socket.userId, socket.id);

    // Update user online status
    updateUserStatus(socket.userId, true);

    // Emit online users to all clients
    io.emit("user:online", {
      userId: socket.userId,
      isOnline: true,
    });

    // Join user's personal room
    socket.join(socket.userId);

    // Handle typing indicator
    socket.on("typing:start", (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:started", {
          senderId: socket.userId,
          senderName: socket.user.name,
        });
      }
    });

    socket.on("typing:stop", (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:stopped", {
          senderId: socket.userId,
        });
      }
    });

    // Handle message read status
    socket.on("message:read", async (data) => {
      const { messageId, senderId } = data;
      const senderSocketId = userSocketMap.get(senderId);

      if (senderSocketId) {
        io.to(senderSocketId).emit("message:read", {
          messageId,
          readBy: socket.userId,
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(
        `❌ User disconnected: ${socket.user.name} (${socket.userId})`,
      );

      // Remove socket connection
      userSocketMap.delete(socket.userId);

      // Update user offline status
      updateUserStatus(socket.userId, false);

      // Emit offline status to all clients
      io.emit("user:offline", {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    });
  });

  return io;
};

// Helper function to update user online status
export const updateUserStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date(),
    });
  } catch (error) {
    console.error("Error updating user status:", error);
  }
};

// Helper function to emit message to specific user
export const emitToUser = (userId, event, data) => {
  const socketId = userSocketMap.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

// Helper function to get online users
export const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

// Check if user is online
export const isUserOnline = (userId) => {
  return userSocketMap.has(userId);
};
