import * as Haptics from "expo-haptics";
import { ComponentProps } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { colors, radius } from "../../constants/theme";

interface ThemedButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: ComponentProps<typeof Button>["icon"];
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ThemedButton({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  compact,
  style,
}: ThemedButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void onPress();
  };

  return (
    <Button
      mode={isGhost ? "text" : "contained"}
      icon={icon}
      disabled={disabled}
      loading={loading}
      compact={compact}
      onPress={handlePress}
      buttonColor={isPrimary ? colors.primary : isSecondary ? colors.accent : colors.surfaceElevated}
      textColor={isGhost ? colors.primaryLight : colors.textPrimary}
      style={[styles.button, !isPrimary && !isSecondary && styles.outline, style]}
      labelStyle={styles.label}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.sm,
    justifyContent: "center",
  },
  outline: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
