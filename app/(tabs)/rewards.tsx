import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Snackbar } from "react-native-paper";
import LoyaltyChart from "../../components/charts/LoyaltyChart";
import RewardCard from "../../components/ui/RewardCard";
import ScreenContainer from "../../components/ui/ScreenContainer";
import SkeletonBox from "../../components/ui/SkeletonBox";
import StatusBadge from "../../components/ui/StatusBadge";
import ThemedCard from "../../components/ui/ThemedCard";
import { earnMethods } from "../../constants/mockData";
import { colors, gradients, radius, spacing, typography } from "../../constants/theme";
import { useNotifications } from "../../hooks/useNotifications";
import { useRewardCatalog, useRewards } from "../../hooks/useRewards";
import { EarnMethod, Reward } from "../../types";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function AnimatedPoints({ points }: { points: number }) {
  const animatedPoints = useSharedValue(0);
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    animatedPoints.value = withTiming(points, { duration: 1000 });
  }, [animatedPoints, points]);

  useAnimatedReaction(
    () => Math.round(animatedPoints.value),
    (value, previous) => {
      if (value !== previous) {
        runOnJS(setDisplayPoints)(value);
      }
    },
  );

  return <Text style={styles.pointsNumber}>{displayPoints.toLocaleString("pt-BR")}</Text>;
}

export default function RewardsScreen() {
  const {
    user,
    transactions,
    currentTier,
    nextTier,
    pointsToNextTier,
    tierProgress,
    isLoading,
    redeemReward,
    addPoints,
  } = useRewards();
  const rewards = useRewardCatalog();
  const { sendPointsEarnedNotification } = useNotifications();
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleRedeem = async (reward: Reward) => {
    const redeemed = await redeemReward(reward);
    setSnackbarMessage(redeemed ? "Beneficio resgatado com sucesso." : "Pontos insuficientes.");
  };

  const handleEarn = async (method: EarnMethod) => {
    await addPoints(method.points, method.title);
    await sendPointsEarnedNotification(method.points, method.title);
    setSnackbarMessage(`+${method.points} pontos adicionados.`);
  };

  if (isLoading || !user) {
    return (
      <ScreenContainer>
        <SkeletonBox height={190} />
        <SkeletonBox height={140} style={styles.loadingGap} />
        <SkeletonBox height={260} style={styles.loadingGap} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ThemedCard gradient={gradients.blueCard} style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>SALDO FORD+</Text>
            <AnimatedPoints points={user.points} />
            <Text style={styles.pointsCaption}>pontos disponiveis</Text>
          </View>
          <StatusBadge label={currentTier.tier} tone="premium" />
        </View>
        <View style={styles.tierBlock}>
          <View style={styles.tierRow}>
            <Text style={styles.tierText}>{currentTier.tier}</Text>
            <Text style={styles.tierText}>{nextTier?.tier ?? "Maximo"}</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: `${tierProgress * 100}%` }]} />
          </View>
          <Text style={styles.tierHint}>
            {nextTier
              ? `${pointsToNextTier.toLocaleString("pt-BR")} pontos para ${nextTier.tier}`
              : "Voce chegou ao nivel Platinum."}
          </Text>
        </View>
      </ThemedCard>

      <Text style={styles.sectionHeader}>COMO GANHAR PONTOS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.earnRow}>
        {earnMethods.map((method) => (
          <Pressable key={method.id} onPress={() => void handleEarn(method)} style={styles.earnCard}>
            <MaterialCommunityIcons name={method.icon as IconName} size={30} color={colors.primaryLight} />
            <Text style={styles.earnTitle}>{method.title}</Text>
            <Text style={styles.earnPoints}>+{method.points} pts</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionHeader}>RESGATAR BENEFICIOS</Text>
      <View style={styles.rewardGrid}>
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            canRedeem={user.points >= reward.pointsNeeded}
            onRedeem={() => void handleRedeem(reward)}
          />
        ))}
      </View>

      <Text style={styles.sectionHeader}>EVOLUCAO</Text>
      <ThemedCard style={styles.chartCard}>
        <LoyaltyChart transactions={transactions} />
      </ThemedCard>

      <Text style={styles.sectionHeader}>HISTORICO DE PONTOS</Text>
      {transactions.slice(0, 5).map((transaction) => (
        <ThemedCard key={transaction.id} style={styles.transactionCard}>
          <View style={styles.transactionRow}>
            <View style={styles.transactionIcon}>
              <MaterialCommunityIcons
                name={transaction.points > 0 ? "plus-circle" : "minus-circle"}
                size={24}
                color={transaction.points > 0 ? colors.success : colors.accent}
              />
            </View>
            <View style={styles.transactionText}>
              <Text style={styles.transactionTitle}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>
                {format(parseISO(transaction.date), "dd MMM yyyy", { locale: ptBR })}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionPoints,
                { color: transaction.points > 0 ? colors.success : colors.accent },
              ]}
            >
              {transaction.points > 0 ? "+" : ""}
              {transaction.points}
            </Text>
          </View>
        </ThemedCard>
      ))}

      <Snackbar
        visible={snackbarMessage.length > 0}
        onDismiss={() => setSnackbarMessage("")}
        duration={1200}
      >
        {snackbarMessage}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingGap: {
    marginTop: spacing.lg,
  },
  headerCard: {
    marginBottom: spacing.xl,
  },
  headerTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  pointsNumber: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  pointsCaption: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tierBlock: {
    marginTop: spacing.xl,
  },
  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tierText: {
    ...typography.caption,
    color: colors.textPrimary,
    textTransform: "uppercase",
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.round,
    height: 10,
    marginVertical: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.warning,
    borderRadius: radius.round,
    height: "100%",
  },
  tierHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  earnRow: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  earnCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 132,
    padding: spacing.lg,
    width: 164,
  },
  earnTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  earnPoints: {
    ...typography.header,
    color: colors.success,
  },
  rewardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  chartCard: {
    marginBottom: spacing.xl,
  },
  transactionCard: {
    marginBottom: spacing.md,
  },
  transactionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  transactionIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.round,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  transactionText: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  transactionDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  transactionPoints: {
    fontSize: 20,
    fontWeight: "900",
  },
});
