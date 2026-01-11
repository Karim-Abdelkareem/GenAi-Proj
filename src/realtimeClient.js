import WebSocket from "ws";
import { buildSystemPrompt } from "./prompt.js";

export function connectRealtime(session, clientSocket) {
  const ws = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-realtime",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    }
  );

  ws.isReady = false;
  ws.messageQueue = [];

  ws.on("open", () => {
    ws.isReady = true;

    // ✅ Set system prompt once
    ws.send(
      JSON.stringify({
        type: "session.update",
        session: {
          instructions: buildSystemPrompt(session),
          modalities: ["audio", "text"],
          voice: "alloy",
          output_audio_format: "pcm16",
          turn_detection: null, // Client-side VAD
        },
      })
    );

    // ✅ Generate greeting dynamically
    const role = session.role || "الوظيفة";
    const level = session.level || "المستوى";
    const stack = session.stack?.join(" و") || "التقنيات";

    const greetingInstruction = `ابدأ المقابلة بطريقة احترافية ومهنية باللهجة المصرية. 
    
    رحّب بالمرشح بشكل مختصر ومهذب (استخدم تحيات متنوعة مثل: 'مساء الخير' أو 'أهلاً وسهلاً' أو 'صباح الخير' حسب الوقت - لا تستخدم نفس التحية في كل مرة).
            
    لا تستخدم عبارات مبتذلة أو مبالغ فيها مثل 'أهلاً بيك' أو 'يالله' أو 'يلا'. كن مباشراً ومهذباً ومهني.
    
    مهم جداً: اجعل رسالة التحية طبيعية ومتنوعة - لا تستخدم نفس الصيغة أو نفس الكلمات في كل مرة. تنوّع في طريقة التحية والترحيب.`;

    ws.send(
      JSON.stringify({
        type: "response.create",
        response: {
          instructions: greetingInstruction,
          modalities: ["audio", "text"],
        },
      })
    );

    // ✅ Flush queued messages
    ws.messageQueue.forEach((msg) => ws.send(msg));
    ws.messageQueue = [];
  });

  ws.safeSend = (msg) => {
    const data = JSON.stringify(msg);

    if (ws.isReady) {
      ws.send(data);
    } else {
      ws.messageQueue.push(data);
    }
  };

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    // ✅ استقبال transcript من المستخدم لاكتشاف أمر الإنهاء
    if (data.type === "conversation.item.input_audio_transcript.delta") {
      if (!session.userTranscript) {
        session.userTranscript = "";
      }
      session.userTranscript += data.delta || "";
    }

    if (data.type === "conversation.item.input_audio_transcript.completed") {
      const transcript = data.transcript || session.userTranscript || "";
      console.log("📝 [USER TRANSCRIPT]", transcript);

      // ✅ اكتشاف أمر إنهاء المقابلة من كلام المستخدم
      const endKeywords = [
        "وقف",
        "كفاية",
        "كفايه",
        "خلص",
        "انتهى",
        "انتهي",
        "اقفل",
        "stop",
        "end",
      ];

      const normalizedTranscript = transcript.toLowerCase().trim();
      const hasEndCommand = endKeywords.some((keyword) =>
        normalizedTranscript.includes(keyword)
      );

      if (hasEndCommand) {
        console.log(
          "🛑 [END COMMAND DETECTED] User said stop/end, will close after response"
        );
        session.shouldCloseAfterResponse = true; // ✅ تعيين flag للإغلاق
      }

      // Reset transcript
      session.userTranscript = "";
    }

    // 4️⃣ Audio from GPT → Forward to frontend
    if (data.type === "response.audio.delta") {
      if (clientSocket.readyState === 1) {
        try {
          clientSocket.send(
            JSON.stringify({
              type: "audio",
              audio: data.delta,
            })
          );
        } catch (error) {
          console.error("Error sending audio:", error);
        }
      }
    }

    // 5️⃣ Response completed → Send ai_done
    if (data.type === "response.audio.done") {
      if (clientSocket.readyState === 1) {
        clientSocket.send(
          JSON.stringify({
            type: "ai_done",
          })
        );
      }

      // ✅ If this is farewell message, send interview_ended
      if (session.shouldCloseAfterResponse) {
        console.log("🏁 [INTERVIEW ENDED] Sending interview_ended signal");
        if (clientSocket.readyState === 1) {
          clientSocket.send(
            JSON.stringify({
              type: "interview_ended",
            })
          );
        }
      }
    }

    // ✅ Close connections after farewell message
    if (data.type === "response.done") {
      if (session.shouldCloseAfterResponse) {
        console.log("🔌 [CLOSING CONNECTION] Interview ended");
        session.shouldCloseAfterResponse = false;

        // Close GPT socket
        if (ws.readyState === 1) {
          ws.close();
        }

        // Close client socket after delay
        setTimeout(() => {
          if (clientSocket.readyState === 1) {
            clientSocket.close();
          }
        }, 1000); // ✅ زيادة delay لضمان إرسال interview_ended
      }
    }
  });

  return ws;
}
