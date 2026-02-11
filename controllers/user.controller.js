// import User from "../models/Users.model.js";
// import { createNotification } from "./notification.controller.js";
// import { storage } from "../config/cloudinary.config.js";

// // @desc    Get user profile by ID
// // @route   GET /api/users/:id
// // @access  Public
// export const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id)
//       .select("-password")
//       .populate("followers", "name profilePicture")
//       .populate("following", "name profilePicture");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Upload profile picture
// // @route   POST /api/users/profile/picture
// // @access  Private
// export const updateProfile = async (req, res) => {
//   try {
//     const { name, bio, skills, githubUrl, linkedinUrl, websiteUrl, location } =
//       req.body;

//     // Find user
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update fields
//     if (name) user.name = name;
//     if (bio) user.bio = bio;
//     if (skills)
//       user.skills = Array.isArray(skills)
//         ? skills
//         : skills.split(",").map((s) => s.trim());
//     if (githubUrl) user.githubUrl = githubUrl;
//     if (linkedinUrl) user.linkedinUrl = linkedinUrl;
//     if (websiteUrl) user.websiteUrl = websiteUrl;
//     if (location) user.location = location;

//     const updatedUser = await user.save();

//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       bio: updatedUser.bio,
//       skills: updatedUser.skills,
//       profilePicture: updatedUser.profilePicture,
//       githubUrl: updatedUser.githubUrl,
//       linkedinUrl: updatedUser.linkedinUrl,
//       websiteUrl: updatedUser.websiteUrl,
//       location: updatedUser.location,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Upload profile picture
// // @route   POST /api/users/profile/picture
// // @access  Private
// export const uploadProfilePicture = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "Please upload an image" });
//     }

//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Delete old image from storage if exists and not default
//     if (user.profilePicture && !user.profilePicture.includes("placeholder")) {
//       const publicId = user.profilePicture.split("/").pop().split(".")[0];
//       await storage.uploader.destroy(`devconnect/profiles/${publicId}`);
//     }

//     // Update profile picture URL
//     user.profilePicture = req.file.path;
//     await user.save();

//     res.json({
//       message: "Profile picture updated successfully",
//       profilePicture: user.profilePicture,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Follow a user
// // @route   PUT /api/users/:id/follow
// // @access  Private
// export const followUser = async (req, res) => {
//   try {
//     const userToFollow = await User.findById(req.params.id);
//     const currentUser = await User.findById(req.user.id);

//     if (!userToFollow) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (req.params.id === req.user.id) {
//       return res.status(400).json({ message: "You cannot follow yourself" });
//     }

//     if (currentUser.following.includes(req.params.id)) {
//       return res
//         .status(400)
//         .json({ message: "You are already following this user" });
//     }

//     currentUser.following.push(req.params.id);
//     userToFollow.followers.push(req.user.id);

//     await currentUser.save();
//     await userToFollow.save();

//     // CREATE NOTIFICATION
//     await createNotification({
//       recipient: userToFollow._id,
//       sender: req.user.id,
//       type: "follow",
//       message: `${req.user.name} started following you`,
//       link: `/profile/${req.user.id}`,
//     });

//     res.json({
//       message: "User followed successfully",
//       following: currentUser.following,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Unfollow a user
// // @route   PUT /api/users/:id/unfollow
// // @access  Private
// export const unfollowUser = async (req, res) => {
//   try {
//     const userToUnfollow = await User.findById(req.params.id);
//     const currentUser = await User.findById(req.user.id);

//     if (!userToUnfollow) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if not following
//     if (!currentUser.following.includes(req.params.id)) {
//       return res
//         .status(400)
//         .json({ message: "You are not following this user" });
//     }

//     // Remove from following and followers
//     currentUser.following = currentUser.following.filter(
//       (id) => id.toString() !== req.params.id,
//     );
//     userToUnfollow.followers = userToUnfollow.followers.filter(
//       (id) => id.toString() !== req.user.id,
//     );

//     await currentUser.save();
//     await userToUnfollow.save();

//     res.json({
//       message: "User unfollowed successfully",
//       following: currentUser.following,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Search users by name or skills
// // @route   GET /api/users/search?q=keyword
// // @access  Public
// export const searchUsers = async (req, res) => {
//   try {
//     const keyword = req.query.q;

//     if (!keyword) {
//       return res
//         .status(400)
//         .json({ message: "Please provide a search keyword" });
//     }

//     const users = await User.find({
//       $or: [
//         { name: { $regex: keyword, $options: "i" } },
//         { skills: { $regex: keyword, $options: "i" } },
//         { bio: { $regex: keyword, $options: "i" } },
//       ],
//     })
//       .select("-password")
//       .limit(20);

//     res.json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Get suggested users (users with similar skills)
// // @route   GET /api/users/suggestions
// // @access  Private
// export const getSuggestedUsers = async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.user.id);

//     // Find users with similar skills who user is not following
//     const suggestions = await User.find({
//       _id: { $ne: req.user.id, $nin: currentUser.following },
//       skills: { $in: currentUser.skills },
//     })
//       .select("-password")
//       .limit(10);

//     res.json(suggestions);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Get user's followers
// // @route   GET /api/users/:id/followers
// // @access  Public
// export const getFollowers = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).populate(
//       "followers",
//       "name profilePicture bio skills",
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user.followers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Get user's following
// // @route   GET /api/users/:id/following
// // @access  Public
// export const getFollowing = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).populate(
//       "following",
//       "name profilePicture bio skills",
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user.following);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

import User from "../models/Users.model.js";
import { createNotification } from "./notification.controller.js";
import { v2 as cloudinary } from "cloudinary";
import stream from "stream";

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name profilePicture")
      .populate("following", "name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, githubUrl, linkedinUrl, websiteUrl, location } =
      req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (websiteUrl !== undefined) user.websiteUrl = websiteUrl;
    if (location !== undefined) user.location = location;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      profilePicture: updatedUser.profilePicture,
      githubUrl: updatedUser.githubUrl,
      linkedinUrl: updatedUser.linkedinUrl,
      websiteUrl: updatedUser.websiteUrl,
      location: updatedUser.location,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Upload profile picture
// @route   PUT /api/users/profile/picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
  try {
    // Check if file exists from multer
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old image from Cloudinary if exists and not default
    if (
      user.profilePicture &&
      !user.profilePicture.includes("default-avatar")
    ) {
      try {
        const publicId = user.profilePicture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`devconnect/profiles/${publicId}`);
      } catch (error) {
        console.error("Error deleting old image:", error);
        // Continue with upload even if delete fails
      }
    }

    // Upload to Cloudinary using buffer stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "devconnect/profiles",
          resource_type: "auto",
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      const bufferStream = stream.Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    });

    user.profilePicture = uploadResult.secure_url;
    await user.save();

    res.json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);

    await currentUser.save();
    await userToFollow.save();

    // Create notification
    await createNotification({
      recipient: userToFollow._id,
      sender: req.user.id,
      type: "follow",
      message: `${currentUser.name} started following you`,
      link: `/profile/${req.user.id}`,
    });

    res.json({
      message: "User followed successfully",
      following: currentUser.following,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
export const unfollowUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(req.params.id)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id,
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id,
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      message: "User unfollowed successfully",
      following: currentUser.following,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search users by name or skills
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Please provide a search keyword" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { skills: { $regex: keyword, $options: "i" } },
        { bio: { $regex: keyword, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get suggested users (users with similar skills)
// @route   GET /api/users/suggestions
// @access  Private
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Find users with similar skills who user is not following
    const suggestions = await User.find({
      _id: { $ne: req.user.id, $nin: currentUser.following },
      skills: { $in: currentUser.skills || [] },
    })
      .select("-password")
      .limit(10);

    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Private
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name profilePicture bio skills",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.followers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Private
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name profilePicture bio skills",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.following);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
