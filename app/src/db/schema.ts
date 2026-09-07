import type { SQLiteDatabase } from "expo-sqlite";

export async function initDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      muscle_group TEXT,
      gif_path TEXT,
      default_sets INTEGER DEFAULT 3,
      default_reps INTEGER DEFAULT 10,
      default_rest_seconds INTEGER DEFAULT 60,
      notes TEXT,
      category TEXT,
      is_timed INTEGER DEFAULT 0,
      hold_seconds INTEGER DEFAULT 0,
      each_side INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS routine_exercises (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      target_sets INTEGER,
      target_reps INTEGER,
      rest_seconds INTEGER,
      FOREIGN KEY (routine_id) REFERENCES routines(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      routine_id TEXT,
      training_day_id TEXT,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      ended_early INTEGER DEFAULT 0,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS sets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      weight_kg REAL,
      side TEXT,
      completed_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      attention_drift TEXT,
      attention_trigger TEXT,
      attention_recovery TEXT,
      impulse_urge TEXT,
      impulse_intensity INTEGER,
      impulse_gated INTEGER,
      obs_person TEXT,
      obs_environment TEXT,
      obs_internal TEXT,
      thinking_idea TEXT,
      thinking_doubt TEXT,
      thinking_disproof TEXT,
      alignment_served_future INTEGER,
      alignment_correction TEXT,
      anchored_source TEXT,
      anchored_central_idea TEXT,
      anchored_doubt TEXT,
      anchored_connection TEXT,
      anchored_implication TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_days (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      focus TEXT NOT NULL,
      day_number INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_day_exercises (
      id TEXT PRIMARY KEY,
      training_day_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      phase TEXT NOT NULL,
      position INTEGER NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER,
      hold_seconds INTEGER,
      rest_seconds INTEGER DEFAULT 60,
      notes TEXT,
      FOREIGN KEY (training_day_id) REFERENCES training_days(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS schedule_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      last_training_day_id TEXT,
      last_session_date TEXT
    );

    INSERT OR IGNORE INTO schedule_state (id, last_training_day_id, last_session_date) VALUES (1, NULL, NULL);
    INSERT OR IGNORE INTO schedule_state (id, last_training_day_id, last_session_date) VALUES (2, 'combat_a', NULL);

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    );
  `);

  // Migrations — SQLite does not support IF NOT EXISTS on ALTER TABLE.
  // Wrap each in try/catch to silently skip if column already exists.
  const migrations = [
    "ALTER TABLE sessions ADD COLUMN ended_early INTEGER DEFAULT 0",
    "ALTER TABLE exercises ADD COLUMN exercise_type TEXT",
  ];
  for (const sql of migrations) {
    try {
      await db.execAsync(sql);
    } catch (_) {}
  }

  // One-time data migration: fix devices where the boot-time override left
  // last_training_day_id = 'day3' with no completed sessions (incorrect hard-seed).
  try {
    const completedCount = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sessions WHERE ended_at IS NOT NULL AND ended_early = 0"
    );
    const bodyState = await db.getFirstAsync<{ last_training_day_id: string | null }>(
      "SELECT last_training_day_id FROM schedule_state WHERE id = 1"
    );
    // If stale seed ('day3') but no real completed sessions, reset to 'day2'
    if (
      bodyState?.last_training_day_id === "day3" &&
      (completedCount?.count ?? 0) === 0
    ) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await db.runAsync(
        "UPDATE schedule_state SET last_training_day_id = 'day2', last_session_date = ? WHERE id = 1",
        yesterday.toISOString().split("T")[0],
      );
    }
  } catch (_) {}

  // --- Session Cleanup (orphaned crashed sessions only) ---
  try {
    // Remove sessions that crashed mid-workout (no end time, started > 2 hours ago).
    // We do NOT delete recently-started sessions to avoid wiping in-progress workouts.
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    await db.runAsync(
      "DELETE FROM sessions WHERE ended_at IS NULL AND ended_early = 0 AND started_at < ?",
      twoHoursAgo,
    );
    await db.execAsync(
      "DELETE FROM sets WHERE session_id NOT IN (SELECT id FROM sessions);"
    );
  } catch (err) {
    console.warn("Session cleanup failed", err);
  }

  // --- Schedule State: seed only on FIRST RUN (last_training_day_id IS NULL) ---
  // This does NOT override existing progress on subsequent boots.
  try {
    const bodyState = await db.getFirstAsync<{
      last_training_day_id: string | null;
    }>("SELECT last_training_day_id FROM schedule_state WHERE id = 1");

    if (!bodyState?.last_training_day_id) {
      // First ever run — seed body cycle at day2 so Day 3 is shown as next
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      await db.runAsync(
        "UPDATE schedule_state SET last_training_day_id = 'day3', last_session_date = ? WHERE id = 1",
        yesterdayStr,
      );
    }

    const combatState = await db.getFirstAsync<{
      last_training_day_id: string | null;
    }>("SELECT last_training_day_id FROM schedule_state WHERE id = 2");

    if (!combatState?.last_training_day_id) {
      // First ever run — seed combat at combat_a
      await db.runAsync(
        "UPDATE schedule_state SET last_training_day_id = 'combat_a' WHERE id = 2",
      );
    }
  } catch (err) {
    console.warn("Schedule state seed failed", err);
  }
}


