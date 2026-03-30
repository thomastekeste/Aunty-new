const { Expo } = require('expo-server-sdk');
const { supabaseAdmin } = require('./supabase');

const expo = new Expo();

const CHECKIN_NOTIFICATIONS = {
  2: {
    title: "Aunty Marcia is checking in 👀",
    body: "It's been a week baby. How are those roots feeling? Come tell us.",
  },
  3: {
    title: "The council wants to see you",
    body: "Week 3. Your curls should be waking up. Aunty Denise needs a progress report.",
  },
  4: {
    title: "Final check-in — Aunty Carmen is excited",
    body: "This is the week mija. Come show us those curls. We knew you could do it.",
  },
};

async function sendPushNotification(expoPushToken, title, body, data = {}) {
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

  const chunks = expo.chunkPushNotifications([message]);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      console.error('Push send error:', err);
    }
  }

  return tickets[0] || null;
}

async function scheduleCheckinNotification(userId, weekNumber) {
  const notification = CHECKIN_NOTIFICATIONS[weekNumber];
  if (!notification) return;

  // Get user push token
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('expo_push_token')
    .eq('id', userId)
    .single();

  if (!user?.expo_push_token) {
    console.warn(`No push token for user ${userId}`);
    return;
  }

  // Send notification (in production, schedule 7 days out via a job queue)
  const ticket = await sendPushNotification(
    user.expo_push_token,
    notification.title,
    notification.body,
    { type: 'checkin_reminder', week: weekNumber }
  );

  // Record in notifications table
  await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    notification_type: 'checkin_reminder',
    week_number: weekNumber,
    sent_at: new Date().toISOString(),
  });

  return ticket;
}

async function registerPushToken(userId, expoPushToken) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    throw new Error('Invalid Expo push token');
  }

  await supabaseAdmin
    .from('users')
    .update({ expo_push_token: expoPushToken })
    .eq('id', userId);
}

module.exports = { scheduleCheckinNotification, registerPushToken, sendPushNotification };
