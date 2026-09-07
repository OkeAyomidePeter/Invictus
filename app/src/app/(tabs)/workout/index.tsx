import { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Alert, Platform } from "react-native";
import { Button, Text, TouchableRipple, Divider } from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Clipboard from "expo-clipboard";
import { invictusTheme } from "../../../constants/theme";
import { getSessions } from "../../../db/workoutDb";
import { exportAsJSON, importData } from "../../../db/exportDb";
import { formatDuration } from "../../../utils/formatTime";
import type { Session } from "../../../db/workoutDb";
import { AppHeader } from "../../../components/AppHeader";

export default function WorkoutHubScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = useCallback(() => {
    getSessions(db).then(setSessions);
  }, [db]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleExport = async () => {
    try {
      const json = await exportAsJSON(db);
      const filename = `invictus_data_${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        await Clipboard.setStringAsync(json);
        Alert.alert(
          "Exported",
          "Data copied to clipboard (file sharing unavailable)",
        );
      }
    } catch (err) {
      Alert.alert("Export Failed", (err as Error).message);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      "Import Data",
      "This will OVERWRITE all current data. Ensure you have a backup string in your clipboard.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "IMPORT FROM CLIPBOARD",
          style: "destructive",
          onPress: async () => {
            try {
              const content = await Clipboard.getStringAsync();
              if (!content || !content.trim().startsWith("{")) {
                throw new Error("Clipboard does not contain valid JSON data.");
              }
              const payload = JSON.parse(content);
              await importData(db, payload);
              Alert.alert("Success", "Data restored. Please restart the app.");
              loadSessions();
            } catch (err) {
              Alert.alert("Import Failed", (err as Error).message);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={st.safeArea} edges={["top"]}>
      <AppHeader title="WORKOUT" />
      <ScrollView style={st.container} contentContainerStyle={st.content}>
        <TouchableRipple
          onPress={() => router.push("/workout/session")}
          style={st.primaryBtn}
        >
          <Text style={st.primaryBtnText}>START SESSION</Text>
        </TouchableRipple>

        <TouchableRipple
          onPress={() => router.push("/(tabs)/workout/history")}
          style={st.secondaryBtn}
        >
          <Text style={st.secondaryBtnText}>VIEW HISTORY</Text>
        </TouchableRipple>

        <View style={st.sectionHeader}>
          <Text style={st.sectionTitle}>RECENT SESSIONS</Text>
        </View>

        {sessions.length === 0 ? (
          <Text style={st.emptyText}>
            No sessions yet. Start your first workout.
          </Text>
        ) : (
          sessions.slice(0, 5).map((session) => (
            <View key={session.id} style={st.card}>
              <Text style={st.cardDate}>
                {new Date(session.started_at).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={st.cardSub}>
                {session.training_day_id?.toUpperCase() ?? "FREE SESSION"}
                {session.ended_at
                  ? `  —  ${formatDuration(session.started_at, session.ended_at)}`
                  : "  —  IN PROGRESS"}
              </Text>
            </View>
          ))
        )}

        <View style={{ marginTop: 24 }}>
          <Divider style={{ height: 2, backgroundColor: invictusTheme.ink }} />
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>DATA PERSISTENCE</Text>
          </View>
          <Text style={st.dataText}>
            Export your data for external AI processing or to migrate to a new
            device.
          </Text>

          <View style={st.dataActionRow}>
            <Button
              mode="outlined"
              onPress={handleExport}
              style={st.dataBtn}
              textColor={invictusTheme.ink}
              labelStyle={st.dataBtnLabel}
            >
              EXPORT
            </Button>
            <Button
              mode="outlined"
              onPress={handleImport}
              style={st.dataBtn}
              textColor={invictusTheme.ink}
              labelStyle={st.dataBtnLabel}
            >
              IMPORT
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: invictusTheme.bg },
  container: { flex: 1, backgroundColor: invictusTheme.bg },
  content: {
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
    paddingBottom: 120,
  },
  primaryBtn: {
    backgroundColor: invictusTheme.accent,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    paddingVertical: invictusTheme.spacing.md,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: invictusTheme.fontSizes.lg,
    fontWeight: "900",
    color: invictusTheme.ink,
    letterSpacing: 2,
  },
  secondaryBtn: {
    backgroundColor: invictusTheme.surface,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    paddingVertical: invictusTheme.spacing.md,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "700",
    color: invictusTheme.ink,
    letterSpacing: 1,
  },
  emptyText: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    textAlign: "center",
    marginTop: invictusTheme.spacing.xl,
    fontStyle: "italic",
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
    textTransform: "uppercase",
  },
  cardSub: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "600",
  },
  sectionHeader: {
    marginTop: invictusTheme.spacing.md,
    marginBottom: invictusTheme.spacing.xs,
  },
  sectionTitle: {
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "900",
    color: invictusTheme.ink,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  dataText: {
    fontSize: invictusTheme.fontSizes.xs,
    color: invictusTheme.textMuted,
    fontStyle: "italic",
    marginBottom: invictusTheme.spacing.md,
    lineHeight: 18,
  },
  dataActionRow: {
    flexDirection: "row",
    gap: invictusTheme.spacing.md,
  },
  dataBtn: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
  },
  dataBtnLabel: {
    fontWeight: "900",
    letterSpacing: 1,
  },
});
