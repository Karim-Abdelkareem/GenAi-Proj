// ✅ AudioWorklet Processor - Simplified for continuous audio streaming
// فقط: resampling + PCM conversion + chunking

class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputSampleRate = 48000; // سيتم تحديثه من main thread
    this.targetSampleRate = 24000;
    this.buffer = []; // ✅ Buffer لتجميع frames
    this.TARGET_SAMPLES = 960; // ✅ 40ms @ 24kHz
    this.MAX_BUFFER_SIZE = 9600; // ✅ حد أقصى: 10 chunks (400ms) لمنع memory leak

    // ✅ استقبال الرسائل من main thread
    this.port.onmessage = (e) => {
      if (e.data.type === "init") {
        this.inputSampleRate = e.data.inputSampleRate || 48000;
      } else if (e.data.type === "reset") {
        this.buffer = []; // إعادة تعيين buffer
      }
    };
  }

  // ✅ Resample من inputRate إلى outputRate
  downsampleBuffer(buffer, inputRate, outputRate) {
    if (outputRate === inputRate) return buffer;

    const ratio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);

    let offset = 0;
    for (let i = 0; i < newLength; i++) {
      const nextOffset = Math.round((i + 1) * ratio);
      let sum = 0;
      let count = 0;
      for (let j = offset; j < nextOffset && j < buffer.length; j++) {
        sum += buffer[j];
        count++;
      }
      result[i] = count > 0 ? sum / count : 0;
      offset = nextOffset;
    }
    return result;
  }

  // ✅ تحويل Float32Array إلى PCM16
  float32ToPCM16(float32Array) {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s * 32767;
    }
    return pcm16;
  }

  // ✅ تحويل ArrayBuffer إلى base64 (بدون btoa - غير متاح في AudioWorklet)
  // ✅ استخدام base64 encoding يدوي
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const base64Chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i = 0;

    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      result += base64Chars.charAt((bitmap >> 18) & 63);
      result += base64Chars.charAt((bitmap >> 12) & 63);
      result +=
        i - 2 < bytes.length ? base64Chars.charAt((bitmap >> 6) & 63) : "=";
      result += i - 1 < bytes.length ? base64Chars.charAt(bitmap & 63) : "=";
    }
    return result;
  }

  // eslint-disable-next-line no-unused-vars
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const inputChannel = input[0];
    if (!inputChannel || inputChannel.length === 0) return true;

    // ✅ Resample من inputRate إلى 24kHz
    const downsampled =
      this.inputSampleRate !== this.targetSampleRate
        ? this.downsampleBuffer(
            inputChannel,
            this.inputSampleRate,
            this.targetSampleRate
          )
        : inputChannel;

    // ✅ إضافة كل الـ samples إلى buffer (بدون RMS check على frame صغير)
    for (let i = 0; i < downsampled.length; i++) {
      this.buffer.push(downsampled[i]);
    }

    // ✅ منع buffer من النمو المفرط (memory leak protection)
    if (this.buffer.length > this.MAX_BUFFER_SIZE) {
      // ✅ إفراغ buffer إذا تجاوز الحد الأقصى
      this.buffer = [];
      return true;
    }

    // ✅ إرسال كل chunk مباشرة (بدون RMS filtering)
    while (this.buffer.length >= this.TARGET_SAMPLES) {
      // ✅ استخراج chunk من buffer
      const chunk = this.buffer.slice(0, this.TARGET_SAMPLES);
      this.buffer = this.buffer.slice(this.TARGET_SAMPLES);

      // ✅ حساب RMS (Root Mean Square) لمستوى الصوت
      let sumSquares = 0;
      for (let i = 0; i < chunk.length; i++) {
        sumSquares += chunk[i] * chunk[i];
      }
      const rms = Math.sqrt(sumSquares / chunk.length);
      // ✅ تحويل RMS إلى نسبة مئوية (0-100)
      const volumeLevel = Math.min(100, Math.max(0, rms * 100));

      // ✅ تحويل إلى PCM16
      const pcm16 = this.float32ToPCM16(chunk);

      // ✅ تحويل إلى base64
      const base64Audio = this.arrayBufferToBase64(pcm16.buffer);

      // ✅ إرسال للـ main thread (chunk كامل 960 samples = 40ms)
      // ✅ الموديل يقرر هو الكلام ولا لا
      this.port.postMessage({
        type: "audio",
        audio: base64Audio,
        samples: chunk.length, // ✅ دائماً 960
        volumeLevel: volumeLevel, // ✅ مستوى الصوت (0-100)
      });
    }

    return true;
  }

  static get parameterDescriptors() {
    return [];
  }
}

registerProcessor("recorder-processor", RecorderProcessor);
