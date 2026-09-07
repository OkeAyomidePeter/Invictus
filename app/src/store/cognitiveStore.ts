import { create } from 'zustand';

interface CognitiveState {
  sectionsDone: number;
  totalSections: number;
  setSectionsDone: (done: number) => void;
}

export const useCognitiveStore = create<CognitiveState>((set) => ({
  sectionsDone: 0,
  totalSections: 5,
  setSectionsDone: (done) => set({ sectionsDone: done }),
}));
