/**
 * Input sanitization middleware.
 *
 * - Strips HTML/script tags from all string fields
 * - Enforces max field lengths
 * - Validates expected types
 * - Rejects oversized payloads early
 */

// Strip HTML tags and trim whitespace
function cleanString(val, maxLen = 500) {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<[^>]*>/g, '')     // strip HTML tags
    .replace(/[<>]/g, '')        // remove stray angle brackets
    .trim()
    .slice(0, maxLen);
}

// Recursively sanitize all string values in an object
function sanitizeObject(obj, maxDepth = 5, depth = 0) {
  if (depth > maxDepth) return {};
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return cleanString(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj;
  if (Array.isArray(obj)) {
    return obj.slice(0, 50).map(item => sanitizeObject(item, maxDepth, depth + 1)); // max 50 array items
  }
  if (typeof obj === 'object') {
    const clean = {};
    const keys = Object.keys(obj).slice(0, 100); // max 100 keys
    for (const key of keys) {
      const cleanKey = cleanString(key, 100);
      clean[cleanKey] = sanitizeObject(obj[key], maxDepth, depth + 1);
    }
    return clean;
  }
  return undefined; // reject functions, symbols, etc.
}

// Allowed values for enum fields
const ENUMS = {
  curlType: ['2a', '2b', '2c', '3a', '3b', '3c', '4a', '4b', '4c'],
  porosity: ['low', 'normal', 'high'],
  elasticity: ['low', 'normal', 'high'],
  density: ['thin', 'medium', 'thick'],
  primaryGoal: ['moisture', 'growth', 'definition', 'damage-repair', 'scalp-health', 'simplify-routine', 'transition'],
  washFrequency: ['daily', 'every-other', 'twice-weekly', 'weekly', 'biweekly', 'monthly'],
  heatUse: ['never', 'rarely', 'monthly', 'weekly', 'daily'],
  mood: ['great', 'good', 'okay', 'struggling'],
  productScope: ['basics', 'routine', 'full', 'everything'],
  productBudget: ['under-30', '30-60', '60-100', '100-plus'],
};

function validateEnum(val, field) {
  if (!val) return val;
  const allowed = ENUMS[field];
  if (!allowed) return val;
  return allowed.includes(val) ? val : undefined;
}

// Validate a hair profile object
function sanitizeHairProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  return {
    curlType: validateEnum(profile.curlType, 'curlType'),
    porosity: validateEnum(profile.porosity, 'porosity'),
    elasticity: validateEnum(profile.elasticity, 'elasticity'),
    density: validateEnum(profile.density, 'density'),
    primaryGoal: validateEnum(profile.primaryGoal, 'primaryGoal'),
    secondaryGoals: Array.isArray(profile.secondaryGoals)
      ? profile.secondaryGoals.filter(g => ENUMS.primaryGoal.includes(g)).slice(0, 5)
      : undefined,
    washFrequency: validateEnum(profile.washFrequency, 'washFrequency'),
    heatUse: validateEnum(profile.heatUse, 'heatUse'),
    relaxerHistory: typeof profile.relaxerHistory === 'boolean' ? profile.relaxerHistory : undefined,
    colorTreated: typeof profile.colorTreated === 'boolean' ? profile.colorTreated : undefined,
    protectiveStyling: typeof profile.protectiveStyling === 'boolean' ? profile.protectiveStyling : undefined,
    scalpConcerns: Array.isArray(profile.scalpConcerns)
      ? profile.scalpConcerns.map(s => cleanString(s, 100)).slice(0, 10)
      : undefined,
    timeAvailable: cleanString(profile.timeAvailable, 20),
    failedAttempts: Array.isArray(profile.failedAttempts)
      ? profile.failedAttempts.map(s => cleanString(s, 100)).slice(0, 20)
      : undefined,
    productScope: validateEnum(profile.productScope, 'productScope'),
    productBudget: validateEnum(profile.productBudget, 'productBudget'),
  };
}

// Express middleware — sanitize req.body on every request
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    // Reject if body is unreasonably large (already limited by express.json but double check)
    const bodyStr = JSON.stringify(req.body);
    if (bodyStr.length > 100_000) {
      return res.status(413).json({ error: 'Payload too large' });
    }

    req.body = sanitizeObject(req.body);

    // If body has hairProfile, validate it specifically
    if (req.body.hairProfile) {
      req.body.hairProfile = sanitizeHairProfile(req.body.hairProfile);
      if (!req.body.hairProfile) {
        return res.status(400).json({ error: 'Invalid hair profile' });
      }
    }

    // Validate name
    if (req.body.name !== undefined) {
      req.body.name = cleanString(req.body.name, 50);
      if (req.body.name.length === 0) delete req.body.name;
    }

    // Validate mood
    if (req.body.mood) {
      req.body.mood = validateEnum(req.body.mood, 'mood');
    }

    // Validate notes
    if (req.body.notes !== undefined) {
      req.body.notes = cleanString(req.body.notes, 2000);
    }

    // Validate message (for chat)
    if (req.body.message !== undefined) {
      req.body.message = cleanString(req.body.message, 2000);
      if (req.body.message.length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }
    }

    // Validate weekNumber
    if (req.body.weekNumber !== undefined) {
      req.body.weekNumber = parseInt(req.body.weekNumber, 10);
      if (isNaN(req.body.weekNumber) || req.body.weekNumber < 1 || req.body.weekNumber > 520) {
        return res.status(400).json({ error: 'Invalid week number' });
      }
    }

    // Validate push token
    if (req.body.token !== undefined) {
      req.body.token = cleanString(req.body.token, 200);
      if (!/^ExponentPushToken\[.+\]$/.test(req.body.token) && !/^[a-zA-Z0-9_-]+$/.test(req.body.token)) {
        return res.status(400).json({ error: 'Invalid push token format' });
      }
    }
  }

  next();
}

export { cleanString, sanitizeObject, sanitizeHairProfile, validateEnum };
