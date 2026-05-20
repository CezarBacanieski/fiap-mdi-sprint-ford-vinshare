import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import {
  requestNotificationPermissions,
  scheduleServiceReminder as scheduleReminder,
  sendPointsEarnedNotification as sendPointsNotification,
} from "../services/notifications";
import { ServiceRecord } from "../types";

interface UseNotificationsResult {
  notificationCount: number;
  permissionGranted: boolean;
  requestPermissions: () => Promise<boolean>;
  clearNotificationCount: () => Promise<void>;
  scheduleServiceReminder: (service: ServiceRecord) => Promise<string | null>;
  sendPointsEarnedNotification: (points: number, reason: string) => Promise<string | null>;
}

export const useNotifications = (): UseNotificationsResult => {
  const [notificationCount, setNotificationCount] = useState(2);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermissions = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
    return granted;
  }, []);

  useEffect(() => {
    void requestPermissions();
    const subscription = Notifications.addNotificationReceivedListener(() => {
      setNotificationCount((count) => count + 1);
    });

    return () => {
      subscription.remove();
    };
  }, [requestPermissions]);

  const clearNotificationCount = useCallback(async () => {
    setNotificationCount(0);
    await Notifications.setBadgeCountAsync(0);
  }, []);

  const scheduleServiceReminder = useCallback(async (service: ServiceRecord) => {
    const id = await scheduleReminder(service);
    if (id) {
      setNotificationCount((count) => count + 1);
    }
    return id;
  }, []);

  const sendPointsEarnedNotification = useCallback(async (points: number, reason: string) => {
    if (!permissionGranted) return null;
    const id = await sendPointsNotification(points, reason);
    setNotificationCount((count) => count + 1);
    return id;
  }, [permissionGranted]);

  return {
    notificationCount,
    permissionGranted,
    requestPermissions,
    clearNotificationCount,
    scheduleServiceReminder,
    sendPointsEarnedNotification,
  };
};
