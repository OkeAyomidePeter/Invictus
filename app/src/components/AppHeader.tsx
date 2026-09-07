import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { invictusTheme } from "../constants/theme";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onRightPress?: () => void;
}

export function AppHeader({
  title,
  showBack,
  onBack,
  rightIcon,
  onRightPress,
}: AppHeaderProps) {
  return (
    <View style={st.container}>
      {showBack ? (
        <View
          style={st.backBtn}
          onStartShouldSetResponder={() => {
            onBack?.();
            return true;
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={invictusTheme.ink}
          />
        </View>
      ) : (
        <View style={st.placeholder} />
      )}

      <Text style={st.title}>{title}</Text>

      {rightIcon && onRightPress ? (
        <View
          style={st.rightBtn}
          onStartShouldSetResponder={() => {
            onRightPress?.();
            return true;
          }}
        >
          <MaterialCommunityIcons
            name={rightIcon}
            size={22}
            color={invictusTheme.ink}
          />
        </View>
      ) : (
        <View style={st.placeholder} />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: invictusTheme.surface,
    borderBottomWidth: 3,
    borderBottomColor: invictusTheme.ink,
    paddingHorizontal: invictusTheme.spacing.md,
    paddingVertical: invictusTheme.spacing.sm,
    minHeight: 56,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: invictusTheme.ink,
    fontSize: invictusTheme.fontSizes.md,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  placeholder: { width: 40 },
  backBtn: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: invictusTheme.surface,
  },
  rightBtn: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: invictusTheme.surface,
  },
});
