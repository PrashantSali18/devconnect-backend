import express from 'express';
import {
  sendMessage,
  getConversationMessages,
  getConversations,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  sendMessageValidation,
  searchValidation,
  paginationValidation,
  mongoIdValidation
} from '../middleware/validator.middleware.js';
import { messageLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', messageLimiter, sendMessageValidation, sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:userId', mongoIdValidation('userId'), paginationValidation, getConversationMessages);
router.put('/read/:userId', mongoIdValidation('userId'), markMessagesAsRead);
router.delete('/:messageId', mongoIdValidation('messageId'), deleteMessage);
router.get('/unread/count', getUnreadCount);
router.get('/search', searchValidation, searchMessages);

export default router;