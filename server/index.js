import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';

import config from './src/config.js';
import authMiddleware from './src/middleware/auth.js';
import { sanitizeBody } from './src/middleware/sanitize.js';
import * as db from './src/services/supabase.js';
import * as ai from './src/services/anthropic.js';
import { sendPushNotification } from './src/services/notifications.js';

const app = express();
app.set('trust proxy', 1); // Railway runs behind a reverse proxy
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  },
});

// ─── Rate Limiting ──────────────────────────────────────────────

// General: 60 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

// Auth: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

// AI generation: 10 requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Try again later.' },
});

// ─── Daily Spending Cap ────────────────────────────────────────
// Hard cap: max 200 AI calls per day across ALL users.
// At ~1K tokens/call × $0.10/M tokens → max ~$0.02/day.
let dailyAiCalls = 0;
let dailyResetDate = new Date().toDateString();

function dailyCap(_req, res, next) {
  const today = new Date().toDateString();
  if (today !== dailyResetDate) { dailyAiCalls = 0; dailyResetDate = today; }
  if (dailyAiCalls >= 200) {
    return res.status(429).json({ error: 'Daily AI limit reached. Try again tomorrow.' });
  }
  dailyAiCalls++;
  next();
}

// ─── Middleware ──────────────────────────────────────────────────

// CORS — mobile apps don't send Origin headers, so allow all in production.
// In dev, restrict to the Expo dev client origins.
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true // allow all origins (mobile app doesn't use browsers)
    : (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081']),
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '1mb' })); // tightened from 10mb — photos go through multer
app.use(sanitizeBody);
app.use(generalLimiter);

// ─── Health Check ───────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiCallsToday: dailyAiCalls,
    aiDailyLimit: 200,
    dbAvailable: !!db.supabase,
  });
});

// ─── Onboarding Intake ──────────────────────────────────────────

app.post('/api/onboarding/intake', aiLimiter, dailyCap, authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, hairProfile } = req.body;

    if (!hairProfile) {
      return res.status(400).json({ error: 'hairProfile is required' });
    }

    // Update user name
    await db.updateUser(userId, { name, onboarding_step: 'intake' });

    // Save hair profile
    await db.saveHairProfile(userId, hairProfile);

    // Generate council response
    const councilResponse = await ai.generateCouncilResponse(hairProfile, name);

    // Generate personalized routine
    const routine = await ai.generateRoutine(hairProfile, councilResponse);

    // Save routine + council response
    await db.saveRoutine(userId, routine, councilResponse);

    // Mark onboarding complete
    await db.updateUser(userId, {
      onboarding_complete: true,
      onboarding_step: 'complete',
    });

    res.json({ councilResponse, routine });
  } catch (err) {
    console.error('Onboarding intake error:', err.message || err);
    res.status(500).json({ error: 'Failed to process intake' });
  }
});

// ─── Photo Analysis ─────────────────────────────────────────────

app.post('/api/photos/analyze', aiLimiter, dailyCap, authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id;

    let imageBase64;
    if (req.file) {
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files allowed' });
      }
      const buf = req.file.buffer;
      const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
      const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
      if (!isJpeg && !isPng && !isWebp) {
        return res.status(400).json({ error: 'Invalid image format. Use JPEG, PNG, or WebP.' });
      }
      imageBase64 = req.file.buffer.toString('base64');
    } else if (req.body.imageBase64) {
      if (typeof req.body.imageBase64 !== 'string' || req.body.imageBase64.length > 3_000_000) {
        return res.status(400).json({ error: 'Image too large or invalid' });
      }
      const buf = Buffer.from(req.body.imageBase64, 'base64');
      const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isPng = buf[0] === 0x89 && buf[1] === 0x50;
      if (!isJpeg && !isPng) {
        return res.status(400).json({ error: 'Invalid image data' });
      }
      imageBase64 = req.body.imageBase64;
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    const hairProfile = await db.getHairProfile(userId);
    const analysis = await ai.analyzePhoto(imageBase64, hairProfile);

    // Store in Supabase storage
    const photoId = uuidv4();
    const storagePath = `${userId}/${photoId}.jpg`;

    if (req.file) {
      await db.supabase.storage
        .from('hair-photos')
        .upload(storagePath, req.file.buffer, { contentType: 'image/jpeg' });
    }

    await db.savePhoto(userId, req.body.type || 'analysis', storagePath, analysis);

    res.json({ analysis, photoId, storagePath });
  } catch (err) {
    console.error('Photo analysis error:', err.message || err);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// ─── Council Generation ─────────────────────────────────────────

app.post('/api/council/generate', aiLimiter, dailyCap, authMiddleware, async (req, res) => {
  try {
    const { hairProfile } = req.body;

    if (!hairProfile) {
      return res.status(400).json({ error: 'hairProfile is required' });
    }

    const user = await db.getUser(req.user.id);
    const councilResponse = await ai.generateCouncilResponse(hairProfile, user?.name);

    res.json(councilResponse);
  } catch (err) {
    console.error('Council generation error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate council response' });
  }
});

// ─── 1-on-1 Chat ───────────────────────────────────────────────

// Optional auth — tries to validate token but proceeds without it (for dev)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { data: { user } } = await client.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) { req.user = user; req.token = authHeader.replace('Bearer ', ''); }
    }
  } catch { /* proceed without auth */ }
  next();
}

app.post('/api/chat/message', aiLimiter, dailyCap, optionalAuth, async (req, res) => {
  try {
    const { message, auntyId, conversationHistory, hairProfile: bodyProfile, userName: bodyName } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required' });
    }

    if (!ai.isAvailable()) {
      return res.status(503).json({ error: 'AI not configured', code: 'AI_UNAVAILABLE' });
    }

    // Try DB lookup if authenticated, fall back to body data
    let userName = bodyName || 'Queen';
    let hairProfile = bodyProfile || {};

    if (req.user) {
      try {
        const [user, dbProfile] = await Promise.all([
          db.getUser(req.user.id),
          db.getHairProfile(req.user.id),
        ]);
        if (user?.name) userName = user.name;
        if (dbProfile) hairProfile = dbProfile;
      } catch (dbErr) {
        console.warn('DB lookup failed, using body data:', dbErr.message);
      }
    }

    const response = await ai.generateChatResponse(
      message.trim(),
      hairProfile,
      auntyId || 'denise',
      conversationHistory || [],
      userName,
    );

    console.log(`Chat response (${auntyId || 'denise'})`);
    res.json({ response, provider: 'anthropic' });
  } catch (err) {
    console.error('Chat message error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// ─── Routine Generation ─────────────────────────────────────────

app.post('/api/routine/generate', aiLimiter, dailyCap, authMiddleware, async (req, res) => {
  try {
    const { hairProfile, councilResponse } = req.body;

    if (!hairProfile || !councilResponse) {
      return res.status(400).json({ error: 'hairProfile and councilResponse are required' });
    }

    const routine = await ai.generateRoutine(hairProfile, councilResponse);

    // Save routine (non-blocking — don't fail if DB is unavailable)
    try { await db.saveRoutine(req.user.id, routine, councilResponse); } catch (dbErr) {
      console.warn('Routine DB save skipped:', dbErr.message);
    }

    res.json(routine);
  } catch (err) {
    console.error('Routine generation error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate routine' });
  }
});

// ─── Check-in Submission ────────────────────────────────────────

app.post('/api/checkin/submit', aiLimiter, dailyCap, authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekNumber, hostingAuntyId, mood, notes, photoUri } = req.body;

    const hairProfile = await db.getHairProfile(userId);

    // Generate aunty response
    const auntyResponse = await ai.generateCheckinResponse(
      { weekNumber, mood, notes },
      hairProfile,
      hostingAuntyId || 'denise'
    );

    let checkin = null;
    try {
      checkin = await db.saveCheckin(userId, {
        weekNumber,
        hostingAuntyId: hostingAuntyId || 'denise',
        mood,
        notes,
        photoUri,
        auntyResponse,
      });
    } catch (dbErr) {
      console.warn('Check-in DB save skipped:', dbErr.message);
    }

    res.json({ checkin, auntyResponse });
  } catch (err) {
    console.error('Check-in submission error:', err.message || err);
    res.status(500).json({ error: 'Failed to submit check-in' });
  }
});

// ─── Push Notification Registration ─────────────────────────────

app.post('/api/notifications/register', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    await db.updateUser(req.user.id, { expo_push_token: token });

    res.json({ success: true });
  } catch (err) {
    console.error('Notification registration error:', err.message || err);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

// ─── User Profile ───────────────────────────────────────────────

app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, hairProfile, routine, checkins] = await Promise.all([
      db.getUser(userId),
      db.getHairProfile(userId),
      db.getRoutine(userId),
      db.getCheckins(userId),
    ]);

    res.json({ user, hairProfile, routine, checkins });
  } catch (err) {
    console.error('Get profile error:', err.message || err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ─── Account Deletion (Apple requirement) ──────────────────────

app.post('/api/user/delete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user data from each table
    const tables = ['checkins', 'photos', 'routines', 'hair_profiles', 'users'];
    for (const table of tables) {
      const col = table === 'users' ? 'id' : 'user_id';
      const { error } = await db.supabase
        .from(table)
        .delete()
        .eq(col, userId);
      if (error) console.warn(`Failed to delete from ${table}:`, error.message);
    }

    // Delete storage files
    try {
      const { data: files } = await db.supabase.storage
        .from('hair-photos')
        .list(userId);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await db.supabase.storage.from('hair-photos').remove(paths);
      }
    } catch (storageErr) {
      console.warn('Storage cleanup failed:', storageErr.message);
    }

    // Delete auth user (requires service role key)
    try {
      await db.supabase.auth.admin.deleteUser(userId);
    } catch (authErr) {
      console.warn('Auth user deletion failed:', authErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Account deletion error:', err.message || err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ─── Start Server ───────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`Aunty Curl Council API running on port ${config.port}`);
});

export default app;
