/**
 * GPT Realtime API service
 */

import WebSocket from "ws";
import {
  buildSystemPrompt,
  buildGreetingInstruction,
} from "../config/promptConfig.js";
import { GPT_MESSAGE_TYPES } from "../config/messageConfig.js";
import {
  processTranscriptDelta,
  processTranscriptCompleted,
} from "./transcriptService.js";
import { logger } from "../utils/logger.js";

/**
 * Create and configure GPT Realtime WebSocket connection
 * @param {Object} session - Session object
 * @param {WebSocket} clientSocket - Client WebSocket connection
 * @returns {WebSocket} - GPT Realtime WebSocket connection
 */
export function createRealtimeConnection(session, clientSocket) {
  // ===============================
  // Create GPT WebSocket
  // ===============================
  const ws = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-realtime",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    }
  );

  // ===============================
  // GPT socket state + safeSend
  // (MUST be defined first)
  // ===============================
  ws.isReady = false;
  ws.messageQueue = [];

  ws.safeSend = (msg) => {
    const data = JSON.stringify(msg);

    if (ws.isReady) {
      ws.send(data);
    } else {
      ws.messageQueue.push(data);
    }
  };

  // ===============================
  // Session state
  // ===============================
  session.userTranscript = "";
  session.awaitingResponse = false;

  // ===============================
  // Client → GPT bridge
  // ===============================
  // Note: Message routing is handled by server.js -> messageRouter.js
  // We do not listen to clientSocket here to avoid duplicate handling

  // ===============================
  // GPT connection open
  // ===============================
  ws.on("open", () => {
    ws.isReady = true;
    logger.success("[GPT CONNECTION] Connected to GPT Realtime API");

    // #region agent log
    fetch("http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "realtimeService.js:71",
        message: "GPT connection open",
        data: {
          sessionId: session.sessionId,
          awaitingResponse: session.awaitingResponse,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "F",
      }),
    }).catch(() => {});
    // #endregion

    // System prompt
    ws.send(
      JSON.stringify({
        type: GPT_MESSAGE_TYPES.SESSION_UPDATE,
        session: {
          instructions: buildSystemPrompt(session),
          modalities: ["audio", "text"],
          voice: "alloy",
          output_audio_format: "pcm16",
          turn_detection: null, // client-side VAD
        },
      })
    );

    // Initial greeting
    const greetingInstruction = buildGreetingInstruction(session);
    // #region agent log
    fetch("http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "realtimeService.js:90",
        message: "Sending greeting response.create",
        data: {
          sessionId: session.sessionId,
          awaitingResponse: session.awaitingResponse,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "G",
      }),
    }).catch(() => {});
    // #endregion
    ws.send(
      JSON.stringify({
        type: GPT_MESSAGE_TYPES.RESPONSE_CREATE,
        response: {
          instructions: greetingInstruction,
          modalities: ["audio", "text"],
        },
      })
    );

    // Flush queued messages
    ws.messageQueue.forEach((msg) => ws.send(msg));
    ws.messageQueue = [];
  });

  // ===============================
  // GPT → Client handling
  // ===============================
  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    // 📝 Transcript streaming
    if (
      data.type ===
      GPT_MESSAGE_TYPES.CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPT_DELTA
    ) {
      processTranscriptDelta(session, data.delta);
    }

    if (
      data.type ===
      GPT_MESSAGE_TYPES.CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPT_COMPLETED
    ) {
      processTranscriptCompleted(session, data.transcript);
    }

    // 🔊 Audio streaming
    if (data.type === GPT_MESSAGE_TYPES.RESPONSE_AUDIO_DELTA) {
      if (clientSocket.readyState === 1) {
        clientSocket.send(
          JSON.stringify({
            type: "audio",
            audio: data.delta,
          })
        );
      }
    }

    // 🔚 Audio finished (unlock next turn)
    if (data.type === GPT_MESSAGE_TYPES.RESPONSE_AUDIO_DONE) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "realtimeService.js:139",
            message: "RESPONSE_AUDIO_DONE received",
            data: {
              sessionId: session.sessionId,
              awaitingResponseBefore: session.awaitingResponse,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H",
          }),
        }
      ).catch(() => {});
      // #endregion
      session.awaitingResponse = false;
      // #region agent log
      fetch(
        "http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "realtimeService.js:141",
            message: "awaitingResponse set to false",
            data: {
              sessionId: session.sessionId,
              awaitingResponseAfter: session.awaitingResponse,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H",
          }),
        }
      ).catch(() => {});
      // #endregion

      if (clientSocket.readyState === 1) {
        clientSocket.send(JSON.stringify({ type: "ai_done" }));
      }

      if (session.shouldCloseAfterResponse) {
        if (clientSocket.readyState === 1) {
          clientSocket.send(JSON.stringify({ type: "interview_ended" }));
        }
      }
    }

    // ✅ Full response done (failsafe unlock)
    if (data.type === GPT_MESSAGE_TYPES.RESPONSE_DONE) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "realtimeService.js:154",
            message: "RESPONSE_DONE received",
            data: {
              sessionId: session.sessionId,
              awaitingResponseBefore: session.awaitingResponse,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "I",
          }),
        }
      ).catch(() => {});
      // #endregion
      session.awaitingResponse = false;
      // #region agent log
      fetch(
        "http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "realtimeService.js:156",
            message: "awaitingResponse set to false (failsafe)",
            data: {
              sessionId: session.sessionId,
              awaitingResponseAfter: session.awaitingResponse,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "I",
          }),
        }
      ).catch(() => {});
      // #endregion

      if (session.shouldCloseAfterResponse) {
        logger.info("[CLOSING CONNECTION] Interview ended");
        session.shouldCloseAfterResponse = false;

        if (ws.readyState === 1) ws.close();

        setTimeout(() => {
          if (clientSocket.readyState === 1) {
            clientSocket.close();
          }
        }, 1000);
      }
    }
  });

  ws.on("error", (error) => {
    logger.error("[GPT CONNECTION] Error:", error);
  });

  ws.on("close", () => {
    logger.info("[GPT CONNECTION] Connection closed");
  });

  return ws;
}
