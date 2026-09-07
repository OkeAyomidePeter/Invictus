import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { invictusTheme } from "../../constants/theme";
import { formatDate, todayISO, yesterdayISO } from "../../utils/formatTime";
import {
  getTodayMotivator,
  WORKOUT_MOTIVATORS,
} from "../../constants/motivators";
import { getScheduleState, getCombatScheduleState } from "../../db/workoutDb";
import { getTodosByDate } from "../../db/todoDb";
import type { TodoItem } from "../../db/todoDb";
import { getJournalEntry } from "../../db/cognitiveDb";
import { AppHeader } from "../../components/AppHeader";
import {
  getTodaySessionType,
  getNextBodyDay,
  getNextCombatDay,
  TRAINING_DAYS,
} from "../../constants/schedule";

function getNextTrainingDayLabel(lastDayId: string | null): {
  dayId: string;
  label: string;
} {
  const days: Record<string, { next: string; label: string }> = {
    day1: { next: "day2", label: "Day 2 — Upper Body + Core" },
    day2: { next: "day3", label: "Day 3 — Glutes + Legs" },
    day3: { next: "day4", label: "Day 4 — Full Body Circuit" },
    day4: { next: "day1", label: "Day 1 — Glute Focus" },
  };
  if (!lastDayId) return { dayId: "day1", label: "Day 1 — Glute Focus" };
  const current = days[lastDayId] ?? {
    next: "day1",
    label: "Day 1 — Glute Focus",
  };
  return {
    dayId: current.next,
    label: current.label,
  };
}

function getCombatDayLabel(dayId: string): string {
  const meta = TRAINING_DAYS.find((d) => d.id === dayId);
  if (!meta) return "Combat Day";
  const dayLetter = dayId.replace("combat_", "").toUpperCase();
  return `Day ${dayLetter} — ${meta.name}`;
}

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [nextDay, setNextDay] = useState({
    dayId: "day1",
    label: "Day 1 — Glute Focus",
  });
  const [combatDay, setCombatDay] = useState({
    dayId: "combat_a",
    label: "Day A — Boxing Mechanics",
  });
  const [alignmentCheck, setAlignmentCheck] = useState<string | null>(null);
  const [journalDone, setJournalDone] = useState(false);
  const today = todayISO();
  const yesterday = yesterdayISO();
  const motivator = getTodayMotivator(WORKOUT_MOTIVATORS);
  const sessionType = getTodaySessionType();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await getTodosByDate(db, today);
    setTodos(t);

    const state = await getScheduleState(db);
    setNextDay(getNextTrainingDayLabel(state?.last_training_day_id ?? null));

    const combatState = await getCombatScheduleState(db);
    const nextCombatId = getNextCombatDay(
      combatState?.last_training_day_id ?? null,
    );
    setCombatDay({
      dayId: nextCombatId,
      label: getCombatDayLabel(nextCombatId),
    });

    // Fetch yesterday's alignment check
    const yesterdayEntry = await getJournalEntry(db, yesterday, "cognitive");
    if (yesterdayEntry?.alignment_correction) {
      setAlignmentCheck(yesterdayEntry.alignment_correction);
    }

    // Fetch today's journal status
    const todayEntry = await getJournalEntry(db, today, "cognitive");
    if (todayEntry) {
      const sectionKeys = [
        "attention",
        "impulse",
        "obs",
        "thinking",
        "alignment",
      ];
      const isDone = sectionKeys.every((section) => {
        const fields = getSectionFields(section);
        return fields.every(
          (f) =>
            (todayEntry[f as keyof typeof todayEntry]?.toString()?.trim()
              ?.length ?? 0) > 0,
        );
      });
      setJournalDone(isDone);
    }
  };

  const toggleTodo = useCallback(
    async (todo: TodoItem) => {
      await db.runAsync(
        "UPDATE todos SET completed = ? WHERE id = ?",
        todo.completed ? 0 : 1,
        todo.id,
      );
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: t.completed ? 0 : 1 } : t,
        ),
      );
    },
    [db],
  );

  const doneTodos = todos.filter((t) => t.completed === 1).length;

  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <AppHeader title="TODAY" />
      <ScrollView style={st.scroll} contentContainerStyle={st.content}>
        {/* Date header */}
        <View style={st.dateBlock}>
          <Text style={st.dateLabel}>
            {formatDate(new Date()).toUpperCase()}
          </Text>
          <View style={st.dateLine} />
        </View>

        {/* Alignment Check Reminder (if exists from yesterday) */}
        {alignmentCheck && (
          <View style={[st.box, st.alignmentBox]}>
            <View style={st.boxHeader}>
              <Text style={st.boxTitle}>YESTERDAY'S CORRECTION</Text>
              <MaterialCommunityIcons
                name="target"
                size={16}
                color={invictusTheme.ink}
              />
            </View>
            <Text style={st.alignmentText}>{alignmentCheck.toUpperCase()}</Text>
          </View>
        )}

        {/* Workout CTA — ALWAYS SHOWS */}
        <View
          style={[
            st.workoutCard,
            sessionType !== "body" && {
              backgroundColor: invictusTheme.surfaceHigh,
              borderColor: invictusTheme.textMuted,
            },
          ]}
        >
          <View style={st.workoutTagRow}>
            <View
              style={[
                st.workoutTag,
                sessionType !== "body" && {
                  backgroundColor: invictusTheme.textMuted,
                },
              ]}
            >
              <Text
                style={[
                  st.workoutTagText,
                  sessionType !== "body" && { color: invictusTheme.bg },
                ]}
              >
                BODY
              </Text>
            </View>
          </View>
          <Text
            style={[
              st.workoutTitle,
              sessionType !== "body" && { color: invictusTheme.textMuted },
            ]}
          >
            {nextDay.label.toUpperCase()}
          </Text>

          {sessionType === "body" ? (
            <TouchableOpacity
              style={st.startBtn}
              onPress={() =>
                router.push({
                  pathname: "/workout/session",
                  params: { trainingDayId: nextDay.dayId },
                })
              }
              activeOpacity={0.9}
            >
              <Text style={st.startBtnText}>START WORKOUT</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={invictusTheme.ink}
              />
            </TouchableOpacity>
          ) : (
            <View style={st.restDayBadge}>
              <Text style={st.restDayText}>REST DAY</Text>
            </View>
          )}
        </View>

        {/* Combat CTA — ALWAYS SHOWS */}
        <View
          style={[
            st.combatCard,
            sessionType !== "combat" && {
              backgroundColor: invictusTheme.surfaceHigh,
              borderColor: invictusTheme.textMuted,
            },
          ]}
        >
          <View style={st.workoutTagRow}>
            <View
              style={[
                st.workoutTag,
                {
                  backgroundColor:
                    sessionType === "combat"
                      ? invictusTheme.combatAccent
                      : invictusTheme.textMuted,
                },
              ]}
            >
              <Text
                style={[
                  st.workoutTagText,
                  sessionType !== "combat" && { color: invictusTheme.bg },
                ]}
              >
                COMBAT
              </Text>
            </View>
          </View>
          <Text
            style={[
              st.workoutTitle,
              sessionType !== "combat" && { color: invictusTheme.textMuted },
            ]}
          >
            {combatDay.label.toUpperCase()}
          </Text>

          {sessionType === "combat" ? (
            <TouchableOpacity
              style={st.combatStartBtn}
              onPress={() =>
                router.push({
                  pathname: "/workout/session",
                  params: { trainingDayId: combatDay.dayId },
                })
              }
              activeOpacity={0.9}
            >
              <Text style={st.combatStartBtnText}>START ROUND</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={invictusTheme.bg}
              />
            </TouchableOpacity>
          ) : (
            <View style={st.restDayBadge}>
              <Text style={st.restDayText}>REST DAY</Text>
            </View>
          )}
        </View>

        {/* Journal Status */}
        <View style={[st.box, journalDone && st.journalDoneBox]}>
          <View style={st.boxHeader}>
            <Text style={st.boxTitle}>DAILY JOURNAL</Text>
            <View style={[st.boxBadge, journalDone && st.journalBadgeDone]}>
              <Text style={st.boxBadgeText}>
                {journalDone ? "DONE" : "PENDING"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={st.journalBtn}
            onPress={() => router.push("/(tabs)/cognitive/journal")}
          >
            <Text style={st.journalBtnText}>
              {journalDone ? "VIEW TODAY'S ENTRY" : "COMPLETE DAILY SESSIONS"}
            </Text>
            <MaterialCommunityIcons
              name={journalDone ? "notebook-check" : "notebook-edit"}
              size={20}
              color={invictusTheme.ink}
            />
          </TouchableOpacity>
        </View>

        {/* To-Do Box */}
        <View style={st.box}>
          <View style={st.boxHeader}>
            <Text style={st.boxTitle}>TO-DO</Text>
            <View style={st.boxBadge}>
              <Text style={st.boxBadgeText}>
                {doneTodos}/{todos.length}
              </Text>
            </View>
          </View>
          {todos.length === 0 && (
            <TouchableOpacity onPress={() => router.push("/(tabs)/todo")}>
              <Text style={st.addText}>+ Add tasks for today</Text>
            </TouchableOpacity>
          )}
          {todos.slice(0, 5).map((todo) => (
            <TouchableOpacity
              key={todo.id}
              style={st.todoRow}
              onPress={() => toggleTodo(todo)}
              activeOpacity={0.85}
            >
              <View
                style={[st.checkbox, todo.completed === 1 && st.checkboxDone]}
              >
                {todo.completed === 1 && (
                  <MaterialCommunityIcons
                    name="check"
                    size={12}
                    color={invictusTheme.ink}
                  />
                )}
              </View>
              <Text
                style={[st.todoText, todo.completed === 1 && st.todoDone]}
                numberOfLines={1}
              >
                {todo.text}
              </Text>
            </TouchableOpacity>
          ))}
          {todos.length > 5 && (
            <Text style={st.moreText}>+ {todos.length - 5} more</Text>
          )}
        </View>

        {/* Motivator */}
        <View style={st.motivatorBlock}>
          <View style={st.motivatorBar} />
          <Text style={st.motivatorText}>"{motivator}"</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getSectionFields(section: string): string[] {
  switch (section) {
    case "attention":
      return ["attention_drift", "attention_trigger", "attention_recovery"];
    case "impulse":
      return ["impulse_urge", "impulse_intensity", "impulse_gated"];
    case "obs":
      return ["obs_person", "obs_environment", "obs_internal"];
    case "thinking":
      return ["thinking_idea", "thinking_doubt", "thinking_disproof"];
    case "alignment":
      return ["alignment_served_future", "alignment_correction"];
    default:
      return [];
  }
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: invictusTheme.bg },
  scroll: { flex: 1, backgroundColor: invictusTheme.bg },
  content: {
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.lg,
    paddingBottom: 120,
  },

  // Date
  dateBlock: { gap: invictusTheme.spacing.xs },
  dateLabel: {
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 3,
    color: invictusTheme.textMuted,
  },
  dateLine: { height: 3, backgroundColor: invictusTheme.ink },

  // Workout card — the hero element
  workoutCard: {
    backgroundColor: invictusTheme.accent,
    borderWidth: 3,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 7,
    borderRightWidth: 7,
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
  },
  workoutTagRow: { flexDirection: "row" },
  workoutTag: {
    backgroundColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.sm,
    paddingVertical: 2,
  },
  workoutTagText: {
    color: invictusTheme.accent,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 2,
  },
  workoutTitle: {
    fontSize: invictusTheme.fontSizes.xl,
    fontWeight: "900",
    color: invictusTheme.ink,
    letterSpacing: 1,
    lineHeight: 30,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.md,
    paddingVertical: invictusTheme.spacing.sm,
  },
  startBtnText: {
    color: invictusTheme.accent,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: invictusTheme.fontSizes.md,
  },

  // Generic box
  box: {
    backgroundColor: invictusTheme.surface,
    borderWidth: 3,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 7,
    borderRightWidth: 7,
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.sm,
  },
  boxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  boxTitle: {
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    color: invictusTheme.ink,
    letterSpacing: 2,
  },
  boxBadge: {
    backgroundColor: invictusTheme.ink,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  boxBadgeText: {
    color: invictusTheme.bg,
    fontSize: 10,
    fontWeight: "900",
  },

  // Alignment specific
  alignmentBox: {
    backgroundColor: invictusTheme.surfaceHigh,
    borderColor: invictusTheme.ink,
  },
  alignmentText: {
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "900",
    color: invictusTheme.ink,
    letterSpacing: 0.5,
  },

  // Journal specific
  journalDoneBox: {
    borderColor: invictusTheme.success,
  },
  journalBadgeDone: {
    backgroundColor: invictusTheme.success,
  },
  journalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: invictusTheme.surfaceHigh,
    padding: invictusTheme.spacing.sm,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
  },
  journalBtnText: {
    color: invictusTheme.ink,
    fontWeight: "800",
    fontSize: invictusTheme.fontSizes.sm,
    letterSpacing: 1,
  },

  // To-do
  addText: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontStyle: "italic",
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: invictusTheme.spacing.sm,
    paddingVertical: 3,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: invictusTheme.accent },
  todoText: {
    flex: 1,
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "600",
  },
  todoDone: {
    textDecorationLine: "line-through",
    color: invictusTheme.textMuted,
  },
  moreText: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "600",
  },

  // Combat card
  combatCard: {
    backgroundColor: invictusTheme.ink,
    borderWidth: 3,
    borderColor: invictusTheme.combatAccent,
    borderBottomWidth: 7,
    borderRightWidth: 7,
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
  },
  combatStartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: invictusTheme.combatAccent,
    paddingHorizontal: invictusTheme.spacing.md,
    paddingVertical: invictusTheme.spacing.sm,
  },
  combatStartBtnText: {
    color: invictusTheme.bg,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: invictusTheme.fontSizes.md,
  },

  // Motivator
  motivatorBlock: {
    flexDirection: "row",
    gap: invictusTheme.spacing.sm,
    alignItems: "flex-start",
  },
  motivatorBar: { width: 4, backgroundColor: invictusTheme.ink, minHeight: 40 },
  motivatorText: {
    flex: 1,
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontStyle: "italic",
    lineHeight: 20,
  },

  // Rest state
  restDayBadge: {
    backgroundColor: invictusTheme.bg,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    paddingVertical: invictusTheme.spacing.xs,
    paddingHorizontal: invictusTheme.spacing.md,
    alignSelf: "flex-start",
  },
  restDayText: {
    color: invictusTheme.textMuted,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: invictusTheme.fontSizes.xs,
  },
});
