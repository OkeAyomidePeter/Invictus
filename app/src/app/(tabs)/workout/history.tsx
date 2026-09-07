import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { invictusTheme } from "../../../constants/theme";
import { getSessions, getSessionSets } from "../../../db/workoutDb";
import { formatDuration } from "../../../utils/formatTime";
import type { Session } from "../../../db/workoutDb";
import { AppHeader } from "../../../components/AppHeader";

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [sessions, setSessions] = useState<
    (Session & { totalSets?: number })[]
  >([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const s = await getSessions(db);
    const withSets = await Promise.all(
      s.map(async (session) => {
        const sets = await getSessionSets(db, session.id);
        return { ...session, totalSets: sets.length };
      }),
    );
    setSessions(withSets);
  };

  return (
    <SafeAreaView style={st.container} edges={["top"]}>
      <AppHeader title="HISTORY" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={st.content}>
        {sessions.length === 0 && (
          <Text style={st.emptyText}>No sessions yet.</Text>
        )}
        {sessions.map((session) => (
          <View key={session.id} style={st.card}>
            <Text style={st.cardDate}>
              {new Date(session.started_at)
                .toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .toUpperCase()}
            </Text>
            <Text style={st.cardSub}>
              {session.training_day_id?.toUpperCase() ?? "FREE"}
              {session.ended_at
                ? `  —  ${formatDuration(session.started_at, session.ended_at)}`
                : "  —  IN PROGRESS"}
              {session.ended_early ? "  —  ENDED EARLY" : ""}
            </Text>
            <View style={st.badge}>
              <Text style={st.badgeText}>{session.totalSets ?? 0} SETS</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: invictusTheme.bg },
  content: {
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
    paddingBottom: 120,
  },
  emptyText: {
    color: invictusTheme.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: invictusTheme.surface,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.xs,
  },
  cardDate: {
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardSub: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "600",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: invictusTheme.accent,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.sm,
    paddingVertical: 2,
    marginTop: invictusTheme.spacing.xs,
  },
  badgeText: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
