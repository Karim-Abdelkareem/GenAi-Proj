/**
 * Audio message handler
 */

import { GPT_MESSAGE_TYPES } from "../config/messageConfig.js";
import { isSessionActive } from "../services/sessionService.js";
import { logger } from "../utils/logger.js";

/**
 * Handle incoming audio message
 * @param {Object} session - Session object
 * @param {Object} message - Message object
 */
export function handleAudio(session, message) {
  if (!isSessionActive(session)) {
    logger.warn("[AUDIO HANDLER] Session not active, ignoring audio");
    return;
  }
  
  // Log occasionally to avoid spam, or finding a way to log summary? 
  // For now, let's log every 20-50 chunks or just debug.
  // Using debug which might not show up unless enabled, using info for now for debugging this issue.
  // logger.debug("[AUDIO HANDLER] Forwarding audio chunk");


  const aiSocket = session.aiSocket;
  if (!aiSocket) {
    logger.warn("[AUDIO HANDLER] GPT socket not available");
    return;
  }

  // Forward audio directly to GPT
  aiSocket.safeSend({
    type: GPT_MESSAGE_TYPES.INPUT_AUDIO_BUFFER_APPEND,
    audio: message.audio,
  });
}

