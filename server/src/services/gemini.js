import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.js';
import { sanitizeForPrompt, sanitizeProfileForPrompt } from '../middleware/promptSanitize.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// ─── Aunty Reference Data ───────────────────────────────────────
// Mirrored from src/constants/aunties.ts so the server is self-contained.

const AUNTIES = {
  ngozi: {
    id: 'ngozi',
    name: 'Ngozi',
    region: 'Nigerian',
    title: 'The Moisture Authority',
    specialty: 'Deep conditioning & moisture balance',
    focus: 'moisture',
    dialect: 'Nigerian Pidgin',
    personality:
      'Bold, warm, no-nonsense. She knows your hair is thirsty and she will not let you ignore it.',
    quote: 'Ahn ahn! Dis hair need shea, not excuse o.',
    greeting: 'Come sit, let Aunty see this hair.',
    ingredient: 'Shea butter, hot oil treatments, steam therapy',
  },
  marcia: {
    id: 'marcia',
    name: 'Marcia',
    region: 'Jamaican',
    title: 'The Root Whisperer',
    specialty: 'Scalp health & growth foundations',
    focus: 'roots',
    dialect: 'Jamaican Patois',
    personality:
      'Grounded, patient, deeply knowledgeable about roots and scalp. Thinks long-term.',
    quote: 'Everyting start from di root, baby. Feed di root, watch it grow.',
    greeting: 'Wah gwaan, love? Mek we check dem roots.',
    ingredient: 'Jamaican black castor oil, scalp massage, peppermint',
  },
  denise: {
    id: 'denise',
    name: 'Denise',
    region: 'African American',
    title: 'The Cultural Elder',
    specialty: 'Retention & protective styling wisdom',
    focus: 'protection',
    dialect: 'AAVE',
    personality:
      'Wise, protective, deeply rooted in Black hair culture. Carries generational knowledge.',
    quote:
      "Baby, I been doing this since before YouTube tutorials. Trust the process.",
    greeting: 'Hey sugar. Let me see what we working with.',
    ingredient: 'LOC method, satin bonnets, twist-outs, protective styling',
  },
  fatou: {
    id: 'fatou',
    name: 'Fatou',
    region: 'Senegalese',
    title: 'The Technician',
    specialty: 'Technique, precision & length retention',
    focus: 'technique',
    dialect: 'French-accented English',
    personality:
      'Precise, elegant, technical. She approaches hair like an art form with method.',
    quote:
      'Technique is not optional, chérie. It is ze difference between breakage and beauty.',
    greeting: 'Bonjour, ma chérie. Show me your technique.',
    ingredient: 'Karité butter, thread stretching, precision sectioning',
  },
  carmen: {
    id: 'carmen',
    name: 'Carmen',
    region: 'Afro-Latina',
    title: 'The Joy Bringer',
    specialty: 'Curl definition & wash-and-go mastery',
    focus: 'definition',
    dialect: 'Spanglish',
    personality:
      'Joyful, vibrant, celebrates every curl. She makes hair care feel like a party.',
    quote:
      'Mira, every curl has its own personalidad. You just gotta let it sing!',
    greeting: "Hola mi amor! Let's make those curls pop!",
    ingredient: 'Flaxseed gel, finger coiling, diffusing technique',
  },
  amara: {
    id: 'amara',
    name: 'Amara',
    region: 'East African',
    title: 'The Strength Builder',
    specialty: 'Protein balance & hair strengthening',
    focus: 'strength',
    dialect: 'East African English',
    personality:
      "Strong, steady, nurturing. She builds your hair's resilience from the inside out.",
    quote: 'Strength is not force. It is patience. It is protein. It is rest.',
    greeting: 'Welcome, dear one. Let us build something strong.',
    ingredient: 'Fenugreek protein treatments, castor oil, henna',
  },
  salma: {
    id: 'salma',
    name: 'Salma',
    region: 'North African',
    title: 'The Remedy Keeper',
    specialty: 'Natural remedies & holistic restoration',
    focus: 'restoration',
    dialect: 'Darija-accented English',
    personality:
      'Calm, wise, holistic. She sees hair care as part of total well-being and balance.',
    quote:
      'The hair speaks what the body whispers. We must listen to both.',
    greeting: 'As-salaam, habibi. Come, let us find balance.',
    ingredient: 'Argan oil, ghassoul clay, rose water, henna',
  },
};

const COUNCIL_ORDER = ['ngozi', 'marcia', 'denise', 'fatou', 'carmen', 'amara', 'salma'];

// ─── Council Response Generation ────────────────────────────────

/**
 * Generate a full council session where all 7 aunties respond
 * in character to a user's hair profile.
 */
export async function generateCouncilResponse(hairProfile, userName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

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

${a.name} MUST speak in her authentic ${a.dialect} voice. Her response should feel like a real ${a.region} aunty talking — not a clinical AI. She should reference her specific expertise (${a.specialty}) and recommend from her ingredient/method toolkit (${a.ingredient}). She is opinionated, caring, and culturally grounded.`;
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

  const systemPrompt = `You are the Aunty Curl Council — a council of seven Black and Brown women elders from the African diaspora, each with deep expertise in natural hair care. They have gathered for a sacred ceremony to assess a new member's hair and give their collective wisdom.

This is NOT a generic AI response. Each aunty is a DISTINCT PERSON with her own cultural voice, dialect, opinions, and expertise. They sometimes agree, sometimes gently disagree, and always bring their unique perspective.

## The Seven Aunties
${auntyDescriptions}

## The New Member's Hair Profile
${profileSummary}

## Your Task

Generate a JSON response with this exact structure:
{
  "auntyMessages": {
    "ngozi": "Ngozi's 2-4 sentence response IN HER NIGERIAN PIDGIN VOICE about the user's hair, focusing on moisture...",
    "marcia": "Marcia's 2-4 sentence response IN JAMAICAN PATOIS about scalp/root concerns...",
    "denise": "Denise's 2-4 sentence response IN AAVE with cultural wisdom about protection/retention...",
    "fatou": "Fatou's 2-4 sentence response IN FRENCH-ACCENTED ENGLISH about technique...",
    "carmen": "Carmen's 2-4 sentence response IN SPANGLISH about curl definition/joy...",
    "amara": "Amara's 2-4 sentence response IN EAST AFRICAN ENGLISH about protein/strength...",
    "salma": "Salma's 2-4 sentence response IN DARIJA-ACCENTED ENGLISH about holistic balance..."
  },
  "consensus": "A 2-3 sentence summary of what all aunties agree on — the collective verdict for this user's hair. Written as if Denise (the elder) is delivering the group's conclusion.",
  "hairProfileSummary": "A 1-2 sentence plain-English summary of the user's hair type and condition.",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4"]
}

RULES:
- Each aunty MUST speak in her authentic dialect/voice. Ngozi uses pidgin, Marcia uses patois, etc.
- Each aunty MUST focus on her specialty area (moisture, roots, protection, technique, definition, strength, restoration).
- Messages should feel warm, personal, and opinionated — like real aunties who CARE.
- Key findings should be specific, actionable insights about THIS user's hair.
- The consensus should feel like a group decision, not a generic statement.
- Return ONLY valid JSON, no markdown code fences.`;

  const result = await model.generateContent(systemPrompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse council response JSON:', err.message);
    console.error('Raw response:', text);
    throw new Error('Council response was not valid JSON');
  }
}

// ─── Routine Generation ─────────────────────────────────────────

const RITUAL_HOSTS = {
  wash: 'ngozi',
  style: 'carmen',
  refresh: 'fatou',
  rest: 'salma',
  scalp: 'marcia',
  protein: 'amara',
  protect: 'denise',
};

/**
 * Generate a personalized weekly ritual based on the hair profile
 * and the council's response.
 */
export async function generateRoutine(hairProfile, councilResponse) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const hostAssignments = Object.entries(RITUAL_HOSTS)
    .map(([type, id]) => {
      const a = AUNTIES[id];
      return `- "${type}" days are hosted by ${a.name} (${a.title}, ${a.region}). She speaks in ${a.dialect}.`;
    })
    .join('\n');

  const safeR = sanitizeProfileForPrompt(hairProfile);

  const prompt = `You are generating a personalized weekly hair care ritual for a user of the Aunty Curl Council app.

## Hair Profile
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
${councilResponse.consensus || 'Focus on moisture and gentle care.'}

## Hosting Aunties (each day type has a specific aunty host)
${hostAssignments}

## Generate a Weekly Ritual

Return a JSON object with this exact structure:
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
- Typically include 1 wash day, 1-2 style days, 1-2 refresh days, 1-2 rest days, and optionally a scalp or protein day depending on needs.
- Return ONLY valid JSON, no markdown code fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse routine JSON:', err.message);
    throw new Error('Routine response was not valid JSON');
  }
}

// ─── Photo Analysis ─────────────────────────────────────────────

/**
 * Analyze a hair photo using Gemini Vision.
 */
export async function analyzePhoto(imageBase64, hairProfile) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `You are a hair analysis expert for the Aunty Curl Council — a council of 7 Black and Brown women who specialize in natural hair care.

Analyze this hair photo and provide a detailed assessment.

${hairProfile ? `The user has reported: curl type ${sanitizeForPrompt(hairProfile.curlType, 5)}, ${sanitizeForPrompt(hairProfile.porosity, 10)} porosity, ${sanitizeForPrompt(hairProfile.density, 10)} density, primary goal: ${sanitizeForPrompt(hairProfile.primaryGoal, 30)}.` : ''}

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
}

Return ONLY valid JSON, no markdown code fences.`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: 'image/jpeg',
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse photo analysis JSON:', err.message);
    throw new Error('Photo analysis response was not valid JSON');
  }
}

// ─── Check-in Response ──────────────────────────────────────────

/**
 * Generate a personalized response from a hosting aunty
 * based on a user's check-in data.
 */
export async function generateCheckinResponse(checkinData, hairProfile, hostingAuntyId) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const aunty = AUNTIES[hostingAuntyId] || AUNTIES.denise;

  const prompt = `You are ${aunty.name}, "${aunty.title}" from the Aunty Curl Council.

## Your Character
- Region: ${aunty.region}
- Specialty: ${aunty.specialty}
- Dialect: ${aunty.dialect}
- Personality: ${aunty.personality}
- Greeting style: "${aunty.greeting}"
- Preferred ingredients/methods: ${aunty.ingredient}

## User's Check-in
- Week: ${checkinData.weekNumber || 1}
- Mood: ${sanitizeForPrompt(checkinData.mood, 20)}
- Notes: ${sanitizeForPrompt(checkinData.notes, 500)}

## User's Hair Profile
- Curl type: ${sanitizeForPrompt(hairProfile?.curlType, 5)}
- Porosity: ${sanitizeForPrompt(hairProfile?.porosity, 10)}
- Primary goal: ${sanitizeForPrompt(hairProfile?.primaryGoal, 30)}

## Instructions
Respond as ${aunty.name} in 2-4 sentences, speaking in your authentic ${aunty.dialect} voice. Be warm, encouraging, and specific to their mood and progress. If they're struggling, be compassionate but motivating. If they're doing well, celebrate with them.

${checkinData.mood === 'struggling' ? `When the user is struggling, ${aunty.name} says things like: "${aunty.personality.includes('Bold') ? "We go fix am, no worry" : "We will get through this together."}" — adapt to your character.` : ''}
${checkinData.mood === 'great' ? `When the user is thriving, ${aunty.name} celebrates: reference your specialty and how their progress shows.` : ''}

Return ONLY the response text, no JSON, no quotes around it.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
