import { SQLiteProvider } from "expo-sqlite";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { initDatabase } from "../db/schema";
import { seedDatabase, seedCombatContent } from "../db/seed";
import { invictusTheme } from "../constants/theme";

// Neo-brutalist Paper theme: light base, accent primary, high contrast
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: invictusTheme.bg,
    surface: invictusTheme.surface,
    onSurface: invictusTheme.text,
    onSurfaceVariant: invictusTheme.textMuted,
    primary: invictusTheme.ink,
    onPrimary: invictusTheme.bg,
    secondary: invictusTheme.accent,
    error: invictusTheme.danger,
    outline: invictusTheme.ink,
  },
};

async function setupDatabase(db: any) {
  try {
    await initDatabase(db);
    await seedDatabase(db);
    await seedCombatContent(db);
  } catch (error) {
    console.error("FAILED TO INITIALIZE DATABASE:", error);
    // Even if seed fails, we want the app to open so user can see something.
  }
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SQLiteProvider databaseName="invictus.db" onInit={setupDatabase}>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            {/* Session is the ONLY screen that covers the tab bar intentionally */}
            <Stack.Screen
              name="workout/session"
              options={{ presentation: "fullScreenModal" }}
            />
          </Stack>
        </PaperProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: invictusTheme.bg },
});
