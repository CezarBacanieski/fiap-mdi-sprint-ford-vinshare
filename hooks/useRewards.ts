import { useCallback, useEffect, useMemo, useState } from "react";
import { redeemableRewards, tierDefinitions } from "../constants/mockData";
import {
  loadRewardTransactions,
  loadUser,
  saveRewardTransactions,
  saveUser,
} from "../services/storage";
import { AppSecurityError } from "../security/errors";
import { auditLog } from "../security/logger";
import { actionRateLimiter } from "../security/rateLimiter";
import { sanitizeText } from "../security/sanitization";
import { validateUserProfileInput } from "../security/validation";
import { Reward, RewardTransaction, TierDefinition, User, UserTier } from "../types";
import { useAuth } from "./useAuth";

interface UseRewardsResult {
  user: User | null;
  transactions: RewardTransaction[];
  currentTier: TierDefinition;
  nextTier: TierDefinition | null;
  pointsToNextTier: number;
  tierProgress: number;
  isLoading: boolean;
  reloadRewards: () => Promise<void>;
  redeemReward: (reward: Reward) => Promise<boolean>;
  addPoints: (points: number, reason: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const findTier = (points: number): TierDefinition => {
  return (
    tierDefinitions.find((definition) => {
      const aboveMin = points >= definition.min;
      const belowMax = definition.max === undefined || points <= definition.max;
      return aboveMin && belowMax;
    }) ?? tierDefinitions[0]
  );
};

const getTierName = (points: number): UserTier => findTier(points).tier;

export const useRewards = (): UseRewardsResult => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission, session } = useAuth();

  const reloadRewards = useCallback(async () => {
    setIsLoading(true);
    const [storedUser, storedTransactions] = await Promise.all([
      loadUser(),
      loadRewardTransactions(),
    ]);
    setUser(storedUser);
    setTransactions(storedTransactions);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void reloadRewards();
  }, [reloadRewards]);

  const currentTier = useMemo(() => findTier(user?.points ?? 0), [user?.points]);

  const nextTier = useMemo(() => {
    const currentIndex = tierDefinitions.findIndex((definition) => definition.tier === currentTier.tier);
    return tierDefinitions[currentIndex + 1] ?? null;
  }, [currentTier.tier]);

  const pointsToNextTier = nextTier && user ? Math.max(nextTier.min - user.points, 0) : 0;

  const tierProgress = useMemo(() => {
    if (!user) return 0;
    if (!currentTier.max) return 1;
    const span = currentTier.max - currentTier.min + 1;
    return Math.min((user.points - currentTier.min) / span, 1);
  }, [currentTier, user]);

  const persistUser = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    await saveUser(nextUser);
  }, []);

  const updateUser = useCallback(
    async (nextUser: User) => {
      if (!hasPermission("profile:update")) {
        throw new AppSecurityError("Profile update denied", {
          code: "FORBIDDEN",
          status: 403,
          publicMessage: "Seu perfil não pode editar dados pessoais.",
        });
      }

      const limiter = actionRateLimiter.consume(`profile-update:${session?.userId ?? "guest"}`);
      if (!limiter.allowed) {
        throw new AppSecurityError("Profile update rate limited", {
          code: "RATE_LIMITED",
          status: 429,
          publicMessage: "Muitas atualizações em sequência. Aguarde alguns segundos.",
        });
      }

      const safeUser = validateUserProfileInput(nextUser);
      await persistUser({
        ...safeUser,
        tier: getTierName(safeUser.points),
      });
      auditLog({
        event: "profile_updated",
        severity: "info",
        userId: session?.userId,
        role: session?.role,
      });
    },
    [hasPermission, persistUser, session?.role, session?.userId],
  );

  const addPoints = useCallback(
    async (points: number, reason: string) => {
      if (!user) return;
      const sanitizedReason = sanitizeText(reason).slice(0, 80);
      const nextUser: User = {
        ...user,
        points: user.points + points,
        tier: getTierName(user.points + points),
      };
      const transaction: RewardTransaction = {
        id: `rt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        description: sanitizedReason,
        points,
        type: "earn",
      };
      const nextTransactions = [transaction, ...transactions];
      setTransactions(nextTransactions);
      await Promise.all([saveRewardTransactions(nextTransactions), persistUser(nextUser)]);
      auditLog({
        event: "points_earned",
        severity: "info",
        userId: session?.userId,
        role: session?.role,
        metadata: { points, reason: sanitizedReason },
      });
    },
    [persistUser, session?.role, session?.userId, transactions, user],
  );

  const redeemReward = useCallback(
    async (reward: Reward) => {
      if (!user || user.points < reward.pointsNeeded) return false;

      const nextPoints = user.points - reward.pointsNeeded;
      const nextUser: User = {
        ...user,
        points: nextPoints,
        tier: getTierName(nextPoints),
      };
      const transaction: RewardTransaction = {
        id: `rt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        description: `Resgate: ${reward.title}`,
        points: -reward.pointsNeeded,
        type: "redeem",
      };
      const nextTransactions = [transaction, ...transactions];
      setTransactions(nextTransactions);
      await Promise.all([saveRewardTransactions(nextTransactions), persistUser(nextUser)]);
      auditLog({
        event: "reward_redeemed",
        severity: "warning",
        userId: session?.userId,
        role: session?.role,
        metadata: { rewardId: reward.id, points: reward.pointsNeeded },
      });
      return true;
    },
    [persistUser, session?.role, session?.userId, transactions, user],
  );

  return {
    user,
    transactions,
    currentTier,
    nextTier,
    pointsToNextTier,
    tierProgress,
    isLoading,
    reloadRewards,
    redeemReward,
    addPoints,
    updateUser,
  };
};

export const useRewardCatalog = (): Reward[] => redeemableRewards;
