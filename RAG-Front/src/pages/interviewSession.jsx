import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import useAuthStore from "../store/authStore";
import AudioVisualization from "../components/AudioVisualization";
import UserAvatar from "../components/UserAvatar";
import Navbar from "../components/Navbar";
import { message } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  PauseOutlined,
} from "@ant-design/icons";
import { useMicrophone } from "../hooks/useMicrophone";
import { useRecorder } from "../hooks/useRecorder";
import { useWebSocket } from "../hooks/useWebSocket";
import { playBase64Audio } from "../utils/audio";
import "./interviewSession.css";

export default function InterviewSession() {
  const { user } = useAuthStore();
  const [question] = useState("");
  const [questionCategory] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [evaluation] = useState(null);
  const [useVoiceMode, setUseVoiceMode] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // State instead of ref for UI updates
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const runningRef = useRef(false);
  const startRecordingRef = useRef(null); // Ref for auto-start function
  const wsRef = useRef(null); // Ref for WebSocket hook

  // Voice Interview Hooks
  const { stream, initMic, stopMic } = useMicrophone();

  // Stop voice recording - defined early to be used in useWebSocket
  const handleStopVoiceRecording = useCallback(() => {
    console.log("🛑 Stopping voice recording...");
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
      console.log("✅ Recorder stopped");
    }
    stopMic();
    setUseVoiceMode(false);
    setIsRecording(false);
    runningRef.current = false;
    streamRef.current = null;
    console.log("✅ Voice mode deactivated");
    message.info("Voice recording stopped");
  }, [stopMic]);

  // Start voice recording - defined early to be used in useWebSocket
  const handleStartVoiceRecording = useCallback(async () => {
    try {
      // Check WebSocket connection using ref
      const ws = wsRef.current;
      if (!ws) {
        console.warn(
          "⚠️ [AUTO START] WebSocket not initialized, skipping auto start"
        );
        return;
      }

      const wsSocket = ws.getSocket();
      if (!wsSocket || wsSocket.readyState !== WebSocket.OPEN) {
        console.warn(
          "⚠️ [AUTO START] WebSocket not connected, skipping auto start"
        );
        return;
      }

      // إذا كان التسجيل شغال بالفعل، لا تفعل شيء
      if (useVoiceMode && isRecording) {
        console.log("ℹ️ [AUTO START] Already recording, skipping");
        return;
      }

      const stream = await initMic();
      streamRef.current = stream;

      if (!ws.isAiSpeaking() && recorderRef.current) {
        recorderRef.current.startRecording(stream);
      }

      setUseVoiceMode(true);
      setIsRecording(true);
      runningRef.current = true;
      console.log("✅ [AUTO START] Voice recording started automatically");
    } catch (error) {
      console.error("❌ [AUTO START] Error starting voice recording:", error);
      // لا نعرض error message في حالة auto start
    }
  }, [initMic, useVoiceMode, isRecording]);

  // WebSocket hook - handles all communication
  const ws = useWebSocket(
    (audio) => {
      // استقبال صوت AI
      console.log("🔊 [AUDIO RECEIVED] Playing AI audio");
      setAiSpeaking(true); // تحديث state فوراً
      if (recorderRef.current) {
        recorderRef.current.pauseRecording();
      }
      // تشغيل الصوت
      playBase64Audio(audio)
        .then(() => {
          console.log("✅ [AUDIO PLAYBACK] Finished");
          // لا نحدث state هنا - سيتم تحديثه من onAiDone
          if (runningRef.current && stream && recorderRef.current) {
            console.log(
              "🔄 [AUTO RESTART] Restarting recording after AI finished"
            );
            // لا نستأنف هنا - سيتم من onAiDone
          }
        })
        .catch((err) => {
          console.error("❌ [AUDIO PLAYBACK ERROR]", err);
          setAiSpeaking(false);
          if (isRecording && stream && recorderRef.current) {
            recorderRef.current.resumeRecording();
          }
        });
    },
    () => {
      // عند انتهاء كلام AI
      console.log("✅ [AI DONE] AI finished speaking");
      setAiSpeaking(false); // تحديث state

      // بدء التسجيل تلقائياً إذا لم يكن شغال
      if (!useVoiceMode && sessionId) {
        console.log(
          "🎙️ [AUTO START] Starting voice mode automatically after AI finished"
        );
        // Use ref to avoid circular dependency
        if (startRecordingRef.current) {
          startRecordingRef.current();
        }
      } else if (isRecording && stream && recorderRef.current) {
        console.log("🔄 [AUTO RESTART] Resuming recording after AI finished");
        recorderRef.current.resumeRecording();
      }
    },
    () => {
      // End ACK - recorder handles this
      if (recorderRef.current) {
        recorderRef.current.onEndAcknowledged();
      }
    },
    () => {
      // Interview ended
      console.log("🏁 [INTERVIEW ENDED] Cleaning up...");
      handleStopVoiceRecording();
    }
  );

  // Recorder hook - sends audio chunks and commit signals
  const recorder = useRecorder(
    (data) => {
      // Send audio chunk or commit signal via WebSocket
      if (wsRef.current) {
        wsRef.current.send(data);
      }
    },
    () => aiSpeaking
  );

  // ✅ مستوى الصوت من recorder
  const voiceSensitivity = recorder.volumeLevel || 0;

  // Save references
  useEffect(() => {
    recorderRef.current = recorder;
    wsRef.current = ws;
  }, [recorder, ws]);

  useEffect(() => {
    // Session is active when WebSocket is connected
    const wsSocket = ws.getSocket();
    const isConnected = wsSocket && wsSocket.readyState === WebSocket.OPEN;
    runningRef.current = useVoiceMode && isConnected;
  }, [useVoiceMode, ws]);

  // Transcription from user (voice mode)
  const [transcript] = useState("");

  // Handle starting interview - WebSocket only
  const handleStartInterview = async () => {
    if (!user?._id) {
      setError("Please login first.");
      message.error("Please login first to start an interview");
      return;
    }

    setIsStarting(true);
    setError(null);
    setSessionId(null);
    localStorage.removeItem("activeInterviewSessionId");

    console.log("🚀 [INTERVIEW] Starting interview...");

    try {
      // Connect WebSocket - connection = session started
      console.log("🔌 [WEBSOCKET] Connecting to start interview...");
      ws.connect();

      // Wait for WebSocket connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(
            new Error("Connection timeout - server may be down or unreachable")
          );
        }, 10000);

        // Check connection status via useWebSocket
        const checkConnection = setInterval(() => {
          const wsSocket = ws.getSocket();
          if (wsSocket && wsSocket.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            clearTimeout(timeout);
            console.log("✅ [WEBSOCKET] Connected - Session started");
            setSessionId("active"); // Session is active when WebSocket is connected
            setIsStarting(false);
            resolve();
          } else if (wsSocket && wsSocket.readyState === WebSocket.CLOSED) {
            clearInterval(checkConnection);
            clearTimeout(timeout);
            reject(new Error("WebSocket connection closed"));
          }
        }, 100);

        // Cleanup on timeout
        setTimeout(() => {
          clearInterval(checkConnection);
        }, 10000);
      });
    } catch (err) {
      const errorMsg = err.message || "Failed to start interview session";
      setError(errorMsg);
      message.error(errorMsg);
      setSessionId(null);
      localStorage.removeItem("activeInterviewSessionId");
      setIsStarting(false);
      ws.close();
    }
  };

  // Cleanup on unmount - empty deps to avoid closing on every render
  useEffect(() => {
    return () => {
      console.log("🧹 [CLEANUP] Cleaning up interview session...");

      // Stop voice recording first
      handleStopVoiceRecording();

      // Close WebSocket connection
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on unmount

  const userName = user?.name || user?.email?.split("@")[0] || "User";

  // Use both state and hook to ensure UI updates
  const isAISpeaking = aiSpeaking || ws.isAiSpeaking();

  // Calculate isUserSpeaking - use useMemo to avoid ref access during render
  const isUserSpeaking = useMemo(() => {
    if (!useVoiceMode) return false;
    const wsSocket = ws.getSocket();
    const isConnected = wsSocket && wsSocket.readyState === WebSocket.OPEN;
    const aiIsSpeaking = aiSpeaking || ws.isAiSpeaking();
    // User is speaking when voice mode is on, connected, AI is not speaking, and recording is active
    return isConnected && !aiIsSpeaking && isRecording;
  }, [useVoiceMode, aiSpeaking, isRecording, ws]);

  // Manual start voice recording (with user interaction)
  const handleStartVoiceRecordingManual = useCallback(async () => {
    try {
      // Check WebSocket connection
      const wsSocket = ws.getSocket();
      if (!wsSocket || wsSocket.readyState !== WebSocket.OPEN) {
        setError("Not connected to server");
        message.error("Not connected to server. Please start interview first.");
        return;
      }

      await handleStartVoiceRecording();
      message.success("Voice recording started");
    } catch (error) {
      console.error("❌ Error starting voice recording:", error);
      setError(error.message || "Failed to start voice recording");
      message.error(error.message || "Failed to start voice recording");
    }
  }, [handleStartVoiceRecording, ws]);

  // End interview
  const handleEndInterview = useCallback(() => {
    // Stop voice recording if active
    if (useVoiceMode && recorderRef.current) {
      recorderRef.current.stopRecording();
      stopMic();
      setUseVoiceMode(false);
      runningRef.current = false;
      streamRef.current = null;
    }

    // Close WebSocket connection
    ws.close();

    setSessionId(null);
    localStorage.removeItem("activeInterviewSessionId");
    message.info("Interview ended");
  }, [useVoiceMode, stopMic, ws]);

  return (
    <div className="interview-container">
      <Navbar />

      {/* Error Banner */}
      {error && (
        <div className="interview-error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Start Screen */}
      {!sessionId && !isStarting && (
        <div className="interview-start-screen">
          <div className="start-screen-card">
            <span className="start-screen-icon">🎙️</span>
            <h1 className="start-screen-title">AI Interview</h1>
            <p className="start-screen-subtitle">
              Practice your interview skills with our AI interviewer. Get
              real-time feedback and improve your responses.
            </p>
            <button
              className="start-interview-btn"
              onClick={handleStartInterview}
              disabled={isStarting || !user?._id}
            >
              {isStarting ? (
                <>
                  <span className="loading-spinner" />
                  Starting...
                </>
              ) : (
                <>
                  <VideoCameraIcon />
                  Start Interview
                </>
              )}
            </button>
            {!user?._id && (
              <p
                style={{
                  marginTop: "16px",
                  color: "#f87171",
                  fontSize: "14px",
                }}
              >
                Please login first to start an interview
              </p>
            )}
          </div>
        </div>
      )}

      {/* Interview Room */}
      {(sessionId || isStarting) && (
        <div className="interview-meeting-room">
          {/* Header */}
          <div className="meeting-header">
            <div className="meeting-title">
              <h2>Live Interview</h2>
              <div className="connection-badge">
                <span
                  className="connection-dot"
                  style={{
                    backgroundColor:
                      ws.getSocket()?.readyState === WebSocket.OPEN
                        ? "#10b981"
                        : "#f59e0b",
                  }}
                />
                {ws.getSocket()?.readyState === WebSocket.OPEN
                  ? "Connected"
                  : isStarting
                  ? "Connecting..."
                  : "Disconnected"}
              </div>
            </div>
            <div className="meeting-controls">
              {question && (
                <button
                  className="toggle-question-btn"
                  onClick={() => setShowQuestion(!showQuestion)}
                >
                  {showQuestion ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  {showQuestion ? "Hide Question" : "Show Question"}
                </button>
              )}
              {sessionId && (
                <button
                  onClick={handleEndInterview}
                  style={{
                    padding: "6px 12px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  End Interview
                </button>
              )}
            </div>
          </div>

          {/* Participants Grid */}
          <div className="participants-grid">
            {/* AI Participant */}
            <div
              className={`participant-card ai-participant-card ${
                isAISpeaking ? "speaking" : ""
              }`}
            >
              <AudioVisualization
                isPlaying={isAISpeaking}
                barCount={12}
                height="280px"
              />

              {/* Question Panel */}
              {question && showQuestion && (
                <div className="question-panel">
                  <div className="question-header">
                    <span className="question-label">Question</span>
                    {questionCategory && (
                      <span className="category-badge">{questionCategory}</span>
                    )}
                  </div>
                  <p className="question-text">{question}</p>

                  {/* Evaluation */}
                  {evaluation && (
                    <div className="evaluation-panel">
                      <div className="evaluation-score">
                        <span className="score-label">Score:</span>
                        <span
                          className={`score-badge ${
                            evaluation.score >= 7
                              ? "high"
                              : evaluation.score >= 5
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {evaluation.score}/10
                        </span>
                      </div>
                      {evaluation.feedback && (
                        <p className="evaluation-feedback">
                          {evaluation.feedback}
                        </p>
                      )}
                      {evaluation.followUp && (
                        <p className="evaluation-followup">
                          Follow-up: {evaluation.followUp}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!question && (
                <p className="waiting-message">
                  {isStarting
                    ? "Starting interview..."
                    : "Waiting for first question..."}
                </p>
              )}
            </div>

            {/* User Participant */}
            <div
              className={`participant-card user-participant-card ${
                isUserSpeaking ? "speaking" : ""
              }`}
            >
              <UserAvatar
                name={userName}
                isSpeaking={isUserSpeaking}
                size="large"
              />

              {/* Microphone Controls */}
              <div className="mic-button-container">
                {useVoiceMode ? (
                  <>
                    <button
                      className={`mic-button recording`}
                      onClick={handleStopVoiceRecording}
                    >
                      <span className="mic-button-icon">
                        <PauseOutlined style={{ fontSize: "28px" }} />
                      </span>
                    </button>
                    <span className="recording-status">
                      {aiSpeaking ? "AI Speaking..." : "Voice Recording..."}
                    </span>

                    {/* Voice Sensitivity Meter */}
                    <div
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        maxWidth: "200px",
                        margin: "12px auto 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: "500",
                          }}
                        >
                          Voice Sensitivity:
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#10b981",
                            fontWeight: "600",
                            minWidth: "40px",
                          }}
                        >
                          {Math.round(voiceSensitivity)}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          backgroundColor: "#e5e7eb",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${voiceSensitivity}%`,
                            height: "100%",
                            backgroundColor:
                              voiceSensitivity > 50
                                ? "#10b981"
                                : voiceSensitivity > 20
                                ? "#f59e0b"
                                : "#ef4444",
                            transition:
                              "width 0.1s ease-out, background-color 0.2s",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  sessionId && (
                    <button
                      onClick={handleStartVoiceRecordingManual}
                      style={{
                        marginTop: "12px",
                        padding: "8px 16px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      🎙️ Start Voice Mode
                    </button>
                  )
                )}
              </div>

              {/* User Response */}
              {transcript && (
                <div className="response-panel">
                  <span className="response-label">Your Response</span>
                  <p className="response-text">{transcript}</p>
                </div>
              )}

              {/* Status */}
              {!transcript && (
                <div
                  className={`status-pill ${isAISpeaking ? "ai-speaking" : ""}`}
                >
                  {isUserSpeaking
                    ? "Speaking..."
                    : isAISpeaking
                    ? "AI is speaking..."
                    : "Ready to answer"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Camera Icon Component
function VideoCameraIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
