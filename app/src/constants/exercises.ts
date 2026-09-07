export type ExerciseType =
  | 'reps'
  | 'timed'
  | 'reps_each_side'
  | 'timed_each_side'
  | 'circuit_timed'
  | 'boxing_round';

export interface ExerciseMeta {
  id: string;
  name: string;
  muscle_group: string;
  category: 'warmup' | 'main' | 'cooldown' | 'abs' | 'circuit';
  type: ExerciseType;
  is_timed: number;
  each_side: number;
  hold_seconds: number;
  default_sets: number;
  default_reps: number;
  default_rest_seconds: number;
  notes: string;
}

export const EXERCISES: ExerciseMeta[] = [
  // ─── Main Work ────────────────────────────────────────────────────────────
  { id: 'glute_bridge', name: 'Glute Bridge', muscle_group: 'Glutes', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 20, default_rest_seconds: 60, notes: 'Squeeze hard at top, pause 1 sec' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', muscle_group: 'Glutes/Quads', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 4, default_reps: 12, default_rest_seconds: 90, notes: 'Rear foot on chair' },
  { id: 'donkey_kick', name: 'Donkey Kick', muscle_group: 'Glutes', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 20, default_rest_seconds: 45, notes: 'Controlled, full extension' },
  { id: 'fire_hydrant', name: 'Fire Hydrant', muscle_group: 'Glutes/Hips', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 20, default_rest_seconds: 45, notes: 'Keep core tight' },
  { id: 'sumo_squat', name: 'Sumo Squat', muscle_group: 'Glutes/Inner Thigh', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 15, default_rest_seconds: 60, notes: 'Wide stance, toes out — hits inner thighs' },
  { id: 'hip_thrust', name: 'Hip Thrust', muscle_group: 'Glutes', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 20, default_rest_seconds: 60, notes: 'Shoulders on sofa or bed edge' },
  { id: 'pushup', name: 'Push-up', muscle_group: 'Chest/Shoulders', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 12, default_rest_seconds: 60, notes: 'Toned not bulky — controlled tempo' },
  { id: 'pike_pushup', name: 'Pike Push-up', muscle_group: 'Shoulders', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 60, notes: 'Hips high, elbows tracking out' },
  { id: 'diamond_pushup', name: 'Diamond Push-up', muscle_group: 'Triceps', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 60, notes: 'Hands form diamond under chest' },
  { id: 'table_row', name: 'Table/Desk Row', muscle_group: 'Back', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 12, default_rest_seconds: 60, notes: 'Back width creates waist illusion' },
  { id: 'plank', name: 'Plank', muscle_group: 'Core', category: 'main', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 45, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: 'Full body tight, do not let hips sag' },
  { id: 'hollow_body_hold', name: 'Hollow Body Hold', muscle_group: 'Core', category: 'main', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 30, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: 'Lower back pressed into floor' },
  { id: 'dead_bug', name: 'Dead Bug', muscle_group: 'Core', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 45, notes: 'Deep core — slow and controlled' },
  { id: 'side_plank', name: 'Side Plank', muscle_group: 'Obliques', category: 'main', type: 'timed_each_side', is_timed: 1, each_side: 1, hold_seconds: 30, default_sets: 3, default_reps: 0, default_rest_seconds: 45, notes: 'Obliques = waist taper' },
  { id: 'jump_squat', name: 'Jump Squat', muscle_group: 'Glutes/Quads', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 15, default_rest_seconds: 60, notes: 'Explosive — builds glute power. Land soft.' },
  { id: 'reverse_lunge', name: 'Reverse Lunge', muscle_group: 'Legs/Glutes', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 4, default_reps: 12, default_rest_seconds: 60, notes: '' },
  { id: 'single_leg_glute_bridge', name: 'Single-Leg Glute Bridge', muscle_group: 'Glutes', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 4, default_reps: 15, default_rest_seconds: 60, notes: '' },
  { id: 'wall_sit', name: 'Wall Sit', muscle_group: 'Quads', category: 'main', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 45, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: 'Back flat against wall' },
  { id: 'calf_raise', name: 'Calf Raise', muscle_group: 'Calves', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 25, default_rest_seconds: 45, notes: 'Full range of motion — ankle-to-calf ratio matters' },
  { id: 'donkey_kick_pulse', name: 'Donkey Kick with Pulse', muscle_group: 'Glutes', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 15, default_rest_seconds: 45, notes: 'Small pulse at top of each rep' },
  { id: 'mountain_climber', name: 'Mountain Climbers', muscle_group: 'Core/Cardio', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 30, notes: '' },
  { id: 'burpee', name: 'Burpee', muscle_group: 'Full Body', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 60, notes: '' },

  // ─── Abs ──────────────────────────────────────────────────────────────────
  { id: 'crunch', name: 'Crunch', muscle_group: 'Upper Abs', category: 'abs', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 20, default_rest_seconds: 30, notes: '' },
  { id: 'leg_raise', name: 'Leg Raise', muscle_group: 'Lower Abs', category: 'abs', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 15, default_rest_seconds: 30, notes: 'Lower back pressed down' },
  { id: 'bicycle_crunch', name: 'Bicycle Crunch', muscle_group: 'Obliques/Abs', category: 'abs', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 20, default_rest_seconds: 30, notes: 'Obliques + upper abs' },
  { id: 'reverse_crunch', name: 'Reverse Crunch', muscle_group: 'Lower Abs', category: 'abs', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 15, default_rest_seconds: 30, notes: 'Safer on back than sit-ups' },

  // ─── Warm-up ──────────────────────────────────────────────────────────────
  { id: 'upward_dog', name: 'Upward Facing Dog', muscle_group: 'Back', category: 'warmup', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 30, notes: 'Hold briefly each rep' },
  { id: 'downward_dog', name: 'Downward Facing Dog', muscle_group: 'Shoulders', category: 'warmup', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 30, notes: '' },
  { id: 'knee_to_chest_hug', name: 'Knee to Chest Hug', muscle_group: 'Glutes', category: 'warmup', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 30, notes: 'Standing' },
  { id: 'toe_touch', name: 'Toe Touches', muscle_group: 'Hamstrings', category: 'warmup', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 30, notes: 'Slow and controlled' },

  // ─── Cool-down ────────────────────────────────────────────────────────────
  { id: 'glute_stretch', name: 'Glute Stretch', muscle_group: 'Glutes', category: 'cooldown', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 6, default_reps: 10, default_rest_seconds: 20, notes: 'Figure-4 position' },
  { id: 'hamstring_90_90', name: '90/90 Hamstring Stretch', muscle_group: 'Hamstrings', category: 'cooldown', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 6, default_reps: 10, default_rest_seconds: 20, notes: '' },
  { id: 'knee_to_chest_supine', name: 'Knee to Chest Supine', muscle_group: 'Glutes', category: 'cooldown', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 6, default_reps: 10, default_rest_seconds: 20, notes: 'Lying down' },

  // ─── Combat Exercises ─────────────────────────────────────────────────────
  { id: 'fighter_stance', name: 'Fighter Stance Hold', muscle_group: 'Full Body', category: 'main', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 30, notes: 'Chin tucked, elbows cover ribs, knees relaxed, weight 50/50' },
  { id: 'shadow_jab', name: 'Jab Repetitions', muscle_group: 'Shoulders', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 50, default_rest_seconds: 45, notes: 'Snap back fast — do not push. Rear hand stays at jaw.' },
  { id: 'shadow_cross', name: 'Cross Repetitions', muscle_group: 'Shoulders/Back', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 30, default_rest_seconds: 45, notes: 'Power from hip rotation. Rear foot pivots. Never arm-punch.' },
  { id: 'shadow_jab_cross', name: 'Jab-Cross Combo', muscle_group: 'Full Body', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 20, default_rest_seconds: 60, notes: 'One combo = 1 rep. Reset guard fully each time.' },
  { id: 'shadow_hook', name: 'Hook Repetitions', muscle_group: 'Shoulders', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 15, default_rest_seconds: 45, notes: 'Elbow level. Short tight arc. Never swing.' },
  { id: 'shadow_body_hook', name: 'Body Hook', muscle_group: 'Core', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 45, notes: 'Bend knees slightly. Hook to the ribs.' },
  { id: 'shadow_jab_cross_hook', name: 'Jab-Cross-Hook Combo', muscle_group: 'Full Body', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 60, notes: 'Flow — do not muscle it. Reset guard after each combo.' },
  { id: 'shadow_teep', name: 'Teep (Push Kick)', muscle_group: 'Legs', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 45, notes: 'Knee lifts first. Hips push forward. Recoil immediately.' },
  { id: 'shadow_low_kick', name: 'Low Kick', muscle_group: 'Legs', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 8, default_rest_seconds: 45, notes: 'Rotate hips fully. Swing shin — not foot. Do NOT condition shins by hitting hard surfaces.' },
  { id: 'shadow_knee', name: 'Straight Knee', muscle_group: 'Legs/Core', category: 'main', type: 'reps_each_side', is_timed: 0, each_side: 1, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 45, notes: 'Thrust hips forward. Strike upward. Target is stomach or ribs.' },
  { id: 'footwork_basic', name: 'Forward/Backward Shadow Movement', muscle_group: 'Legs', category: 'warmup', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 30, notes: 'Short steps. Stay balanced. Never cross feet. Feet move first — always.' },
  { id: 'footwork_circle', name: 'Circle Movement', muscle_group: 'Legs', category: 'main', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 30, notes: 'Move around a fixed object. Maintain stance the entire time.' },
  { id: 'footwork_pivot', name: 'Pivot Drill', muscle_group: 'Legs', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 10, default_rest_seconds: 30, notes: 'Pivot on lead foot. Exit to 45° angle.' },
  { id: 'footwork_step_jab', name: 'Step-and-Jab', muscle_group: 'Full Body', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 4, default_reps: 15, default_rest_seconds: 45, notes: 'Step first — punch second. Never simultaneously.' },
  { id: 'slip_drill', name: 'Slip Line Drill', muscle_group: 'Core', category: 'main', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 45, notes: 'Hang a rope or string at head height. Slip head outside it — small movement only.' },
  { id: 'shadow_slip_jab', name: 'Slip then Jab Counter', muscle_group: 'Full Body', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 45, notes: 'Slip outside the line, return jab immediately. No delay.' },
  { id: 'shadow_roll', name: 'Roll Under Hook', muscle_group: 'Core', category: 'main', type: 'reps', is_timed: 0, each_side: 0, hold_seconds: 0, default_sets: 3, default_reps: 10, default_rest_seconds: 45, notes: 'Bend knees, rotate under, come up in guard. Keep eyes forward.' },
  { id: 'shadowboxing', name: 'Shadowboxing Round', muscle_group: 'Full Body', category: 'main', type: 'boxing_round', is_timed: 1, each_side: 0, hold_seconds: 180, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: 'Move constantly. Imagine an opponent. Maintain guard. Stay relaxed.' },
  { id: 'jump_rope', name: 'Jump Rope', muscle_group: 'Cardio', category: 'warmup', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 120, default_sets: 3, default_reps: 0, default_rest_seconds: 30, notes: 'Consistent rhythm. Light on feet.' },
  { id: 'defense_shadow', name: 'Defensive Shadow Round', muscle_group: 'Full Body', category: 'main', type: 'boxing_round', is_timed: 1, each_side: 0, hold_seconds: 180, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: 'Focus only on guard, slips, pulls, pivots. No power striking this round.' },
  { id: 'stance_mirror', name: 'Stance Mirror Check', muscle_group: 'Full Body', category: 'main', type: 'timed', is_timed: 1, each_side: 0, hold_seconds: 120, default_sets: 1, default_reps: 0, default_rest_seconds: 30, notes: 'Film yourself. Check: chin tucked, guard up, knees relaxed, no lean.' },
  { id: 'combat_circuit_shadow', name: 'Shadowboxing — Circuit', muscle_group: 'Full Body', category: 'circuit', type: 'circuit_timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: 'Flow. Not power.' },
  { id: 'combat_circuit_mc', name: 'Mountain Climbers — Circuit', muscle_group: 'Cardio', category: 'circuit', type: 'circuit_timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: '' },
  { id: 'combat_circuit_squat', name: 'Squats — Circuit', muscle_group: 'Legs', category: 'circuit', type: 'circuit_timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: '' },
  { id: 'combat_circuit_pushup', name: 'Push-ups — Circuit', muscle_group: 'Chest', category: 'circuit', type: 'circuit_timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: '' },
  { id: 'combat_circuit_plank', name: 'Plank — Circuit', muscle_group: 'Core', category: 'circuit', type: 'circuit_timed', is_timed: 1, each_side: 0, hold_seconds: 60, default_sets: 3, default_reps: 0, default_rest_seconds: 60, notes: '' },
];

export const EXERCISE_MAP = new Map(EXERCISES.map(e => [e.id, e]));

// Combat exercise IDs — used for targeted seeding
export const COMBAT_EXERCISES = EXERCISES.filter(
  e =>
    e.id === 'fighter_stance' || e.id === 'shadow_jab' || e.id === 'shadow_cross' ||
    e.id === 'shadow_jab_cross' || e.id === 'shadow_hook' || e.id === 'shadow_body_hook' ||
    e.id === 'shadow_jab_cross_hook' || e.id === 'shadow_teep' || e.id === 'shadow_low_kick' ||
    e.id === 'shadow_knee' || e.id === 'footwork_basic' || e.id === 'footwork_circle' ||
    e.id === 'footwork_pivot' || e.id === 'footwork_step_jab' || e.id === 'slip_drill' ||
    e.id === 'shadow_slip_jab' || e.id === 'shadow_roll' || e.id === 'shadowboxing' ||
    e.id === 'jump_rope' || e.id === 'defense_shadow' || e.id === 'stance_mirror' ||
    e.id === 'combat_circuit_shadow' || e.id === 'combat_circuit_mc' ||
    e.id === 'combat_circuit_squat' || e.id === 'combat_circuit_pushup' ||
    e.id === 'combat_circuit_plank',
);

/**
 * Derive ExerciseType from is_timed + each_side flags (for rows loaded from DB
 * that pre-date the exercise_type column, or for circuit exercises).
 * Passing a non-null storedType (from exercise_type column) takes priority.
 */
export function deriveExerciseType(
  isTimed: number,
  eachSide: number,
  phase: string,
  storedType?: string | null,
): ExerciseType {
  if (storedType === 'boxing_round') return 'boxing_round';
  if (storedType === 'circuit_timed') return 'circuit_timed';
  if (phase === 'circuit') return 'circuit_timed';
  if (isTimed && eachSide) return 'timed_each_side';
  if (isTimed) return 'timed';
  if (eachSide) return 'reps_each_side';
  return 'reps';
}
