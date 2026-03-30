const express = require('express');
const { requireAuth, respond } = require('../middleware/auth');
const { registerPushToken } = require('../services/notifications');

const router = express.Router();

// POST /api/notifications/register — store device push token after send-off
router.post('/register', requireAuth, async (req, res) => {
  try {
    const { user_id, expo_push_token } = req.body;
    if (!user_id || !expo_push_token) {
      return respond(res, false, null, 'user_id and expo_push_token required', 400);
    }
    await registerPushToken(user_id, expo_push_token);
    return respond(res, true, { registered: true });
  } catch (err) {
    console.error('Push token register error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

module.exports = router;
