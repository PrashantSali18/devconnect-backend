import { Router } from "express";
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
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadProfile } from "../config/cloudinary.config.js";

const router = Router();

// Public routes
router.get("/search", searchUsers);
router.get("/:id", getUserProfile);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

// Protected routes
router.put("/profile", protect, updateProfile);
router.post(
  "/profile/picture",
  protect,
  uploadProfile.single("profilePicture"),
  uploadProfilePicture,
);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.get("/suggestions/users", protect, getSuggestedUsers);

export default router;
