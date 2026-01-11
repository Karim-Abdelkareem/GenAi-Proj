/**
 * Express Application Setup
 * Main Express app configuration
 */

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middleware/errorHandler.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import vectorRoutes from "./modules/vectors/vector.routes.js";
import ragRoutes from "./modules/llm/rag.routes.js";
import questionRoutes from "./modules/questions/questions.routes.js";
import cvAnalysisRoutes from "./modules/llm/cv-analysis.routes.js";
import { logger } from "./utils/logger.js";

/**
 * Create and configure Express app
 * @returns {express.Application} - Express app instance
 */
export function createExpressApp() {
  const app = express();

  // 1. CORS middleware - Allow frontend on localhost:5173
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true, // Allow cookies to be sent
    })
  );

  // 2. Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Cookie parser middleware
  app.use(cookieParser());

  // 3. Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  // 4. API Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/upload-pdf", uploadRoutes);
  app.use("/query", vectorRoutes);
  app.use("/ask", ragRoutes);
  app.use("/api/v1/interview/questions", questionRoutes);
  app.use("/api/v1/cv", cvAnalysisRoutes);

  // 5. 404 handler
  app.all("*", (req, res, next) => {
    res.status(404).json({
      status: "fail",
      message: `Can't find ${req.originalUrl} on this server!`,
    });
  });

  // 6. Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}

/**
 * Initialize database connection
 */
export async function initializeDatabase() {
  try {
    await connectDB();
    logger.success("[DATABASE] Connected to MongoDB");
  } catch (error) {
    logger.error("[DATABASE] Failed to connect to MongoDB:", error);
    throw error;
  }
}
