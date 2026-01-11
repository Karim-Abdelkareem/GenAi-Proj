/**
 * Message router - routes incoming messages to appropriate handlers
 */

import { MESSAGE_TYPES } from "../config/messageConfig.js";
import { handleAudio } from "../handlers/audioHandler.js";
import { handleCommit } from "../handlers/commitHandler.js";
import { handleEndInterview } from "../handlers/endInterviewHandler.js";
import { logger } from "../utils/logger.js";

/**
 * Route message to appropriate handler
 * @param {WebSocket} clientSocket - Client WebSocket connection
 * @param {Object} session - Session object
 * @param {Object} message - Parsed message object
 */
export function routeMessage(clientSocket, session, message) {
  try {
    switch (message.type) {
      case MESSAGE_TYPES.AUDIO:
        handleAudio(session, message);
        break;

      case MESSAGE_TYPES.COMMIT:
        handleCommit(session);
        break;

      case MESSAGE_TYPES.END_INTERVIEW:
        handleEndInterview(clientSocket, session);
        break;

      default:
        logger.warn("[MESSAGE ROUTER] Unknown message type:", message.type);
    }
  } catch (error) {
    logger.error("[MESSAGE ROUTER] Error routing message:", error);
  }
}

