export function createSession(sessionId) {
  return {
    sessionId,
    level: "junior", // 👈 من الـ UI لاحقًا
    role: "fullstack",
    stack: [
      "React",
      "Node.js",
      "MongoDB",
      "JavaScript",
      "Express Js",
      "HTML",
      "CSS",
    ],
    askedQuestions: 0,
    scores: {
      clarity: 0,
      accuracy: 0,
      depth: 0,
    },
    state: "active",
    mode: "interview", // "interview" or "feedback"
    lastQuestion: null, // Store last question for repeat
  };
}
