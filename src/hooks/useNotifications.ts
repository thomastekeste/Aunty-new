/**
 * useNotifications — Push notification registration and listener setup.
 *
 * Handles permissions, Expo push token acquisition, and foreground/background
 * notification listeners. Saves token to AsyncStorage and optionally syncs to API.
 */

import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import type { EventSubscription } from 'expo-modules-core';

const PUSH_TOKEN_KEY = 'expo_push_token';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4A04A',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return undefined;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    token = pushToken.data;
  } catch (e) {
    console.warn('[Notifications] Failed to get push token:', e);
  }

  return token;
}

export interface NotificationHookResult {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPermissions: () => Promise<void>;
}

export function usePushNotifications(): NotificationHookResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<EventSubscription>(undefined);
  const responseListener = useRef<EventSubscription>(undefined);

  useEffect(() => {
    // Try to load cached token first
    AsyncStorage.getItem(PUSH_TOKEN_KEY).then((cached) => {
      if (cached) setExpoPushToken(cached);
    });

    // Register and get token
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);

        // Persist locally
        try {
          await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        } catch (e) {
          console.warn('[Notifications] Failed to cache token:', e);
        }

        // Optionally sync to backend
        try {
          fetch(`${API_URL}/api/notifications/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pushToken: token, platform: Platform.OS }),
          }).catch(() => {
            // Silent fail — token is stored locally
          });
        } catch {
          // Silent
        }
      }
    });

    // Foreground notification listener
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notif) => {
        setNotification(notif);
      }
    );

    // Background/tap notification listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        // Handle deep linking based on notification data
        console.log('[Notifications] User tapped notification:', data);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const requestPermissions = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    }
  };

  return {
    expoPushToken,
    notification,
    requestPermissions,
  };
}
