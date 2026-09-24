import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { addDays, format } from "date-fns";
import { mockServices } from "../constants/mockData";
import { storageKeys } from "./storage";
import { scheduleServiceReminder, sendPointsEarnedNotification } from "./notifications";

const storage = AsyncStorage as typeof AsyncStorage & { __clear: () => void };
const notifications = Notifications as jest.Mocked<typeof Notifications>;

const futureService = {
  ...mockServices[0],
  date: format(addDays(new Date(), 3), "yyyy-MM-dd"),
  time: "10:00",
};

describe("local notification preferences", () => {
  beforeEach(() => {
    storage.__clear();
    jest.clearAllMocks();
    notifications.getPermissionsAsync.mockResolvedValue({ granted: true } as never);
    notifications.scheduleNotificationAsync.mockResolvedValue("notification-id" as never);
  });

  it("schedules a service reminder when notification preferences are enabled", async () => {
    await AsyncStorage.setItem(storageKeys.notificationsEnabled, "true");
    await AsyncStorage.setItem(storageKeys.reviewRemindersEnabled, "true");

    await expect(scheduleServiceReminder(futureService)).resolves.toBe("notification-id");
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.objectContaining({ data: { serviceId: futureService.id } }) }),
    );
  });

  it("does not schedule when notifications are disabled", async () => {
    await AsyncStorage.setItem(storageKeys.notificationsEnabled, "false");
    await AsyncStorage.setItem(storageKeys.reviewRemindersEnabled, "true");

    await expect(scheduleServiceReminder(futureService)).resolves.toBeNull();
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("does not schedule when review reminders are disabled", async () => {
    await AsyncStorage.setItem(storageKeys.notificationsEnabled, "true");
    await AsyncStorage.setItem(storageKeys.reviewRemindersEnabled, "false");

    await expect(scheduleServiceReminder(futureService)).resolves.toBeNull();
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("does not create a reward notification when notifications are disabled", async () => {
    await AsyncStorage.setItem(storageKeys.notificationsEnabled, "false");

    await expect(sendPointsEarnedNotification(100, "Revisao")).resolves.toBeNull();
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
