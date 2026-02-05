import { connect } from "mongoose";
import dotenv from "dotenv";
import Post from "../models/Posts.model.js";
import User from "../models/Users.model.js";

dotenv.config();

const samplePosts = [
  {
    content:
      "Just deployed my first MERN stack application! 🚀 So excited to share it with you all. The learning curve was steep but totally worth it.",
    tags: ["mern", "webdev", "nodejs", "react"],
    codeSnippet: {
      code: "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello World!' });\n});\n\napp.listen(5000);",
      language: "javascript",
    },
  },
  {
    content:
      "Here's a quick tip for React developers: Always use useMemo for expensive calculations to avoid unnecessary re-renders.",
    tags: ["react", "performance", "tips"],
    codeSnippet: {
      code: "const expensiveValue = useMemo(() => {\n  return computeExpensiveValue(a, b);\n}, [a, b]);",
      language: "javascript",
    },
  },
  {
    content:
      "Working on a new portfolio design. What do you think about dark mode vs light mode for developer portfolios?",
    tags: ["design", "portfolio", "webdev"],
  },
  {
    content:
      "Just learned about MongoDB aggregation pipelines. They're incredibly powerful for complex queries!",
    tags: ["mongodb", "database", "backend"],
    codeSnippet: {
      code: "db.users.aggregate([\n  { $match: { age: { $gte: 18 } } },\n  { $group: { _id: '$city', count: { $sum: 1 } } },\n  { $sort: { count: -1 } }\n]);",
      language: "javascript",
    },
  },
  {
    content: "Happy Friday everyone! 🎉 What are you building this weekend?",
    tags: ["friday", "community", "coding"],
  },
];

const seedPosts = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Get first user to assign posts
    const user = await User.findOne();

    if (!user) {
      console.log("❌ No users found. Please create a user first.");
      process.exit(1);
    }

    // Add user to each post
    const postsWithUser = samplePosts.map((post) => ({
      ...post,
      user: user._id,
    }));

    // Clear existing posts (optional)
    // await Post.deleteMany();

    // Create posts
    await Post.insertMany(postsWithUser);

    console.log("✅ Posts seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedPosts();
