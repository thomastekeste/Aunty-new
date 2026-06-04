/**
 * Wash-frequency prescription.
 *
 * Recommended washes per week from curl type × porosity, based on
 * dermatologist guidance (AAD: tightly coiled hair → once a week or every
 * other week) and porosity care references:
 * - Tighter curls = scalp oils travel slower = fewer washes.
 * - Low porosity = sealed cuticle, slower buildup → wash less, clarify monthly.
 * - High porosity = open cuticle, loses moisture fast → keep moisture washes
 *   up (co-wash between shampoos), never reduce below baseline.
 *
 * Used by the onboarding habits question to react to the user's current habit
 * and tease the exact prescription (paywalled — shown blurred to free users).
 */

import type { CurlType, Porosity, WashFrequency } from '../types';

export interface WashRecommendation {
  /** Lower/upper bound, in washes per week. */
  perWeek: [number, number];
  /** Human phrase, e.g. "2–3 times a week" / "every 10–14 days". */
  display: string;
}

type Verdict = 'over' | 'under' | 'good';

export interface WashAssessment {
  verdict: Verdict;
  /** Aunty-voiced reaction line. */
  reaction: string;
  recommendation: WashRecommendation;
}

// ─── Matrix: curl type × porosity ───────────────────────────────────

const REC: Record<CurlType, Record<Porosity, WashRecommendation>> = {
  '2a': {
    low: { perWeek: [2, 2], display: '2 times a week' },
    normal: { perWeek: [2, 3], display: '2–3 times a week' },
    high: { perWeek: [2, 3], display: '2–3 times a week (gentle)' },
  },
  '2b': {
    low: { perWeek: [1, 2], display: '1–2 times a week' },
    normal: { perWeek: [2, 2], display: '2 times a week' },
    high: { perWeek: [2, 2], display: '2 times a week' },
  },
  '2c': {
    low: { perWeek: [1, 2], display: '1–2 times a week' },
    normal: { perWeek: [2, 2], display: '2 times a week' },
    high: { perWeek: [2, 2], display: '2 times a week (1 can be a co-wash)' },
  },
  '3a': {
    low: { perWeek: [1, 2], display: '1–2 times a week' },
    normal: { perWeek: [2, 2], display: '2 times a week' },
    high: { perWeek: [2, 2], display: '2 times a week' },
  },
  '3b': {
    low: { perWeek: [1, 1], display: 'once a week' },
    normal: { perWeek: [1, 2], display: '1–2 times a week' },
    high: { perWeek: [2, 2], display: 'twice a week (1 shampoo + 1 co-wash)' },
  },
  '3c': {
    low: { perWeek: [1, 1], display: 'once a week' },
    normal: { perWeek: [1, 1], display: 'once a week' },
    high: { perWeek: [1, 2], display: 'once a week + a mid-week co-wash' },
  },
  '4a': {
    low: { perWeek: [0.5, 1], display: 'every 7–14 days' },
    normal: { perWeek: [1, 1], display: 'once a week' },
    high: { perWeek: [1, 2], display: 'once a week + a mid-week co-wash' },
  },
  '4b': {
    low: { perWeek: [0.5, 0.7], display: 'every 10–14 days' },
    normal: { perWeek: [0.7, 1], display: 'every 7–10 days' },
    high: { perWeek: [1, 1], display: 'once a week (moisture-focused)' },
  },
  '4c': {
    low: { perWeek: [0.5, 0.7], display: 'every 10–14 days' },
    normal: { perWeek: [0.5, 1], display: 'every 7–14 days' },
    high: { perWeek: [1, 1], display: 'once a week (moisture-focused)' },
  },
};

const FALLBACK: WashRecommendation = { perWeek: [1, 2], display: '1–2 times a week' };

export function recommendedWashFrequency(
  curlType?: CurlType,
  porosity?: Porosity,
): WashRecommendation {
  if (!curlType) return FALLBACK;
  const byPorosity = REC[curlType];
  if (!byPorosity) return FALLBACK;
  return byPorosity[porosity ?? 'normal'] ?? byPorosity.normal;
}

// ─── User habit → washes per week ───────────────────────────────────

const FREQ_PER_WEEK: Record<WashFrequency, number> = {
  daily: 7,
  'every-other': 3.5,
  'twice-weekly': 2,
  weekly: 1,
  biweekly: 0.5,
  monthly: 0.25,
};

export function washesPerWeek(freq: WashFrequency): number {
  return FREQ_PER_WEEK[freq] ?? 1;
}

// ─── Assessment + aunty reaction ────────────────────────────────────

const REACTIONS: Record<Verdict, string[]> = {
  over: [
    'Ouuuu… that’s too much, sugar. You’re washing the moisture right out of those curls.',
  ],
  under: [
    'Ouuuu… buildup city, baby. Your scalp is begging for a reset.',
  ],
  good: [
    'Okay okay! You’re in the right zone — but the exact rhythm? That’s where the magic is.',
  ],
};

export function assessWashHabit(
  freq: WashFrequency,
  curlType?: CurlType,
  porosity?: Porosity,
): WashAssessment {
  const recommendation = recommendedWashFrequency(curlType, porosity);
  const user = washesPerWeek(freq);
  const [lo, hi] = recommendation.perWeek;

  let verdict: Verdict = 'good';
  if (user > hi) verdict = 'over';
  else if (user < lo) verdict = 'under';

  return { verdict, reaction: REACTIONS[verdict][0], recommendation };
}
