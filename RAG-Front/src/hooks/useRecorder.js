import { useRef, useState } from "react";

export function useRecorder(send, isAiSpeaking) {
  const [volumeLevel, setVolumeLevel] = useState(0); // مستوى الصوت للـ UI

  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  const inputSampleRateRef = useRef(48000);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);

  const silenceTimerRef = useRef(null);
  const workletLoadedRef = useRef(false);
  const pendingEndRef = useRef(false);

  // Helper to trigger commit
  const triggerCommit = () => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRecorder.js:20',message:'triggerCommit called',data:{isAiSpeaking:isAiSpeaking(),pendingEnd:pendingEndRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
    // #endregion

    if (isAiSpeaking()) {
      console.log("🔇 [SILENCE] Ignored - AI is speaking");
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRecorder.js:23',message:'Commit ignored - AI speaking',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      return;
    }

    if (!pendingEndRef.current) {
      console.log("🔇 [SILENCE] Sending commit");
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRecorder.js:30',message:'Sending commit message',data:{pendingEndBefore:pendingEndRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
      // #endregion

      try {
        send({ type: "commit" });
        pendingEndRef.current = true;
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRecorder.js:33',message:'Commit sent successfully',data:{pendingEndAfter:pendingEndRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
      } catch (err) {
        console.error("[COMMIT ERROR]", err);
        pendingEndRef.current = false;
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRecorder.js:37',message:'Commit send error',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
      }
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/0e93a866-7620-4197-bd9c-1b8eafc3e2d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRecorder.js:40',message:'Commit skipped - pendingEnd is true',data:{pendingEnd:pendingEndRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
    }
  };


  const startRecording = async (stream) => {
    streamRef.current = stream;

    // Get real input sample rate
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const settings = audioTracks[0].getSettings();
      inputSampleRateRef.current = settings.sampleRate || 48000;
      console.log("🎙️ [SAMPLE RATE]", inputSampleRateRef.current, "Hz");
    }

    if (isRecordingRef.current) return;
    isPausedRef.current = false;

    // Create AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({
        sampleRate: inputSampleRateRef.current,
      });
      console.log(
        "🎙️ [AUDIO CONTEXT]",
        audioContextRef.current.sampleRate,
        "Hz"
      );
    }

    // Load worklet
    if (!workletLoadedRef.current) {
      await audioContextRef.current.audioWorklet.addModule(
        "/worklets/recorder-processor.js"
      );
      workletLoadedRef.current = true;
      console.log("✅ [WORKLET LOADED]");
    }

    // MediaStream source
    if (!sourceRef.current) {
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
    }

    // AudioWorklet node
    if (!processorRef.current) {
      processorRef.current = new AudioWorkletNode(
        audioContextRef.current,
        "recorder-processor"
      );

      processorRef.current.port.postMessage({
        type: "init",
        inputSampleRate: inputSampleRateRef.current,
      });

      processorRef.current.port.postMessage({ type: "reset" });

      processorRef.current.port.onmessage = (e) => {
        const msg = e.data;

        if (isPausedRef.current || isAiSpeaking()) return;

        if (msg.type === "audio") {
          // Send audio chunk constantly (or maybe gate this too? No, let's stream all for now so AI hears background or start of breath)
          // actually, usually we stream everything but only commit on silence.
          
          const isSpeaking = msg.volumeLevel > 2; // Threshold for speech (approx 2%)

          if (isSpeaking) {
             // User is speaking, send audio and reset silence timer
             if (msg.volumeLevel !== undefined) {
               setVolumeLevel(msg.volumeLevel);
             }

             // Send audio chunk
             send({
               type: "audio",
               audio: msg.audio,
             });

            // Log every 50 chunks to verify flow without spamming
            if (Math.random() < 0.05) {
               console.log("🎤 [RECORDER] Sending audio chunk...");
            }

             // Reset silence timer because user is speaking
             if (silenceTimerRef.current) {
               clearTimeout(silenceTimerRef.current);
             }
             
             // Prepare the silence timer (will trigger if no more speaking frames come)
             silenceTimerRef.current = setTimeout(() => {
                triggerCommit();
             }, 1000); // 1.0 second of silence -> Commit
             
          } else {
             // Silence / Noise
             // We can still send the audio if we want OpenAI to hear the silence/noise, 
             // but if we are in "speaking" mode we generally send it.
             // However, if we are "silent", we just let the timer tick.
             // But wait, if we DON'T send audio during silence, the user might sound cut off.
             // BUT if we send audio, we are fine.
             
             // The important part is: DO NOT CLEAR THE TIMER.
             
             // OPTIONAL: Send silence audio too? 
             // If we send silence, OpenAI receives "background noise".
             // If we rely on OUR timer to commit, that's fine.
             
             send({
               type: "audio",
               audio: msg.audio,
             });
             
             // Note: We do NOT clear silenceTimerRef here. 
             // If it was already set by a previous "speaking" frame, it will eventually expire.
             // If it wasn't set (user never spoke), it remains null.
          }
        }
      };
    }


    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);

    isRecordingRef.current = true;
    console.log("▶️ [RECORDING STARTED]");
  };

  const pauseRecording = () => {
    if (isPausedRef.current) return;

    isPausedRef.current = true;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    pendingEndRef.current = false;
    setVolumeLevel(0);

    console.log("⏸️ [RECORDING PAUSED]");
  };

  const resumeRecording = () => {
    if (!streamRef.current) return;

    isPausedRef.current = false;
    pendingEndRef.current = false;

    processorRef.current?.port.postMessage({ type: "reset" });

    console.log("▶️ [RECORDING RESUMED]");
  };

  const onEndAcknowledged = () => {
    pendingEndRef.current = false;
  };

  const stopRecording = () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();

    processorRef.current = null;
    sourceRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;
    workletLoadedRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    isRecordingRef.current = false;
    streamRef.current = null;
    setVolumeLevel(0);

    console.log("⏹️ [RECORDING STOPPED]");
  };

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    onEndAcknowledged,
    volumeLevel,
  };
}
