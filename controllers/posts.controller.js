import Post from "../models/Posts.model.js";
import User from "../models/Users.model.js";
import { createNotification } from "./notification.controller.js";
import cloudinary from "../config/cloudinary.config.js";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, code, language, tags } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    // Create post object
    const postData = {
      user: req.user.id,
      content,
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((t) => t.trim())
        : [],
    };

    // Add code snippet if provided
    if (code) {
      postData.codeSnippet = {
        code,
        language: language || "other",
      };
    }

    // Add image if uploaded
    if (req.file) {
      postData.image = req.file.path;
    }

    const post = await Post.create(postData);

    // Populate user details
    await post.populate("user", "name profilePicture");

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all posts (with pagination)
// @route   GET /api/posts?page=1&limit=10
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name profilePicture bio")
      .populate("comments.user", "name profilePicture");

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get personalized feed (posts from followed users)
// @route   GET /api/posts/feed
// @access  Private
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get current user with following list
    const currentUser = await User.findById(req.user.id);

    // Get posts from followed users AND own posts
    const feedUsers = [...currentUser.following, req.user.id];

    const posts = await Post.find({ user: { $in: feedUsers } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name profilePicture bio")
      .populate("comments.user", "name profilePicture");

    const total = await Post.countDocuments({ user: { $in: feedUsers } });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name profilePicture bio")
      .populate("comments.user", "name profilePicture");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get posts by user ID
// @route   GET /api/posts/user/:userId
// @access  Public
export const getPostsByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name profilePicture bio")
      .populate("comments.user", "name profilePicture");

    const total = await Post.countDocuments({ user: req.params.userId });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this post" });
    }

    const { content, code, language, tags } = req.body;

    if (content) post.content = content;
    if (tags)
      post.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t) => t.trim());

    if (code !== undefined) {
      post.codeSnippet = {
        code,
        language: language || "other",
      };
    }

    const updatedPost = await post.save();
    await updatedPost.populate("user", "name profilePicture");

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete image from Cloudinary if exists
    if (post.image) {
      const publicId = post.image.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Post already liked" });
    }

    post.likes.push(req.user.id);
    await post.save();

    // CREATE NOTIFICATION
    await createNotification({
      recipient: post.user,
      sender: req.user.id,
      type: "like",
      post: post._id,
      message: `${req.user.name} liked your post`,
      link: `/posts/${post._id}`,
    });

    res.json({ message: "Post liked", likes: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Unlike a post
// @route   PUT /api/posts/:id/unlike
// @access  Private
export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if post is not liked
    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Post not liked yet" });
    }

    post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    await post.save();

    res.json({ message: "Post unliked", likes: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user.id,
      text,
    };

    post.comments.push(comment);
    await post.save();

    await post.populate("comments.user", "name profilePicture");

    // CREATE NOTIFICATION
    await createNotification({
      recipient: post.user,
      sender: req.user.id,
      type: "comment",
      post: post._id,
      comment: post.comments[post.comments.length - 1]._id,
      message: `${req.user.name} commented on your post`,
      link: `/posts/${post._id}`,
    });

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user owns the comment or the post
    if (
      comment.user.toString() !== req.user.id &&
      post.user.toString() !== req.user.id
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search posts by content or tags
// @route   GET /api/posts/search?q=keyword
// @access  Public
export const searchPosts = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Please provide a search keyword" });
    }

    const posts = await Post.find({
      $or: [
        { content: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "name profilePicture bio")
      .populate("comments.user", "name profilePicture");

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
