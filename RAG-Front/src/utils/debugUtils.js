/**
 * Debug utilities for Socket.io and general debugging
 */

/**
 * Enable Socket.io debug logging
 * Sets localStorage.debug to enable Socket.io client debug logs
 */
export const enableSocketDebug = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("debug", "socket.io-client:*");
    console.log("✅ Socket.io debug mode enabled");
    console.log("Refresh the page for debug logs to take effect");
  }
};

/**
 * Disable Socket.io debug logging
 */
export const disableSocketDebug = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("debug");
    console.log("❌ Socket.io debug mode disabled");
  }
};

/**
 * Check if debug mode is active
 * @returns {boolean} - True if debug mode is enabled
 */
export const isDebugMode = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("debug");
};

/**
 * Toggle Socket.io debug mode
 * @returns {boolean} - New debug mode state
 */
export const toggleSocketDebug = () => {
  if (isDebugMode()) {
    disableSocketDebug();
    return false;
  } else {
    enableSocketDebug();
    return true;
  }
};

/**
 * Log connection attempt with details
 * @param {string} url - Connection URL
 * @param {object} options - Connection options
 */
export const logConnectionAttempt = (url, options = {}) => {
  console.group("🔌 Socket Connection Attempt");
  console.log("URL:", url);
  console.log("Options:", {
    ...options,
    auth: options.auth
      ? {
          ...options.auth,
          token: options.auth.token
            ? `${options.auth.token.substring(0, 20)}...`
            : "missing",
        }
      : "none",
  });
  console.groupEnd();
};

/**
 * Log connection state changes
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const logConnectionState = (event, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Socket ${event}:`, data || "");
};












