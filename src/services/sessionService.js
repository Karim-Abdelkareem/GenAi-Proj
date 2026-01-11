/**
 * Session management service
 */

import { v4 as uuid } from "uuid";

/**
 * Create a new session
 * @param {string} sessionId - Optional session ID (generated if not provided)
 * @param {Object} config - Optional session configuration
 * @returns {Object} - Session object
 */
export function createSession(sessionId = null, config = {}) {
  const defaultConfig = {
    level: "junior",
    role: "fullstack",
    stack: [
      "React",
      "Node.js",
      "MongoDB",
      "JavaScript",
      "Express Js",
      "HTML",
      "CSS",
    ],
    askedQuestions: 0,
    scores: {
      clarity: 0,
      accuracy: 0,
      depth: 0,
    },
    state: "active",
    mode: "interview",
    lastQuestion: null,
  };

  return {
    sessionId: sessionId || uuid(),
    ...defaultConfig,
    ...config,
    // Runtime state
    open: true,
    aiSocket: null,
    userTranscript: "",
    shouldCloseAfterResponse: false,
  };
}

/**
 * Close a session
 * @param {Object} session - Session object
 */
export function closeSession(session) {
  session.open = false;
  
  if (session.aiSocket) {
    session.aiSocket.close();
    session.aiSocket = null;
  }
}

/**
 * Check if session is active
 * @param {Object} session - Session object
 * @returns {boolean} - True if session is active
 */
export function isSessionActive(session) {
  return session && session.open === true;
}

