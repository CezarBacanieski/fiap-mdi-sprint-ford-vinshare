import { Platform } from "react-native";
import { securityLog } from "../security/logger";

type ScreenCaptureModule = typeof import("expo-screen-capture");

let screenCaptureModulePromise: Promise<ScreenCaptureModule | null> | null = null;

const loadScreenCaptureModule = async (): Promise<ScreenCaptureModule | null> => {
  if (!screenCaptureModulePromise) {
    const moduleName = "expo-screen-capture";
    screenCaptureModulePromise = import(moduleName)
      .then((module) => module as ScreenCaptureModule)
      .catch(() => null);
  }
  return screenCaptureModulePromise;
};

export const enableRuntimeHardening = async (): Promise<void> => {
  try {
    const screenCapture = await loadScreenCaptureModule();
    if (screenCapture) {
      await screenCapture.preventScreenCaptureAsync();
    }
  } catch {
    securityLog("warn", "runtime_hardening_partial", { platform: Platform.OS });
  }
};
