import { Stack } from "expo-router";
import { invictusTheme } from "../../../constants/theme";

export default function CognitiveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: invictusTheme.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="anchored" />
    </Stack>
  );
}
