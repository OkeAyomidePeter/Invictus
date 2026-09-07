import type { SQLiteDatabase } from "expo-sqlite";

export interface ExportPayload {
  sessions: any[];
  sets: any[];
  journal_entries: any[];
  todos: any[];
  milestones: any[];
  schedule_state: any[];
  exported_at: string;
}

/**
 * Extracts all user data from the database for personal AI context or backup.
 */
export async function exportAllData(
  db: SQLiteDatabase,
): Promise<ExportPayload> {
  const sessions = await db.getAllAsync("SELECT * FROM sessions");
  const sets = await db.getAllAsync("SELECT * FROM sets");
  const journal_entries = await db.getAllAsync("SELECT * FROM journal_entries");
  const todos = await db.getAllAsync("SELECT * FROM todos");
  const milestones = await db.getAllAsync("SELECT * FROM milestones");
  const schedule_state = await db.getAllAsync("SELECT * FROM schedule_state");

  return {
    sessions,
    sets,
    journal_entries,
    todos,
    milestones,
    schedule_state,
    exported_at: new Date().toISOString(),
  };
}

/**
 * Returns the entire database as a JSON string.
 */
export async function exportAsJSON(db: SQLiteDatabase): Promise<string> {
  const data = await exportAllData(db);
  return JSON.stringify(data, null, 2);
}

/**
 * Overwrites current database with provided payload.
 * WARNING: This deletes current data.
 */
export async function importData(db: SQLiteDatabase, payload: ExportPayload) {
  await db.withTransactionAsync(async () => {
    // 1. Clear tables
    await db.runAsync("DELETE FROM sessions");
    await db.runAsync("DELETE FROM sets");
    await db.runAsync("DELETE FROM journal_entries");
    await db.runAsync("DELETE FROM todos");
    await db.runAsync("DELETE FROM milestones");
    await db.runAsync("DELETE FROM schedule_state");

    // 2. Insert metadata tables (Schedule State)
    for (const row of payload.schedule_state) {
      await db.runAsync(
        "INSERT INTO schedule_state (id, last_training_day_id, last_session_date) VALUES (?, ?, ?)",
        row.id,
        row.last_training_day_id,
        row.last_session_date,
      );
    }

    // 3. Insert Milestones
    for (const m of payload.milestones) {
      await db.runAsync(
        "INSERT INTO milestones (id, label, completed) VALUES (?, ?, ?)",
        m.id,
        m.label,
        m.completed,
      );
    }

    // 4. Insert Todos
    for (const t of payload.todos) {
      await db.runAsync(
        "INSERT INTO todos (id, text, date, completed, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        t.id,
        t.text,
        t.date,
        t.completed,
        t.priority,
        t.created_at,
      );
    }

    // 5. Insert Journal Entries
    for (const e of payload.journal_entries) {
      await db.runAsync(
        `INSERT INTO journal_entries (
          id, date, type, attention_drift, attention_trigger, attention_recovery,
          impulse_urge, impulse_intensity, impulse_gated, obs_person, obs_environment, obs_internal,
          thinking_idea, thinking_doubt, thinking_disproof, alignment_served_future, alignment_correction,
          anchored_source, anchored_central_idea, anchored_doubt, anchored_connection, anchored_implication,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        e.id,
        e.date,
        e.type,
        e.attention_drift,
        e.attention_trigger,
        e.attention_recovery,
        e.impulse_urge,
        e.impulse_intensity,
        e.impulse_gated,
        e.obs_person,
        e.obs_environment,
        e.obs_internal,
        e.thinking_idea,
        e.thinking_doubt,
        e.thinking_disproof,
        e.alignment_served_future,
        e.alignment_correction,
        e.anchored_source,
        e.anchored_central_idea,
        e.anchored_doubt,
        e.anchored_connection,
        e.anchored_implication,
        e.created_at,
      );
    }

    // 6. Insert Sessions
    for (const s of payload.sessions) {
      await db.runAsync(
        "INSERT INTO sessions (id, routine_id, training_day_id, started_at, ended_at, ended_early, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
        s.id,
        s.routine_id,
        s.training_day_id,
        s.started_at,
        s.ended_at,
        s.ended_early,
        s.note,
      );
    }

    // 7. Insert Sets
    for (const st of payload.sets) {
      await db.runAsync(
        "INSERT INTO sets (id, session_id, exercise_id, set_number, reps, weight_kg, side, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        st.id,
        st.session_id,
        st.exercise_id,
        st.set_number,
        st.reps,
        st.weight_kg,
        st.side,
        st.completed_at,
      );
    }
  });
}
