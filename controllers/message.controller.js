import Message from "../models/Messages.model.js";
import Conversation from "../models/Conversations.model.js";
import User from "../models/Users.model.js";
import { emitToUser } from "../socket/socket.js";

// Helper function to generate conversation ID
export const generateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("_");
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Receiver and content are required" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Generate conversation ID
    const conversationId = generateConversationId(req.user.id, receiverId);

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      receiver: receiverId,
      content,
      messageType: "text",
    });

    // Populate sender details
    await message.populate("sender", "name profilePicture");
    await message.populate("receiver", "name profilePicture");

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        lastMessage: {
          content,
          sender: req.user.id,
          timestamp: new Date(),
        },
        unreadCount: {
          [receiverId]: 1,
        },
      });
    } else {
      conversation.lastMessage = {
        content,
        sender: req.user.id,
        timestamp: new Date(),
      };

      // Increment unread count for receiver
      const currentUnread = conversation.unreadCount.get(receiverId) || 0;
      conversation.unreadCount.set(receiverId, currentUnread + 1);

      await conversation.save();
    }

    // Emit real-time message to receiver via Socket.io
    emitToUser(receiverId, "message:received", message);

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get conversation messages
// @route   GET /api/messages/conversation/:userId
// @access  Private
export const getConversationMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const conversationId = generateConversationId(req.user.id, userId);

    const messages = await Messagse.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name profilePicture")
      .populate("receiver", "name profilePicture");

    const total = await Messagse.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    });

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .sort({ "lastMessage.timestamp": -1 })
      .populate("participants", "name profilePicture isOnline lastSeen")
      .populate("lastMessage.sender", "name");

    // Format conversations to include other participant info
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== req.user.id,
      );

      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount.get(req.user.id) || 0,
        updatedAt: conv.updatedAt,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = generateConversationId(req.user.id, userId);

    // Update all unread messages from the other user
    await Messagse.updateMany(
      {
        conversation: conversationId,
        receiver: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    // Reset unread count in conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
    });

    if (conversation) {
      conversation.unreadCount.set(req.user.id, 0);
      await conversation.save();
    }

    // Emit read receipt to sender via Socket.io
    emitToUser(userId, "messages:read", {
      readBy: req.user.id,
      conversationId,
    });

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this message" });
    }

    message.isDeleted = true;
    await message.save();

    // Emit deletion to receiver via Socket.io
    emitToUser(message.receiver.toString(), "message:deleted", {
      messageId: message._id,
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Messagse.countDocuments({
      receiver: req.user.id,
      isRead: false,
      isDeleted: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search messages
// @route   GET /api/messages/search?q=keyword
// @access  Private
export const searchMessages = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Please provide a search keyword" });
    }

    const messages = await Messagse.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      content: { $regex: keyword, $options: "i" },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name profilePicture")
      .populate("receiver", "name profilePicture");

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
