import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { storageKeys } from "../services/storage";
import { AuthProvider, useAuth } from "./useAuth";

const storage = AsyncStorage as typeof AsyncStorage & { __clear: () => void };

describe("onboarding and logout", () => {
  beforeEach(() => storage.__clear());

  const wrapper = ({ children }: PropsWithChildren) => <AuthProvider>{children}</AuthProvider>;

  it("restores onboarding, completes it and clears it on logout", async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isOnboarded).toBe(false);

    await act(async () => {
      await result.current.completeOnboarding();
    });
    expect(result.current.isOnboarded).toBe(true);
    expect(await AsyncStorage.getItem(storageKeys.onboardingComplete)).toBe("true");

    await act(async () => {
      await result.current.resetOnboarding();
    });
    expect(result.current.isOnboarded).toBe(false);
    expect(await AsyncStorage.getItem(storageKeys.onboardingComplete)).toBeNull();
  });
});
