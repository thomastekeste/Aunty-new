import { Expo } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Send a push notification via Expo's push service.
 *
 * @param {string} expoPushToken - The user's Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {object} data - Optional data payload
 */
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.warn(`Invalid Expo push token: ${expoPushToken}`);
    return null;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    return tickets;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}
