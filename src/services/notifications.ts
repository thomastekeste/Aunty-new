import * as ExpoNotifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getRandomNotifCopy } from '@/constants/aunties';

if (Platform.OS !== 'web') {
  ExpoNotifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    const { status: existing } = await ExpoNotifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    return status === 'granted';
  },

  getExpoPushToken: async (): Promise<string | null> => {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await ExpoNotifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      return token.data;
    } catch {
      return null;
    }
  },

  scheduleCheckinReminders: async () => {
    await ExpoNotifications.cancelAllScheduledNotificationsAsync();

    const weekDays = [7, 14, 21, 28];
    const auntyRotation = ['2', '3', '5', '1']; // Week 1-4 aunties

    for (let i = 0; i < weekDays.length; i++) {
      const auntyId = auntyRotation[i];
      const copy = getRandomNotifCopy(auntyId);
      const trigger = new Date();
      trigger.setDate(trigger.getDate() + weekDays[i]);
      trigger.setHours(9, 0, 0, 0);

      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: copy.title,
          body: copy.body,
          data: { aunty_id: auntyId, week_number: i + 1, type: 'checkin' },
        },
        trigger: { type: ExpoNotifications.SchedulableTriggerInputTypes.DATE, date: trigger },
      });
    }
  },

  onNotificationTapped: (
    cb: (response: ExpoNotifications.NotificationResponse) => void
  ): ExpoNotifications.Subscription =>
    ExpoNotifications.addNotificationResponseReceivedListener(cb),

  cancelAll: () => ExpoNotifications.cancelAllScheduledNotificationsAsync(),
};
