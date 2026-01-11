import { useState } from "react";

export function useMicrophone() {
  const [stream, setStream] = useState(null);

  const initMic = async () => {
    // ✅ DSP Settings - محسّنة للجودة
    const constraints = {
      audio: {
        noiseSuppression: true, // ✅ تقليل الضوضاء
        echoCancellation: true, // ✅ إزالة الصدى
        autoGainControl: true, // ✅ مفعّل - AGC + dynamic threshold = ممتاز (AGC تخلي صوتك ثابت والـ threshold بيتحرك معاه)
        sampleRate: 48000, // ✅ أفضل جودة
        channelCount: 1, // ✅ Mono (أفضل للكلام)
      },
    };

    console.log(
      "🎙️ [MIC INIT] Requesting microphone with constraints:",
      constraints
    );

    const s = await navigator.mediaDevices.getUserMedia(constraints);

    // 🔥 Log إعدادات الميكروفون الفعلية
    const audioTracks = s.getAudioTracks();
    if (audioTracks.length > 0) {
      const settings = audioTracks[0].getSettings();
      const settingsData = {
        deviceId: settings.deviceId,
        sampleRate: settings.sampleRate,
        channelCount: settings.channelCount,
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: settings.autoGainControl,
      };
      console.log("🎙️ [MIC SETTINGS]", settingsData);
    }

    setStream(s);
    return s;
  };

  const stopMic = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      console.log("🛑 [MIC] Microphone stopped");
    }
  };

  return { stream, initMic, stopMic };
}
