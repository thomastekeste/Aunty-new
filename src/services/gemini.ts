import axios from 'axios';
import { HairProfile, GeminiVisionAnalysis, CouncilResponse, DailyRoutine, OnboardingData } from '@/types';
import { AUNTIES } from '@/constants/aunties';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(prompt: string, systemInstruction?: string, images?: string[], jsonMode = false): Promise<string> {
  const parts: any[] = [];

  if (images?.length) {
    for (const base64 of images) {
      parts.push({ inline_data: { mime_type: 'image/jpeg', data: base64 } });
    }
  }

  parts.push({ text: prompt });

  const body: any = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: jsonMode ? 2048 : 800,
      ...(jsonMode ? { response_mime_type: 'application/json' } : {}),
    },
  };

  if (systemInstruction) {
    body.system_instruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await axios.post(`${BASE_URL}?key=${API_KEY}`, body);
  return res.data.candidates[0].content.parts[0].text as string;
}

function safeJSON<T>(text: string): T | null {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Extract outermost JSON object or array to handle any extra prose
    const objMatch = clean.match(/\{[\s\S]*\}/);
    const arrMatch = clean.match(/\[[\s\S]*\]/);
    const extracted = objMatch ? objMatch[0] : arrMatch ? arrMatch[0] : clean;
    return JSON.parse(extracted) as T;
  } catch {
    return null;
  }
}

// ── 1. Intake photo analysis ─────────────────────────────────────────
export async function analyzeIntakePhotos(
  base64Images: string[],
  partialProfile: Partial<OnboardingData>
): Promise<GeminiVisionAnalysis> {
  const prompt = `You are a professional curly hair consultant.

Context from hair tests:
- Porosity: ${partialProfile.porosity ?? 'unknown'}
- Elasticity: ${partialProfile.elasticity ?? 'unknown'}
- Density: ${partialProfile.density ?? 'unknown'}

Analyze these ${base64Images.length} hair photo(s) and return ONLY valid JSON (no markdown, no extra text):
{
  "curl_type": "3b",
  "texture_description": "...",
  "visible_concerns": ["frizz", "dryness"],
  "condition_assessment": "..."
}

Curl types: 2a, 2b, 2c, 3a, 3b, 3c, 4a, 4b, 4c`;

  const text = await callGemini(prompt, undefined, base64Images, true);
  return safeJSON<GeminiVisionAnalysis>(text) ?? {
    curl_type: '3b',
    texture_description: 'Unable to fully analyze. Please retake in natural light.',
    visible_concerns: [],
    condition_assessment: 'Analysis incomplete.',
  };
}

// ── 2. Council responses (called in parallel) ────────────────────────
const AUNTY_SYSTEM_PROMPTS: Record<string, string> = {
  '1': `You are Ngozi, a Nigerian hair expert specializing in moisture and deep conditioning. Your signature: "This hair needs shea, not excuses." Be warm and practical. 2-3 sentences max. Speak directly to the user.`,
  '2': `You are Marcia, a Jamaican hair expert specializing in scalp health and growth. Your signature: "Roots first. Always." Be no-nonsense and direct. 2-3 sentences max. Speak directly to the user.`,
  '3': `You are Denise, an African American hair expert specializing in retention and protective styling. Your signature: "Been natural before it was trendy." Bring decades of wisdom. 2-3 sentences max. Speak directly to the user.`,
  '4': `You are Fatou, a Senegalese hair expert specializing in length retention and technique. Your signature: "Technique is everything." Be precise and methodical. 2-3 sentences max. Speak directly to the user.`,
  '5': `You are Carmen, an Afro-Latina hair expert specializing in curl definition and wash-and-go. Your signature: "Mija, your curls are a gift." Be warm and celebratory. 2-3 sentences max. Speak directly to the user.`,
  '6': `You are Amara, an East African hair expert specializing in scalp nourishment and strengthening. Your signature: "Strong roots, strong hair." Focus on foundation and strength. 2-3 sentences max. Speak directly to the user.`,
  '7': `You are Salma, a North African hair expert specializing in natural remedies and moisture sealing. Your signature: "Nature gave us everything." Bring knowledge of natural ingredients. 2-3 sentences max. Speak directly to the user.`,
};

function buildUserContext(data: OnboardingData, analysis: GeminiVisionAnalysis): string {
  return `User hair profile:
- Name: ${data.name}
- Curl type: ${analysis.curl_type ?? 'unknown'}
- Porosity: ${data.porosity}
- Elasticity: ${data.elasticity}
- Density: ${data.density}
- Primary goal: ${data.primary_goal}
- Failed attempts: ${data.failed_attempts.join(', ') || 'none listed'}
- Scalp concerns: ${data.scalp_concerns.join(', ') || 'none'}
- Time available: ${data.time_available}
- Wash frequency: ${data.wash_frequency}
- Heat use: ${data.heat_use}
- Relaxer history: ${data.relaxer_history}
- Protective styling: ${data.protective_styling}
- Water hardness: ${data.water_hardness}
- Texture: ${analysis.texture_description ?? ''}
- Visible concerns: ${(analysis.visible_concerns ?? []).join(', ')}

Respond with your perspective based on your specialty. You may naturally mention another aunty if relevant.`;
}

async function getOneAuntyResponse(
  auntyId: string,
  context: string
): Promise<{ aunty_id: string; aunty_name: string; message: string }> {
  const message = await callGemini(context, AUNTY_SYSTEM_PROMPTS[auntyId]);
  return { aunty_id: auntyId, aunty_name: AUNTIES[auntyId].name, message };
}

export async function generateCouncilResponses(
  data: OnboardingData,
  analysis: GeminiVisionAnalysis
): Promise<CouncilResponse> {
  const context = buildUserContext(data, analysis);

  // All 7 aunties in parallel — max 8s
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Council timeout')), 8000)
  );

  const calls = ['1', '2', '3', '4', '5', '6', '7'].map(id =>
    getOneAuntyResponse(id, context)
  );

  const results = await Promise.race([Promise.all(calls), timeout]);
  const council: CouncilResponse = { consensus: '' };

  for (const r of results) {
    council[r.aunty_id] = {
      aunty_id: r.aunty_id,
      aunty_name: r.aunty_name,
      message: r.message,
      timestamp: new Date().toISOString(),
    };
  }

  council.consensus = `All seven aunties have reviewed ${data.name}'s profile. Your ${analysis.curl_type ?? 'natural'} hair is ready for a personalized routine.`;
  return council;
}

// ── 3. Routine generation ────────────────────────────────────────────
export async function generateRoutine(
  data: OnboardingData,
  analysis: GeminiVisionAnalysis
): Promise<DailyRoutine> {
  const prompt = `You are a curly hair routine architect.

${buildUserContext(data, analysis)}

Create a 4-day weekly routine (wash day, style day, refresh day, rest day).
Return ONLY valid JSON (no markdown):
{
  "wash_day": {
    "day_name": "Wash Day",
    "hosted_by_aunty_id": "1",
    "steps": [
      { "step_number": 1, "name": "Detangle", "description": "...", "duration_minutes": 10, "product_category": "leave_in" }
    ],
    "estimated_time_minutes": 60,
    "purpose": "Deep cleanse and condition"
  },
  "style_day": { ... },
  "refresh_day": { ... },
  "rest_day": { ... }
}

Rules:
- wash_day host: aunty 1 (Ngozi) or 2 (Marcia)
- style_day host: aunty 4 (Fatou) or 5 (Carmen)
- refresh_day host: aunty 5 (Carmen)
- rest_day host: aunty 6 (Amara) or 7 (Salma)
- Steps must reference the user's porosity, elasticity, and goal
- Respect time_available constraint
- Warn about protein if elasticity is low`;

  const text = await callGemini(prompt, undefined, undefined, true);
  const parsed = safeJSON<DailyRoutine>(text);

  if (!parsed) throw new Error('Failed to parse routine JSON from Gemini');
  return parsed;
}

// ── 4. Checkin progress analysis ─────────────────────────────────────
export async function analyzeCheckinProgress(
  checkinImageBase64: string,
  intakeAnalysis: GeminiVisionAnalysis,
  weekNumber: number
): Promise<{ progress_detected: boolean; comparison_notes: string; suggested_adjustments: string[]; next_steps: string[] }> {
  const prompt = `You are analyzing hair progress.

Intake assessment (week 0):
- Curl type: ${intakeAnalysis.curl_type}
- Texture: ${intakeAnalysis.texture_description}
- Concerns: ${(intakeAnalysis.visible_concerns ?? []).join(', ')}
- Condition: ${intakeAnalysis.condition_assessment}

Current week: ${weekNumber}

Compare the current photo to the intake description. Return ONLY valid JSON:
{
  "progress_detected": true,
  "comparison_notes": "...",
  "suggested_adjustments": ["..."],
  "next_steps": ["..."]
}`;

  const text = await callGemini(prompt, undefined, [checkinImageBase64], true);
  return safeJSON(text) ?? {
    progress_detected: false,
    comparison_notes: 'Keep going — changes take 4–8 weeks to show.',
    suggested_adjustments: [],
    next_steps: ['Continue your current routine for one more week'],
  };
}
