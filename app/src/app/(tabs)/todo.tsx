import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Keyboard,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { invictusTheme } from "../../constants/theme";
import { todayISO } from "../../utils/formatTime";
import {
  getTodosByDate,
  addTodo,
  updateTodo,
  deleteTodo,
} from "../../db/todoDb";
import type { TodoItem } from "../../db/todoDb";
import { AppHeader } from "../../components/AppHeader";

export default function TodoScreen() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const today = todayISO();

  useEffect(() => {
    getTodosByDate(db, today).then(setTodos);
  }, []);

  const handleAdd = useCallback(async () => {
    if (!newText.trim()) return;
    const todo: TodoItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      text: newText.trim(),
      date: today,
      completed: 0,
      priority: 0,
      created_at: Date.now(),
    };
    await addTodo(db, todo);
    setTodos((prev) => [...prev, todo]);
    setNewText("");
    Keyboard.dismiss();
  }, [newText, today, db]);

  const handleToggle = useCallback(
    async (todo: TodoItem) => {
      const newCompleted = todo.completed ? 0 : 1;
      await updateTodo(db, todo.id, { completed: newCompleted });
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: newCompleted } : t,
        ),
      );
    },
    [db],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTodo(db, id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
    [db],
  );

  const handleLongPress = useCallback(
    async (todo: TodoItem) => {
      const newPriority = todo.priority ? 0 : 1;
      await updateTodo(db, todo.id, { priority: newPriority });
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, priority: newPriority } : t,
        ),
      );
    },
    [db],
  );

  const saveEdit = useCallback(async () => {
    if (editingId && editingText.trim()) {
      await updateTodo(db, editingId, { text: editingText.trim() });
      setTodos((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, text: editingText.trim() } : t,
        ),
      );
    }
    setEditingId(null);
    Keyboard.dismiss();
  }, [editingId, editingText, db]);

  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <AppHeader title="TO-DO" />
      <ScrollView
        style={st.container}
        contentContainerStyle={st.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={st.addRow}>
          <TextInput
            style={st.input}
            value={newText}
            onChangeText={setNewText}
            onSubmitEditing={handleAdd}
            placeholder="ADD A TASK..."
            placeholderTextColor={invictusTheme.textMuted}
            returnKeyType="done"
          />
          <IconButton
            icon="plus"
            mode="contained"
            containerColor={invictusTheme.accent}
            iconColor={invictusTheme.ink}
            size={32}
            onPress={handleAdd}
            style={st.addBtn}
          />
        </View>

        {todos.map((todo) => (
          <View
            key={todo.id}
            style={[st.card, todo.priority === 1 && st.priority]}
          >
            <View style={st.cardInner}>
              <TouchableOpacity
                onPress={() => handleToggle(todo)}
                onLongPress={() => handleLongPress(todo)}
                style={st.todoMain}
              >
                <View
                  style={[st.checkbox, todo.completed === 1 && st.checkboxDone]}
                >
                  {todo.completed === 1 && (
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color={invictusTheme.ink}
                    />
                  )}
                </View>
                {editingId === todo.id ? (
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    onBlur={saveEdit}
                    onSubmitEditing={saveEdit}
                    autoFocus
                    style={st.editInput}
                    returnKeyType="done"
                  />
                ) : (
                  <Text
                    style={[st.todoText, todo.completed === 1 && st.todoDone]}
                    onPress={() => {
                      setEditingId(todo.id);
                      setEditingText(todo.text);
                    }}
                  >
                    {todo.text.toUpperCase()}
                  </Text>
                )}
              </TouchableOpacity>
              <IconButton
                icon="close"
                iconColor={invictusTheme.danger}
                size={20}
                onPress={() => handleDelete(todo.id)}
              />
            </View>
          </View>
        ))}

        {todos.length === 0 && (
          <Text style={st.emptyText}>
            NO TASKS FOR TODAY. PULL THE TRIGGER.
          </Text>
        )}
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
  priority: { borderColor: invictusTheme.accent, borderLeftWidth: 8 },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: invictusTheme.spacing.md,
  },
  todoMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: invictusTheme.spacing.md,
    paddingVertical: invictusTheme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: invictusTheme.accent },
  todoText: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  todoDone: {
    textDecorationLine: "line-through",
    color: invictusTheme.textMuted,
  },
  editInput: {
    flex: 1,
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "800",
  },
  emptyText: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 40,
  },
});
