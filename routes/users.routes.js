// import express from 'express';
// import {
//   register,
//   login,
//   getMe,
//   forgotPassword,
//   resetPassword,
//   verifyEmail,
//   resendVerification
// } from '../controllers/auth.controller.js';
// import { getUserProfile } from '../controllers/user.controller.js';
// import { protect } from '../middleware/auth.middleware.js';

// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);
// router.post('/forgot-password', forgotPassword);
// router.put('/reset-password/:resetToken', resetPassword);
// router.get('/verify-email/:token', verifyEmail);
// router.post('/resend-verification', protect, resendVerification);

// // routes/userRoutes.js
// router.get("/:id", protect, getUserProfile);

// export default router;

import express from "express";
import multer from "multer";
import {
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestedUsers,
  getFollowers,
  getFollowing,
  getUserByUsername,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

// Search and suggestions
router.get("/search", protect, searchUsers);
router.get("/username/:username", protect, getUserByUsername);
router.get("/suggestions/users", protect, getSuggestedUsers);

// Profile routes
router.get("/:id", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.put(
  "/profile/picture",
  protect,
  upload.single("picture"),
  uploadProfilePicture,
);

// Follow/Unfollow routes
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);

// Followers/Following lists
router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);

export default router;
