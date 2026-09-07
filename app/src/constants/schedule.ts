export const CYCLE_ORDER = ["day1", "day2", "day3", "day4"];
export const REST_PATTERN = [false, true, false, false, true, false, true];

export interface TrainingDayMeta {
  id: string;
  name: string;
  focus: string;
  day_number: number;
}

export const TRAINING_DAYS: TrainingDayMeta[] = [
  { id: "day1", name: "Glutes & Hips", focus: "Main glute day", day_number: 1 },
  {
    id: "day2",
    name: "Upper Body + Core",
    focus: "Tone upper body, build core",
    day_number: 2,
  },
  {
    id: "day3",
    name: "Glutes + Legs",
    focus: "Volume day — build & shape",
    day_number: 3,
  },
  {
    id: "day4",
    name: "Full Body + Flexibility",
    focus: "Circuit + full stretch",
    day_number: 4,
  },
  {
    id: "combat_a",
    name: "Boxing Mechanics",
    focus: "Stance · Jab · Cross · Combos",
    day_number: 5,
  },
  {
    id: "combat_b",
    name: "Footwork + Defense",
    focus: "Movement · Slips · Defensive flow",
    day_number: 6,
  },
  {
    id: "combat_c",
    name: "Conditioning + Flow",
    focus: "Combat circuit · Full combos · Muay Thai",
    day_number: 7,
  },
  {
    id: "combat_d",
    name: "Mobility + Shadowboxing",
    focus: "Flow · Muay Thai · Movement",
    day_number: 8,
  },
];

export function getNextTrainingDay(lastDayId: string | null): string {
  if (!lastDayId) return "day1";
  const idx = CYCLE_ORDER.indexOf(lastDayId);
  return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
}

export function getTrainingDayMeta(id: string): TrainingDayMeta | undefined {
  return TRAINING_DAYS.find((d) => d.id === id);
}

// ─── Combat Schedule ─────────────────────────────────────────────────────────

export const BODY_DAYS_OF_WEEK = [1, 3, 5, 6]; // Mon, Wed, Fri, Sat
export const COMBAT_DAYS_OF_WEEK = [0, 2, 4]; // Sun, Tue, Thu

export const BODY_CYCLE = ["day1", "day2", "day3", "day4"];
export const COMBAT_CYCLE = ["combat_a", "combat_b", "combat_c", "combat_d"];

export function getNextBodyDay(lastDayId: string | null): string {
  if (!lastDayId) return "day1";
  const idx = BODY_CYCLE.indexOf(lastDayId);
  return BODY_CYCLE[(idx + 1) % BODY_CYCLE.length];
}

export function getNextCombatDay(lastDayId: string | null): string {
  if (!lastDayId) return "combat_a";
  const idx = COMBAT_CYCLE.indexOf(lastDayId);
  return COMBAT_CYCLE[(idx + 1) % COMBAT_CYCLE.length];
}

export function getTodaySessionType(): "body" | "combat" {
  const dow = new Date().getDay();
  return BODY_DAYS_OF_WEEK.includes(dow) ? "body" : "combat";
}
