/**
 * Main entry point for Voice Interview Server
 * Combines Express HTTP server with WebSocket server
 * Modular design with separated concerns
 */

import "dotenv/config";
import http from "http";
import { createExpressApp, initializeDatabase } from "./src/app.js";
import { createWebSocketServer } from "./src/core/server.js";
import { logger } from "./src/utils/logger.js";
// Import worker to start processing jobs
import "./src/modules/upload/upload.worker.js";

const port = process.env.PORT || 3000;

// Handle uncaught exceptions (e.g., port already in use)
process.on("uncaughtException", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      `[SERVER] Port ${port} is already in use. Please use a different port or stop the process using this port.`
    );
    logger.info(`[SERVER] Windows: netstat -ano | findstr :${port}`);
    logger.info(`[SERVER] Mac/Linux: lsof -ti:${port} | xargs kill`);
  } else {
    logger.error("[SERVER] Uncaught exception:", error);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("[SERVER] Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

/**
 * Start server
 */
async function startServer() {
  try {
    // 1. Initialize database connection
    await initializeDatabase();

    // 2. Create Express app
    const app = createExpressApp();

    // 3. Create HTTP server from Express app
    const httpServer = http.createServer(app);

    // 4. Attach WebSocket server to HTTP server
    const wss = createWebSocketServer(httpServer, {
      // Optional: Custom session configuration
      sessionConfig: {
        // level: "senior",
        // role: "backend-developer",
        // stack: ["Node.js", "PostgreSQL"],
      },
    });

    // 5. Start HTTP server (this will also start WebSocket server)
    httpServer.listen(port, () => {
      logger.success(`[HTTP SERVER] Express app running on port ${port}`);
      logger.success(
        `[WEBSOCKET SERVER] WebSocket server attached to HTTP server`
      );
      logger.info(
        `[SERVER] API endpoints available at http://localhost:${port}/api`
      );
      logger.info(`[SERVER] WebSocket available at ws://localhost:${port}`);
    });

    // 6. Handle server errors
    httpServer.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(
          `[SERVER] Port ${port} is already in use. Please use a different port or stop the process using this port.`
        );
        logger.info(`[SERVER] Windows: netstat -ano | findstr :${port}`);
        logger.info(`[SERVER] Mac/Linux: lsof -ti:${port} | xargs kill`);
      } else {
        logger.error("[SERVER] HTTP server error:", error);
      }
      process.exit(1);
    });

    // 7. Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`[SERVER] ${signal} received. Shutting down gracefully...`);

      httpServer.close(() => {
        logger.info("[SERVER] HTTP server closed");

        // Close all WebSocket connections
        wss.clients.forEach((client) => {
          client.close();
        });

        wss.close(() => {
          logger.info("[SERVER] WebSocket server closed");
          process.exit(0);
        });
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    return { httpServer, wss };
  } catch (error) {
    logger.error("[SERVER] Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
