// ⚠️ لازم يكون خارج أي Component
// 🔥 GPT-Realtime يرسل PCM16 بـ sample rate 24,000 Hz
// لازم AudioContext يكون بنفس الـ sample rate عشان الصوت يطلع بالسرعة الصحيحة
const audioContext = new AudioContext({
  sampleRate: 24000, // نفس GPT-Realtime
});

// 🔥 Audio Scheduling: متغير لتتبع متى يجب تشغيل الـ chunk التالي
let nextPlayTime = 0;

// ✅ الحصول على الوقت المتبقي حتى ينتهي الصوت
export function getRemainingAudioTime() {
  if (nextPlayTime === 0) return 0;
  const now = audioContext.currentTime;
  const remaining = nextPlayTime - now;
  return remaining > 0 ? remaining * 1000 : 0; // تحويل إلى milliseconds
}

export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function playBase64Audio(base64) {
  // 🔥 ده المهم في Vite / Chrome
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  // البيانات دائماً PCM خام من GPT-Realtime
  // لا نحتاج decodeAudioData
  playPCMAudio(base64);
}

function playPCMAudio(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // PCM 16-bit little-endian: كل sample = 2 bytes
  const numSamples = bytes.length / 2;

  // معدل العينة: 24000 Hz (نفس GPT-Realtime)
  const sampleRate = 24000;

  const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  // قراءة PCM 16-bit little-endian
  for (let i = 0; i < numSamples; i++) {
    const byteIndex = i * 2;
    // Little-endian: البايت الأول هو الأقل أهمية
    const low = bytes[byteIndex];
    const high = bytes[byteIndex + 1];

    // دمج البايتين في sample واحد (16-bit signed integer)
    let sample = (high << 8) | low;

    // تحويل إلى signed integer (two's complement)
    if (sample >= 0x8000) {
      sample -= 0x10000;
    }

    // تحويل إلى float بين -1.0 و 1.0
    channelData[i] = sample / 32768.0;
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.playbackRate.value = 1.0;

  // 🔥 Audio Scheduling: تحديد متى يجب تشغيل هذا الـ chunk
  const now = audioContext.currentTime;
  if (nextPlayTime < now) {
    nextPlayTime = now;
  }

  source.start(nextPlayTime);

  // تحديث nextPlayTime ليكون بعد انتهاء هذا الـ chunk
  const duration = audioBuffer.duration;
  nextPlayTime += duration;
}
