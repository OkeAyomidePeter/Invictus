import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { invictusTheme } from "../../../constants/theme";
import { todayISO } from "../../../utils/formatTime";
import { saveJournalEntry } from "../../../db/cognitiveDb";
import { AppHeader } from "../../../components/AppHeader";

const FIELDS = [
  { key: "source", label: "Source (book, video, article, etc.)" },
  { key: "centralIdea", label: "Central idea in 1–2 sentences" },
  { key: "doubt", label: "One thing I doubt or disagree with" },
  { key: "connection", label: "Connection to something I already know" },
  { key: "implication", label: "One implication for real life" },
];

export default function AnchoredJournalScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const today = todayISO();

  const [values, setValues] = useState<Record<string, string>>({
    source: "",
    centralIdea: "",
    doubt: "",
    connection: "",
    implication: "",
  });

  const wordCount = Object.values(values).reduce(
    (sum, text) => sum + text.split(/\s+/).filter(Boolean).length,
    0,
  );

  useEffect(() => {
    const timer = setTimeout(() => persistEntry(), 1000);
    return () => clearTimeout(timer);
  }, [values]);

  const persistEntry = useCallback(async () => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    await saveJournalEntry(db, {
      id,
      date: today,
      type: "anchored",
      created_at: Date.now(),
      anchored_source: values.source || null,
      anchored_central_idea: values.centralIdea || null,
      anchored_doubt: values.doubt || null,
      anchored_connection: values.connection || null,
      anchored_implication: values.implication || null,
      attention_drift: null,
      attention_trigger: null,
      attention_recovery: null,
      impulse_urge: null,
      impulse_intensity: null,
      impulse_gated: null,
      obs_person: null,
      obs_environment: null,
      obs_internal: null,
      thinking_idea: null,
      thinking_doubt: null,
      thinking_disproof: null,
      alignment_served_future: null,
      alignment_correction: null,
    });
  }, [values, today, db]);

  return (
    <SafeAreaView style={st.container} edges={["top"]}>
      <AppHeader
        title="ANCHORED READING"
        showBack
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={st.content}>
        <View style={st.counterRow}>
          <Text style={[st.counter, wordCount > 300 && st.counterOver]}>
            {wordCount} / 300 WORDS
          </Text>
        </View>

        {FIELDS.map((field) => (
          <View key={field.key} style={st.fieldBlock}>
            <Text style={st.label}>{field.label.toUpperCase()}</Text>
            <TextInput
              style={st.input}
              value={values[field.key]}
              onChangeText={(text) =>
                setValues((prev) => ({ ...prev, [field.key]: text }))
              }
              placeholder="..."
              placeholderTextColor={invictusTheme.textMuted + "88"}
              multiline
              textAlignVertical="top"
            />
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
  counterRow: { alignItems: "flex-end" },
  counter: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "700",
    letterSpacing: 1,
  },
  counterOver: { color: invictusTheme.danger },
  fieldBlock: { gap: invictusTheme.spacing.xs },
  label: {
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    borderLeftWidth: 3,
    borderLeftColor: invictusTheme.accent,
    paddingLeft: invictusTheme.spacing.sm,
  },
  input: {
    backgroundColor: invictusTheme.surface,
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.md,
    padding: invictusTheme.spacing.md,
    minHeight: 80,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    textAlignVertical: "top",
  },
});
