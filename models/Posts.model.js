import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [2000, "Post content cannot be more than 2000 characters"],
    },
    image: {
      type: String, // Cloudinary URL
    },
    codeSnippet: {
      code: String,
      language: {
        type: String,
        enum: [
          "javascript",
          "python",
          "java",
          "cpp",
          "html",
          "css",
          "typescript",
          "go",
          "rust",
          "other",
        ],
      },
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: [500, "Comment cannot be more than 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

export default model("Post", postSchema);
