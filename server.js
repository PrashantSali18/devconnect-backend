// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import session from "express-session";
// import { createServer } from "http";
// import connectDB from "./config/db.js";
// import { initializeSocket } from "./socket/socket.js"; // ADD THIS
// import passportConfig from "./config/passport.js";
// import {
//   helmetConfig,
//   sanitizeData,
//   preventXSS,
//   preventHPP,
//   sanitizeUserInput,
//   corsOptions,
// } from "./middleware/securite.middleware.js";
// import { apiLimiter } from "./middleware/rateLimiter.middleware.js";

// dotenv.config();

// console.log("🚀 Starting server...");
// console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);

// connectDB();

// const app = express();
// const server = createServer(app); // IMPORTANT: Use http server

// // Trust proxy
// app.set("trust proxy", 1);

// // Security Middleware
// app.use(helmetConfig);
// app.use(cors(corsOptions));

// // Session middleware (required for Passport)
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000,
//     },
//   }),
// );

// // Initialize Passport
// app.use(passportConfig.initialize());
// app.use(passportConfig.session());

// app.use(sanitizeData);
// app.use(preventXSS);
// app.use(preventHPP);

// // Body parser
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Custom sanitization
// app.use(sanitizeUserInput);

// // Rate limiting
// if (process.env.NODE_ENV === "production") {
//   app.use("/api/", apiLimiter);
// }

// // Routes
// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/users.routes.js";
// import postRoutes from "./routes/posts.routes.js";
// import messageRoutes from "./routes/message.routes.js";
// import notificationRoutes from "./routes/notification.routes.js";

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/posts", postRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/notifications", notificationRoutes);

// // Root route
// app.get("/", (req, res) => {
//   res.json({
//     message: "DevConnect API is running...",
//     version: "1.0.0",
//     status: "active",
//     environment: process.env.NODE_ENV || "development",
//     features: {
//       auth: ["JWT", "OAuth (Google, GitHub)", "Email Verification"],
//       security: ["Rate Limiting", "XSS Protection", "CORS", "Helmet"],
//       realtime: ["Socket.io", "Notifications"],
//     },
//   });
// });

// // Health check
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     status: "ok",
//     environment: process.env.NODE_ENV || "development",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     message: "Route not found",
//     path: req.path,
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error("Error:", err);

//   if (err.code === 11000) {
//     const field = Object.keys(err.keyPattern)[0];
//     return res.status(400).json({
//       message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
//     });
//   }

//   if (err.name === "ValidationError") {
//     const errors = Object.values(err.errors).map((e) => e.message);
//     return res.status(400).json({
//       message: "Validation failed",
//       errors,
//     });
//   }

//   if (err.name === "JsonWebTokenError") {
//     return res.status(401).json({ message: "Invalid token" });
//   }

//   if (err.name === "TokenExpiredError") {
//     return res.status(401).json({ message: "Token expired" });
//   }

//   res.status(err.status || 500).json({
//     message: err.message || "Internal server error",
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   });
// });

// // ✅ Initialize Socket.io with the HTTP server
// initializeSocket(server);

// const PORT = parseInt(process.env.PORT || "5000", 10);
// const HOST = "0.0.0.0";

// server.listen(PORT, HOST, (err) => {
//   if (err) {
//     console.error("❌ Failed to start server:", err);
//     process.exit(1);
//   }
//   console.log(`✅ Server running on ${HOST}:${PORT}`);
//   console.log(`🔒 Security middleware enabled`);
//   console.log(`🔑 OAuth providers: Google, GitHub`);
//   console.log(
//     `⏱️  Rate limiting: ${process.env.NODE_ENV === "production" ? "ENABLED" : "DISABLED"}`,
//   );
//   console.log(`🔌 Socket.io initialized on port ${PORT}`);
// });

// process.on("SIGTERM", () => {
//   console.log("👋 SIGTERM received, shutting down gracefully...");
//   server.close(() => {
//     console.log("✅ Server closed");
//     process.exit(0);
//   });
// });

// export default app;


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import connectDB from "./config/db.js";
import { initializeSocket } from "./socket/socket.js";
import passportConfig from "./config/passport.js";
import {
  helmetConfig,
  sanitizeData,
  preventXSS,
  preventHPP,
  sanitizeUserInput,
  corsOptions,
} from "./middleware/securite.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";

// Load environment variables
dotenv.config();

console.log("🚀 Starting server...");
console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);

// Trust proxy (important if deploying behind Nginx or on Heroku)
app.set("trust proxy", 1);

// ✅ Security Middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(sanitizeData);
app.use(preventXSS);
app.use(preventHPP);
app.use(sanitizeUserInput);

// ✅ Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);

// Initialize Passport
app.use(passportConfig.initialize());
app.use(passportConfig.session());

// ✅ Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Rate limiting in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/", apiLimiter);
}

// ✅ Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import postRoutes from "./routes/posts.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.json({
    message: "DevConnect API is running...",
    version: "1.0.0",
    status: "active",
    environment: process.env.NODE_ENV || "development",
    features: {
      auth: ["JWT", "OAuth (Google, GitHub)", "Email Verification"],
      security: ["Rate Limiting", "XSS Protection", "CORS", "Helmet"],
      realtime: ["Socket.io", "Notifications"],
    },
  });
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  if (err.message === "Only images are allowed") {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ✅ Initialize Socket.io
initializeSocket(server);

// ✅ Start server
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0";

server.listen(PORT, HOST, (err) => {
  if (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
  console.log(`✅ Server running on ${HOST}:${PORT}`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`🔑 OAuth providers: Google, GitHub`);
  console.log(
    `⏱️  Rate limiting: ${process.env.NODE_ENV === "production" ? "ENABLED" : "DISABLED"}`,
  );
  console.log(`🔌 Socket.io initialized on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

export default app;
