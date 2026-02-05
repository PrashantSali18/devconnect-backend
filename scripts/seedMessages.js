import { connect } from "mongoose";
import dotenv from "dotenv";
import Message  from "../models/Messages.model.js";
import Conversation from "../models/Conversations.model.js";
import User from "../models/Users.model.js";

dotenv.config();

const generateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("_");
};

const seedMessages = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Get two users
    const users = await User.find().limit(2);

    if (users.length < 2) {
      console.log("❌ Need at least 2 users. Please create more users first.");
      process.exit(1);
    }

    const [user1, user2] = users;
    const conversationId = generateConversationId(
      user1._id.toString(),
      user2._id.toString(),
    );

    const sampleMessages = [
      {
        conversation: conversationId,
        sender: user1._id,
        receiver: user2._id,
        content: "Hey! How's it going? 👋",
      },
      {
        conversation: conversationId,
        sender: user2._id,
        receiver: user1._id,
        content: "Hi! I'm doing great, thanks for asking! How about you?",
      },
      {
        conversation: conversationId,
        sender: user1._id,
        receiver: user2._id,
        content:
          "Doing well! Working on a new React project. Have you tried React hooks?",
      },
      {
        conversation: conversationId,
        sender: user2._id,
        receiver: user1._id,
        content:
          "Yes! Hooks are amazing. I recently learned about useReducer and it's so powerful.",
      },
      {
        conversation: conversationId,
        sender: user1._id,
        receiver: user2._id,
        content: "Cool! Want to collaborate on a project sometime?",
      },
    ];

    // Create messages
    await Message.insertMany(sampleMessages);

    // Create conversation
    await Conversation.create({
      participants: [user1._id, user2._id],
      lastMessage: {
        content: sampleMessages[sampleMessages.length - 1].content,
        sender: user1._id,
        timestamp: new Date(),
      },
      unreadCount: {
        [user2._id]: 3,
      },
    });

    console.log("✅ Messages seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedMessages();