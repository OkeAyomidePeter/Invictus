import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { invictusTheme } from "../constants/theme";

interface Field {
  key: string;
  label: string;
}

interface JournalSectionProps {
  title: string;
  sectionKey: string;
  fields: Field[];
  values: Record<string, string>;
  numericFields?: string[];
  toggleFields?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  onChange: (key: string, value: string) => void;
}

export function JournalSection({
  title,
  sectionKey,
  fields,
  values,
  numericFields = [],
  toggleFields = [],
  onChange,
}: JournalSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const allFilled =
    fields.every((f) => {
      const v = values[f.key];
      return v !== undefined && v !== null && v.toString().trim().length > 0;
    }) &&
    toggleFields.every((tf) => {
      const v = values[tf.key];
      return v !== undefined && v !== null && v.length > 0;
    });

  const toggleOpen = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <View style={st.container}>
      <Pressable onPress={toggleOpen} style={st.header}>
        <View style={st.headerLeft}>
          <View style={st.badge}>
            <Text style={st.badgeText}>{sectionKey}</Text>
          </View>
          <Text style={st.title}>{title.toUpperCase()}</Text>
        </View>
        <View style={[st.checkCircle, allFilled && st.checked]}>
          {allFilled && (
            <MaterialCommunityIcons
              name="check"
              size={16}
              color={invictusTheme.ink}
            />
          )}
        </View>
      </Pressable>
      {expanded && (
        <View style={st.fields}>
          {fields.map((field) => (
            <View key={field.key} style={st.fieldRow}>
              <Text style={st.fieldLabel}>{field.label.toUpperCase()}</Text>
              <TextInput
                style={st.input}
                value={values[field.key] ?? ""}
                onChangeText={(v) => onChange(field.key, v)}
                placeholder="..."
                placeholderTextColor={invictusTheme.textMuted + "88"}
                multiline
                textAlignVertical="top"
                keyboardType={
                  numericFields.includes(field.key) ? "numeric" : "default"
                }
              />
            </View>
          ))}
          {toggleFields.map((tf) => (
            <View key={tf.key} style={st.fieldRow}>
              <Text style={st.fieldLabel}>{tf.label.toUpperCase()}</Text>
              <View style={st.toggleRow}>
                {tf.options.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => onChange(tf.key, opt.value)}
                    style={[
                      st.toggleBtn,
                      values[tf.key] === opt.value && st.toggleActive,
                    ]}
                  >
                    <Text
                      style={[
                        st.toggleText,
                        values[tf.key] === opt.value && st.toggleTextActive,
                      ]}
                    >
                      {opt.label.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
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
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: invictusTheme.spacing.md,
    backgroundColor: invictusTheme.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: invictusTheme.spacing.sm,
  },
  badge: {
    backgroundColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: invictusTheme.accent,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.sm,
    fontWeight: "900",
    letterSpacing: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: invictusTheme.accent,
  },
  fields: {
    padding: invictusTheme.spacing.md,
    gap: invictusTheme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: invictusTheme.ink,
    backgroundColor: invictusTheme.bg,
  },
  fieldRow: {
    gap: invictusTheme.spacing.xs,
  },
  fieldLabel: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: invictusTheme.surface,
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.sm,
    padding: invictusTheme.spacing.sm,
    minHeight: 80,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    gap: invictusTheme.spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: invictusTheme.spacing.sm,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    alignItems: "center",
    backgroundColor: invictusTheme.surface,
  },
  toggleActive: {
    backgroundColor: invictusTheme.accent,
  },
  toggleText: {
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.xs,
    fontWeight: "900",
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: invictusTheme.ink,
  },
});
