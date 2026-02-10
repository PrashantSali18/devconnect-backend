import jwt from "jsonwebtoken";
import User from "../models/Users.model.js";

let io;
const userSocketMap = new Map();

export const initializeSocket = async (server) => {
  const { Server } = await import("socket.io");

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000", // Explicit default
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"], // WebSocket first
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("❌ No token provided");
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("❌ User not found for token");
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      console.log(`✅ Socket authenticated for user: ${user.name}`);
      next();
    } catch (error) {
      console.error("❌ Socket authentication error:", error.message);
      if (error.name === "TokenExpiredError") {
        return next(new Error("Token expired"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(new Error("Invalid token"));
      }
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ Socket connected: ${socket.id} for user: ${socket.user.name} (${socket.userId})`,
    );

    // Store socket connection
    userSocketMap.set(socket.userId, socket.id);

    // Update user status in database
    updateUserStatus(socket.userId, true);

    // Join user's own room
    socket.join(socket.userId);

    // Broadcast user online status to all connected clients
    socket.broadcast.emit("user:online", {
      userId: socket.userId,
      isOnline: true,
      name: socket.user.name,
    });

    // Typing indicators
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

    // Message read receipts
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

    // Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.user.name}:`, error);
    });

    // Disconnect
    socket.on("disconnect", (reason) => {
      console.log(
        `❌ Socket disconnected: ${socket.id} (${socket.user.name}) - Reason: ${reason}`,
      );

      userSocketMap.delete(socket.userId);
      updateUserStatus(socket.userId, false);

      socket.broadcast.emit("user:offline", {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
        name: socket.user.name,
      });
    });

    // Test endpoint
    socket.on("ping", (data, callback) => {
      console.log("🏓 Ping received:", data);
      if (callback) callback({ status: "pong", timestamp: new Date() });
    });
  });

  console.log("🔌 Socket.io initialized successfully");
  return io;
};

const updateUserStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date(),
    });
    console.log(
      `📊 Updated user ${userId} status to ${isOnline ? "online" : "offline"}`,
    );
  } catch (error) {
    console.error("❌ Error updating user status:", error);
  }
};

export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.warn("⚠️ Socket.io not initialized - cannot emit event");
    return false;
  }

  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`📤 Emitted ${event} to user ${userId}`);
    return true;
  } else {
    console.log(`📭 User ${userId} is offline - could not emit ${event}`);
    return false;
  }
};

export const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

export const isUserOnline = (userId) => {
  return userSocketMap.has(userId);
};

export const getSocketInstance = () => {
  return io;
};
