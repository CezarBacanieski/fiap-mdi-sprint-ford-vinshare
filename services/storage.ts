import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockRewardTransactions, mockServices, mockUser, mockVehicles } from "../constants/mockData";
import { decryptString, encryptString } from "../security/cryptoStorage";
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

const encryptedKeys = new Set<string>([
  storageKeys.user,
  storageKeys.vehicles,
  storageKeys.services,
  storageKeys.rewards,
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

const encodeForStorage = async (key: string, value: string): Promise<string> => {
  if (!encryptedKeys.has(key)) {
    return value;
  }
  return encryptString(value);
};

const decodeFromStorage = async (key: string, value: string): Promise<string | null> => {
  if (!encryptedKeys.has(key)) {
    return value;
  }
  return decryptString(value);
};

export const getJsonItem = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const decoded = await decodeFromStorage(key, raw);
  if (!decoded) return null;
  return parseSafeJson<T>(decoded);
};

export const setJsonItem = async <T>(key: string, value: T): Promise<void> => {
  const raw = JSON.stringify(value);
  const encoded = await encodeForStorage(key, raw);
  await AsyncStorage.setItem(key, encoded);
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

  const [user, vehicles, services, rewards] = await Promise.all([
    encodeForStorage(storageKeys.user, JSON.stringify(seed.user)),
    encodeForStorage(storageKeys.vehicles, JSON.stringify(seed.vehicles)),
    encodeForStorage(storageKeys.services, JSON.stringify(seed.services)),
    encodeForStorage(storageKeys.rewards, JSON.stringify(seed.rewards)),
  ]);

  await AsyncStorage.multiSet([
    [storageKeys.user, user],
    [storageKeys.vehicles, vehicles],
    [storageKeys.services, services],
    [storageKeys.rewards, rewards],
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
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return decodeFromStorage(key, raw);
};

export const setStringItem = async (key: string, value: string): Promise<void> => {
  const encoded = await encodeForStorage(key, value);
  await AsyncStorage.setItem(key, encoded);
};

export const removeStorageItem = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};
