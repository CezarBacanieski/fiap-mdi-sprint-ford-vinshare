import Constants from "expo-constants";
import * as Device from "expo-device";
import { addHours, differenceInMilliseconds, parseISO, subHours } from "date-fns";
import { Platform } from "react-native";
import { ServiceRecord } from "../types";

type NotificationsModule = typeof import("expo-notifications");

export interface NotificationSubscriptionHandle {
  remove: () => void;
}

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let notificationHandlerConfigured = false;

const isExpoGoAndroid = (): boolean => {
  return (
    Platform.OS === "android" &&
    (Constants.appOwnership === "expo" || Constants.expoGoConfig !== null)
  );
};

const loadNotificationsModule = async (): Promise<NotificationsModule | null> => {
  if (isExpoGoAndroid()) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications")
      .then((module) => {
        if (!notificationHandlerConfigured) {
          module.setNotificationHandler({
            handleNotification: async () => ({
              shouldPlaySound: true,
              shouldSetBadge: true,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
          notificationHandlerConfigured = true;
        }

        return module;
      })
      .catch(() => null);
  }

  return notificationsModulePromise;
};

export const configureAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== "android" || isExpoGoAndroid()) return;

  const notifications = await loadNotificationsModule();
  if (!notifications) return;

  await notifications.setNotificationChannelAsync("service-reminders", {
    name: "Lembretes de servico",
    importance: notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#003499",
  });
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice || isExpoGoAndroid()) {
    return false;
  }

  const notifications = await loadNotificationsModule();
  if (!notifications) {
    return false;
  }

  await configureAndroidNotificationChannel();
  const existing = await notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await notifications.requestPermissionsAsync();
  return requested.granted;
};

const getReminderDate = (service: ServiceRecord): Date | null => {
  const serviceDate = parseISO(`${service.date}T${service.time ?? "09:00"}:00`);
  const reminderDate = subHours(serviceDate, 24);
  const fallbackDate = addHours(new Date(), 1);

  if (differenceInMilliseconds(reminderDate, new Date()) > 0) {
    return reminderDate;
  }

  if (differenceInMilliseconds(serviceDate, new Date()) > 0) {
    return fallbackDate;
  }

  return null;
};

export const scheduleServiceReminder = async (service: ServiceRecord): Promise<string | null> => {
  const reminderDate = getReminderDate(service);
  if (!reminderDate || isExpoGoAndroid()) return null;

  const notifications = await loadNotificationsModule();
  if (!notifications) return null;

  return notifications.scheduleNotificationAsync({
    content: {
      title: "Revisao Ford+ amanha",
      body: `${service.type} na ${service.dealershipName} as ${service.time ?? "09:00"}.`,
      data: { serviceId: service.id },
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: "service-reminders",
    },
  });
};

export const sendPointsEarnedNotification = async (
  points: number,
  reason: string,
): Promise<string | null> => {
  if (isExpoGoAndroid()) return null;

  const notifications = await loadNotificationsModule();
  if (!notifications) return null;

  return notifications.scheduleNotificationAsync({
    content: {
      title: `+${points} pontos Ford+`,
      body: reason,
      data: { reason, points },
    },
    trigger: null,
  });
};

export const subscribeToForegroundNotifications = async (
  onReceive: () => void,
): Promise<NotificationSubscriptionHandle | null> => {
  if (isExpoGoAndroid()) return null;

  const notifications = await loadNotificationsModule();
  if (!notifications) return null;

  return notifications.addNotificationReceivedListener(onReceive);
};

export const setNotificationBadgeCount = async (count: number): Promise<void> => {
  if (isExpoGoAndroid()) return;

  const notifications = await loadNotificationsModule();
  if (!notifications) return;

  await notifications.setBadgeCountAsync(count);
};
