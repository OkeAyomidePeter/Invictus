import { create } from 'zustand';

interface WorkoutState {
  activeSessionId: string | null;
  isResting: boolean;
  setActiveSession: (id: string | null) => void;
  setResting: (resting: boolean) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeSessionId: null,
  isResting: false,
  setActiveSession: (id) => set({ activeSessionId: id }),
  setResting: (resting) => set({ isResting: resting }),
}));
