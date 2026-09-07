import { create } from 'zustand';

interface Routine {
  id: string;
  name: string;
  created_at: number;
  is_default: number;
}

interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  position: number;
  target_sets: number | null;
  target_reps: number | null;
  rest_seconds: number | null;
}

interface RoutineState {
  routines: Routine[];
  currentRoutineExercises: RoutineExercise[];
  setRoutines: (routines: Routine[]) => void;
  setCurrentRoutineExercises: (exercises: RoutineExercise[]) => void;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  currentRoutineExercises: [],
  setRoutines: (routines) => set({ routines }),
  setCurrentRoutineExercises: (exercises) => set({ currentRoutineExercises: exercises }),
}));
