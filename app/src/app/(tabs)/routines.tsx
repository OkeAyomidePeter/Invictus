import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { invictusTheme } from "../../constants/theme";
import { AppHeader } from "../../components/AppHeader";

export default function RoutinesScreen() {
  const db = useSQLiteContext();
  const [routines, setRoutines] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    const r = await db.getAllAsync(
      "SELECT * FROM routines ORDER BY created_at DESC",
    );
    setRoutines(r);
  };

  const createRoutine = useCallback(async () => {
    if (!newName.trim()) return;
    await db.runAsync(
      "INSERT INTO routines (id, name, created_at, is_default) VALUES (?, ?, ?, 0)",
      Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      newName.trim(),
      Date.now(),
    );
    setNewName("");
    loadRoutines();
    Keyboard.dismiss();
  }, [newName, db]);

  const deleteRoutine = useCallback(
    async (id: string) => {
      Alert.alert("DELETE ROUTINE?", "THIS ACTION IS PERMANENT.", [
        { text: "CANCEL", style: "cancel" },
        {
          text: "DELETE",
          style: "destructive",
          onPress: async () => {
            await db.runAsync(
              "DELETE FROM routine_exercises WHERE routine_id = ?",
              id,
            );
            await db.runAsync("DELETE FROM routines WHERE id = ?", id);
            loadRoutines();
          },
        },
      ]);
    },
    [db],
  );

  const startEdit = useCallback((routine: any) => {
    setEditingId(routine.id);
    setEditName(routine.name);
  }, []);

  const saveEdit = useCallback(async () => {
    if (editingId && editName.trim()) {
      await db.runAsync(
        "UPDATE routines SET name = ? WHERE id = ?",
        editName.trim(),
        editingId,
      );
    }
    setEditingId(null);
    loadRoutines();
    Keyboard.dismiss();
  }, [editingId, editName, db]);

  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <AppHeader title="ROUTINES" />
      <ScrollView
        style={st.container}
        contentContainerStyle={st.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={st.addRow}>
          <TextInput
            style={st.input}
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={createRoutine}
            placeholder="NEW ROUTINE NAME"
            placeholderTextColor={invictusTheme.textMuted}
            returnKeyType="done"
          />
          <IconButton
            icon="plus"
            mode="contained"
            containerColor={invictusTheme.accent}
            iconColor={invictusTheme.ink}
            size={32}
            onPress={createRoutine}
            style={st.addBtn}
          />
        </View>

        {routines.map((routine) => (
          <View key={routine.id} style={st.card}>
            {editingId === routine.id ? (
              <TextInput
                style={st.editInput}
                value={editName}
                onChangeText={setEditName}
                onBlur={saveEdit}
                onSubmitEditing={saveEdit}
                autoFocus
                placeholderTextColor={invictusTheme.textMuted}
                returnKeyType="done"
              />
            ) : (
              <TouchableOpacity
                onLongPress={() => deleteRoutine(routine.id)}
                onPress={() => startEdit(routine)}
                activeOpacity={0.8}
                style={st.cardInner}
              >
                <Text style={st.routineName}>{routine.name.toUpperCase()}</Text>
                <Text style={st.hintText}>LONG PRESS TO DELETE</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: invictusTheme.bg },
  container: { flex: 1, backgroundColor: invictusTheme.bg },
  content: {
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
    paddingBottom: 100,
  },
  addRow: {
    flexDirection: "row",
    gap: invictusTheme.spacing.sm,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: invictusTheme.surface,
    color: invictusTheme.ink,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    padding: invictusTheme.spacing.md,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "700",
  },
  addBtn: {
    margin: 0,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    height: 56,
    width: 56,
  },
  card: {
    backgroundColor: invictusTheme.surface,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 5,
    borderRightWidth: 5,
  },
  cardInner: { padding: invictusTheme.spacing.md, gap: 4 },
  routineName: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "900",
    letterSpacing: 1,
  },
  hintText: { color: invictusTheme.textMuted, fontSize: 10, fontWeight: "600" },
  editInput: {
    padding: invictusTheme.spacing.md,
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "900",
  },
});
