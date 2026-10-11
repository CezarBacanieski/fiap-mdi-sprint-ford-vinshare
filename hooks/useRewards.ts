import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { redeemableRewards, tierDefinitions } from "../constants/mockData";
import {
  loadRewardTransactions,
  loadUser,
  saveRewardsState,
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
  const userRef = useRef<User | null>(null);
  const transactionsRef = useRef<RewardTransaction[]>([]);
  const mutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const enqueueMutation = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    const result = mutationQueueRef.current.then(operation);
    mutationQueueRef.current = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }, []);

  const reloadRewards = useCallback(async () => {
    setIsLoading(true);
    const [storedUser, storedTransactions] = await Promise.all([
      loadUser(),
      loadRewardTransactions(),
    ]);
    userRef.current = storedUser;
    transactionsRef.current = storedTransactions;
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
    userRef.current = nextUser;
    setUser(nextUser);
    await saveUser(nextUser);
  }, []);

  const updateUser = useCallback(
    async (nextUser: User) => {
      await enqueueMutation(async () => {
        await persistUser({
          ...nextUser,
          tier: getTierName(nextUser.points),
        });
      });
    },
    [enqueueMutation, persistUser],
  );

  const addPoints = useCallback(
    async (points: number, reason: string) => {
      await enqueueMutation(async () => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        const nextUser: User = {
          ...currentUser,
          points: currentUser.points + points,
          tier: getTierName(currentUser.points + points),
        };
        const transaction: RewardTransaction = {
          id: `rt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          date: new Date().toISOString().slice(0, 10),
          description: reason,
          points,
          type: "earn",
        };
        const nextTransactions = [transaction, ...transactionsRef.current];
        await saveRewardsState(nextUser, nextTransactions);
        userRef.current = nextUser;
        transactionsRef.current = nextTransactions;
        setUser(nextUser);
        setTransactions(nextTransactions);
      });
    },
    [enqueueMutation],
  );

  const redeemReward = useCallback(
    async (reward: Reward) => {
      return enqueueMutation(async () => {
        const currentUser = userRef.current;
        if (!currentUser || currentUser.points < reward.pointsNeeded) return false;

        const nextPoints = currentUser.points - reward.pointsNeeded;
        const nextUser: User = {
          ...currentUser,
          points: nextPoints,
          tier: getTierName(nextPoints),
        };
        const transaction: RewardTransaction = {
          id: `rt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          date: new Date().toISOString().slice(0, 10),
          description: `Resgate: ${reward.title}`,
          points: -reward.pointsNeeded,
          type: "redeem",
        };
        const nextTransactions = [transaction, ...transactionsRef.current];
        await saveRewardsState(nextUser, nextTransactions);
        userRef.current = nextUser;
        transactionsRef.current = nextTransactions;
        setUser(nextUser);
        setTransactions(nextTransactions);
        return true;
      });
    },
    [enqueueMutation],
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
