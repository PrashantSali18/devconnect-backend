import express from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} from '../controllers/auth.controller.js';
import {
  googleCallback,
  githubCallback,
  getLinkedAccounts,
  unlinkAccount
} from '../controllers/oath.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} from '../middleware/validator.middleware.js';
import { authLimiter, emailLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Regular auth routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', emailLimiter, forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:resetToken', resetPasswordValidation, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, emailLimiter, resendVerification);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
    session: false 
  }),
  googleCallback
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
    session: false 
  }),
  githubCallback
);

// Linked accounts management
router.get('/linked-accounts', protect, getLinkedAccounts);
router.delete('/unlink/:provider', protect, unlinkAccount);

export default router;