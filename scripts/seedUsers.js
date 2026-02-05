import { connect } from "mongoose";
import dotenv from "dotenv";
import User from "../models/Users.model.js";

dotenv.config();

const users = [
  {
    name: "John Doe",
    email: "john@test.com",
    password: "123456",
    bio: "Senior Full Stack Developer with 5 years experience",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    location: "Mumbai, Maharashtra",
  },
  {
    name: "Sarah Williams",
    email: "sarah@test.com",
    password: "123456",
    bio: "Frontend Developer specializing in React and Vue",
    skills: ["React", "Vue.js", "CSS", "JavaScript", "Tailwind"],
    location: "Bangalore, Karnataka",
  },
  {
    name: "Mike Johnson",
    email: "mike@test.com",
    password: "123456",
    bio: "Backend Developer passionate about scalable systems",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Docker"],
    location: "Delhi, NCR",
  },
  {
    name: "Emily Chen",
    email: "emily@test.com",
    password: "123456",
    bio: "Full Stack Developer and UI/UX enthusiast",
    skills: ["React", "Node.js", "Figma", "MongoDB", "Redux"],
    location: "Pune, Maharashtra",
  },
  {
    name: "David Kumar",
    email: "david@test.com",
    password: "123456",
    bio: "DevOps Engineer with cloud expertise",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
    location: "Hyderabad, Telangana",
  },
];

const seedUsers = async () => {
  try {
    await connect(process.env.MONGO_URI);

    console.log("MongoDB Connected...");

    // Clear existing users (optional - be careful!)
    // await User.deleteMany();

    // Create users
    await User.insertMany(users);

    console.log("✅ Users seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedUsers();
