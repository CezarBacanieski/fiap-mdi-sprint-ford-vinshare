import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockRewardTransactions, mockServices, mockUser, mockVehicles } from "../constants/mockData";
import { RewardTransaction, ServiceRecord, StorageSeed, User, Vehicle } from "../types";

export const storageKeys = {
  onboardingComplete: "@fordplus/onboarding_complete",
  seeded: "@fordplus/seeded_v1",
  user: "@fordplus/user",
  vehicles: "@fordplus/vehicles",
  services: "@fordplus/services",
  rewards: "@fordplus/reward_transactions",
  notificationsEnabled: "@fordplus/notifications_enabled",
  reviewRemindersEnabled: "@fordplus/review_reminders_enabled",
} as const;

export const getJsonItem = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
};

export const setJsonItem = async <T>(key: string, value: T): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const seedInitialData = async (): Promise<void> => {
  const seeded = await AsyncStorage.getItem(storageKeys.seeded);
  if (seeded === "true") return;

  const seed: StorageSeed = {
    user: mockUser,
    vehicles: mockVehicles,
    services: mockServices,
    rewards: mockRewardTransactions,
  };

  await AsyncStorage.multiSet([
    [storageKeys.user, JSON.stringify(seed.user)],
    [storageKeys.vehicles, JSON.stringify(seed.vehicles)],
    [storageKeys.services, JSON.stringify(seed.services)],
    [storageKeys.rewards, JSON.stringify(seed.rewards)],
    [storageKeys.notificationsEnabled, "true"],
    [storageKeys.reviewRemindersEnabled, "true"],
    [storageKeys.seeded, "true"],
  ]);
};

export const loadUser = async (): Promise<User> => {
  return (await getJsonItem<User>(storageKeys.user)) ?? mockUser;
};

export const saveUser = async (user: User): Promise<void> => {
  await setJsonItem(storageKeys.user, user);
};

export const loadVehicles = async (): Promise<Vehicle[]> => {
  return (await getJsonItem<Vehicle[]>(storageKeys.vehicles)) ?? mockVehicles;
};

export const saveVehicles = async (vehicles: Vehicle[]): Promise<void> => {
  await setJsonItem(storageKeys.vehicles, vehicles);
};

export const loadServices = async (): Promise<ServiceRecord[]> => {
  return (await getJsonItem<ServiceRecord[]>(storageKeys.services)) ?? mockServices;
};

export const saveServices = async (services: ServiceRecord[]): Promise<void> => {
  await setJsonItem(storageKeys.services, services);
};

export const loadRewardTransactions = async (): Promise<RewardTransaction[]> => {
  return (await getJsonItem<RewardTransaction[]>(storageKeys.rewards)) ?? mockRewardTransactions;
};

export const saveRewardTransactions = async (transactions: RewardTransaction[]): Promise<void> => {
  await setJsonItem(storageKeys.rewards, transactions);
};

export const resetOnboardingFlag = async (): Promise<void> => {
  await AsyncStorage.removeItem(storageKeys.onboardingComplete);
};
