import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, gradients, radius, shadow, spacing } from "../../constants/theme";

type GradientColors = readonly [string, string, ...string[]];

interface ThemedCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  gradient?: GradientColors;
  onPress?: () => void;
}

export default function ThemedCard({
  children,
  style,
  contentStyle,
  gradient = gradients.card,
  onPress,
}: ThemedCardProps) {
  const card = (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, style]}>
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </LinearGradient>
  );

  if (!onPress) return card;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow,
  },
  inner: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
