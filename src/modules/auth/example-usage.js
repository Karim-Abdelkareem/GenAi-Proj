/**
 * Example: How to integrate Auth Module in Express App
 * 
 * This is a reference file showing how to set up the auth module
 */

import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "../../config/db.js";
import authRoutes from "./auth.routes.js";
import { globalErrorHandler } from "../../middleware/errorHandler.middleware.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const app = express();

// 1. Connect to MongoDB
await connectDB();

// 2. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Auth Routes
app.use("/api/auth", authRoutes);

// 4. Example Protected Route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    status: "success",
    message: "This is a protected route",
    user: req.user,
  });
});

// 5. Example Admin-Only Route
app.delete("/api/admin/users/:id", protect, restrictTo("admin"), (req, res) => {
  res.json({
    status: "success",
    message: "Admin only route",
  });
});

// 6. Error Handler (must be last)
app.use(globalErrorHandler);

// 7. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

