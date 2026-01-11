/**
 * End interview handler
 * Handles interview termination with farewell message
 */

import { GPT_MESSAGE_TYPES } from "../config/messageConfig.js";
import { buildFarewellInstruction } from "../config/promptConfig.js";
import { isSessionActive, closeSession } from "../services/sessionService.js";
import { logger } from "../utils/logger.js";

/**
 * Handle end interview command
 * @param {WebSocket} clientSocket - Client WebSocket connection
 * @param {Object} session - Session object
 */
export async function handleEndInterview(clientSocket, session) {
  if (!isSessionActive(session)) {
    logger.warn("[END INTERVIEW] Session already closed");
    return;
  }

  logger.warn("[END INTERVIEW] Ending interview");

  const aiSocket = session.aiSocket;

  // Check if GPT socket exists
  if (!aiSocket) {
    logger.warn("[END INTERVIEW] GPT socket not available, sending fallback message");
    if (clientSocket.readyState === 1) {
      clientSocket.send(JSON.stringify({ type: "interview_ended" }));
      setTimeout(() => clientSocket.close(), 300);
    }
    closeSession(session);
    return;
  }

  try {
    // Request GPT to generate farewell message
    logger.info("[END INTERVIEW] Requesting farewell message from GPT");
    aiSocket.safeSend({
      type: GPT_MESSAGE_TYPES.RESPONSE_CREATE,
      response: {
        instructions: buildFarewellInstruction(),
        modalities: ["audio", "text"],
      },
    });

    // Set flag to close connection after GPT finishes
    session.shouldCloseAfterResponse = true;
    closeSession(session);
  } catch (error) {
    logger.error("[END INTERVIEW] Error:", error);
    if (clientSocket.readyState === 1) {
      clientSocket.send(JSON.stringify({ type: "interview_ended" }));
      setTimeout(() => clientSocket.close(), 300);
    }
    closeSession(session);
  }
}

