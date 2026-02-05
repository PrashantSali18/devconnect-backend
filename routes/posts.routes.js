import { Router } from "express";
import {
  createPost,
  getPosts,
  getFeed,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  searchPosts,
} from "../controllers/posts.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadPost } from "../config/cloudinary.config.js";

const router = Router();

// Public routes
router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/:id", getPostById);
router.get("/user/:userId", getPostsByUser);

// Protected routes
router.post("/", protect, uploadPost.single("image"), createPost);
router.get("/feed/personalized", protect, getFeed);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, likePost);
router.put("/:id/unlike", protect, unlikePost);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

export default router;
