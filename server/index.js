import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';

import config from './src/config.js';
import authMiddleware from './src/middleware/auth.js';
import { sanitizeBody } from './src/middleware/sanitize.js';
import * as db from './src/services/supabase.js';
import * as ai from './src/services/anthropic.js';
import { sendPushNotification } from './src/services/notifications.js';
import { registerLegalRoutes } from './src/legal.js';

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

// ─── Daily AI Caps ──────────────────────────────────────────────
// Per-user daily caps (keyed by user id, or IP for anonymous calls) so one
// user can't exhaust the budget for everyone. Subscribers verified via the
// RevenueCat REST API get a generous cap; free users get enough to finish
// onboarding. A global circuit breaker still bounds total daily spend.
const DAILY_CAP_FREE = 15;
const DAILY_CAP_SUBSCRIBED = 150;
// Without a RevenueCat key we can't tell subscribers apart — use one
// moderate per-user cap instead of punishing paying users.
const DAILY_CAP_UNVERIFIED = 50;
const DAILY_GLOBAL_BREAKER = 5000;

let dailyAiCalls = 0;
let dailyResetDate = new Date().toDateString();
let dailyCallsByUser = new Map();

function rolloverIfNeeded() {
  const today = new Date().toDateString();
  if (today !== dailyResetDate) {
    dailyResetDate = today;
    dailyAiCalls = 0;
    dailyCallsByUser = new Map();
  }
}

// Entitlement lookups are cached for 10 minutes to keep chat snappy.
const entitlementCache = new Map();

async function isSubscriber(userId) {
  if (!userId || !config.revenueCatSecretKey) return false;
  const cached = entitlementCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.isPro;

  let isPro = false;
  try {
    const resp = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
      { headers: { Authorization: `Bearer ${config.revenueCatSecretKey}` } },
    );
    if (resp.ok) {
      const data = await resp.json();
      const ent = data?.subscriber?.entitlements?.['Aunty Pro'];
      isPro = !!ent && (!ent.expires_date || new Date(ent.expires_date) > new Date());
    }
  } catch (err) {
    console.warn('RevenueCat entitlement check failed:', err.message);
  }

  if (entitlementCache.size > 10000) entitlementCache.clear();
  entitlementCache.set(userId, { isPro, expiresAt: Date.now() + 10 * 60 * 1000 });
  return isPro;
}

async function dailyCap(req, res, next) {
  try {
    rolloverIfNeeded();
    if (dailyAiCalls >= DAILY_GLOBAL_BREAKER) {
      return res.status(429).json({ error: 'Daily AI limit reached. Try again tomorrow.' });
    }

    const key = req.user?.id || req.ip;
    const used = dailyCallsByUser.get(key) || 0;
    const cap = !config.revenueCatSecretKey
      ? DAILY_CAP_UNVERIFIED
      : (await isSubscriber(req.user?.id)) ? DAILY_CAP_SUBSCRIBED : DAILY_CAP_FREE;

    if (used >= cap) {
      return res.status(429).json({ error: 'Daily AI limit reached. Try again tomorrow.' });
    }

    dailyCallsByUser.set(key, used + 1);
    dailyAiCalls++;
    next();
  } catch (err) {
    // Cap accounting must never take the API down.
    console.error('dailyCap error:', err);
    next();
  }
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
    aiGlobalBreaker: DAILY_GLOBAL_BREAKER,
    entitlementChecks: !!config.revenueCatSecretKey,
    dbAvailable: !!db.supabase,
  });
});

// ─── Public legal pages (/privacy, /terms, /reset-password) ─────
registerLegalRoutes(app);

// ─── Onboarding Intake ──────────────────────────────────────────

app.post('/api/onboarding/intake', aiLimiter, authMiddleware, dailyCap, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, hairProfile, photoAnalysis = null } = req.body;

    if (!hairProfile) {
      return res.status(400).json({ error: 'hairProfile is required' });
    }

    // Update user name
    await db.updateUser(userId, { name, onboarding_step: 'intake' });

    // Save hair profile
    await db.saveHairProfile(userId, hairProfile);

    // Generate council response
    const councilResponse = await ai.generateCouncilResponse(hairProfile, name, photoAnalysis);

    // Generate personalized routine
    const routine = await ai.generateRoutine(hairProfile, councilResponse, photoAnalysis);

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

app.post('/api/photos/analyze', aiLimiter, optionalAuth, dailyCap, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user?.id || null; // onboarding runs pre-auth

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
      const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
      const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
      if (!isJpeg && !isPng && !isWebp) {
        return res.status(400).json({ error: 'Invalid image data. Use JPEG, PNG, or WebP.' });
      }
      imageBase64 = req.body.imageBase64;
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    const hairProfile = userId ? await db.getHairProfile(userId) : null;
    const analysis = await ai.analyzePhoto(imageBase64, hairProfile);

    // Persist only for signed-in users. During value-first onboarding the user
    // isn't authed yet — they just get the analysis back; it's re-saved via
    // /api/onboarding/intake once they sign in at the end.
    let photoId = null;
    let storagePath = null;
    if (userId) {
      photoId = uuidv4();
      storagePath = `${userId}/${photoId}.jpg`;
      if (req.file) {
        await db.supabase.storage
          .from('hair-photos')
          .upload(storagePath, req.file.buffer, { contentType: 'image/jpeg' });
      }
      await db.savePhoto(userId, req.body.type || 'analysis', storagePath, analysis);
    }

    res.json({ analysis, photoId, storagePath });
  } catch (err) {
    console.error('Photo analysis error:', err.message || err);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// ─── Council Generation ─────────────────────────────────────────

app.post('/api/council/generate', aiLimiter, optionalAuth, dailyCap, async (req, res) => {
  try {
    const { hairProfile } = req.body;

    if (!hairProfile) {
      return res.status(400).json({ error: 'hairProfile is required' });
    }

    // Pre-auth during onboarding: fall back to the name supplied in the body.
    const user = req.user ? await db.getUser(req.user.id) : null;
    const name = user?.name || req.body.name || null;
    const councilResponse = await ai.generateCouncilResponse(hairProfile, name, req.body.photoAnalysis || null);

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

app.post('/api/chat/message', aiLimiter, optionalAuth, dailyCap, async (req, res) => {
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
    let recentCheckins = [];

    if (req.user) {
      try {
        const [user, dbProfile, checkins] = await Promise.all([
          db.getUser(req.user.id),
          db.getHairProfile(req.user.id),
          db.getCheckins(req.user.id),
        ]);
        if (user?.name) userName = user.name;
        if (dbProfile) hairProfile = dbProfile;
        if (Array.isArray(checkins)) recentCheckins = checkins.slice(0, 3);
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
      recentCheckins,
    );

    console.log(`Chat response (${auntyId || 'denise'})`);
    res.json({ response, provider: 'anthropic' });
  } catch (err) {
    console.error('Chat message error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// ─── Routine Generation ─────────────────────────────────────────

app.post('/api/routine/generate', aiLimiter, optionalAuth, dailyCap, async (req, res) => {
  try {
    const { hairProfile, councilResponse } = req.body;

    if (!hairProfile || !councilResponse) {
      return res.status(400).json({ error: 'hairProfile and councilResponse are required' });
    }

    const routine = await ai.generateRoutine(hairProfile, councilResponse, req.body.photoAnalysis || null);

    // Save only when signed in (pre-auth onboarding re-saves via intake).
    if (req.user) {
      try { await db.saveRoutine(req.user.id, routine, councilResponse); } catch (dbErr) {
        console.warn('Routine DB save skipped:', dbErr.message);
      }
    }

    res.json(routine);
  } catch (err) {
    console.error('Routine generation error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate routine' });
  }
});

// ─── Council + Routine (single call, onboarding speed path) ─────

app.post('/api/council/generate-full', aiLimiter, optionalAuth, dailyCap, async (req, res) => {
  try {
    const { hairProfile } = req.body;

    if (!hairProfile) {
      return res.status(400).json({ error: 'hairProfile is required' });
    }

    const user = req.user ? await db.getUser(req.user.id) : null;
    const name = user?.name || req.body.name || null;

    const full = await ai.generateCouncilAndRoutine(hairProfile, name, req.body.photoAnalysis || null);

    // Split the merged result back into the two shapes the app expects.
    const { routine, ...councilResponse } = full;

    // Save only when signed in (pre-auth onboarding re-saves via intake).
    if (req.user && routine) {
      try { await db.saveRoutine(req.user.id, routine, councilResponse); } catch (dbErr) {
        console.warn('Routine DB save skipped:', dbErr.message);
      }
    }

    res.json({ councilResponse, routine });
  } catch (err) {
    console.error('Council+routine generation error:', err.message || err);
    res.status(500).json({ error: 'Failed to generate council and routine' });
  }
});

// ─── Check-in Submission ────────────────────────────────────────

app.post('/api/checkin/submit', aiLimiter, authMiddleware, dailyCap, async (req, res) => {
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

async function generateAppleClientSecret() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: config.appleKeyId })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: config.appleTeamId,
    iat: now,
    exp: now + 15777000,
    aud: 'https://appleid.apple.com',
    sub: config.appleClientId,
  })).toString('base64url');
  const signingInput = `${header}.${payload}`;
  const key = crypto.createPrivateKey(config.applePrivateKey.replace(/\\n/g, '\n'));
  const sign = crypto.createSign('SHA256');
  sign.update(signingInput);
  const sig = sign.sign(key);
  // Convert DER signature to raw r||s for ES256
  const rLen = sig[3];
  let r = sig.slice(4, 4 + rLen);
  let s = sig.slice(4 + rLen + 2, 4 + rLen + 2 + sig[4 + rLen + 1]);
  if (r.length > 32) r = r.slice(r.length - 32);
  if (s.length > 32) s = s.slice(s.length - 32);
  if (r.length < 32) r = Buffer.concat([Buffer.alloc(32 - r.length), r]);
  if (s.length < 32) s = Buffer.concat([Buffer.alloc(32 - s.length), s]);
  const rawSig = Buffer.concat([r, s]).toString('base64url');
  return `${signingInput}.${rawSig}`;
}

app.post('/api/user/delete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Revoke Apple Sign In token if this user signed in with Apple (required by Apple Guideline 4.2.3).
    try {
      const { data: identities } = await db.supabase.auth.admin.getUserById(userId);
      const appleIdentity = identities?.user?.identities?.find((i) => i.provider === 'apple');
      if (appleIdentity && config.applePrivateKey && config.appleTeamId && config.appleKeyId) {
        const jwt = await generateAppleClientSecret();
        const tokenToRevoke = appleIdentity.identity_data?.refresh_token || appleIdentity.identity_data?.access_token;
        if (tokenToRevoke) {
          await fetch('https://appleid.apple.com/auth/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: config.appleClientId,
              client_secret: jwt,
              token: tokenToRevoke,
              token_type_hint: 'refresh_token',
            }),
          });
        }
      }
    } catch (appleErr) {
      console.warn('Apple token revocation failed (non-fatal):', appleErr.message);
    }

    // Delete the auth user FIRST. public.users references auth.users with
    // `on delete cascade`, which transitively removes hair_profiles, routines,
    // checkins and photos. Doing this first means we can never end up with the
    // data deleted but the auth account still able to log in (an orphan).
    // If this fails, abort with 500 so the client can retry — nothing is lost.
    const { error: authErr } = await db.supabase.auth.admin.deleteUser(userId);
    if (authErr) {
      console.error('Auth user deletion failed:', authErr.message);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    // Defensive table cleanup in case the cascade isn't configured on the
    // live DB. Best-effort — the auth user (and its cascade) is already gone.
    const tables = ['checkins', 'photos', 'routines', 'hair_profiles', 'users'];
    for (const table of tables) {
      const col = table === 'users' ? 'id' : 'user_id';
      const { error } = await db.supabase
        .from(table)
        .delete()
        .eq(col, userId);
      if (error) console.warn(`Failed to delete from ${table}:`, error.message);
    }

    // Delete storage files (not covered by the DB cascade)
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
