import { useRef, useCallback, useMemo, useEffect } from "react";
import { getRemainingAudioTime } from "../utils/audio";

export function useWebSocket(onAudio, onAiDone, onEndAck, onInterviewEnded) {
  const socketRef = useRef(null);
  const aiSpeakingRef = useRef(false);
  const lastAudioTimeRef = useRef(null);
  const aiDoneTimerRef = useRef(null);

  // Store callbacks in refs to avoid recreating functions
  const callbacksRef = useRef({
    onAudio,
    onAiDone,
    onEndAck,
    onInterviewEnded,
  });

  // Update callbacks ref when they change (in effect, not during render)
  useEffect(() => {
    callbacksRef.current = { onAudio, onAiDone, onEndAck, onInterviewEnded };
  }, [onAudio, onAiDone, onEndAck, onInterviewEnded]);

  const connect = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current) {
      const currentState = socketRef.current.readyState;
      if (
        currentState === WebSocket.CONNECTING ||
        currentState === WebSocket.OPEN
      ) {
        console.log(
          "🔌 [WEBSOCKET] Closing existing connection before creating new one"
        );
        socketRef.current.close();
      }
      socketRef.current = null;
    }

    const port = import.meta.env.VITE_WS_PORT || 3000;
    const wsUrl = `ws://localhost:${port}`;
    console.log(`🔌 [WEBSOCKET] Connecting to ${wsUrl}`);
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("✅ [WEBSOCKET] Connected to backend");
      console.log(
        "✅ [WEBSOCKET] Session started (connection = session started)"
      );
    };

    socketRef.current.onerror = (error) => {
      console.error("❌ [WEBSOCKET ERROR]", error);
      console.error("❌ [WEBSOCKET] Error details:", {
        type: error.type,
        target: error.target,
        readyState: socketRef.current?.readyState,
      });
    };

    socketRef.current.onclose = (event) => {
      console.log("🔌 [WEBSOCKET] Connection closed", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        readyState: socketRef.current?.readyState,
      });

      // Reset ref if connection was closed
      if (event.code !== 1000) {
        console.warn("⚠️ [WEBSOCKET] Connection closed unexpectedly");
      }
    };

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "audio") {
        aiSpeakingRef.current = true; // GPT بيتكلم
        lastAudioTimeRef.current = performance.now();

        // ✅ إلغاء timer القديم
        if (aiDoneTimerRef.current) {
          clearTimeout(aiDoneTimerRef.current);
          aiDoneTimerRef.current = null;
        }

        // 🔥 Log الصوت المستقبل من AI
        console.log("🤖 [AI AUDIO RECEIVED]", {
          timestamp: new Date().toISOString(),
          audioLength: msg.audio?.length || 0,
          audioPreview: msg.audio?.substring(0, 50) || "",
        });

        callbacksRef.current.onAudio?.(msg.audio);

        // ✅ بعد آخر audio chunk، انتظر حتى ينتهي الصوت فعلياً
        aiDoneTimerRef.current = setTimeout(() => {
          if (aiSpeakingRef.current) {
            // ✅ حساب الوقت المتبقي حتى ينتهي الصوت
            const remainingTime = getRemainingAudioTime();

            if (remainingTime > 0) {
              // ✅ انتظار حتى ينتهي الصوت فعلياً
              setTimeout(() => {
                if (aiSpeakingRef.current) {
                  aiSpeakingRef.current = false;
                  console.log(
                    "✅ [AI DONE] AI finished speaking (after audio playback)"
                  );
                  callbacksRef.current.onAiDone?.();
                }
                aiDoneTimerRef.current = null;
              }, remainingTime + 100); // +100ms buffer
            } else {
              // ✅ الصوت انتهى بالفعل
              aiSpeakingRef.current = false;
              console.log("✅ [AI DONE] AI finished speaking (after silence)");
              callbacksRef.current.onAiDone?.();
              aiDoneTimerRef.current = null;
            }
          }
        }, 500); // 500ms بعد آخر audio chunk
      }

      if (msg.type === "ai_done") {
        // ✅ إلغاء timer إذا كان موجوداً
        if (aiDoneTimerRef.current) {
          clearTimeout(aiDoneTimerRef.current);
          aiDoneTimerRef.current = null;
        }

        // ✅ حساب الوقت المتبقي حتى ينتهي الصوت فعلياً
        const remainingTime = getRemainingAudioTime();
        const delay = remainingTime > 0 ? remainingTime + 200 : 300; // +200ms buffer

        setTimeout(() => {
          aiSpeakingRef.current = false;
          console.log(
            "✅ [AI DONE] AI finished speaking (from backend, after audio playback)"
          );
          callbacksRef.current.onAiDone?.();
        }, delay);

        // ❌ لا نستدعي onEndAck() هنا
        // ✅ ai_done = "AI finished speaking" ≠ "User finished speaking"
        // ✅ فقط end_ack يعتبر ACK لـ "end" من المستخدم
      }

      // ✅ Note: commit doesn't need ACK - it's fire-and-forget

      // ✅ إنهاء المقابلة من backend
      if (msg.type === "interview_ended") {
        console.log("🏁 [INTERVIEW ENDED] Interview ended by AI");
        aiSpeakingRef.current = false;
        callbacksRef.current.onAiDone?.();
        callbacksRef.current.onInterviewEnded?.();
      }
    };
  }, []); // Empty deps - callbacks are stored in ref

  const send = useCallback((data) => {
    if (!socketRef.current) {
      console.warn("⚠️ [WEBSOCKET] Cannot send: WebSocket not connected", data);
      return;
    }

    const readyState = socketRef.current.readyState;

    if (readyState !== WebSocket.OPEN) {
      console.warn(
        "⚠️ [WEBSOCKET] Cannot send: WebSocket not ready. State:",
        readyState,
        data
      );
      return;
    }

    try {
      // إرسال audio: { type: "audio", audio: base64 }
      // إرسال commit: { type: "input_audio_buffer.commit" }
      const message = JSON.stringify(data);
      socketRef.current.send(message);
      console.log("📤 [WEBSOCKET SENT]", {
        type: data.type,
        timestamp: new Date().toISOString(),
        readyState: socketRef.current.readyState,
        audioLength: data.type === "audio" ? data.audio?.length : undefined,
      });
    } catch (error) {
      console.error("❌ [WEBSOCKET SEND ERROR]", error, data);
    }
  }, []);

  const close = useCallback(() => {
    // ✅ تنظيف timers
    if (aiDoneTimerRef.current) {
      clearTimeout(aiDoneTimerRef.current);
      aiDoneTimerRef.current = null;
    }

    if (socketRef.current) {
      const readyState = socketRef.current.readyState;
      // Only close if connection is open or connecting
      if (
        readyState === WebSocket.OPEN ||
        readyState === WebSocket.CONNECTING
      ) {
        console.log("🔌 [WEBSOCKET] Closing connection, state:", readyState);
        try {
          socketRef.current.close(1000, "Normal closure");
        } catch (error) {
          console.error("❌ [WEBSOCKET] Error closing connection:", error);
        }
      } else {
        console.log(
          "ℹ️ [WEBSOCKET] Connection already closed or closing, state:",
          readyState
        );
      }
      socketRef.current = null;
    }
  }, []);

  const isAiSpeaking = useCallback(() => aiSpeakingRef.current, []);

  const getSocket = useCallback(() => socketRef.current, []);

  // Return stable object reference using useMemo
  return useMemo(
    () => ({
      connect,
      send,
      close,
      isAiSpeaking,
      getSocket,
    }),
    [connect, send, close, isAiSpeaking, getSocket]
  );
}
