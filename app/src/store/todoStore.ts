import { create } from 'zustand';

export interface TodoItem {
  id: string;
  text: string;
  date: string;
  completed: number;
  priority: number;
  created_at: number;
}

interface TodoState {
  todos: TodoItem[];
  setTodos: (todos: TodoItem[]) => void;
  addTodo: (todo: TodoItem) => void;
  updateTodo: (id: string, updates: Partial<Pick<TodoItem, 'text' | 'completed' | 'priority'>>) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((s) => ({ todos: [...s.todos, todo] })),
  updateTodo: (id, updates) => set((s) => ({
    todos: s.todos.map(t => t.id === id ? { ...t, ...updates } : t),
  })),
  removeTodo: (id) => set((s) => ({
    todos: s.todos.filter(t => t.id !== id),
  })),
}));
