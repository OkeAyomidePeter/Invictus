export const WORKOUT_MOTIVATORS = [
  "You don't stop when tired. You stop when done.",
  "The rep you don't want is the one that counts.",
  "Discipline is remembering what you want.",
  "One more. Always one more.",
  "Build the body that carries the mind.",
];

export const COGNITIVE_MOTIVATORS = [
  "A closed loop. Resistant to manipulation.",
  "Gating is not weakness. It's engineering.",
  "Observe first. Conclude later.",
  "Standards over moods.",
  "You are stabilizing an overclocked mind.",
];

export function getTodayMotivator(list: string[]): string {
  const todayIndex = Math.floor(Date.now() / 86400000) % list.length;
  return list[todayIndex];
}
