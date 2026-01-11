/**
 * Main export file for Voice Interview Server
 * Provides a clean API for importing the server
 */

export { createWebSocketServer } from "./core/server.js";
export { createSession, closeSession, isSessionActive } from "./services/sessionService.js";
export { createRealtimeConnection } from "./services/realtimeService.js";
export { buildSystemPrompt, buildGreetingInstruction, buildFarewellInstruction } from "./config/promptConfig.js";
export { MESSAGE_TYPES, GPT_MESSAGE_TYPES } from "./config/messageConfig.js";
export { logger } from "./utils/logger.js";
export { detectEndCommand, detectRepeatCommand } from "./utils/commandDetector.js";

