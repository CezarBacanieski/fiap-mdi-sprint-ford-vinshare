import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { mockRewardTransactions, mockServices, mockUser, mockVehicles } from "../constants/mockData";
import { securityLog } from "../security/logger";
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
  authSession: "@fordplus/auth_session",
  refreshToken: "@fordplus/refresh_token",
  auditTail: "@fordplus/audit_tail",
} as const;

const secureKeys = new Set<string>([
  storageKeys.authSession,
  storageKeys.refreshToken,
]);

const parseSafeJson = <T>(raw: string): T | null => {
  if (raw.length > 200_000) {
    securityLog("warn", "storage_payload_blocked", { size: raw.length });
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    securityLog("warn", "storage_invalid_json");
    return null;
  }
};

const getStoredValue = async (key: string): Promise<string | null> =>
  secureKeys.has(key) ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);

const setStoredValue = async (key: string, value: string): Promise<void> => {
  if (secureKeys.has(key)) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }
  await AsyncStorage.setItem(key, value);
};

const removeStoredValue = async (key: string): Promise<void> => {
  if (secureKeys.has(key)) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
};

export const getJsonItem = async <T>(key: string): Promise<T | null> => {
  const raw = await getStoredValue(key);
  if (!raw) return null;
  return parseSafeJson<T>(raw);
};

export const setJsonItem = async <T>(key: string, value: T): Promise<void> => {
  const raw = JSON.stringify(value);
  await setStoredValue(key, raw);
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

export const getStringItem = async (key: string): Promise<string | null> => {
  return getStoredValue(key);
};

export const setStringItem = async (key: string, value: string): Promise<void> => {
  await setStoredValue(key, value);
};

export const removeStorageItem = async (key: string): Promise<void> => {
  await removeStoredValue(key);
};
