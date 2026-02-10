import express from 'express';
import { 
  register, 
  login, 
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} from '../controllers/auth.controller.js';
import { getUserProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

// routes/userRoutes.js
router.get("/:id", protect, getUserProfile);


export default router;