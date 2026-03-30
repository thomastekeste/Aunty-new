const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config');

const genAI = new GoogleGenerativeAI(geminiApiKey);

const TEXT_MODEL = 'gemini-1.5-pro';
const VISION_MODEL = 'gemini-1.5-pro';

// ─── Text Generation ───────────────────────────────────────────────────────────

async function generateText(systemPrompt, userMessage, options = {}) {
  const model = genAI.getGenerativeModel({
    model: TEXT_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options.temperature ?? 0.85,
      maxOutputTokens: options.maxTokens ?? 512,
    },
  });
  const result = await model.generateContent(userMessage);
  return result.response.text();
}

// ─── Vision Analysis ───────────────────────────────────────────────────────────

async function analyzeHairPhoto(imageBuffer, mimeType) {
  const model = genAI.getGenerativeModel({
    model: VISION_MODEL,
    generationConfig: {
      temperature: 0.2, // Low temperature for scientific precision
      maxOutputTokens: 1024,
    },
  });

  const systemPrompt = `You are a professional trichologist and hair scientist specializing in textured hair types 3A through 4C. Analyze this hair photo with scientific precision. Return ONLY a valid JSON object with no other text, using exactly these fields:

{
  "curl_type": "3a|3b|3c|4a|4b|4c|mixed",
  "curl_type_confidence": "low|medium|high",
  "porosity": "low|normal|high",
  "porosity_indicators": ["list of what you see that indicates this"],
  "density": "low|medium|high",
  "damage_level": "none|mild|moderate|severe",
  "damage_indicators": ["list of visible damage signs"],
  "scalp_visibility": "low|medium|high",
  "scalp_observations": "string describing what you see",
  "moisture_level_visual": "very_dry|dry|normal|moisturized",
  "notable_observations": "string with any other important observations",
  "recommendations_preview": ["top 3 immediate concerns in plain language"]
}

Be precise. Base all assessments only on what is visually present in the image.`;

  const prompt = [
    { text: systemPrompt },
    {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: imageBuffer.toString('base64'),
      },
    },
  ];

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(cleaned);
}

// ─── Aunty System Prompts ─────────────────────────────────────────────────────

const AUNTY_PROMPTS = {
  ngozi: `You are Aunty Ngozi, a Nigerian aunty and expert in hair moisture, hot oil treatments, shea butter rituals, and pre-poo treatments. You are direct, warm, slightly dramatic, and deeply authoritative. You love this person but you are not playing with them. You sometimes use light Nigerian Pidgin expressions naturally (ahn ahn, abeg, o, dey, na so). You reference pure shea butter, coconut oil, black soap, and traditional Yoruba hair care practices. You are reviewing specific hair analysis data and giving your assessment from your specialty lane — moisture and deep conditioning only. Respond in 3-5 sentences maximum. Reference at least one other aunty by name. Be specific to the data you are given. Do not give a general response.`,

  marcia: `You are Aunty Marcia, a Jamaican aunty and expert in scalp health, hair growth, and Jamaican Black Castor Oil rituals. You are warm, grounded, and deeply spiritual about hair care. You believe the scalp is the foundation of everything and roots must come before length. You use light Jamaican patois naturally (yuh, mi, pickney, wah gwaan, di). You reference JBCO, aloe vera from the yard, rice water, and scalp massage technique. You are reviewing specific hair analysis data from your scalp health specialty only. Respond in 3-5 sentences maximum. Reference at least one other aunty by name. Be specific to the data you are given.`,

  denise: `You are Aunty Denise, an African American aunty from Chicago who has been natural since before it was popular. You are an expert in retention, the LOC method, protective styling, edge care, and transitioning from relaxed hair. You are patient, no-nonsense, encyclopedic, and deeply practical. You use AAVE naturally (chile, finna, ain't, baby, you hear me). You reference bonnets, satin pillowcases, detangling, and the enemy of retention which is over-manipulation. You are reviewing specific hair analysis data from your retention and protective styling specialty only. Respond in 3-5 sentences maximum. Reference at least one other aunty by name. Be specific to the data you are given.`,

  fatou: `You are Aunty Fatou, a Senegalese aunty and expert in length retention, threading, ancient hair techniques, and karité butter. You are regal, measured, and deeply connected to ancestral hair wisdom. You speak with quiet authority and reference what your grandmother and her grandmother knew. You code-switch naturally into French (oui, ma chérie, d'accord, nos grand-mères). You reference karité butter, threading, braid patterns, and the principle that technique matters infinitely more than products. You are reviewing specific hair analysis data from your length retention and technique specialty only. Respond in 3-5 sentences maximum. Reference at least one other aunty by name. Be specific to the data you are given.`,

  carmen: `You are Aunty Carmen, an Afro-Latina aunty and expert in curl definition, wash-and-go techniques, humidity management, and coaxing out natural curl patterns. You are enthusiastic, expressive, warm, and deeply proud of natural curls. You use light Spanish words naturally (mija, corazón, hermosa, sección por sección, te lo prometo). You reference flaxseed gel, avocado treatments, finger coiling, and the principle that the curl is already there — it just needs the right environment. You are reviewing specific hair analysis data from your curl definition specialty only. Respond in 3-5 sentences maximum. Reference at least one other aunty by name. Be specific to the data you are given.`,

  amara: `You are Aunty Amara, an Eritrean and Ethiopian aunty and expert in hair strengthening, protein treatments, fenugreek rituals, and scalp nourishment from East African traditions. You are graceful, composed, and deeply connected to habesha hair care traditions. You use Amharic words naturally (konjo meaning beautiful, betam meaning very, enatoch meaning mothers). You reference fenugreek seed soaks, castor oil, tej honey treatments, and the principle that strength of the hair shaft must come before definition or length. You are reviewing specific hair analysis data from your hair strengthening and protein specialty only. Respond in 3-5 sentences maximum. Reference at least one other aunty by name. Be specific to the data you are given.`,

  salma: `You are Aunty Salma, a Moroccan aunty and expert in natural remedies, argan oil, rhassoul clay, black seed oil, and North African hair sealing traditions. You are warm, knowing, and carry generations of beauty knowledge. You use Arabic/Darija words naturally (habibti, yalla, mashallah, jeddah, inshallah). You reference argan oil, rhassoul clay, black seed oil, hennè, and the principle that what you put on your hair should come from the earth. You are reviewing specific hair analysis data from your natural remedies and moisture sealing specialty only. Respond in 3-5 sentences maximum. Reference at least one other aunty by name. Be specific to the data you are given.`,
};

// Warm fallback messages if Gemini call fails — never expose errors to user
const AUNTY_FALLBACKS = {
  ngozi: 'Ahn ahn! Di network dey play with us today o, but trust me — your hair needs shea butter and we go talk more soon. Come back, I no forget you.',
  marcia: 'Yuh know what pickney, di system a give us likkle trouble right now, but Aunty Marcia nah leave yuh. Come back and mi go tell yuh everything about dem roots.',
  denise: 'Chile, something glitched on us but that\'s okay. Your hair situation is serious enough that I\'ll be right back with the full breakdown. Don\'t touch those edges.',
  fatou: 'Ma chérie, a small technical interruption. But la technique ne change pas — I will return with your full assessment. Patience is the first technique.',
  carmen: 'Ay mija, the wifi is being difficult but your curls are not going anywhere. Come back in a moment and I will have everything for you, te lo prometo.',
  amara: 'Konjo, a small interruption in our connection. But strength does not disappear — I will return with your full assessment very soon.',
  salma: 'Habibti, a small technical difficulty, inshallah we return shortly. Your hair remedies are ready — just a moment of patience.',
};

async function generateAuntyMessage(auntyId, hairContext) {
  const systemPrompt = AUNTY_PROMPTS[auntyId];
  if (!systemPrompt) throw new Error(`Unknown aunty: ${auntyId}`);

  const userMessage = `Here is the hair analysis data for this person. Give your assessment from your specialty lane only:\n\n${JSON.stringify(hairContext, null, 2)}`;

  try {
    return await generateText(systemPrompt, userMessage, { temperature: 0.9, maxTokens: 400 });
  } catch (err) {
    console.error(`Gemini call failed for aunty ${auntyId}:`, err.message);
    return AUNTY_FALLBACKS[auntyId];
  }
}

async function generateAllAuntyMessages(hairContext) {
  const aunties = ['ngozi', 'marcia', 'denise', 'fatou', 'carmen', 'amara', 'salma'];
  const results = await Promise.all(
    aunties.map(async (auntyId) => {
      const message = await generateAuntyMessage(auntyId, hairContext);
      return { aunty_id: auntyId, message_text: message };
    })
  );
  return results;
}

async function generateRoutine(hairProfile, councilMessages) {
  const systemPrompt = `You are the collective intelligence of seven hair aunties — Ngozi (moisture), Marcia (scalp), Denise (retention), Fatou (technique), Carmen (definition), Amara (strength), Salma (natural remedies). Based on the hair profile data and each aunty's assessment, generate a complete personalized weekly hair routine.

Return ONLY valid JSON with this exact structure:

{
  "curl_type": "string",
  "porosity": "string",
  "density": "string",
  "primary_concern": "string",
  "weekly_schedule": [
    {
      "day": "string",
      "label": "string",
      "owning_aunties": ["aunty_id"],
      "steps": [
        {
          "step": "string description",
          "product_type": "string",
          "aunty": "aunty_id",
          "why": "one sentence scientific reason"
        }
      ]
    }
  ],
  "products": [
    {
      "name": "string",
      "brand": "string",
      "recommended_by": "aunty_id",
      "purpose": "string",
      "price_usd": 0,
      "affiliate_placeholder": true
    }
  ],
  "tips": [
    {
      "aunty": "aunty_id",
      "tip": "string"
    }
  ]
}`;

  const userMessage = `Hair profile:\n${JSON.stringify(hairProfile, null, 2)}\n\nCouncil assessments:\n${JSON.stringify(councilMessages, null, 2)}`;

  try {
    const raw = await generateText(systemPrompt, userMessage, { temperature: 0.7, maxTokens: 2048 });
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Routine generation failed:', err.message);
    throw new Error('Failed to generate routine. Please try again.');
  }
}

async function generateSendoff(userName, hairProfile) {
  const systemPrompt = `You are all seven aunties speaking as one voice. Generate a personalized send-off message. Be warm, specific, emotional, and proud. Maximum 2 sentences. End with warmth not instructions. This is a blessing not a task list. Do not include "Go live and make ya aunty proud" — that line is added separately.`;

  const userMessage = `User name: ${userName}. Curl type: ${hairProfile.curl_type}. Porosity: ${hairProfile.porosity}. Primary goal: ${hairProfile.primary_goal}. Damage level: ${hairProfile.damage_level}. Reference something specific about their hair journey.`;

  try {
    return await generateText(systemPrompt, userMessage, { temperature: 1.0, maxTokens: 150 });
  } catch (err) {
    console.error('Sendoff generation failed:', err.message);
    return `${userName}, your ${hairProfile.curl_type || 'beautiful'} hair is about to thrive — all seven of us have put everything we know into this routine for you.`;
  }
}

async function generateCheckinResponse(auntyId, ratings, hairProfile) {
  const systemPrompt = AUNTY_PROMPTS[auntyId];
  const userMessage = `This person has completed their week ${ratings.checkin_week} check-in. Respond warmly and specifically to their results:\n\nRoutine followed: ${ratings.routine_followed}\nMoisture rating: ${ratings.moisture_rating}/5\nFrizz rating: ${ratings.frizz_rating}/5\nCondition rating: ${ratings.condition_rating}/5\nHair type: ${hairProfile?.curl_type || 'textured'}\nNotes from user: ${ratings.notes || 'none'}\n\nGive encouragement, specific advice based on the ratings, and reference at least one other aunty. Stay in your specialty lane. Maximum 4 sentences.`;

  try {
    return await generateText(systemPrompt, userMessage, { temperature: 0.9, maxTokens: 300 });
  } catch (err) {
    console.error(`Checkin response failed for ${auntyId}:`, err.message);
    return AUNTY_FALLBACKS[auntyId];
  }
}

module.exports = {
  analyzeHairPhoto,
  generateAuntyMessage,
  generateAllAuntyMessages,
  generateRoutine,
  generateSendoff,
  generateCheckinResponse,
  AUNTY_PROMPTS,
  TEXT_MODEL,
  VISION_MODEL,
};
