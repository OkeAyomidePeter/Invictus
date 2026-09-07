import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { invictusTheme } from "../../../constants/theme";
import { JournalSection } from "../../../components/JournalSection";
import { todayISO } from "../../../utils/formatTime";
import { getJournalEntry, saveJournalEntry } from "../../../db/cognitiveDb";
import { AppHeader } from "../../../components/AppHeader";

export default function JournalScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const today = todayISO();

  const [values, setValues] = useState<Record<string, string>>({});
  const [sectionsDone, setSectionsDone] = useState(0);

  useEffect(() => {
    loadEntry();
  }, []);

  const loadEntry = async () => {
    const entry = await getJournalEntry(db, today, "cognitive");
    if (entry) {
      const v: Record<string, string> = {};
      Object.entries(entry).forEach(([key, val]) => {
        if (val !== null && val !== undefined) v[key] = String(val);
      });
      setValues(v);
    }
  };

  const handleChange = useCallback(async (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => persistEntry(), 500);
    return () => clearTimeout(timer);
  }, [values]);

  const persistEntry = async () => {
    const id =
      values.id ||
      Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    await saveJournalEntry(db, {
      id,
      date: today,
      type: "cognitive" as const,
      created_at: Date.now(),
      attention_drift: values.attention_drift ?? null,
      attention_trigger: values.attention_trigger ?? null,
      attention_recovery: values.attention_recovery ?? null,
      impulse_urge: values.impulse_urge ?? null,
      impulse_intensity: values.impulse_intensity
        ? parseInt(values.impulse_intensity)
        : null,
      impulse_gated: values.impulse_gated
        ? parseInt(values.impulse_gated)
        : null,
      obs_person: values.obs_person ?? null,
      obs_environment: values.obs_environment ?? null,
      obs_internal: values.obs_internal ?? null,
      thinking_idea: values.thinking_idea ?? null,
      thinking_doubt: values.thinking_doubt ?? null,
      thinking_disproof: values.thinking_disproof ?? null,
      alignment_served_future: values.alignment_served_future
        ? parseInt(values.alignment_served_future)
        : null,
      alignment_correction: values.alignment_correction ?? null,
      anchored_source: null,
      anchored_central_idea: null,
      anchored_doubt: null,
      anchored_connection: null,
      anchored_implication: null,
    });
  };

  useEffect(() => {
    const sectionKeys = [
      "attention",
      "impulse",
      "obs",
      "thinking",
      "alignment",
    ];
    const done = sectionKeys.reduce((acc, section) => {
      const fields = getSectionFields(section);
      const allFilled = fields.every(
        (f) => (values[f]?.toString()?.trim()?.length ?? 0) > 0,
      );
      return acc + (allFilled ? 1 : 0);
    }, 0);
    setSectionsDone(done);
  }, [values]);

  return (
    <SafeAreaView style={st.container} edges={["top"]}>
      <AppHeader title="DAILY JOURNAL" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={st.content}>
        <View style={st.progressRow}>
          <View style={st.progressBadge}>
            <Text style={st.progressText}>{sectionsDone} / 5 SECTIONS</Text>
          </View>
          <Text style={st.dateText}>{today}</Text>
        </View>

        <JournalSection
          title="Attention Log"
          sectionKey="A"
          fields={[
            { key: "attention_drift", label: "When did attention drift?" },
            { key: "attention_trigger", label: "What triggered it?" },
            { key: "attention_recovery", label: "What brought it back?" },
          ]}
          values={values}
          onChange={handleChange}
        />
        <JournalSection
          title="Impulse & Pressure Log"
          sectionKey="B"
          fields={[
            { key: "impulse_urge", label: "What urges appeared?" },
            { key: "impulse_intensity", label: "Intensity (1-10)" },
          ]}
          numericFields={["impulse_intensity"]}
          toggleFields={[
            {
              key: "impulse_gated",
              label: "Did I gate or leak?",
              options: [
                { value: "1", label: "GATED" },
                { value: "0", label: "LEAKED" },
              ],
            },
          ]}
          values={values}
          onChange={handleChange}
        />
        <JournalSection
          title="Observation Log"
          sectionKey="C"
          fields={[
            { key: "obs_person", label: "One detail about a person" },
            { key: "obs_environment", label: "One environmental detail" },
            { key: "obs_internal", label: "One internal state noticed" },
          ]}
          values={values}
          onChange={handleChange}
        />
        <JournalSection
          title="Thinking Quality Check"
          sectionKey="D"
          fields={[
            { key: "thinking_idea", label: "One idea consumed" },
            { key: "thinking_doubt", label: "Why might it be wrong?" },
            { key: "thinking_disproof", label: "What would disprove it?" },
          ]}
          values={values}
          onChange={handleChange}
        />
        <JournalSection
          title="Alignment Check"
          sectionKey="E"
          fields={[
            {
              key: "alignment_correction",
              label: "One small correction for tomorrow",
            },
          ]}
          toggleFields={[
            {
              key: "alignment_served_future",
              label: "Did today serve future-you?",
              options: [
                { value: "1", label: "YES" },
                { value: "0", label: "NO" },
              ],
            },
          ]}
          values={values}
          onChange={handleChange}
        />
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
  container: { flex: 1, backgroundColor: invictusTheme.bg },
  content: {
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
    paddingBottom: 120,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBadge: {
    backgroundColor: invictusTheme.accent,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.sm,
    paddingVertical: 2,
  },
  progressText: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1,
  },
  dateText: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
  },
});
