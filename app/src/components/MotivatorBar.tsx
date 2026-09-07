import { StyleSheet, Text, View } from "react-native";
import { invictusTheme } from "../constants/theme";

interface MotivatorBarProps {
  text: string;
}

export function MotivatorBar({ text }: MotivatorBarProps) {
  return (
    <View style={st.container}>
      <View style={st.bar} />
      <Text style={st.text}>"{text}"</Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    paddingVertical: invictusTheme.spacing.md,
    paddingHorizontal: invictusTheme.spacing.md,
    flexDirection: "row",
    gap: invictusTheme.spacing.sm,
    alignItems: "flex-start",
  },
  bar: {
    width: 4,
    backgroundColor: invictusTheme.ink,
    minHeight: 40,
  },
  text: {
    flex: 1,
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    fontStyle: "italic",
    lineHeight: 20,
    fontWeight: "600",
  },
});
