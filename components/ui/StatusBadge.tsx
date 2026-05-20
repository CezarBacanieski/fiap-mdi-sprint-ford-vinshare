import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../constants/theme";
import { ServiceStatus, UrgencyLevel, UserTier } from "../../types";

type BadgeTone = "success" | "warning" | "danger" | "info" | "muted" | "premium";

interface StatusBadgeProps {
  label: ServiceStatus | UrgencyLevel | UserTier | string;
  tone?: BadgeTone;
}

const toneColors: Record<BadgeTone, { background: string; text: string; border: string }> = {
  success: { background: "rgba(0,200,83,0.15)", text: colors.success, border: colors.success },
  warning: { background: "rgba(255,214,0,0.16)", text: colors.warning, border: colors.warning },
  danger: { background: "rgba(200,16,46,0.16)", text: colors.accent, border: colors.accent },
  info: { background: "rgba(27,92,255,0.18)", text: colors.primaryLight, border: colors.primaryLight },
  muted: { background: "rgba(160,160,160,0.12)", text: colors.textSecondary, border: colors.border },
  premium: { background: "rgba(255,255,255,0.14)", text: colors.white, border: colors.white },
};

const inferTone = (label: string): BadgeTone => {
  if (["Concluido", "Baixa"].includes(label)) return "success";
  if (["Agendado", "Confirmado", "Media", "Prata"].includes(label)) return "warning";
  if (["Em andamento", "Bronze"].includes(label)) return "info";
  if (["Alta", "Critica", "Cancelado"].includes(label)) return "danger";
  if (["Ouro", "Platinum"].includes(label)) return "premium";
  return "muted";
};

export default function StatusBadge({ label, tone }: StatusBadgeProps) {
  const normalizedTone = tone ?? inferTone(label);
  const palette = toneColors[normalizedTone];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.background, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.caption,
    textTransform: "uppercase",
  },
});
