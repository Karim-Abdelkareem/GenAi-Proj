/**
 * WebSocket server core
 */

import { WebSocketServer } from "ws";
import { createSession } from "../services/sessionService.js";
import { createRealtimeConnection } from "../services/realtimeService.js";
import { routeMessage } from "./messageRouter.js";
import { logger } from "../utils/logger.js";

/**
 * Create and configure WebSocket server
 * @param {number|Object} portOrServer - Port number or HTTP server instance
 * @param {Object} options - Optional configuration
 * @returns {WebSocketServer} - WebSocket server instance
 */
export function createWebSocketServer(portOrServer, options = {}) {
  // If portOrServer is a number, create standalone server
  // If it's an object (HTTP server), attach to it
  const wss =
    typeof portOrServer === "number"
      ? new WebSocketServer({ port: portOrServer })
      : new WebSocketServer({ server: portOrServer });

  // Handle server-level errors (e.g., port already in use)
  // Access the underlying HTTP server to catch listen errors
  const server = wss._server;
  if (server) {
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        const port =
          typeof portOrServer === "number"
            ? portOrServer
            : server.address()?.port || "unknown";
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
  }

  // Also handle WebSocketServer-level errors
  wss.on("error", (error) => {
    logger.error("[SERVER] WebSocket server error:", error);
  });

  wss.on("connection", (ws) => {
    // Create session
    const sessionData = createSession(null, options.sessionConfig || {});
    const session = {
      ...sessionData,
      open: true,
      aiSocket: null,
    };

    logger.success(
      "[SERVER] Client connected with sessionId:",
      session.sessionId
    );

    // Connect to GPT Realtime API
    const aiSocket = createRealtimeConnection(session, ws);
    session.aiSocket = aiSocket;

    // Handle incoming messages
    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        logger.info(`[SERVER] Received message type: ${msg.type}`);
        routeMessage(ws, session, msg);
      } catch (error) {
        logger.error("[SERVER] Error handling message:", error);
      }
    });

    // Handle connection close
    ws.on("close", () => {
      logger.info("[SERVER] Session closed:", session.sessionId);

      // Cleanup
      if (session.aiSocket) {
        session.aiSocket.close();
      }
    });

    // Handle errors
    ws.on("error", (error) => {
      logger.error("[SERVER] WebSocket error:", error);
    });
  });

  // Wait for server to be ready before logging
  wss.on("listening", () => {
    const port =
      typeof portOrServer === "number"
        ? portOrServer
        : wss._server?.address()?.port || "unknown";
    logger.success(`[SERVER] WebSocket server running on port ${port}`);
  });

  return wss;
}
