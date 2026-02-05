import { Router } from "express";
import {
  sendMessage,
  getConversationMessages,
  getConversations,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All routes are protected
router.use(protect);

router.post("/", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversation/:userId", getConversationMessages);
router.put("/read/:userId", markMessagesAsRead);
router.delete("/:messageId", deleteMessage);
router.get("/unread/count", getUnreadCount);
router.get("/search", searchMessages);

export default router;
