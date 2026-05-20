import { useCallback, useEffect, useMemo, useState } from "react";
import { redeemableRewards, tierDefinitions } from "../constants/mockData";
import {
  loadRewardTransactions,
  loadUser,
  saveRewardTransactions,
  saveUser,
} from "../services/storage";
import { Reward, RewardTransaction, TierDefinition, User, UserTier } from "../types";

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
      await persistUser({
        ...nextUser,
        tier: getTierName(nextUser.points),
      });
    },
    [persistUser],
  );

  const addPoints = useCallback(
    async (points: number, reason: string) => {
      if (!user) return;
      const nextUser: User = {
        ...user,
        points: user.points + points,
        tier: getTierName(user.points + points),
      };
      const transaction: RewardTransaction = {
        id: `rt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        description: reason,
        points,
        type: "earn",
      };
      const nextTransactions = [transaction, ...transactions];
      setTransactions(nextTransactions);
      await Promise.all([saveRewardTransactions(nextTransactions), persistUser(nextUser)]);
    },
    [persistUser, transactions, user],
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
      return true;
    },
    [persistUser, transactions, user],
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
