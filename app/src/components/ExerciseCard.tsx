import { Image, StyleSheet, Text, View } from "react-native";
import { invictusTheme } from "../constants/theme";

interface ExerciseCardProps {
  name: string;
  muscleGroup: string;
  gifPath: string | null;
  isTimed: boolean;
  eachSide: boolean;
  phase: string;
}

export function ExerciseCard({
  name,
  muscleGroup,
  gifPath,
  isTimed,
  eachSide,
  phase,
}: ExerciseCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {muscleGroup}
            {isTimed ? " · timed" : ""}
            {eachSide ? " · each side" : ""}
          </Text>
        </View>
        <View style={[styles.phaseBadge, phaseBadgeStyle(phase)]}>
          <Text style={styles.phaseText}>{phaseLabel(phase)}</Text>
        </View>
      </View>
      <View style={styles.gifContainer}>
        {gifPath ? (
          <Image
            source={{ uri: gifPath }}
            style={styles.gif}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {muscleGroup.split("/")[0]}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case "warmup":
      return "WARM-UP";
    case "main":
      return "MAIN";
    case "abs":
      return "ABS";
    case "circuit":
      return "CIRCUIT";
    case "cooldown":
      return "COOL-DOWN";
    default:
      return phase.toUpperCase();
  }
}

function phaseBadgeStyle(phase: string) {
  switch (phase) {
    case "main":
    case "abs":
    case "circuit":
      return { backgroundColor: invictusTheme.accent + "33" };
    case "cooldown":
      return { backgroundColor: invictusTheme.textMuted + "33" };
    default:
      return { backgroundColor: invictusTheme.textMuted + "22" };
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: invictusTheme.surface,
    borderRadius: invictusTheme.radius.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.sm,
  },
  name: {
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.lg,
    fontWeight: "700",
  },
  meta: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.xs,
    marginTop: 2,
  },
  phaseBadge: {
    paddingHorizontal: invictusTheme.spacing.sm,
    paddingVertical: invictusTheme.spacing.xs,
    borderRadius: invictusTheme.radius.sm,
  },
  phaseText: {
    color: invictusTheme.text,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  gifContainer: {
    height: 200,
    backgroundColor: invictusTheme.bg,
  },
  gif: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.xl,
    fontWeight: "600",
    opacity: 0.3,
  },
});
