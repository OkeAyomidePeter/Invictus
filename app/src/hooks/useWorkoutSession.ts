import { useCallback, useReducer } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { createSession, saveSet, endSession, updateScheduleState } from '../db/workoutDb';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export interface ExerciseSlot {
  id: string;
  exercise_id: string;
  name: string;
  muscle_group: string;
  phase: string;
  sets: number;
  reps: number | null;
  is_timed: number;
  each_side: number;
  hold_seconds: number;
  rest_seconds: number;
  notes: string;
  gif_path: string | null;
}

export interface LoggedSet {
  set_number: number;
  reps: number;
  side: 'left' | 'right' | null;
}

type Phase = 'warmup' | 'main' | 'abs' | 'circuit' | 'cooldown';

interface SessionState {
  sessionId: string | null;
  exercises: ExerciseSlot[];
  currentExerciseIndex: number;
  currentSet: number;
  currentSide: 'left' | 'right' | null;
  currentReps: number;
  phase: Phase;
  phaseOrder: Phase[];
  isFinished: boolean;
  startedAt: number;
}

type Action =
  | { type: 'INIT_SESSION'; sessionId: string; exercises: ExerciseSlot[]; phaseOrder: Phase[] }
  | { type: 'SET_REPS'; reps: number }
  | { type: 'NEXT_SIDE_OR_SET' }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

function getPhaseForExercise(exercise: ExerciseSlot): Phase {
  return exercise.phase as Phase;
}

function getNextSide(side: 'left' | 'right' | null, each_side: number): 'left' | 'right' | null {
  if (!each_side) return null;
  if (side === null) return 'left';
  if (side === 'left') return 'right';
  return null;
}

function sessionReducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'INIT_SESSION':
      return {
        ...state,
        sessionId: action.sessionId,
        exercises: action.exercises,
        phaseOrder: action.phaseOrder,
        currentExerciseIndex: 0,
        currentSet: 1,
        currentSide: null,
        currentReps: 0,
        isFinished: false,
        startedAt: Date.now(),
      };
    case 'SET_REPS':
      return { ...state, currentReps: action.reps };
    case 'NEXT_SIDE_OR_SET': {
      const ex = state.exercises[state.currentExerciseIndex];
      if (!ex) return state;
      const nextSide = getNextSide(state.currentSide, ex.each_side);
      if (nextSide) {
        return { ...state, currentSide: nextSide, currentReps: 0 };
      }
      if (state.currentSet < ex.sets) {
        return { ...state, currentSet: state.currentSet + 1, currentSide: null, currentReps: 0 };
      }
      return state;
    }
    case 'NEXT_EXERCISE': {
      const nextIdx = state.currentExerciseIndex + 1;
      if (nextIdx >= state.exercises.length) {
        return { ...state, isFinished: true };
      }
      const nextEx = state.exercises[nextIdx];
      return {
        ...state,
        currentExerciseIndex: nextIdx,
        currentSet: 1,
        currentSide: null,
        currentReps: 0,
        phase: getPhaseForExercise(nextEx) as Phase,
      };
    }
    case 'FINISH':
      return { ...state, isFinished: true };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const initialState: SessionState = {
  sessionId: null,
  exercises: [],
  currentExerciseIndex: 0,
  currentSet: 1,
  currentSide: null,
  currentReps: 0,
  phase: 'warmup',
  phaseOrder: [],
  isFinished: false,
  startedAt: 0,
};

export function useWorkoutSession() {
  const db = useSQLiteContext();
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const currentExercise = state.exercises[state.currentExerciseIndex];

  const initSession = useCallback(async (exercises: ExerciseSlot[], phaseOrder: Phase[]) => {
    const sessionId = generateId();
    await createSession(db, {
      id: sessionId,
      routine_id: null,
      training_day_id: null,
      started_at: Date.now(),
      ended_at: null,
      note: null,
    });
    dispatch({ type: 'INIT_SESSION', sessionId, exercises, phaseOrder });
    return sessionId;
  }, [db]);

  const logSet = useCallback(async (reps: number, side: 'left' | 'right' | null) => {
    if (!state.sessionId || !currentExercise) return;
    await saveSet(db, {
      id: generateId(),
      session_id: state.sessionId,
      exercise_id: currentExercise.exercise_id,
      set_number: state.currentSet,
      reps,
      weight_kg: null,
      side,
      completed_at: Date.now(),
    });
  }, [state.sessionId, state.currentSet, currentExercise, db]);

  const doneSet = useCallback(async () => {
    if (!currentExercise) return;
    await logSet(state.currentReps, state.currentSide);
    dispatch({ type: 'NEXT_SIDE_OR_SET' });
  }, [currentExercise, logSet, state.currentReps, state.currentSide]);

  const nextExercise = useCallback(async () => {
    dispatch({ type: 'NEXT_EXERCISE' });
  }, []);

  const finishSession = useCallback(async (trainingDayId?: string) => {
    if (state.sessionId) {
      await endSession(db, state.sessionId);
      if (trainingDayId) {
        await updateScheduleState(db, trainingDayId);
      }
    }
    dispatch({ type: 'FINISH' });
  }, [state.sessionId, db]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    currentExercise,
    initSession,
    doneSet,
    nextExercise,
    finishSession,
    reset,
    setReps: (reps: number) => dispatch({ type: 'SET_REPS', reps }),
  };
}
