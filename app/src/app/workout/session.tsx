import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  ProgressBar,
  Surface,
  Text,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { invictusTheme } from "../../constants/theme";
import { TimerBar } from "../../components/TimerBar";
import { MotivatorBar } from "../../components/MotivatorBar";
import { SetRow } from "../../components/SetRow";
import { VideoPlaceholder } from "../../components/VideoPlaceholder";
import { useTimer } from "../../hooks/useTimer";
// Removed useHeadphoneButton usage
import {
  getTrainingDayExercises,
  getScheduleState,
  endSession,
  updateScheduleState,
  updateCombatScheduleState,
} from "../../db/workoutDb";
import type { ExerciseSlot } from "../../db/workoutDb";
import {
  getTodayMotivator,
  WORKOUT_MOTIVATORS,
} from "../../constants/motivators";
import { EXERCISE_MEDIA } from "../../constants/media";

// ─── Phase label display ──────────────────────────────────────────────────────
const getPhaseLabel = (() => {
  const baseLabels: Record<string, string> = {
    warmup: "WARM-UP",
    main: "MAIN WORK",
    abs: "ABS",
    circuit: "CIRCUIT",
    cooldown: "COOL-DOWN",
  };
  const combatLabels: Record<string, string> = {
    warmup: "WARM-UP",
    main: "STRIKING",
    abs: "ABS",
    circuit: "COMBAT CIRCUIT",
    cooldown: "COOL-DOWN",
  };
  return (phase: string, isCombat = false): string => {
    const map = isCombat ? combatLabels : baseLabels;
    return map[phase] ?? phase.toUpperCase();
  };
})();

// ─── Phase Transition Interstitial ───────────────────────────────────────────
function PhaseTransition({
  from,
  to,
  onDone,
  isCombat = false,
}: {
  from: string;
  to: string;
  onDone: () => void;
  isCombat?: boolean;
}) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={st.container}>
      <View style={st.transitionWrap}>
        <Surface style={st.transitionCard} elevation={2}>
          <Text style={st.transitionFrom}>
            {getPhaseLabel(from, isCombat)} COMPLETE
          </Text>
          <Text style={st.transitionTo}>
            Starting {getPhaseLabel(to, isCombat)} in {countdown}...
          </Text>
          <ProgressBar
            progress={(3 - countdown) / 3}
            color={invictusTheme.accent}
            style={st.transitionBar}
          />
        </Surface>
      </View>
    </SafeAreaView>
  );
}

// ─── Boxing Round Timer Layout ────────────────────────────────────────────────
function BoxingRoundPanel({
  exercise,
  round,
  totalRounds,
  onRoundComplete,
}: {
  exercise: ExerciseSlot;
  round: number;
  totalRounds: number;
  onRoundComplete: () => void;
}) {
  const [isWork, setIsWork] = useState(true);
  const workTimer = useTimer();
  const restTimer = useTimer();

  useEffect(() => {
    workTimer.start(exercise.hold_seconds || 180);
  }, [exercise.id, round]);

  useEffect(() => {
    if (workTimer.remaining === 0 && !workTimer.isRunning && isWork) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setIsWork(false);
      restTimer.start(exercise.rest_seconds || 60);
    }
  }, [workTimer.remaining, workTimer.isRunning]);

  useEffect(() => {
    if (restTimer.remaining === 0 && !restTimer.isRunning && !isWork) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setIsWork(true);
      onRoundComplete();
    }
  }, [restTimer.remaining, restTimer.isRunning]);

  const handleEndEarly = useCallback(() => {
    if (isWork) {
      workTimer.skip();
    } else {
      restTimer.skip();
    }
  }, [isWork, workTimer, restTimer]);

  const timer = isWork ? workTimer : restTimer;
  const phase = isWork ? "WORK" : "REST";
  const total = isWork
    ? exercise.hold_seconds || 180
    : exercise.rest_seconds || 60;
  const elapsed = total - timer.remaining;

  return (
    <View style={st.boxingPanel}>
      <Text style={st.boxingRoundBadge}>
        Round {round} of {totalRounds}
      </Text>
      <Text style={st.exerciseName}>{exercise.name}</Text>
      <View style={st.boxingPhaseBadge}>
        <Text style={[st.boxingPhaseText, !isWork && st.boxingPhaseRestText]}>
          {phase}
        </Text>
      </View>
      <Text style={st.timedCounter}>
        {String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:
        {String(timer.remaining % 60).padStart(2, "0")}
      </Text>
      <ProgressBar
        progress={total > 0 ? elapsed / total : 0}
        color={isWork ? invictusTheme.combatAccent : invictusTheme.textMuted}
        style={st.timedProgress}
      />
      {!isWork && (
        <Text style={st.boxingNextLabel}>Round {round + 1} up next</Text>
      )}
      <Button
        mode="outlined"
        onPress={handleEndEarly}
        textColor={
          isWork ? invictusTheme.combatAccent : invictusTheme.textMuted
        }
        style={st.boxingEndBtn}
        icon={() => (
          <MaterialCommunityIcons
            name={isWork ? "stop" : "skip-next"}
            size={16}
            color={
              isWork ? invictusTheme.combatAccent : invictusTheme.textMuted
            }
          />
        )}
      >
        {isWork ? "END ROUND EARLY" : "SKIP REST"}
      </Button>
    </View>
  );
}

// ─── Circuit Timer Layout ─────────────────────────────────────────────────────
function CircuitPanel({
  exercise,
  nextExerciseName,
  round,
  totalRounds,
  onCircuitComplete,
}: {
  exercise: ExerciseSlot;
  nextExerciseName: string | null;
  round: number;
  totalRounds: number;
  onCircuitComplete: () => void;
}) {
  const [isWorking, setIsWorking] = useState(true);
  const workTimer = useTimer();
  const restTimer = useTimer();

  useEffect(() => {
    // Start the 45s work timer immediately
    workTimer.start(45);
  }, [exercise.id, round]);

  useEffect(() => {
    // When work timer ends, start 15s rest then signal complete
    if (workTimer.remaining === 0 && !workTimer.isRunning && isWorking) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setIsWorking(false);
      restTimer.start(15);
    }
  }, [workTimer.remaining, workTimer.isRunning]);

  useEffect(() => {
    // When rest timer ends, advance
    if (restTimer.remaining === 0 && !restTimer.isRunning && !isWorking) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setIsWorking(true);
      onCircuitComplete();
    }
  // onCircuitComplete MUST be in deps — stale closure caused Day 4 circuit to never exit
  }, [restTimer.remaining, restTimer.isRunning, onCircuitComplete]);

  const timer = isWorking ? workTimer : restTimer;
  const phase = isWorking ? "WORK" : "REST";
  const total = isWorking ? 45 : 15;
  const elapsed = total - timer.remaining;

  return (
    <View style={st.circuitPanel}>
      <Text style={st.circuitRoundBadge}>
        CIRCUIT — Round {round} of {totalRounds}
      </Text>
      <Text style={st.exerciseName}>{exercise.name}</Text>
      <View style={st.circuitPhaseBadge}>
        <MaterialCommunityIcons
          name={isWorking ? "play" : "pause"}
          size={14}
          color={isWorking ? invictusTheme.accent : invictusTheme.textMuted}
        />
        <Text style={[st.circuitPhaseText, !isWorking && st.circuitPhaseRest]}>
          {phase}
        </Text>
      </View>
      <Text style={st.timedCounter}>
        {String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:
        {String(timer.remaining % 60).padStart(2, "0")}
      </Text>
      <ProgressBar
        progress={total > 0 ? elapsed / total : 0}
        color={isWorking ? invictusTheme.accent : invictusTheme.textMuted}
        style={st.timedProgress}
      />
      {nextExerciseName && (
        <Text style={st.nextLabel}>NEXT: {nextExerciseName}</Text>
      )}
    </View>
  );
}

// ─── Timed Exercise Layout ────────────────────────────────────────────────────
function TimedPanel({
  holdSeconds,
  side,
  onComplete,
}: {
  holdSeconds: number;
  side: "left" | "right" | null;
  onComplete: () => void;
}) {
  const timer = useTimer(onComplete);

  useEffect(() => {
    timer.start(holdSeconds);
  }, [holdSeconds, side]);

  const elapsed = holdSeconds - timer.remaining;

  return (
    <View style={st.timedPanel}>
      {side && <Text style={st.sideLabel}>{side.toUpperCase()} SIDE</Text>}
      <Text style={st.timedCounter}>
        {String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:
        {String(timer.remaining % 60).padStart(2, "0")}
      </Text>
      <ProgressBar
        progress={holdSeconds > 0 ? elapsed / holdSeconds : 0}
        color={invictusTheme.accent}
        style={st.timedProgress}
      />
      <View style={st.timedActions}>
        <Button
          mode="outlined"
          onPress={timer.skip}
          textColor={invictusTheme.textMuted}
          style={st.skipBtn}
          icon={() => (
            <MaterialCommunityIcons
              name="skip-next"
              size={16}
              color={invictusTheme.textMuted}
            />
          )}
        >
          SKIP
        </Button>
      </View>
    </View>
  );
}

// ─── Main Session Screen ──────────────────────────────────────────────────────
export default function SessionScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { trainingDayId } = useLocalSearchParams<{ trainingDayId?: string }>();
  const motivator = getTodayMotivator(WORKOUT_MOTIVATORS);

  const restTimer = useTimer();

  const [exercises, setExercises] = useState<ExerciseSlot[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentSide, setCurrentSide] = useState<"left" | "right" | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  const [transitionState, setTransition] = useState<{
    from: string;
    to: string;
    isCombat?: boolean;
  } | null>(null);
  const [loggedSets, setLoggedSets] = useState<
    {
      set_number: number;
      reps: number;
      side: string | null;
      exercise_id: string;
    }[]
  >([]);

  // Circuit state
  const [circuitRound, setCircuitRound] = useState(1);
  const [circuitExIdx, setCircuitExIdx] = useState(0); // index within circuit exercises

  // Boxing round state
  const [boxingRound, setBoxingRound] = useState(1);

  const [activeTrainingDayId, setActiveTrainingDayId] =
    useState<string>("day1");
  const isCombatSession = activeTrainingDayId.startsWith("combat_");

  // Removed hook call

  const currentExercise = exercises[currentIdx];
  const nextExercise = exercises[currentIdx + 1] ?? null;

  // ── Load exercises on mount ──
  useEffect(() => {
    initSession();
  }, [trainingDayId]);

  const initSession = async () => {
    let dayId = (trainingDayId as string) || "day1";
    if (!trainingDayId) {
      const state = await getScheduleState(db);
      const { getNextTrainingDay } = await import("../../constants/schedule");
      dayId = getNextTrainingDay(state?.last_training_day_id ?? null);
    }
    setActiveTrainingDayId(dayId);
    const exs = await getTrainingDayExercises(db, dayId);
    setExercises(exs);

    const sid =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    setSessionId(sid);
    await db.runAsync(
      "INSERT INTO sessions (id, training_day_id, started_at) VALUES (?, ?, ?)",
      sid,
      dayId,
      Date.now(),
    );
  };

  // ── Phase transition detection ──
  const advanceExercise = useCallback(
    (fromIdx: number) => {
      const current = exercises[fromIdx];
      const next = exercises[fromIdx + 1];
      if (!next) {
        setIsFinished(true);
        if (sessionId) endSession(db, sessionId, false);
        if (activeTrainingDayId) {
          if (isCombatSession) {
            updateCombatScheduleState(db, activeTrainingDayId);
          } else {
            updateScheduleState(db, activeTrainingDayId);
          }
        }
        return;
      }
      if (current && next.phase !== current.phase) {
        setTransition({
          from: current.phase,
          to: next.phase,
          isCombat: isCombatSession,
        });
      } else {
        setCurrentIdx(fromIdx + 1);
        setCurrentSet(1);
        setCurrentSide(null);
        setBoxingRound(1);
      }
    },
    [exercises, sessionId, activeTrainingDayId, db, isCombatSession],
  );

  const onTransitionDone = useCallback(() => {
    setTransition(null);
    setCurrentIdx((prev) => {
      setCurrentSet(1);
      setCurrentSide(null);
      setBoxingRound(1);
      return prev + 1;
    });
  }, []);

  // ── Log a reps set ──
  const handleDoneSet = useCallback(async () => {
    if (!currentExercise || !sessionId) return;

    // each_side flow: null → left → right → done
    if (
      currentExercise.exercise_type === "reps_each_side" ||
      currentExercise.exercise_type === "timed_each_side"
    ) {
      if (currentSide === null) {
        setCurrentSide("left");
        return;
      }
      // log current side
      await db.runAsync(
        "INSERT INTO sets (id, session_id, exercise_id, set_number, reps, side, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
        sessionId,
        currentExercise.exercise_id,
        currentSet,
        currentExercise.reps ?? 0,
        currentSide,
        Date.now(),
      );
      setLoggedSets((prev) => [
        ...prev,
        {
          set_number: currentSet,
          reps: currentExercise.reps ?? 0,
          side: currentSide,
          exercise_id: currentExercise.exercise_id,
        },
      ]);

      if (currentSide === "left") {
        setCurrentSide("right");
        return;
      }
      // both sides done — advance set/exercise
      setCurrentSide(null);
    } else {
      // standard reps
      await db.runAsync(
        "INSERT INTO sets (id, session_id, exercise_id, set_number, reps, side, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
        sessionId,
        currentExercise.exercise_id,
        currentSet,
        currentExercise.reps ?? 0,
        null,
        Date.now(),
      );
      setLoggedSets((prev) => [
        ...prev,
        {
          set_number: currentSet,
          reps: currentExercise.reps ?? 0,
          side: null,
          exercise_id: currentExercise.exercise_id,
        },
      ]);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );

    if (currentSet < currentExercise.sets) {
      setCurrentSet((prev) => prev + 1);
      restTimer.start(currentExercise.rest_seconds);
    } else {
      restTimer.start(currentExercise.rest_seconds);
      advanceExercise(currentIdx);
    }
  }, [
    currentExercise,
    currentIdx,
    currentSet,
    currentSide,
    sessionId,
    db,
    restTimer,
    advanceExercise,
  ]);

  // ── Timed exercise auto-advance ──
  const handleTimedComplete = useCallback(async () => {
    if (!currentExercise || !sessionId) return;

    if (currentExercise.exercise_type === "timed_each_side") {
      if (currentSide === null) {
        setCurrentSide("left");
        return;
      }
      if (currentSide === "left") {
        setCurrentSide("right");
        return;
      }
      setCurrentSide(null);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );

    if (currentSet < currentExercise.sets) {
      setCurrentSet((prev) => prev + 1);
      restTimer.start(currentExercise.rest_seconds);
    } else {
      restTimer.start(currentExercise.rest_seconds);
      advanceExercise(currentIdx);
    }
  }, [
    currentExercise,
    currentIdx,
    currentSet,
    currentSide,
    sessionId,
    db,
    restTimer,
    advanceExercise,
  ]);

  // ── Circuit auto-advance ──
  const handleCircuitStepComplete = useCallback(() => {
    if (!currentExercise) return;
    const circuitExercises = exercises.filter((e) => e.phase === "circuit");
    const nextIdx = circuitExIdx + 1;
    if (nextIdx < circuitExercises.length) {
      setCircuitExIdx(nextIdx);
      setCurrentIdx(exercises.indexOf(circuitExercises[nextIdx]));
    } else if (circuitRound < 3) {
      setCircuitRound((prev) => prev + 1);
      setCircuitExIdx(0);
      setCurrentIdx(exercises.indexOf(circuitExercises[0]));
    } else {
      // All 3 rounds done — advance past circuit
      const firstNonCircuit = exercises.findIndex(
        (e, i) => i > currentIdx && e.phase !== "circuit",
      );
      if (firstNonCircuit !== -1) {
        setTransition({
          from: "circuit",
          to: exercises[firstNonCircuit].phase,
          isCombat: isCombatSession,
        });
      } else {
        setIsFinished(true);
        if (sessionId) endSession(db, sessionId, false);
        if (activeTrainingDayId) {
          if (isCombatSession) {
            updateCombatScheduleState(db, activeTrainingDayId);
          } else {
            updateScheduleState(db, activeTrainingDayId);
          }
        }
      }
    }
  }, [
    circuitExIdx,
    circuitRound,
    exercises,
    currentIdx,
    sessionId,
    db,
    activeTrainingDayId,
    isCombatSession,
  ]);

  // ── Boxing round auto-advance ──
  const handleBoxingRoundComplete = useCallback(() => {
    if (!currentExercise) return;
    if (boxingRound < currentExercise.sets) {
      setBoxingRound((prev) => prev + 1);
    } else {
      setBoxingRound(1);
      advanceExercise(currentIdx);
    }
  }, [boxingRound, currentExercise, currentIdx, advanceExercise]);

  // ── Nav ──
  const handlePrevExercise = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setCurrentSet(1);
      setCurrentSide(null);
      setBoxingRound(1);
    }
  }, [currentIdx]);

  const handleNextExercise = useCallback(() => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setCurrentSet(1);
      setCurrentSide(null);
      setBoxingRound(1);
    }
  }, [currentIdx, exercises.length]);

  // ── Exit ──
  const handleExitConfirm = useCallback(async () => {
    if (sessionId) await endSession(db, sessionId, true);
    setExitVisible(false);
    router.back();
  }, [sessionId, db, router]);

  // ─── FINISHED state ────────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <SafeAreaView style={st.container}>
        <View style={st.finishedContainer}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={48}
            color={invictusTheme.accent}
          />
          <Text style={st.finishedTitle}>WORKOUT COMPLETE</Text>
          <Text style={st.finishedSub}>Close this loop.</Text>
          <MotivatorBar text={motivator} />
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={st.doneButton}
            labelStyle={st.doneButtonLabel}
            contentStyle={{ paddingVertical: 8 }}
          >
            DONE
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Phase transition ──────────────────────────────────────────────────────
  if (transitionState) {
    return (
      <PhaseTransition
        from={transitionState.from}
        to={transitionState.to}
        onDone={onTransitionDone}
        isCombat={transitionState.isCombat}
      />
    );
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (!currentExercise) {
    return (
      <SafeAreaView style={st.container}>
        <Text style={st.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const exType = currentExercise.exercise_type;
  const isTimed = exType === "timed" || exType === "timed_each_side";
  const isCircuit = exType === "circuit_timed";
  const isBoxingRound = exType === "boxing_round";

  const currentPhaseExIdx =
    exercises
      .filter((e) => e.phase === currentExercise.phase)
      .indexOf(currentExercise) + 1;
  const totalPhaseEx = exercises.filter(
    (e) => e.phase === currentExercise.phase,
  ).length;

  // ─── CIRCUIT layout ────────────────────────────────────────────────────────
  if (isCircuit) {
    const circuitExs = exercises.filter((e) => e.phase === "circuit");
    const nextCircuit = circuitExs[circuitExIdx + 1] ?? null;
    return (
      <SafeAreaView style={st.container}>
        <View style={st.sessionHeader}>
          <IconButton
            icon="arrow-left"
            onPress={() => setExitVisible(true)}
            iconColor={invictusTheme.text}
          />
          <Text style={st.sessionHeaderText}>
            Exercise {currentIdx + 1} of {exercises.length}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <CircuitPanel
          exercise={currentExercise}
          nextExerciseName={nextCircuit?.name ?? null}
          round={circuitRound}
          totalRounds={3}
          onCircuitComplete={handleCircuitStepComplete}
        />
        <ExitDialog
          visible={exitVisible}
          onResume={() => setExitVisible(false)}
          onEnd={handleExitConfirm}
        />
      </SafeAreaView>
    );
  }

  // ─── BOXING ROUND layout ──────────────────────────────────────────────────
  if (isBoxingRound) {
    return (
      <SafeAreaView style={st.container}>
        <View style={st.sessionHeader}>
          <IconButton
            icon="arrow-left"
            onPress={() => setExitVisible(true)}
            iconColor={invictusTheme.text}
          />
          <View style={st.sessionHeaderCenter}>
            <Text style={st.sessionHeaderText}>
              {isCombatSession
                ? `COMBAT — DAY ${activeTrainingDayId.replace("combat_", "").toUpperCase()}`
                : `Exercise ${currentIdx + 1} of ${exercises.length}`}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={st.content}>
          <View style={st.phaseRow}>
            <View style={st.phaseBadge}>
              <Text style={st.phaseBadgeText}>
                {getPhaseLabel(currentExercise.phase, isCombatSession)}
              </Text>
            </View>
          </View>
          {currentExercise.notes ? (
            <Text style={st.coachNote}>{currentExercise.notes}</Text>
          ) : null}
          <BoxingRoundPanel
            exercise={currentExercise}
            round={boxingRound}
            totalRounds={currentExercise.sets}
            onRoundComplete={handleBoxingRoundComplete}
          />
        </ScrollView>
        <ExitDialog
          visible={exitVisible}
          onResume={() => setExitVisible(false)}
          onEnd={handleExitConfirm}
        />
      </SafeAreaView>
    );
  }

  // ─── REP / TIMED layout ───────────────────────────────────────────────────
  const loggedForCurrentEx = loggedSets.filter(
    (ls) => ls.exercise_id === currentExercise.exercise_id,
  );

  // Determine button label for each_side exercises
  let doneSetLabel = "DONE SET";
  if (exType === "reps_each_side") {
    if (currentSide === null) doneSetLabel = "START LEFT SIDE";
    else if (currentSide === "left") doneSetLabel = "DONE LEFT — SWITCH RIGHT";
    else doneSetLabel = "DONE RIGHT SIDE";
  }

  return (
    <SafeAreaView style={st.container}>
      {/* Minimal session header */}
      <View style={st.sessionHeader}>
        <IconButton
          icon="arrow-left"
          onPress={() => setExitVisible(true)}
          iconColor={invictusTheme.text}
        />
        <Text style={st.sessionHeaderText}>
          Exercise {currentIdx + 1} of {exercises.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={st.content}>
        {/* Phase badge */}
        <View style={st.phaseRow}>
          <View style={st.phaseBadge}>
            <Text style={st.phaseBadgeText}>
              {getPhaseLabel(currentExercise.phase, isCombatSession)}
            </Text>
          </View>
          <Text style={st.phasePosition}>
            {currentPhaseExIdx} of {totalPhaseEx}
          </Text>
        </View>

        {/* Exercise name + set info */}
        <Text style={st.exerciseName}>{currentExercise.name}</Text>
        <Text style={st.setInfo}>
          Set {currentSet} of {currentExercise.sets}
        </Text>

        {/* Side label for each_side */}
        {currentSide && !isTimed && (
          <Text style={st.sideLabel}>{currentSide.toUpperCase()} SIDE</Text>
        )}

        {/* Coaching note */}
        {currentExercise.notes ? (
          <Text style={st.coachNote}>{currentExercise.notes}</Text>
        ) : null}

        {/* Exercise Animation — Body sessions only */}
        {!isCombatSession && (
          <VideoPlaceholder
            exerciseName={currentExercise.name}
            media={EXERCISE_MEDIA[currentExercise.exercise_id]}
          />
        )}

        {/* Work timer — hidden while rest timer is running to prevent overlap.
            key forces full remount (and timer restart) on each new set/side. */}
        {isTimed && !restTimer.isRunning && (
          <TimedPanel
            key={`${currentSet}-${currentSide ?? 'ns'}`}
            holdSeconds={currentExercise.hold_seconds}
            side={exType === "timed_each_side" ? currentSide : null}
            onComplete={handleTimedComplete}
          />
        )}

        {/* DONE SET button — only for reps exercises */}
        {!isTimed && (
          <Button
            mode="contained"
            onPress={handleDoneSet}
            style={st.doneSetButton}
            labelStyle={st.doneSetLabel}
            contentStyle={{ paddingVertical: 8 }}
            icon={() => (
              <MaterialCommunityIcons
                name="check"
                size={18}
                color={invictusTheme.bg}
              />
            )}
          >
            {doneSetLabel}
          </Button>
        )}

        {/* Rest timer bar */}
        <TimerBar
          remaining={restTimer.remaining}
          progress={restTimer.progress}
          isRunning={restTimer.isRunning}
          onSkip={restTimer.skip}
        />

        {/* Sets progress */}
        <View style={st.setsList}>
          {Array.from({ length: currentExercise.sets }, (_, i) => {
            const setNum = i + 1;
            const isCompl = currentSet > setNum;
            const isCurr = currentSet === setNum;
            const logged = loggedForCurrentEx.filter(
              (ls) => ls.set_number === setNum,
            );
            return (
              <SetRow
                key={setNum}
                setNumber={setNum}
                reps={
                  isCompl
                    ? (logged[0]?.reps ?? currentExercise.reps ?? 0)
                    : (currentExercise.reps ?? 0)
                }
                holdSeconds={isTimed ? currentExercise.hold_seconds : undefined}
                isCompleted={isCompl}
                isCurrent={isCurr}
                showSide={currentExercise.each_side ? currentSide : null}
              />
            );
          })}
        </View>

        {/* Prev / Next nav */}
        <View style={st.navButtons}>
          <Button
            mode="outlined"
            onPress={handlePrevExercise}
            disabled={currentIdx === 0}
            textColor={invictusTheme.text}
            style={st.navBtn}
            icon={() => (
              <MaterialCommunityIcons
                name="arrow-left"
                size={16}
                color={invictusTheme.text}
              />
            )}
          >
            PREV
          </Button>
          {currentIdx < exercises.length - 1 && (
            <Button
              mode="outlined"
              onPress={handleNextExercise}
              textColor={invictusTheme.text}
              style={st.navBtn}
              contentStyle={{ flexDirection: "row-reverse" }}
              icon={() => (
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color={invictusTheme.text}
                />
              )}
            >
              NEXT
            </Button>
          )}
        </View>

        <MotivatorBar text={motivator} />
      </ScrollView>

      {/* Exit confirm dialog */}
      <ExitDialog
        visible={exitVisible}
        onResume={() => setExitVisible(false)}
        onEnd={handleExitConfirm}
      />
    </SafeAreaView>
  );
}

// ─── Exit Dialog ──────────────────────────────────────────────────────────────
function ExitDialog({
  visible,
  onResume,
  onEnd,
}: {
  visible: boolean;
  onResume: () => void;
  onEnd: () => void;
}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onResume} style={st.dialog}>
        <Dialog.Icon
          icon={() => (
            <MaterialCommunityIcons
              name="alert-outline"
              size={28}
              color={invictusTheme.accent}
            />
          )}
        />
        <Dialog.Title style={st.dialogTitle}>End Workout?</Dialog.Title>
        <Dialog.Content>
          <Text style={st.dialogContent}>
            Your progress so far will be saved.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onResume} textColor={invictusTheme.text}>
            RESUME
          </Button>
          <Button onPress={onEnd} textColor={invictusTheme.danger}>
            END SESSION
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: invictusTheme.bg },
  content: {
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
    paddingBottom: 60,
  },
  loadingText: {
    color: invictusTheme.textMuted,
    textAlign: "center",
    marginTop: 80,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "900",
    letterSpacing: 2,
  },

  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: invictusTheme.spacing.xs,
    paddingTop: invictusTheme.spacing.xs,
    backgroundColor: invictusTheme.bg,
  },
  sessionHeaderText: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sessionHeaderCenter: {
    flex: 1,
    alignItems: "center",
  },

  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: invictusTheme.spacing.sm,
  },
  phaseBadge: {
    backgroundColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.sm,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  phaseBadgeText: {
    color: invictusTheme.accent,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 2,
  },
  phasePosition: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "700",
  },

  exerciseName: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xl,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  setInfo: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: -4,
  },
  sideLabel: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.lg,
    fontWeight: "900",
    letterSpacing: 2,
    borderLeftWidth: 4,
    borderLeftColor: invictusTheme.accent,
    paddingLeft: invictusTheme.spacing.sm,
  },
  coachNote: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "600",
    fontStyle: "italic",
    backgroundColor: invictusTheme.surfaceHigh,
    padding: invictusTheme.spacing.md,
    borderWidth: 1.5,
    borderColor: invictusTheme.ink,
  },

  timedPanel: {
    alignItems: "center",
    gap: invictusTheme.spacing.md,
    paddingVertical: invictusTheme.spacing.md,
    backgroundColor: invictusTheme.surface,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
  timedCounter: {
    color: invictusTheme.ink,
    fontSize: 84,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  timedProgress: {
    width: "90%",
    height: 10,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
  },
  timedActions: { flexDirection: "row", gap: invictusTheme.spacing.sm },
  skipBtn: { borderWidth: 2, borderColor: invictusTheme.ink, borderRadius: 0 },

  boxingPanel: {
    alignItems: "center",
    gap: invictusTheme.spacing.md,
    paddingVertical: invictusTheme.spacing.lg,
    backgroundColor: invictusTheme.surface,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
  boxingRoundBadge: {
    color: invictusTheme.bg,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "900",
    backgroundColor: invictusTheme.combatAccent,
    paddingHorizontal: invictusTheme.spacing.md,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    letterSpacing: 1,
    overflow: "hidden",
  },
  boxingPhaseBadge: {
    backgroundColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.md,
    paddingVertical: 4,
  },
  boxingPhaseText: {
    color: invictusTheme.accent,
    fontWeight: "900",
    fontSize: invictusTheme.fontSizes.md,
    letterSpacing: 3,
  },
  boxingPhaseRestText: {
    color: invictusTheme.combatAccent,
  },
  boxingNextLabel: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  boxingEndBtn: {
    borderWidth: 2,
    borderColor: invictusTheme.combatAccent,
    borderRadius: 0,
  },

  circuitPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: invictusTheme.spacing.lg,
    paddingHorizontal: invictusTheme.spacing.md,
    backgroundColor: invictusTheme.surface,
    borderWidth: 3,
    borderColor: invictusTheme.ink,
    marginHorizontal: invictusTheme.spacing.md,
    marginTop: invictusTheme.spacing.xl,
    borderBottomWidth: 8,
    borderRightWidth: 8,
  },
  circuitRoundBadge: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "900",
    backgroundColor: invictusTheme.accent,
    paddingHorizontal: invictusTheme.spacing.md,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    letterSpacing: 1,
  },
  circuitPhaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.md,
    paddingVertical: 4,
  },
  circuitPhaseText: {
    color: invictusTheme.bg,
    fontWeight: "900",
    fontSize: invictusTheme.fontSizes.md,
    letterSpacing: 3,
  },
  circuitPhaseRest: { color: invictusTheme.accent },
  nextLabel: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  doneSetButton: {
    borderRadius: 0,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    backgroundColor: invictusTheme.accent,
  },
  doneSetLabel: {
    color: invictusTheme.ink,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: invictusTheme.fontSizes.md,
  },

  setsList: { gap: invictusTheme.spacing.xs },

  navButtons: { flexDirection: "row", gap: invictusTheme.spacing.sm },
  navBtn: {
    flex: 1,
    borderColor: invictusTheme.ink,
    borderWidth: 2,
    borderRadius: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    backgroundColor: invictusTheme.surface,
  },

  finishedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: invictusTheme.spacing.xl,
    gap: invictusTheme.spacing.xl,
    backgroundColor: invictusTheme.bg,
  },
  finishedTitle: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xxl,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: invictusTheme.accent,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  finishedSub: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  doneButton: {
    borderRadius: 0,
    minWidth: 200,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    backgroundColor: invictusTheme.success,
  },
  doneButtonLabel: {
    color: invictusTheme.bg,
    fontWeight: "900",
    letterSpacing: 3,
  },

  // Phase transition
  transitionWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: invictusTheme.spacing.xl,
    backgroundColor: invictusTheme.bg,
  },
  transitionCard: {
    backgroundColor: invictusTheme.surface,
    padding: invictusTheme.spacing.xl,
    gap: invictusTheme.spacing.lg,
    alignItems: "center",
    width: "100%",
    borderWidth: 4,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 12,
    borderRightWidth: 12,
    borderRadius: 0,
  },
  transitionFrom: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.lg,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  transitionTo: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  transitionBar: {
    width: "100%",
    height: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
  },

  // Dialog
  dialog: {
    backgroundColor: invictusTheme.surface,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: invictusTheme.ink,
  },
  dialogTitle: {
    color: invictusTheme.ink,
    textAlign: "center",
    fontWeight: "900",
    fontSize: invictusTheme.fontSizes.xl,
    letterSpacing: 1,
  },
  dialogContent: {
    color: invictusTheme.ink,
    textAlign: "center",
    fontWeight: "600",
    fontSize: invictusTheme.fontSizes.md,
  },
});
