import type { SQLiteDatabase } from 'expo-sqlite';

export interface JournalEntry {
  id: string;
  date: string;
  type: 'cognitive' | 'anchored';
  attention_drift: string | null;
  attention_trigger: string | null;
  attention_recovery: string | null;
  impulse_urge: string | null;
  impulse_intensity: number | null;
  impulse_gated: number | null;
  obs_person: string | null;
  obs_environment: string | null;
  obs_internal: string | null;
  thinking_idea: string | null;
  thinking_doubt: string | null;
  thinking_disproof: string | null;
  alignment_served_future: number | null;
  alignment_correction: string | null;
  anchored_source: string | null;
  anchored_central_idea: string | null;
  anchored_doubt: string | null;
  anchored_connection: string | null;
  anchored_implication: string | null;
  created_at: number;
}

export async function getJournalEntry(db: SQLiteDatabase, date: string, type: 'cognitive' | 'anchored'): Promise<JournalEntry | null> {
  return await db.getFirstAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE date = ? AND type = ?',
    date, type
  );
}

export async function getJournalEntriesByDate(db: SQLiteDatabase, date: string): Promise<JournalEntry[]> {
  return await db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE date = ? ORDER BY created_at',
    date
  );
}

export async function saveJournalEntry(db: SQLiteDatabase, entry: Partial<JournalEntry> & { id: string; date: string; type: 'cognitive' | 'anchored'; created_at: number }) {
  const existing = await getJournalEntry(db, entry.date, entry.type);
  if (existing) {
    await db.runAsync(
      `UPDATE journal_entries SET
        attention_drift = ?, attention_trigger = ?, attention_recovery = ?,
        impulse_urge = ?, impulse_intensity = ?, impulse_gated = ?,
        obs_person = ?, obs_environment = ?, obs_internal = ?,
        thinking_idea = ?, thinking_doubt = ?, thinking_disproof = ?,
        alignment_served_future = ?, alignment_correction = ?,
        anchored_source = ?, anchored_central_idea = ?, anchored_doubt = ?,
        anchored_connection = ?, anchored_implication = ?
      WHERE id = ?`,
      entry.attention_drift ?? null, entry.attention_trigger ?? null, entry.attention_recovery ?? null,
      entry.impulse_urge ?? null, entry.impulse_intensity ?? null, entry.impulse_gated ?? null,
      entry.obs_person ?? null, entry.obs_environment ?? null, entry.obs_internal ?? null,
      entry.thinking_idea ?? null, entry.thinking_doubt ?? null, entry.thinking_disproof ?? null,
      entry.alignment_served_future ?? null, entry.alignment_correction ?? null,
      entry.anchored_source ?? null, entry.anchored_central_idea ?? null, entry.anchored_doubt ?? null,
      entry.anchored_connection ?? null, entry.anchored_implication ?? null,
      entry.id
    );
  } else {
    await db.runAsync(
      `INSERT INTO journal_entries (
        id, date, type, attention_drift, attention_trigger, attention_recovery,
        impulse_urge, impulse_intensity, impulse_gated,
        obs_person, obs_environment, obs_internal,
        thinking_idea, thinking_doubt, thinking_disproof,
        alignment_served_future, alignment_correction,
        anchored_source, anchored_central_idea, anchored_doubt, anchored_connection, anchored_implication,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.id, entry.date, entry.type,
      entry.attention_drift ?? null, entry.attention_trigger ?? null, entry.attention_recovery ?? null,
      entry.impulse_urge ?? null, entry.impulse_intensity ?? null, entry.impulse_gated ?? null,
      entry.obs_person ?? null, entry.obs_environment ?? null, entry.obs_internal ?? null,
      entry.thinking_idea ?? null, entry.thinking_doubt ?? null, entry.thinking_disproof ?? null,
      entry.alignment_served_future ?? null, entry.alignment_correction ?? null,
      entry.anchored_source ?? null, entry.anchored_central_idea ?? null, entry.anchored_doubt ?? null,
      entry.anchored_connection ?? null, entry.anchored_implication ?? null,
      entry.created_at
    );
  }
}
