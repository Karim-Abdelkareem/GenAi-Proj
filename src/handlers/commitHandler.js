/**
 * Commit message handler
 * Triggers GPT response after user finishes speaking
 */

import { GPT_MESSAGE_TYPES } from "../config/messageConfig.js";
import { buildContinueInstruction } from "../config/promptConfig.js";
import { isSessionActive } from "../services/sessionService.js";
import { logger } from "../utils/logger.js";

/**
 * Handle commit message (user finished speaking)
 * @param {Object} session - Session object
 */
export function handleCommit(session) {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'commitHandler.js:15',message:'handleCommit called',data:{sessionId:session.sessionId,isActive:isSessionActive(session),awaitingResponse:session.awaitingResponse,aiSocketExists:!!session.aiSocket},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (!isSessionActive(session)) {
    logger.warn("[COMMIT HANDLER] Session not active, ignoring commit");
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'commitHandler.js:18',message:'Commit rejected - session not active',data:{sessionId:session.sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return;
  }

  // Guard: prevent double commit while AI is responding
  if (session.awaitingResponse) {
    logger.info("[COMMIT HANDLER] Ignored - Awaiting GPT response");
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'commitHandler.js:24',message:'Commit rejected - awaiting response',data:{sessionId:session.sessionId,awaitingResponse:session.awaitingResponse},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return;
  }

  const aiSocket = session.aiSocket;
  if (!aiSocket) {
    logger.warn("[COMMIT HANDLER] GPT socket not available");
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'commitHandler.js:30',message:'Commit rejected - no AI socket',data:{sessionId:session.sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return;
  }

  logger.info("[COMMIT HANDLER] 🎤 User finished speaking - Processing Commit");
  logger.info(`[COMMIT HANDLER] Session ID: ${session.sessionId}, AwaitingResponse: ${session.awaitingResponse}`);

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'commitHandler.js:37',message:'Processing commit',data:{sessionId:session.sessionId,awaitingResponseBefore:session.awaitingResponse,aiSocketReady:aiSocket.isReady},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  // Set awaiting response state
  session.awaitingResponse = true;

  // Commit audio buffer - tell GPT: audio is done
  logger.debug("[COMMIT HANDLER] Sending input_audio_buffer.commit");
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'commitHandler.js:43',message:'Sending input_audio_buffer.commit',data:{sessionId:session.sessionId,awaitingResponse:session.awaitingResponse},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  aiSocket.safeSend({
    type: GPT_MESSAGE_TYPES.INPUT_AUDIO_BUFFER_COMMIT,
  });

  // Create response - tell GPT: respond now
  logger.debug("[COMMIT HANDLER] Sending response.create");
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'commitHandler.js:50',message:'Sending response.create',data:{sessionId:session.sessionId,awaitingResponse:session.awaitingResponse},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  aiSocket.safeSend({
    type: GPT_MESSAGE_TYPES.RESPONSE_CREATE,
    response: {
      modalities: ["audio", "text"],
      instructions: buildContinueInstruction(),
    },
  });
}

