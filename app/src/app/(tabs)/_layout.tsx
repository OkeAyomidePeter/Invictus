import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { invictusTheme } from "../../constants/theme";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const TABS: Array<{
  name: string;
  title: string;
  icon: IconName;
  iconFocused: IconName;
}> = [
  { name: "index", title: "TODAY", icon: "home-outline", iconFocused: "home" },
  {
    name: "workout",
    title: "WORKOUT",
    icon: "dumbbell",
    iconFocused: "dumbbell",
  },
  {
    name: "cognitive",
    title: "JOURNAL",
    icon: "notebook-outline",
    iconFocused: "notebook",
  },
  {
    name: "routines",
    title: "PLAN",
    icon: "clipboard-list-outline",
    iconFocused: "clipboard-list",
  },
  {
    name: "todo",
    title: "TO-DO",
    icon: "checkbox-marked-outline",
    iconFocused: "checkbox-marked",
  },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: invictusTheme.ink,
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <View style={[styles.iconWrap, focused && styles.iconActive]}>
                <MaterialCommunityIcons
                  name={focused ? tab.iconFocused : tab.icon}
                  size={20}
                  color={focused ? invictusTheme.ink : "#888888"}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: invictusTheme.surface,
    borderTopWidth: 3,
    borderTopColor: invictusTheme.ink,
    height: 85,
    paddingBottom: 25,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  tabItem: {
    paddingTop: 8,
  },
  iconWrap: {
    padding: 4,
    borderRadius: 0,
  },
  iconActive: {
    backgroundColor: invictusTheme.accent,
    borderWidth: 2,
    borderColor: invictusTheme.ink,
  },
});
