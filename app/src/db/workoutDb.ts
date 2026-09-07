import type { SQLiteDatabase } from "expo-sqlite";
import { deriveExerciseType } from "../constants/exercises";
import type { ExerciseType } from "../constants/exercises";

export const PHASE_ORDER: Record<string, number> = {
  warmup: 0,
  main: 1,
  circuit: 1, // Day 4: circuit takes the main slot
  abs: 2,
  cooldown: 3,
};

export interface Session {
  id: string;
  routine_id: string | null;
  training_day_id: string | null;
  started_at: number;
  ended_at: number | null;
  ended_early: number | null;
  note: string | null;
}

export interface SetRow {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg: number | null;
  side: string | null;
  completed_at: number;
}

export interface ExerciseSlot {
  id: string;
  training_day_id: string;
  exercise_id: string;
  phase: string;
  position: number;
  sets: number;
  reps: number | null;
  hold_seconds: number;
  rest_seconds: number;
  notes: string;
  name: string;
  muscle_group: string;
  is_timed: number;
  each_side: number;
  gif_path: string | null;
  exercise_type: ExerciseType;
}

export async function createSession(
  db: SQLiteDatabase,
  session: Omit<Session, "ended_early">,
) {
  await db.runAsync(
    "INSERT INTO sessions (id, routine_id, training_day_id, started_at, ended_at, note) VALUES (?, ?, ?, ?, ?, ?)",
    session.id,
    session.routine_id,
    session.training_day_id,
    session.started_at,
    session.ended_at,
    session.note,
  );
}

export async function endSession(
  db: SQLiteDatabase,
  id: string,
  endedEarly = false,
) {
  await db.runAsync(
    "UPDATE sessions SET ended_at = ?, ended_early = ? WHERE id = ?",
    Date.now(),
    endedEarly ? 1 : 0,
    id,
  );
}

export async function saveSet(db: SQLiteDatabase, set: SetRow) {
  await db.runAsync(
    "INSERT INTO sets (id, session_id, exercise_id, set_number, reps, weight_kg, side, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    set.id,
    set.session_id,
    set.exercise_id,
    set.set_number,
    set.reps,
    set.weight_kg,
    set.side,
    set.completed_at,
  );
}

export async function getSessions(db: SQLiteDatabase): Promise<Session[]> {
  return await db.getAllAsync<Session>(
    "SELECT * FROM sessions ORDER BY started_at DESC",
  );
}

export async function getSessionSets(
  db: SQLiteDatabase,
  sessionId: string,
): Promise<SetRow[]> {
  return await db.getAllAsync<SetRow>(
    "SELECT * FROM sets WHERE session_id = ? ORDER BY completed_at",
    sessionId,
  );
}

export async function updateScheduleState(
  db: SQLiteDatabase,
  trainingDayId: string,
) {
  await db.runAsync(
    "UPDATE schedule_state SET last_training_day_id = ?, last_session_date = ? WHERE id = 1",
    trainingDayId,
    new Date().toISOString().split("T")[0],
  );
}

export async function getScheduleState(
  db: SQLiteDatabase,
): Promise<{
  last_training_day_id: string | null;
  last_session_date: string | null;
} | null> {
  return await db.getFirstAsync<{
    last_training_day_id: string | null;
    last_session_date: string | null;
  }>(
    "SELECT last_training_day_id, last_session_date FROM schedule_state WHERE id = 1",
  );
}

export async function getTrainingDayExercises(
  db: SQLiteDatabase,
  trainingDayId: string,
): Promise<ExerciseSlot[]> {
  const rows = await db.getAllAsync<Omit<ExerciseSlot, "exercise_type">>(
    `SELECT
       tde.id, tde.training_day_id, tde.exercise_id, tde.phase, tde.position,
       tde.sets, tde.reps, tde.hold_seconds, tde.rest_seconds, tde.notes,
       e.name, e.muscle_group, e.is_timed, e.each_side, e.gif_path,
       e.exercise_type
     FROM training_day_exercises tde
     JOIN exercises e ON tde.exercise_id = e.id
     WHERE tde.training_day_id = ?
     ORDER BY
       CASE tde.phase
         WHEN 'warmup'   THEN 0
         WHEN 'main'     THEN 1
         WHEN 'circuit'  THEN 1
         WHEN 'abs'      THEN 2
         WHEN 'cooldown' THEN 3
         ELSE 4
       END,
       tde.position`,
    trainingDayId,
  );

  // Attach derived exercise_type for each row
  return rows.map((row) => ({
    ...row,
    exercise_type: deriveExerciseType(
      row.is_timed,
      row.each_side,
      row.phase,
      (row as unknown as { exercise_type: string | null }).exercise_type,
    ),
  }));
}

// ─── Combat Schedule State ────────────────────────────────────────────────────

export async function updateCombatScheduleState(
  db: SQLiteDatabase,
  combatDayId: string,
) {
  await db.runAsync(
    "UPDATE schedule_state SET last_training_day_id = ?, last_session_date = ? WHERE id = 2",
    combatDayId,
    new Date().toISOString().split("T")[0],
  );
}

export async function getCombatScheduleState(
  db: SQLiteDatabase,
): Promise<{
  last_training_day_id: string | null;
  last_session_date: string | null;
} | null> {
  return await db.getFirstAsync<{
    last_training_day_id: string | null;
    last_session_date: string | null;
  }>(
    "SELECT last_training_day_id, last_session_date FROM schedule_state WHERE id = 2",
  );
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  label: string;
  completed: number;
}

export async function getMilestones(db: SQLiteDatabase): Promise<Milestone[]> {
  return await db.getAllAsync<Milestone>(
    "SELECT * FROM milestones ORDER BY id",
  );
}

export async function toggleMilestone(
  db: SQLiteDatabase,
  id: string,
  completed: number,
) {
  await db.runAsync(
    "UPDATE milestones SET completed = ? WHERE id = ?",
    completed ? 1 : 0,
    id,
  );
}
