import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Ensure only 2 participants
conversationSchema.pre("save", async function () {
  if (this.participants.length !== 2) {
    throw new Error("A conversation must have exactly 2 participants");
  }
});

// Index for faster queries
conversationSchema.index({ participants: 1 });

export default mongoose.model("Conversation", conversationSchema);
