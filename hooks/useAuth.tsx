import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { refreshSession, revokeSession, signIn } from "../security/auth";
import { AppSecurityError } from "../security/errors";
import { hasPermission } from "../security/permissions";
import { AppRole, AuthSession, Permission } from "../security/types";
import {
  getJsonItem,
  getStringItem,
  removeStorageItem,
  setJsonItem,
  setStringItem,
  storageKeys,
} from "../services/storage";

interface UseAuthResult {
  isLoading: boolean;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  role: AppRole | null;
  session: AuthSession | null;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuthSession: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<UseAuthResult | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  const checkOnboarding = useCallback(async () => {
    try {
      const [onboardingValue, storedSession] = await Promise.all([
        getStringItem(storageKeys.onboardingComplete),
        getJsonItem<AuthSession>(storageKeys.authSession),
      ]);
      setIsOnboarded(onboardingValue === "true");
      setSession(storedSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkOnboarding();
  }, [checkOnboarding]);

  const completeOnboarding = useCallback(async () => {
    await setStringItem(storageKeys.onboardingComplete, "true");
    setIsOnboarded(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await removeStorageItem(storageKeys.onboardingComplete);
    setIsOnboarded(false);
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const requestFingerprint = "mobile-app";
    const nextSession = await signIn({ email, password, requestFingerprint });
    setSession(nextSession);
    await Promise.all([
      setJsonItem(storageKeys.authSession, nextSession),
      setStringItem(storageKeys.refreshToken, nextSession.refreshToken),
    ]);
  }, []);

  const signOut = useCallback(async () => {
    if (session) {
      revokeSession(session.sessionId);
    }
    setSession(null);
    await Promise.all([
      removeStorageItem(storageKeys.authSession),
      removeStorageItem(storageKeys.refreshToken),
    ]);
  }, [session]);

  const refreshAuthSession = useCallback(async () => {
    const refreshToken = await getStringItem(storageKeys.refreshToken);
    if (!refreshToken) {
      setSession(null);
      return;
    }

    try {
      const nextSession = refreshSession(refreshToken);
      setSession(nextSession);
      await Promise.all([
        setJsonItem(storageKeys.authSession, nextSession),
        setStringItem(storageKeys.refreshToken, nextSession.refreshToken),
      ]);
    } catch (error) {
      setSession(null);
      await Promise.all([
        removeStorageItem(storageKeys.authSession),
        removeStorageItem(storageKeys.refreshToken),
      ]);
      if (!(error instanceof AppSecurityError)) {
        throw error;
      }
    }
  }, []);

  const checkPermission = useCallback(
    (permission: Permission) => {
      if (!session) return false;
      return hasPermission(session.role, permission);
    },
    [session],
  );

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isOnboarded,
        isAuthenticated: Boolean(session),
        role: session?.role ?? null,
        session,
        completeOnboarding,
        resetOnboarding,
        signInWithPassword,
        signOut,
        refreshAuthSession,
        hasPermission: checkPermission,
      }}
    >
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
