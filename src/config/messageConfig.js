/**
 * Message type constants and configuration
 */

export const MESSAGE_TYPES = {
  // Incoming from client
  AUDIO: "audio",
  COMMIT: "commit",
  END_INTERVIEW: "end_interview",

  // Outgoing to client
  AI_AUDIO: "audio",
  AI_DONE: "ai_done",
  INTERVIEW_ENDED: "interview_ended",
};

export const GPT_MESSAGE_TYPES = {
  SESSION_UPDATE: "session.update",
  INPUT_AUDIO_BUFFER_APPEND: "input_audio_buffer.append",
  INPUT_AUDIO_BUFFER_COMMIT: "input_audio_buffer.commit",
  RESPONSE_CREATE: "response.create",
  RESPONSE_AUDIO_DELTA: "response.audio.delta",
  RESPONSE_AUDIO_DONE: "response.audio.done",
  RESPONSE_DONE: "response.done",
  CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPT_DELTA:
    "conversation.item.input_audio_transcript.delta",
  CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPT_COMPLETED:
    "conversation.item.input_audio_transcript.completed",
};

