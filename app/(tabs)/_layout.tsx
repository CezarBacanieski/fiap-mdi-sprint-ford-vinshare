import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors, radius, spacing } from "../../constants/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const tabIcon = (name: IconName) => {
  return ({ color, size }: { color: string; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingBottom: spacing.sm,
          paddingTop: spacing.sm,
        },
        tabBarItemStyle: {
          borderRadius: radius.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          letterSpacing: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio", tabBarIcon: tabIcon("view-dashboard-outline") }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{ title: "Veiculos", tabBarIcon: tabIcon("car-multiple") }}
      />
      <Tabs.Screen
        name="services"
        options={{ title: "Servicos", tabBarIcon: tabIcon("wrench-clock") }}
      />
      <Tabs.Screen
        name="rewards"
        options={{ title: "Pontos", tabBarIcon: tabIcon("trophy-outline") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: tabIcon("account-circle-outline") }}
      />
    </Tabs>
  );
}
