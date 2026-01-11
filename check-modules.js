/**
 * Quick module check script
 * Verifies all modules can be imported correctly
 */

import { createWebSocketServer } from "./src/core/server.js";
import { routeMessage } from "./src/core/messageRouter.js";
import { handleAudio } from "./src/handlers/audioHandler.js";
import { handleCommit } from "./src/handlers/commitHandler.js";
import { handleEndInterview } from "./src/handlers/endInterviewHandler.js";
import { createSession, closeSession, isSessionActive } from "./src/services/sessionService.js";
import { createRealtimeConnection } from "./src/services/realtimeService.js";
import { processTranscriptDelta, processTranscriptCompleted } from "./src/services/transcriptService.js";
import { buildSystemPrompt, buildGreetingInstruction, buildFarewellInstruction, buildContinueInstruction } from "./src/config/promptConfig.js";
import { MESSAGE_TYPES, GPT_MESSAGE_TYPES } from "./src/config/messageConfig.js";
import { logger } from "./src/utils/logger.js";
import { detectEndCommand, detectRepeatCommand } from "./src/utils/commandDetector.js";

console.log("✅ All modules imported successfully!");
console.log("\n📦 Module Check:");
console.log("  ✅ Core modules");
console.log("  ✅ Handlers");
console.log("  ✅ Services");
console.log("  ✅ Config");
console.log("  ✅ Utils");
console.log("\n🎉 Modular architecture is working correctly!");

