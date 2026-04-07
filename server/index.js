import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';

import config from './src/config.js';
import authMiddleware from './src/middleware/auth.js';
import * as db from './src/services/supabase.js';
import * as gemini from './src/services/gemini.js';
import { sendPushNotification } from './src/services/notifications.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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

// AI generation: 10 requests per 15 minutes per IP (Gemini is expensive)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Try again later.' },
});

// ─── Middleware ──────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// ─── Health Check ───────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Onboarding Intake ──────────────────────────────────────────

app.post('/api/onboarding/intake', aiLimiter, authMiddleware, async (req, res) => {
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
    const councilResponse = await gemini.generateCouncilResponse(hairProfile, name);

    // Generate personalized routine
    const routine = await gemini.generateRoutine(hairProfile, councilResponse);

    // Save routine + council response
    await db.saveRoutine(userId, routine, councilResponse);

    // Mark onboarding complete
    await db.updateUser(userId, {
      onboarding_complete: true,
      onboarding_step: 'complete',
    });

    res.json({ councilResponse, routine });
  } catch (err) {
    console.error('Onboarding intake error:', err);
    res.status(500).json({ error: 'Failed to process intake' });
  }
});

// ─── Photo Analysis ─────────────────────────────────────────────

app.post('/api/photos/analyze', aiLimiter, authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id;

    let imageBase64;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    } else if (req.body.imageBase64) {
      imageBase64 = req.body.imageBase64;
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    const hairProfile = await db.getHairProfile(userId);
    const analysis = await gemini.analyzePhoto(imageBase64, hairProfile);

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
    console.error('Photo analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// ─── Council Generation ─────────────────────────────────────────

app.post('/api/council/generate', aiLimiter, authMiddleware, async (req, res) => {
  try {
    const { hairProfile } = req.body;

    if (!hairProfile) {
      return res.status(400).json({ error: 'hairProfile is required' });
    }

    const user = await db.getUser(req.user.id);
    const councilResponse = await gemini.generateCouncilResponse(hairProfile, user?.name);

    res.json(councilResponse);
  } catch (err) {
    console.error('Council generation error:', err);
    res.status(500).json({ error: 'Failed to generate council response' });
  }
});

// ─── Routine Generation ─────────────────────────────────────────

app.post('/api/routine/generate', aiLimiter, authMiddleware, async (req, res) => {
  try {
    const { hairProfile, councilResponse } = req.body;

    if (!hairProfile || !councilResponse) {
      return res.status(400).json({ error: 'hairProfile and councilResponse are required' });
    }

    const routine = await gemini.generateRoutine(hairProfile, councilResponse);

    // Save routine
    await db.saveRoutine(req.user.id, routine, councilResponse);

    res.json(routine);
  } catch (err) {
    console.error('Routine generation error:', err);
    res.status(500).json({ error: 'Failed to generate routine' });
  }
});

// ─── Check-in Submission ────────────────────────────────────────

app.post('/api/checkin/submit', aiLimiter, authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekNumber, hostingAuntyId, mood, notes, photoUri } = req.body;

    const hairProfile = await db.getHairProfile(userId);

    // Generate aunty response
    const auntyResponse = await gemini.generateCheckinResponse(
      { weekNumber, mood, notes },
      hairProfile,
      hostingAuntyId || 'denise'
    );

    const checkin = await db.saveCheckin(userId, {
      weekNumber,
      hostingAuntyId: hostingAuntyId || 'denise',
      mood,
      notes,
      photoUri,
      auntyResponse,
    });

    res.json({ checkin, auntyResponse });
  } catch (err) {
    console.error('Check-in submission error:', err);
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
    console.error('Notification registration error:', err);
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
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ─── Start Server ───────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`Aunty Curl Council API running on port ${config.port}`);
});

export default app;
