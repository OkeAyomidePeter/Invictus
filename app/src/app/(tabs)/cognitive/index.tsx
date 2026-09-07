import { ScrollView, StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { invictusTheme } from "../../../constants/theme";
import {
  getTodayMotivator,
  COGNITIVE_MOTIVATORS,
} from "../../../constants/motivators";
import { AppHeader } from "../../../components/AppHeader";

export default function CognitiveHubScreen() {
  const router = useRouter();
  const motivator = getTodayMotivator(COGNITIVE_MOTIVATORS);

  return (
    <SafeAreaView style={st.safeArea} edges={["top"]}>
      <AppHeader title="JOURNAL" />
      <ScrollView style={st.container} contentContainerStyle={st.content}>
        <TouchableRipple
          onPress={() => router.push("/(tabs)/cognitive/journal")}
          style={st.card}
        >
          <View style={st.cardInner}>
            <View>
              <Text style={st.cardTitle}>DAILY JOURNAL</Text>
              <Text style={st.cardDesc}>
                A–E: Attention, Impulse, Observation, Thinking, Alignment
              </Text>
            </View>
            <View style={st.arrow}>
              <Text style={st.arrowText}>→</Text>
            </View>
          </View>
        </TouchableRipple>

        <TouchableRipple
          onPress={() => router.push("/(tabs)/cognitive/anchored")}
          style={st.card}
        >
          <View style={st.cardInner}>
            <View>
              <Text style={st.cardTitle}>ANCHORED READING</Text>
              <Text style={st.cardDesc}>Post-reading compression journal</Text>
            </View>
            <View style={st.arrow}>
              <Text style={st.arrowText}>→</Text>
            </View>
          </View>
        </TouchableRipple>

        <Text style={st.motivator}>{motivator}</Text>
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
  card: {
    backgroundColor: invictusTheme.surface,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
  },
  cardTitle: {
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  cardDesc: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    marginTop: 2,
  },
  arrow: { marginLeft: "auto" },
  arrowText: { fontSize: 22, fontWeight: "900", color: invictusTheme.ink },
  motivator: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: invictusTheme.spacing.xl,
  },
});
