import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, getHealthColor, radius, spacing, typography } from "../../constants/theme";

interface HealthBarProps {
  label: string;
  value: number;
}

export default function HealthBar({ label, value }: HealthBarProps) {
  const progress = useSharedValue(0);
  const healthColor = getHealthColor(value);

  useEffect(() => {
    progress.value = withTiming(value, { duration: 800 });
  }, [progress, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: healthColor }]}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: healthColor }, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  value: {
    ...typography.caption,
  },
  track: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.round,
    height: 9,
    overflow: "hidden",
  },
  fill: {
    borderRadius: radius.round,
    height: "100%",
  },
});
