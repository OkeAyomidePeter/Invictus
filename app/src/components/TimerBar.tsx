import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { invictusTheme } from "../constants/theme";
import { formatTime } from "../utils/formatTime";

interface TimerBarProps {
  remaining: number;
  progress: number;
  isRunning: boolean;
  onSkip: () => void;
}

export function TimerBar({
  remaining,
  progress,
  isRunning,
  onSkip,
}: TimerBarProps) {
  if (!isRunning && remaining === 0) return null;

  return (
    <View style={st.container}>
      <View style={st.row}>
        <Text style={st.label}>REST</Text>
        <Text style={st.time}>{formatTime(remaining)}</Text>
      </View>
      <View style={st.progressBg}>
        <View
          style={[st.progressFill, { width: `${(1 - progress) * 100}%` }]}
        />
      </View>
      <Button
        mode="contained"
        onPress={onSkip}
        buttonColor={invictusTheme.ink}
        textColor={invictusTheme.accent}
        style={st.skipButton}
        labelStyle={st.skipLabel}
      >
        SKIP REST
      </Button>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    backgroundColor: invictusTheme.surface,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  time: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xl,
    fontWeight: "900",
  },
  progressBg: {
    height: 12,
    backgroundColor: invictusTheme.surfaceHigh,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
  },
  progressFill: {
    height: "100%",
    backgroundColor: invictusTheme.accent,
  },
  skipButton: {
    marginTop: invictusTheme.spacing.xs,
    borderRadius: 0,
  },
  skipLabel: {
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
