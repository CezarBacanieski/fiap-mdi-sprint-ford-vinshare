import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, gradients, spacing, typography } from "../../constants/theme";
import { Reward } from "../../types";
import ThemedButton from "./ThemedButton";
import ThemedCard from "./ThemedCard";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface RewardCardProps {
  reward: Reward;
  canRedeem: boolean;
  onRedeem: () => void;
}

export default function RewardCard({ reward, canRedeem, onRedeem }: RewardCardProps) {
  return (
    <ThemedCard gradient={canRedeem ? gradients.card : ["#1A1A1A", "#101010"]} style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={reward.icon as IconName}
          size={26}
          color={canRedeem ? colors.primaryLight : colors.textMuted}
        />
      </View>
      <Text style={styles.title}>{reward.title}</Text>
      <Text style={styles.description}>{reward.description}</Text>
      <Text style={[styles.points, canRedeem ? styles.pointsActive : styles.pointsMuted]}>
        {reward.pointsNeeded.toLocaleString("pt-BR")} pts
      </Text>
      <ThemedButton
        title="Resgatar"
        onPress={onRedeem}
        disabled={!canRedeem}
        compact
        variant={canRedeem ? "primary" : "outline"}
      />
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 154,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(27,92,255,0.14)",
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 42,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
    minHeight: 40,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginVertical: spacing.sm,
    minHeight: 48,
  },
  points: {
    ...typography.header,
    marginBottom: spacing.md,
  },
  pointsActive: {
    color: colors.warning,
  },
  pointsMuted: {
    color: colors.textMuted,
  },
});
