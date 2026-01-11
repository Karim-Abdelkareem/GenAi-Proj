// Command detection for user input

const END_COMMANDS = [
  "انهي الانترفيو",
  "وقف المقابلة",
  "كفاية كده",
  "خلصنا",
  "انهاء",
  "انهي",
  "كفاية",
  "خلص",
];

const REPEAT_COMMANDS = [
  "عيد السؤال",
  "ممكن تعيد",
  "ما سمعتش",
  "قول تاني",
  "كرر السؤال",
  "اعيد",
  "تاني",
  "ما فهمتش",
];

export function isEndInterview(text) {
  if (!text) return false;
  const normalizedText = text.toLowerCase().trim();
  return END_COMMANDS.some((cmd) => normalizedText.includes(cmd));
}

export function isRepeatQuestion(text) {
  if (!text) return false;
  const normalizedText = text.toLowerCase().trim();
  return REPEAT_COMMANDS.some((cmd) => normalizedText.includes(cmd));
}
