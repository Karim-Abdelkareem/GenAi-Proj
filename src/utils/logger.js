/**
 * Logger utility for consistent logging across the application
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || LOG_LEVELS.INFO;

export const logger = {
  debug: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log("🔍 [DEBUG]", ...args);
    }
  },

  info: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log("ℹ️ [INFO]", ...args);
    }
  },

  warn: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn("⚠️ [WARN]", ...args);
    }
  },

  error: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error("❌ [ERROR]", ...args);
    }
  },

  success: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log("✅ [SUCCESS]", ...args);
    }
  },
};

