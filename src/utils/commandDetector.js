/**
 * Command detection utility for user transcripts
 */

const END_KEYWORDS = [
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

/**
 * Detect if transcript contains end command
 * @param {string} transcript - User transcript
 * @returns {boolean} - True if end command detected
 */
export function detectEndCommand(transcript) {
  if (!transcript) return false;

  const normalizedTranscript = transcript.toLowerCase().trim();
  return END_KEYWORDS.some((keyword) =>
    normalizedTranscript.includes(keyword)
  );
}

/**
 * Detect if transcript contains repeat command
 * @param {string} transcript - User transcript
 * @returns {boolean} - True if repeat command detected
 */
export function detectRepeatCommand(transcript) {
  if (!transcript) return false;

  const REPEAT_KEYWORDS = [
    "عيد",
    "كرر",
    "تاني",
    "ما سمعتش",
    "ما فهمتش",
    "repeat",
  ];

  const normalizedTranscript = transcript.toLowerCase().trim();
  return REPEAT_KEYWORDS.some((keyword) =>
    normalizedTranscript.includes(keyword)
  );
}

