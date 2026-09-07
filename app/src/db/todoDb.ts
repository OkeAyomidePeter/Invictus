import type { SQLiteDatabase } from 'expo-sqlite';

export interface TodoItem {
  id: string;
  text: string;
  date: string;
  completed: number;
  priority: number;
  created_at: number;
}

export async function getTodosByDate(db: SQLiteDatabase, date: string): Promise<TodoItem[]> {
  return await db.getAllAsync<TodoItem>(
    'SELECT * FROM todos WHERE date = ? ORDER BY priority DESC, created_at ASC',
    date
  );
}

export async function addTodo(db: SQLiteDatabase, todo: TodoItem) {
  await db.runAsync(
    'INSERT INTO todos (id, text, date, completed, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    todo.id, todo.text, todo.date, todo.completed, todo.priority, todo.created_at
  );
}

export async function updateTodo(db: SQLiteDatabase, id: string, updates: Partial<Pick<TodoItem, 'text' | 'completed' | 'priority'>>) {
  const keys = Object.keys(updates);
  if (keys.length === 0) return;
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (updates as any)[k]);
  values.push(id);
  await db.runAsync(`UPDATE todos SET ${setClause} WHERE id = ?`, ...values);
}

export async function deleteTodo(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM todos WHERE id = ?', id);
}
