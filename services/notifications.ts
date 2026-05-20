import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { addHours, differenceInMilliseconds, parseISO, subHours } from "date-fns";
import { Platform } from "react-native";
import { ServiceRecord } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const configureAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("service-reminders", {
    name: "Lembretes de servico",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#003499",
  });
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    return false;
  }

  await configureAndroidNotificationChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
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
  if (!reminderDate) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Revisao Ford+ amanha",
      body: `${service.type} na ${service.dealershipName} as ${service.time ?? "09:00"}.`,
      data: { serviceId: service.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: "service-reminders",
    },
  });
};

export const sendPointsEarnedNotification = async (
  points: number,
  reason: string,
): Promise<string> => {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `+${points} pontos Ford+`,
      body: reason,
      data: { reason, points },
    },
    trigger: null,
  });
};
