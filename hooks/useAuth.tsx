import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { storageKeys } from "../services/storage";

interface UseAuthResult {
  isLoading: boolean;
  isOnboarded: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const AuthContext = createContext<UseAuthResult | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const checkOnboarding = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(storageKeys.onboardingComplete);
      setIsOnboarded(value === "true");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkOnboarding();
  }, [checkOnboarding]);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(storageKeys.onboardingComplete, "true");
    setIsOnboarded(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(storageKeys.onboardingComplete);
    setIsOnboarded(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, isOnboarded, completeOnboarding, resetOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): UseAuthResult => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
