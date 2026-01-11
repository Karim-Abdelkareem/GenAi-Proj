import WebSocket from "ws";

/**
 * Generate TTS audio for a given text using OpenAI Realtime API
 * @param {string} text - Text to convert to speech
 * @returns {Promise<string[]>} Array of base64 PCM audio chunks
 */
export async function generateTTS(text) {
  return new Promise((resolve, reject) => {
    const audioChunks = [];
    let isDone = false;

    const ws = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-realtime",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    const timeout = setTimeout(() => {
      if (!isDone) {
        ws.close();
        reject(new Error("TTS timeout"));
      }
    }, 10000); // 10 second timeout

    ws.on("open", () => {
      // Configure session for TTS only
      ws.send(
        JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["audio", "text"],
            voice: "alloy",
            output_audio_format: "pcm16",
            turn_detection: null,
          },
        })
      );

      // Create response with the text (say exactly as provided)
      ws.send(
        JSON.stringify({
          type: "response.create",
          response: {
            instructions: `Say exactly the following text in Egyptian Arabic: "${text}"`,
            modalities: ["audio", "text"],
          },
        })
      );
    });

    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());

      if (data.type === "response.audio.delta") {
        audioChunks.push(data.delta);
      }

      if (data.type === "response.audio.done") {
        isDone = true;
        clearTimeout(timeout);
        ws.close();
        resolve(audioChunks);
      }

      if (data.type === "error") {
        clearTimeout(timeout);
        ws.close();
        reject(new Error(data.error?.message || "TTS error"));
      }
    });

    ws.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
