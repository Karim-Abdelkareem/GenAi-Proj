/**
 * Transcript processing service
 */

import { detectEndCommand } from "../utils/commandDetector.js";
import { logger } from "../utils/logger.js";

/**
 * Process transcript delta (partial transcript)
 * @param {Object} session - Session object
 * @param {string} delta - Transcript delta
 */
export function processTranscriptDelta(session, delta) {
  if (!session.userTranscript) {
    session.userTranscript = "";
  }
  session.userTranscript += delta || "";
}

/**
 * Process completed transcript
 * @param {Object} session - Session object
 * @param {string} transcript - Complete transcript
 * @returns {boolean} - True if end command detected
 */
export function processTranscriptCompleted(session, transcript) {
  const fullTranscript = transcript || session.userTranscript || "";
  
  logger.info("[USER TRANSCRIPT]", fullTranscript);

  // Detect end command
  const hasEndCommand = detectEndCommand(fullTranscript);

  if (hasEndCommand) {
    logger.warn(
      "[END COMMAND DETECTED] User said stop/end, will close after response"
    );
    session.shouldCloseAfterResponse = true;
  }

  // Reset transcript
  session.userTranscript = "";

  return hasEndCommand;
}

