import express from 'express';
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
  searchPosts
} from '../controllers/posts.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadPost } from '../config/cloudinary.config.js';
import {
  createPostValidation,
  updatePostValidation,
  addCommentValidation,
  searchValidation,
  paginationValidation,
  mongoIdValidation
} from '../middleware/validator.middleware.js';
import { postLimiter, uploadLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, getPosts);
router.get('/search', searchValidation, searchPosts);
router.get('/:id', mongoIdValidation('id'), getPostById);
router.get('/user/:userId', mongoIdValidation('userId'), paginationValidation, getPostsByUser);

// Protected routes
router.post(
  '/', 
  protect, 
  postLimiter, 
  uploadPost.single('image'), 
  createPostValidation, 
  createPost
);
router.get('/feed/personalized', protect, paginationValidation, getFeed);
router.put('/:id', protect, mongoIdValidation('id'), updatePostValidation, updatePost);
router.delete('/:id', protect, mongoIdValidation('id'), deletePost);
router.put('/:id/like', protect, mongoIdValidation('id'), likePost);
router.put('/:id/unlike', protect, mongoIdValidation('id'), unlikePost);
router.post('/:id/comments', protect, mongoIdValidation('id'), addCommentValidation, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;