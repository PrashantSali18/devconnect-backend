import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/Users.model.js';

let io;
const userSocketMap = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.userId})`);

    userSocketMap.set(socket.userId, socket.id);
    updateUserStatus(socket.userId, true);

    io.emit('user:online', {
      userId: socket.userId,
      isOnline: true
    });

    socket.join(socket.userId);

    // Typing indicators
    socket.on('typing:start', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:started', {
          senderId: socket.userId,
          senderName: socket.user.name
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stopped', {
          senderId: socket.userId
        });
      }
    });

    socket.on('message:read', async (data) => {
      const { messageId, senderId } = data;
      const senderSocketId = userSocketMap.get(senderId);

      if (senderSocketId) {
        io.to(senderSocketId).emit('message:read', {
          messageId,
          readBy: socket.userId
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.userId})`);

      userSocketMap.delete(socket.userId);
      updateUserStatus(socket.userId, false);

      io.emit('user:offline', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });

  return io;
};

const updateUserStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

export const emitToUser = (userId, event, data) => {
  const socketId = userSocketMap.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

export const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

export const isUserOnline = (userId) => {
  return userSocketMap.has(userId);
};