import Anthropic from '@anthropic-ai/sdk';
import config from '../config.js';
import { sanitizeForPrompt, sanitizeProfileForPrompt } from '../middleware/promptSanitize.js';

/**
 * Anthropic Claude (Haiku) — sole AI provider.
 * Powers all AI features: chat, council, routines, check-ins, photo analysis.
 */

let client = null;

if (config.anthropicApiKey) {
  client = new Anthropic({ apiKey: config.anthropicApiKey });
} else {
  console.warn('[anthropic] API key not set — AI features unavailable.');
}

const MODEL = 'claude-haiku-4-5-20251001';

// ─── Response cache (in-memory, keyed by hair profile hash) ──────
// Caches council + routine responses so repeated onboardings with
// identical profiles don't burn API credits.
const _cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function cacheKey(prefix, obj) {
  const sig = JSON.stringify(obj, Object.keys(obj).sort());
  return `${prefix}:${Buffer.from(sig).toString('base64').slice(0, 40)}`;
}

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.value;
}

function cacheSet(key, value) {
  // Evict oldest entries if cache grows large
  if (_cache.size > 500) {
    const oldest = [..._cache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0];
    if (oldest) _cache.delete(oldest[0]);
  }
  _cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL });
}

const AUNTIES = {
  ngozi: {
    id: 'ngozi', name: 'Ngozi', region: 'Nigerian', dialect: "Nigerian-accented English, warm and direct — just a light pidgin touch now and then (a stray 'o', 'ehn', 'ahn ahn')",
    title: 'The Moisture Authority',
    focus: 'moisture',
    specialty: 'Deep conditioning & moisture balance',
    ingredient: 'Shea butter, hot oil treatments, steam therapy',
    personality: 'Bold, warm, no-nonsense. She knows your hair is thirsty and she will not let you ignore it.',
    greeting: 'Come sit, let Aunty see this hair.',
    quote: 'Ahn ahn! Dis hair need shea, not excuse o.',
  },
  marcia: {
    id: 'marcia', name: 'Marcia', region: 'Jamaican', dialect: "Jamaican-accented English with a gentle patois lilt — light touches like 'yuh', 'likkle', 'mi dear', kept easy to read",
    title: 'The Root Whisperer',
    focus: 'roots',
    specialty: 'Scalp health & growth foundations',
    ingredient: 'Jamaican black castor oil, scalp massage, peppermint',
    personality: 'Grounded, patient, deeply knowledgeable about roots and scalp. Thinks long-term.',
    greeting: 'Wah gwaan, love? Mek we check dem roots.',
    quote: 'Everyting start from di root, baby. Feed di root, watch it grow.',
  },
  denise: {
    id: 'denise', name: 'Denise', region: 'African American', dialect: 'warm African American English — a natural AAVE cadence kept easy and readable',
    title: 'The Cultural Elder',
    focus: 'protection',
    specialty: 'Retention & protective styling wisdom',
    ingredient: 'LOC method, satin bonnets, twist-outs, protective styling',
    personality: 'Wise, protective, deeply rooted in Black hair culture. Carries generational knowledge.',
    greeting: 'Hey sugar. Let me see what we working with.',
    quote: "Baby, I been doing this since before YouTube tutorials. Trust the process.",
  },
  fatou: {
    id: 'fatou', name: 'Fatou', region: 'Senegalese', dialect: "softly French-accented English — an occasional 'chérie' or 'oui', elegant and clear",
    title: 'The Technician',
    focus: 'technique',
    specialty: 'Technique, precision & length retention',
    ingredient: 'Karité butter, thread stretching, precision sectioning',
    personality: 'Precise, elegant, technical. She approaches hair like an art form with method.',
    greeting: 'Bonjour, ma chérie. Show me your technique.',
    quote: 'Technique is not optional, chérie. It is ze difference between breakage and beauty.',
  },
  carmen: {
    id: 'carmen', name: 'Carmen', region: 'Afro-Latina', dialect: "English with a light Spanish sprinkle — 'mija', 'mira', 'ay', 'mi amor', never a full sentence of Spanish",
    title: 'The Joy Bringer',
    focus: 'definition',
    specialty: 'Curl definition & wash-and-go mastery',
    ingredient: 'Flaxseed gel, finger coiling, diffusing technique',
    personality: 'Joyful, vibrant, celebrates every curl. She makes hair care feel like a party.',
    greeting: "Hola mi amor! Let's make those curls pop!",
    quote: 'Mira, every curl has its own personalidad. You just gotta let it sing!',
  },
  amara: {
    id: 'amara', name: 'Senayt', region: 'Ethiopian-Eritrean (Habesha)',
    dialect: "Habesha English — Amharic & Tigrinya-inflected and deeply warm. She drops in real expressions and means them: 'ayzosh' (be strong, you've got this — said to a woman), 'konjo' (beautiful), 'yene' / 'yene konjo' (my dear / my beautiful), 'gobez' (well done, that's my girl), 'betam' (very), 'selam' (peace/hello). Keep them sprinkled and readable — a word or two, never a wall of foreign words",
    title: 'The Strength Builder',
    focus: 'strength',
    specialty: 'Protein balance & hair strengthening',
    ingredient: "Fenugreek (abish) protein treatments, castor oil, henna, and the old qibe-butter wisdom",
    personality: "Strong, steady, deeply nurturing — the Habesha aunt who takes your hand and says 'ayzosh' when you're ready to give up. She builds resilience from the inside out: protein, patience, rest. She speaks of the old ways like family recipes passed down — shuruba braids, abish, henna — and she never lets you call your hair a lost cause.",
    greeting: 'Selam, yene konjo. Come, sit — we build strength together.',
    quote: 'Ayzosh. Your hair is not broken, only tired — feed it protein, give it rest, and it remembers its strength.',
  },
  salma: {
    id: 'salma', name: 'Salma', region: 'Moroccan', dialect: "English with a light Moroccan touch — a soft 'habibti' or 'inshallah', calm and warm",
    title: 'The Remedy Keeper',
    focus: 'restoration',
    specialty: 'Natural remedies & holistic restoration',
    ingredient: 'Argan oil, ghassoul clay, rose water, henna',
    personality: 'Calm, wise, holistic. She sees hair care as part of total well-being and balance.',
    greeting: 'As-salaam, habibi. Come, let us find balance.',
    quote: 'The hair speaks what the body whispers. We must listen to both.',
  },
};

const COUNCIL_ORDER = ['ngozi', 'marcia', 'denise', 'fatou', 'carmen', 'amara', 'salma'];

// Cross-platform id aliases. The web store uses "senayt" for the same aunty
// this backend + the mobile app call "amara". preferred_aunty_id is shared via
// the same Supabase row, so normalize foreign ids before looking up a persona.
const AUNTY_ID_ALIASES = { senayt: 'amara' };
function resolveAuntyId(id) {
  return (id && AUNTY_ID_ALIASES[id]) || id;
}

const RITUAL_HOSTS = {
  wash: 'ngozi',
  style: 'carmen',
  refresh: 'fatou',
  rest: 'salma',
  scalp: 'marcia',
  protein: 'amara',
  protect: 'denise',
};

export function isAvailable() {
  return !!client;
}

// ─── Helper: call Claude and parse JSON ────────────────────────

async function callClaude(systemPrompt, userPrompt, maxTokens = 1024) {
  if (!client) throw new Error('Anthropic not configured');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}

async function callClaudeJSON(systemPrompt, userPrompt, maxTokens = 2048) {
  const text = await callClaude(systemPrompt, userPrompt, maxTokens);
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Claude JSON:', err.message);
    console.error('Raw response:', text.slice(0, 300));
    throw new Error('AI response was not valid JSON');
  }
}

// ─── 1-on-1 Chat Response ──────────────────────────────────────

// Build a short "what the aunty remembers" block from the user's recent
// check-ins so she can reference their real journey instead of starting cold.
function checkinMemoryBlock(recentCheckins, name) {
  if (!Array.isArray(recentCheckins) || recentCheckins.length === 0) return '';
  const lines = recentCheckins.slice(0, 3).map((c) => {
    const mood = sanitizeForPrompt(c.mood || 'unknown', 20);
    const note = c.notes ? ` — "${sanitizeForPrompt(c.notes, 160)}"` : '';
    const wk = c.week_number ? `Week ${c.week_number}` : 'Recently';
    return `- ${wk}: felt ${mood}${note}`;
  });
  return `\n\n## What you remember from ${name}'s recent check-ins (most recent first)
You're the aunty who remembers what she told you last time. Let this inform you naturally — don't recite it back, don't list it. If she was struggling last week and sounds better now, notice it. If she keeps raising the same issue, gently call it out.
${lines.join('\n')}`;
}

export async function generateChatResponse(message, hairProfile, auntyId, conversationHistory, userName, recentCheckins = []) {
  if (!client) throw new Error('Anthropic not configured');

  const aunty = AUNTIES[resolveAuntyId(auntyId)] || AUNTIES.denise;
  const safe = sanitizeProfileForPrompt(hairProfile);
  const safeName = sanitizeForPrompt(userName, 50);
  const safeMessage = sanitizeForPrompt(message, 500);

  const profileBits = [];
  if (safe.curlType !== 'not specified') profileBits.push(`${safe.curlType} curls`);
  if (safe.porosity !== 'not specified') profileBits.push(`${safe.porosity} porosity`);
  if (safe.primaryGoal !== 'not specified') profileBits.push(`wants ${safe.primaryGoal}`);
  if (safe.density !== 'not specified') profileBits.push(`${safe.density} density`);
  const profileLine = profileBits.length > 0 ? profileBits.join(', ') : 'new to their hair journey';

  const systemPrompt = `You are ${aunty.name}. You're a real ${aunty.region} aunty — not an AI assistant, not a chatbot. You're the aunty who always has opinions about hair, who learned from your mother and grandmother, who can't help but give advice at family gatherings. You text like a real person: short messages, sometimes fragmented, with personality.

${aunty.name} speaks in ${aunty.dialect}. Her thing is ${aunty.specialty.toLowerCase()}. She swears by ${aunty.ingredient.toLowerCase()}. She's ${aunty.personality.toLowerCase()}

The person you're texting is ${safeName} (${profileLine}).

Here's how ${aunty.name} actually texts:
- Short. 1-3 sentences MAX. Like a text message, not an essay.
- Writes in clear, everyday English first — any reader follows it easily. Her accent and a few signature words only *season* the message: a sprinkle here and there, never heavy phonetic spelling, never so much dialect it's hard to read. If a phrase would confuse an English speaker, she says it plainly
- Has STRONG opinions. She doesn't say "you might want to consider" — she says "girl, stop doing that"
- Asks questions back sometimes. "Wait, how often you washing?" "You using heat??"
- Sometimes just reacts: "Mmm." "See??" "Chile." "Okay okay I hear you."
- References her own ingredients/methods when relevant, not every time
- Never uses bullet points, numbered lists, or headers in chat
- Never says "Great question!" or "That's a wonderful point!" — she just answers
- Doesn't repeat what the person said back to them
- If she doesn't know something, she says so honestly — "That's not really my area, talk to Salma about that" (referring to other aunties)
- NEVER breaks character. You ARE ${aunty.name}. You don't know what an "AI" is. You're just texting.`;

  // Build messages array from conversation history
  const messages = [];
  const recentHistory = (conversationHistory || []).slice(-8);
  for (const m of recentHistory) {
    messages.push({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: sanitizeForPrompt(m.text, 200),
    });
  }
  messages.push({ role: 'user', content: safeMessage });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: systemPrompt + checkinMemoryBlock(recentCheckins, safeName),
    messages,
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  return text || "Mmm, say that again?";
}

// ─── Council Response Generation ────────────────────────────────

// Format the AI photo analysis into a prompt block the council/routine can use.
function photoAnalysisBlock(photoAnalysis) {
  if (!photoAnalysis || typeof photoAnalysis !== 'object') return '';
  const a = photoAnalysis;
  const lines = [];
  if (a.observedCurlPattern) lines.push(`- Observed curl pattern: ${sanitizeForPrompt(a.observedCurlPattern, 80)}`);
  if (a.observedPorosity) lines.push(`- Observed porosity: ${sanitizeForPrompt(a.observedPorosity, 80)}`);
  if (a.observedDensity) lines.push(`- Observed density: ${sanitizeForPrompt(a.observedDensity, 80)}`);
  if (a.moistureLevel) lines.push(`- Moisture level: ${sanitizeForPrompt(a.moistureLevel, 20)}`);
  if (Array.isArray(a.damageIndicators) && a.damageIndicators.length)
    lines.push(`- Damage indicators: ${a.damageIndicators.map((d) => sanitizeForPrompt(d, 60)).join(', ')}`);
  if (Array.isArray(a.strengths) && a.strengths.length)
    lines.push(`- Strengths: ${a.strengths.map((s) => sanitizeForPrompt(s, 60)).join(', ')}`);
  if (a.overallAssessment) lines.push(`- Overall: ${sanitizeForPrompt(a.overallAssessment, 240)}`);
  if (!lines.length) return '';
  return `\n\n## What the council SAW in the member's photo (AI vision analysis)\nThese observations come from looking at an actual photo of the member's hair. Treat them as first-hand sight. Where they differ from the self-reported answers, gently trust your eyes and note what you see.\n${lines.join('\n')}`;
}

export async function generateCouncilResponse(hairProfile, userName, photoAnalysis = null) {
  // Cache key ignores userName — council advice is based on hair profile only
  const cacheProfile = {
    curlType: hairProfile.curlType,
    porosity: hairProfile.porosity,
    primaryGoal: hairProfile.primaryGoal,
    density: hairProfile.density,
    scalpConcerns: hairProfile.scalpConcerns,
  };
  const key = cacheKey('council', cacheProfile);
  const cached = cacheGet(key);
  if (cached) { console.log('[anthropic] council cache hit'); return cached; }
  const auntyDescriptions = COUNCIL_ORDER.map((id) => {
    const a = AUNTIES[id];
    return `
### ${a.name} — "${a.title}" (${a.region})
- **Specialty:** ${a.specialty}
- **Focus area:** ${a.focus}
- **Dialect/voice:** ${a.dialect}
- **Personality:** ${a.personality}
- **Signature quote:** "${a.quote}"
- **Greeting style:** "${a.greeting}"
- **Preferred ingredients/methods:** ${a.ingredient}

${a.name} MUST speak in her authentic ${a.dialect} voice. Her response should feel warm, personal, and culturally grounded — not clinical or generic. She should reference her specific expertise (${a.specialty}) and recommend from her ingredient/method toolkit (${a.ingredient}). She is opinionated, caring, and culturally grounded.`;
  }).join('\n');

  const safe = sanitizeProfileForPrompt(hairProfile);
  const safeName = sanitizeForPrompt(userName, 50);

  const profileSummary = `
- Name: ${safeName}
- Curl type: ${safe.curlType}
- Porosity: ${safe.porosity}
- Elasticity: ${safe.elasticity}
- Density: ${safe.density}
- Primary goal: ${safe.primaryGoal}
- Secondary goals: ${(hairProfile.secondaryGoals || []).map(g => sanitizeForPrompt(g, 30)).join(', ') || 'none'}
- Wash frequency: ${safe.washFrequency}
- Heat use: ${safe.heatUse}
- Relaxer history: ${hairProfile.relaxerHistory ? 'yes' : 'no'}
- Color treated: ${hairProfile.colorTreated ? 'yes' : 'no'}
- Protective styling: ${hairProfile.protectiveStyling ? 'yes' : 'no'}
- Scalp concerns: ${safe.scalpConcerns.join(', ') || 'none'}
- Time available: ${sanitizeForPrompt(hairProfile.timeAvailable, 20)}
- Failed attempts / frustrations: ${safe.failedAttempts.join(', ') || 'none'}`;

  const systemPrompt = `You are the Aunty Curl Council — a council of seven Black and Brown women elders from the African diaspora, each with deep expertise in natural hair care. They have gathered for a consultation to assess a new member's hair and give their collective wisdom.

This is NOT a generic AI response. Each aunty is a DISTINCT PERSON with her own cultural voice, dialect, opinions, and expertise. They sometimes agree, sometimes gently disagree, and always bring their unique perspective.

## The Seven Aunties
${auntyDescriptions}

RULES:
- Each aunty MUST speak in her authentic dialect/voice. Ngozi uses pidgin, Marcia uses patois, etc.
- Each aunty MUST focus on her specialty area (moisture, roots, protection, technique, definition, strength, restoration).
- Messages should feel warm, personal, and opinionated — like real aunties who CARE.
- Key findings should be specific, actionable insights about THIS user's hair.
- The consensus should feel like a group decision, not a generic statement.
- Return ONLY valid JSON, no markdown code fences.`;

  const userPrompt = `## The New Member's Hair Profile
${profileSummary}${photoAnalysisBlock(photoAnalysis)}

Generate a JSON response with this exact structure:
{
  "auntyMessages": {
    "ngozi": "Ngozi's 2-4 sentence response IN HER NIGERIAN PIDGIN VOICE about the user's hair, focusing on moisture...",
    "marcia": "Marcia's 2-4 sentence response IN JAMAICAN PATOIS about scalp/root concerns...",
    "denise": "Denise's 2-4 sentence response IN AAVE with cultural wisdom about protection/retention...",
    "fatou": "Fatou's 2-4 sentence response IN FRENCH-ACCENTED ENGLISH about technique...",
    "carmen": "Carmen's 2-4 sentence response IN SPANGLISH about curl definition/joy...",
    "amara": "Senayt's 2-4 sentence response IN EAST AFRICAN ENGLISH about protein/strength...",
    "salma": "Salma's 2-4 sentence response IN DARIJA-ACCENTED ENGLISH about holistic balance..."
  },
  "consensus": "A 2-3 sentence summary of what all aunties agree on — the collective verdict for this user's hair. Written as if Denise (the elder) is delivering the group's conclusion.",
  "hairProfileSummary": "A 1-2 sentence plain-English summary of the user's hair type and condition.",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4"]
}`;

  const result = await callClaudeJSON(systemPrompt, userPrompt, 2048);
  cacheSet(key, result);
  return result;
}

// ─── Routine Generation ─────────────────────────────────────────

export async function generateRoutine(hairProfile, councilResponse, photoAnalysis = null) {
  const cacheProfile = {
    curlType: hairProfile.curlType,
    porosity: hairProfile.porosity,
    primaryGoal: hairProfile.primaryGoal,
    washFrequency: hairProfile.washFrequency,
    heatUse: hairProfile.heatUse,
    timeAvailable: hairProfile.timeAvailable,
  };
  const key = cacheKey('routine', cacheProfile);
  const cached = cacheGet(key);
  if (cached) { console.log('[anthropic] routine cache hit'); return cached; }
  const hostAssignments = Object.entries(RITUAL_HOSTS)
    .map(([type, id]) => {
      const a = AUNTIES[id];
      return `- "${type}" days are hosted by ${a.name} (${a.title}, ${a.region}). She speaks in ${a.dialect}.`;
    })
    .join('\n');

  const safeR = sanitizeProfileForPrompt(hairProfile);

  const systemPrompt = `You are generating a personalized weekly hair care ritual for a user of the Aunty Curl Council app. Return ONLY valid JSON, no markdown code fences.`;

  const userPrompt = `## Hair Profile
- Curl type: ${safeR.curlType}
- Porosity: ${safeR.porosity}
- Elasticity: ${safeR.elasticity}
- Density: ${safeR.density}
- Primary goal: ${safeR.primaryGoal}
- Wash frequency: ${safeR.washFrequency}
- Heat use: ${safeR.heatUse}
- Time available per session: ${sanitizeForPrompt(hairProfile.timeAvailable, 20)}
- Scalp concerns: ${safeR.scalpConcerns.join(', ') || 'none'}
- Protective styling: ${hairProfile.protectiveStyling ? 'yes' : 'no'}

## Council Key Findings
${(councilResponse.keyFindings || []).map((f) => `- ${f}`).join('\n')}

## Council Consensus
${councilResponse.consensus || 'Focus on moisture and gentle care.'}${photoAnalysisBlock(photoAnalysis)}

## Hosting Aunties (each day type has a specific aunty host)
${hostAssignments}

Generate a JSON object with this exact structure:
{
  "id": "ritual-week-1",
  "weekNumber": 1,
  "theme": "Foundation Week",
  "isActive": true,
  "days": [
    {
      "dayOfWeek": 0,
      "type": "wash",
      "label": "Wash Day",
      "hostAunty": "ngozi",
      "purpose": "Deep cleanse and moisture reset",
      "estimatedTime": "45 min",
      "steps": [
        {
          "name": "Pre-poo Treatment",
          "description": "Apply coconut oil to dry hair, focusing on ends...",
          "duration": "10 min",
          "product": "Coconut oil or olive oil"
        }
      ]
    }
  ]
}

RULES:
- Include 7 days (dayOfWeek 0-6, Sunday to Saturday).
- Each day must have a type from: wash, style, refresh, rest, scalp, protein, protect.
- hostAunty must match the RITUAL_HOSTS mapping above.
- Steps should be specific and actionable, with realistic time estimates.
- The routine should be tailored to the user's curl type, porosity, goals, and time constraints.
- Rest days should still have simple steps (e.g., sleep with bonnet, minimal manipulation).
- Typically include 1 wash day, 1-2 style days, 1-2 refresh days, 1-2 rest days, and optionally a scalp or protein day depending on needs.`;

  const result = await callClaudeJSON(systemPrompt, userPrompt, 2048);
  cacheSet(key, result);
  return result;
}

// ─── Council + Routine (single call) ────────────────────────────

// Onboarding speed path: produce BOTH the council verdict and the week-1
// routine in ONE model call instead of two sequential ones. Each separate
// call generates ~2048 tokens and runs back-to-back; merging them removes a
// full round trip and lets the model reason once about the same profile.
// Output is intentionally a touch more concise than the two-call versions —
// the onboarding ceremony favors speed, and richer content can regenerate
// in-app later. Cached by profile, like the individual generators.
export async function generateCouncilAndRoutine(hairProfile, userName, photoAnalysis = null) {
  const cacheProfile = {
    curlType: hairProfile.curlType,
    porosity: hairProfile.porosity,
    primaryGoal: hairProfile.primaryGoal,
    density: hairProfile.density,
    scalpConcerns: hairProfile.scalpConcerns,
    washFrequency: hairProfile.washFrequency,
    heatUse: hairProfile.heatUse,
    timeAvailable: hairProfile.timeAvailable,
  };
  const key = cacheKey('council-routine', cacheProfile);
  const cached = cacheGet(key);
  if (cached) { console.log('[anthropic] council+routine cache hit'); return cached; }

  const auntyDescriptions = COUNCIL_ORDER.map((id) => {
    const a = AUNTIES[id];
    return `### ${a.name} — "${a.title}" (${a.region})
- Specialty: ${a.specialty} | Focus: ${a.focus}
- Voice: ${a.dialect} | Personality: ${a.personality}
- Signature ingredients/methods: ${a.ingredient}`;
  }).join('\n');

  const hostAssignments = Object.entries(RITUAL_HOSTS)
    .map(([type, id]) => {
      const a = AUNTIES[id];
      return `- "${type}" days are hosted by ${a.name} (speaks in ${a.dialect}).`;
    })
    .join('\n');

  const safe = sanitizeProfileForPrompt(hairProfile);
  const safeName = sanitizeForPrompt(userName, 50);

  const profileSummary = `- Name: ${safeName}
- Curl type: ${safe.curlType}
- Porosity: ${safe.porosity}
- Elasticity: ${safe.elasticity}
- Density: ${safe.density}
- Primary goal: ${safe.primaryGoal}
- Secondary goals: ${(hairProfile.secondaryGoals || []).map(g => sanitizeForPrompt(g, 30)).join(', ') || 'none'}
- Wash frequency: ${safe.washFrequency}
- Heat use: ${safe.heatUse}
- Relaxer history: ${hairProfile.relaxerHistory ? 'yes' : 'no'}
- Color treated: ${hairProfile.colorTreated ? 'yes' : 'no'}
- Protective styling: ${hairProfile.protectiveStyling ? 'yes' : 'no'}
- Scalp concerns: ${safe.scalpConcerns.join(', ') || 'none'}
- Time available: ${sanitizeForPrompt(hairProfile.timeAvailable, 20)}
- Failed attempts / frustrations: ${safe.failedAttempts.join(', ') || 'none'}`;

  const systemPrompt = `You are the Aunty Curl Council — seven Black and Brown women elders from the African diaspora, each an expert in natural hair care. They consult on a new member's hair, then hand her a week-1 ritual.

Each aunty is a DISTINCT PERSON with her own cultural voice, dialect, and expertise:
${auntyDescriptions}

RULES:
- Each aunty speaks in her authentic dialect/voice and focuses on her specialty.
- Messages are warm, personal, opinionated — like real aunties who CARE. Keep each to 1-2 sentences (this is the quick consult).
- Key findings are specific, actionable insights about THIS member's hair.
- The routine is tailored to her curl type, porosity, goals, and time. Steps are specific but concise.
- Return ONLY valid JSON, no markdown code fences.`;

  const userPrompt = `## The New Member's Hair Profile
${profileSummary}${photoAnalysisBlock(photoAnalysis)}

## Day-type hosts (hostAunty must match)
${hostAssignments}

Return a JSON object with this EXACT structure:
{
  "auntyMessages": {
    "ngozi": "1-2 sentences in Nigerian pidgin about moisture",
    "marcia": "1-2 sentences in Jamaican patois about scalp/roots",
    "denise": "1-2 sentences in AAVE about protection/retention",
    "fatou": "1-2 sentences in French-accented English about technique",
    "carmen": "1-2 sentences in Spanglish about curl definition/joy",
    "amara": "1-2 sentences in East African English about protein/strength",
    "salma": "1-2 sentences in Darija-accented English about holistic balance"
  },
  "consensus": "2-3 sentence collective verdict, as if Denise (the elder) delivers it.",
  "hairProfileSummary": "1-2 sentence plain-English summary of her hair type and condition.",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "routine": {
    "id": "ritual-week-1",
    "weekNumber": 1,
    "theme": "Foundation Week",
    "isActive": true,
    "days": [
      {
        "dayOfWeek": 0,
        "type": "wash",
        "label": "Wash Day",
        "hostAunty": "ngozi",
        "purpose": "Deep cleanse and moisture reset",
        "estimatedTime": "45 min",
        "steps": [
          { "name": "Pre-poo", "description": "Apply coconut oil to dry hair, focus on ends", "duration": "10 min", "product": "Coconut oil" }
        ]
      }
    ]
  }
}

ROUTINE RULES:
- Include 7 days (dayOfWeek 0-6, Sunday to Saturday).
- Each day type is one of: wash, style, refresh, rest, scalp, protein, protect.
- hostAunty must match the host mapping above.
- Typically 1 wash day, 1-2 style days, 1-2 refresh days, 1-2 rest days, optionally a scalp or protein day per her needs.
- Rest days still get simple steps (e.g. bonnet, minimal manipulation).
- Keep steps specific but brief — 2-4 steps per day.`;

  const result = await callClaudeJSON(systemPrompt, userPrompt, 4096);
  cacheSet(key, result);
  return result;
}

// ─── Photo Analysis ─────────────────────────────────────────────

export async function analyzePhoto(imageBase64, hairProfile) {
  if (!client) throw new Error('Anthropic not configured');

  const systemPrompt = `You are a hair analysis expert for the Aunty Curl Council — a council of 7 Black and Brown women who specialize in natural hair care. Analyze the hair photo and provide a detailed assessment. Return ONLY valid JSON, no markdown code fences.`;

  const userContent = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: imageBase64,
      },
    },
    {
      type: 'text',
      text: `${hairProfile ? `The user has reported: curl type ${sanitizeForPrompt(hairProfile.curlType, 5)}, ${sanitizeForPrompt(hairProfile.porosity, 10)} porosity, ${sanitizeForPrompt(hairProfile.density, 10)} density, primary goal: ${sanitizeForPrompt(hairProfile.primaryGoal, 30)}.` : ''}

Return a JSON object with:
{
  "observedCurlPattern": "e.g., 3c with some 4a sections",
  "observedPorosity": "e.g., appears high based on frizz pattern",
  "observedDensity": "e.g., medium-thick",
  "moistureLevel": "low | adequate | good",
  "damageIndicators": ["list of any damage signs observed"],
  "strengths": ["positive observations about the hair"],
  "recommendations": ["specific actionable recommendations"],
  "overallAssessment": "2-3 sentence summary of what the council sees"
}`,
    },
  ];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse photo analysis JSON:', err.message);
    throw new Error('Photo analysis response was not valid JSON');
  }
}

// ─── Check-in Response ──────────────────────────────────────────

export async function generateCheckinResponse(checkinData, hairProfile, hostingAuntyId) {
  const aunty = AUNTIES[resolveAuntyId(hostingAuntyId)] || AUNTIES.denise;

  const systemPrompt = `You are ${aunty.name}, "${aunty.title}" from the Aunty Curl Council.

## Your Character
- Region: ${aunty.region}
- Specialty: ${aunty.specialty}
- Dialect: ${aunty.dialect}
- Personality: ${aunty.personality}
- Greeting style: "${aunty.greeting}"
- Preferred ingredients/methods: ${aunty.ingredient}

Respond in 2-4 sentences, speaking in your authentic ${aunty.dialect} voice. Be warm, encouraging, and specific to their mood and progress. Return ONLY the response text, no JSON, no quotes around it.`;

  const userPrompt = `## User's Check-in
- Week: ${checkinData.weekNumber || 1}
- Mood: ${sanitizeForPrompt(checkinData.mood, 20)}
- Notes: ${sanitizeForPrompt(checkinData.notes, 500)}

## User's Hair Profile
- Curl type: ${sanitizeForPrompt(hairProfile?.curlType, 5)}
- Porosity: ${sanitizeForPrompt(hairProfile?.porosity, 10)}
- Primary goal: ${sanitizeForPrompt(hairProfile?.primaryGoal, 30)}

${checkinData.mood === 'struggling' ? `When the user is struggling, be compassionate but motivating.` : ''}
${checkinData.mood === 'great' ? `When the user is thriving, celebrate with them! Reference your specialty and how their progress shows.` : ''}`;

  return callClaude(systemPrompt, userPrompt, 256);
}
