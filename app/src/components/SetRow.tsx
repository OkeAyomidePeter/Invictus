import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { invictusTheme } from "../constants/theme";

interface SetRowProps {
  setNumber: number;
  reps: number;
  isCompleted: boolean;
  isCurrent: boolean;
  holdSeconds?: number;
  showSide?: "left" | "right" | null;
}

export function SetRow({
  setNumber,
  reps,
  isCompleted,
  isCurrent,
  holdSeconds,
  showSide,
}: SetRowProps) {
  const label = showSide
    ? `SET ${setNumber} (${showSide.toUpperCase()})`
    : `SET ${setNumber}`;
  const valueText =
    holdSeconds != null && holdSeconds > 0
      ? `${holdSeconds}S`
      : isCompleted
        ? `${reps} REPS`
        : isCurrent
          ? "..."
          : `${reps} REPS`;

  return (
    <View
      style={[
        st.container,
        isCurrent && st.current,
        isCompleted && st.completed,
      ]}
    >
      <View style={st.indicator}>
        {isCompleted ? (
          <View style={st.checkWrap}>
            <MaterialCommunityIcons
              name="check"
              size={14}
              color={invictusTheme.ink}
            />
          </View>
        ) : isCurrent ? (
          <View style={st.dot} />
        ) : (
          <View style={st.emptyDot} />
        )}
      </View>
      <Text style={[st.text, isCompleted && st.completedText]}>{label}</Text>
      <Text style={[st.reps, isCompleted && st.completedText]}>
        {valueText}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: invictusTheme.spacing.sm,
    paddingHorizontal: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
    borderWidth: 1.5,
    borderColor: invictusTheme.border,
    backgroundColor: invictusTheme.surface,
  },
  current: {
    borderColor: invictusTheme.ink,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    backgroundColor: invictusTheme.surfaceHigh,
    zIndex: 1,
  },
  completed: {
    opacity: 0.6,
    backgroundColor: invictusTheme.bg,
  },
  indicator: {
    width: 24,
    alignItems: "center",
  },
  checkWrap: {
    backgroundColor: invictusTheme.accent,
    borderWidth: 1.5,
    borderColor: invictusTheme.ink,
    padding: 2,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: invictusTheme.accent,
    borderWidth: 1.5,
    borderColor: invictusTheme.ink,
  },
  emptyDot: {
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: invictusTheme.ink,
  },
  text: {
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "800",
    letterSpacing: 0.5,
    flex: 1,
  },
  reps: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "900",
  },
  completedText: {
    color: invictusTheme.textMuted,
    textDecorationLine: "line-through",
  },
});
