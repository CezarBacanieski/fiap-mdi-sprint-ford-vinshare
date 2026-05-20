import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../constants/theme";

interface NotificationBellProps {
  count: number;
  onPress?: () => void;
}

export default function NotificationBell({ count, onPress }: NotificationBellProps) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textPrimary} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.round,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radius.round,
    minWidth: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: -2,
    top: -2,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900",
  },
});
