/**
 * Validation Screen Copy — Aunty-specific lines for the 3 transition interludes.
 *
 * Each aunty speaks in her own voice. These are not interchangeable.
 * V1: "The Read" — reacting to curl type
 * V2: "The Profile" — acknowledging goal + closing
 * V3: "The Release" — empathy + resolution after struggles
 */

import type { AuntyId } from './aunties';
import { addressUser } from './auntyVoice';
import type { PrimaryGoal, Porosity } from '../types';

// ─── V1: Curl Type Read ────────────────────────────────────────────
// Keyed by curl prefix: '2' (wavy), '3' (curly), '4' (coily), 'default'

export const AUNTY_CURL_READS: Record<AuntyId, Record<string, string>> = {
  ngozi: {
    '2': "Wavy hair! People overlook you. Not me o.",
    '3': "Curly texture. Needs moisture like earth needs rain.",
    '4': "Coily hair! Most people no sabi what to do. I do.",
    default: "Your hair. Let Aunty Ngozi see what we working with.",
  },
  marcia: {
    '2': "Waves. Gentle, but deeper than people think.",
    '3': "Curls like these need patience. I have plenty.",
    '4': "Coily roots. Deep roots. We nourish from di inside.",
    default: "Your hair has a story. Mek we read it together.",
  },
  denise: {
    '2': "Waves like that got their own language. I speak it.",
    '3': "Baby, those curls are a whole crown.",
    '4': "Coily pattern. I grew up with it. I know exactly what it needs.",
    default: "Let me see what we working with, sugar.",
  },
  fatou: {
    '2': "Wavy texture. It responds beautifully to precise technique.",
    '3': "Curly hair. Complex, yes. But I love a challenge.",
    '4': "Coily hair requires ze most precise care. I am ready.",
    default: "Show me your hair. I will know what it needs.",
  },
  carmen: {
    '2': "Waves! Mira, they got rhythm. We just let them dance.",
    '3': "Ay, those curls got so much personality!",
    '4': "Coily hair is POWERFUL. We about to unlock all of it.",
    default: "Your hair is already beautiful. We just turning it up.",
  },
  amara: {
    '2': "Wavy hair. Gentle on the outside, resilient underneath.",
    '3': "Curly texture. Your hair is stronger than you think.",
    '4': "Coily hair. The strongest pattern. I respect it.",
    default: "Your hair has survived a lot. Let us build from here.",
  },
  salma: {
    '2': "Waves. They speak softly. We must learn to listen.",
    '3': "Curly hair carries energy. Let us find its balance.",
    '4': "Coily texture. Ancient and powerful. I honour it.",
    default: "Your hair is speaking. Let us listen together.",
  },
};

// ─── V2: Goal-Specific Read ────────────────────────────────────────

export const AUNTY_GOAL_READS: Record<AuntyId, Partial<Record<PrimaryGoal, string>> & { default: string }> = {
  ngozi: {
    moisture: "Moisture! Now we talking. This is my territory.",
    growth: "Growth. Your hair dey grow — we just need to keep am.",
    definition: "Definition. Every curl get its own shape. We find am.",
    'damage-repair': "Repair. Your hair don suffer but e go recover.",
    'scalp-health': "Scalp health! Smart. Everything start from there.",
    'simplify-routine': "Simplify. No wahala — we cut the nonsense.",
    transition: "Transitioning. New chapter, new rules.",
    default: "I hear you. Let Aunty Ngozi handle this.",
  },
  marcia: {
    moisture: "Moisture. Di foundation of everything. Good choice.",
    growth: "Growth starts at di root. And we going deep.",
    definition: "Definition. Every curl has a voice. We help it speak.",
    'damage-repair': "Repair. We go slow, we go steady, we heal.",
    'scalp-health': "Scalp health. Your roots are di beginning.",
    'simplify-routine': "Simple routine. Less fuss, more consistency.",
    transition: "Transition is a journey. I walk with you.",
    default: "Whatever you need, we take it one step at a time.",
  },
  denise: {
    moisture: "Moisture. Baby, I been moisturizing curls since before YouTube.",
    growth: "Growth. Patience is the real secret ingredient.",
    definition: "Definition. We about to make those curls speak.",
    'damage-repair': "Repair. We don't give up. We restore.",
    'scalp-health': "Scalp first. Smart girl. That's where it all begins.",
    'simplify-routine': "Simplify. Cut the clutter, keep what works.",
    transition: "Transitioning. I walked this road. I'll walk it with you.",
    default: "I see what you need, sugar. I got you.",
  },
  fatou: {
    moisture: "Moisture. Ze correct technique makes all ze difference.",
    growth: "Growth requires discipline. I will teach you.",
    definition: "Definition! Precision in application is everything.",
    'damage-repair': "Repair. We rebuild with care and intention.",
    'scalp-health': "Scalp health. Ze foundation of all technique.",
    'simplify-routine': "Simplify. Precision, not quantity. I show you.",
    transition: "Transition. A new technique for a new era.",
    default: "I see your goal. Now we design ze protocol.",
  },
  carmen: {
    moisture: "Moisture! We about to make those curls so juicy.",
    growth: "Growth! Patience plus love equals inches, mami.",
    definition: "Definition! We making those curls dance!",
    'damage-repair': "Repair. We heal it with love and the right products.",
    'scalp-health': "Scalp health! Taking care of the foundation, smart.",
    'simplify-routine': "Simplify! Less stress, more curls. I love it.",
    transition: "Transitioning! A whole new vibe. I'm so excited for you.",
    default: "Whatever you need, we making it happen!",
  },
  amara: {
    moisture: "Moisture. Your hair is asking for it. We provide.",
    growth: "Growth. We build strength first, then length follows.",
    definition: "Definition. Let each curl find its true shape.",
    'damage-repair': "Repair. Your hair has been through a lot. We rebuild.",
    'scalp-health': "Scalp health. Everything flows from the foundation.",
    'simplify-routine': "Simplify. Strength comes from consistency, not complexity.",
    transition: "Transition. Shedding the old, growing into the new.",
    default: "I see your need. We address it, step by step.",
  },
  salma: {
    moisture: "Moisture. Balance between hydration and sealing. We find it.",
    growth: "Growth. When the body is calm, the hair follows.",
    definition: "Definition. Each curl has its own rhythm to find.",
    'damage-repair': "Repair. Healing is not linear, but it is certain.",
    'scalp-health': "Scalp health. The soil from which everything blooms.",
    'simplify-routine': "Simplify. A calm routine brings calm hair.",
    transition: "Transition. A beautiful shedding of what no longer serves.",
    default: "Your goal speaks clearly. I hear it.",
  },
};

// ─── V2: Profile Closers (second line) ─────────────────────────────

export const AUNTY_PROFILE_CLOSERS: Record<AuntyId, string> = {
  ngozi: "I see the full picture now. Watch me work.",
  marcia: "Di foundation is set. Now we build, steady.",
  denise: "I see the full picture now. I know exactly what to do.",
  fatou: "Ze data is clear. Now we design your protocol.",
  carmen: "Now I see you, mi amor. This plan is going to be fire.",
  amara: "I see your strength. And I see where to reinforce it.",
  salma: "Balance is possible. I see the path clearly now.",
};

// ─── V3: Empathy Lines (after struggles) ───────────────────────────

export const AUNTY_EMPATHY_LINES: Record<AuntyId, (count: number) => string> = {
  ngozi: (count) =>
    count >= 3
      ? "Ahn ahn! All of this? No wonder you tired."
      : "I hear you. Every bit of it.",
  marcia: (count) =>
    count >= 3
      ? "Yuh been carrying dis fi too long. Put it down."
      : "I see what's been troubling you, love.",
  denise: (count) =>
    count >= 3
      ? "Baby, you've been carrying all of that alone?"
      : "I hear you, sugar. Every single word.",
  fatou: (count) =>
    count >= 3
      ? "All of these? Each one has a solution. I know every one."
      : "I understand. We address each one with care.",
  carmen: (count) =>
    count >= 3
      ? "You've been dealing with all this alone? No more, mi amor."
      : "I feel you. But the struggle stops here.",
  amara: (count) =>
    count >= 3
      ? "You are stronger than you know. But you don't have to carry this alone."
      : "I see the weight. Let me help you carry it.",
  salma: (count) =>
    count >= 3
      ? "These burdens are heavy. Let us lift them together."
      : "I see where the pain is. We will bring balance.",
};

// ─── V3: Resolution Lines (after empathy) ──────────────────────────

export const AUNTY_RESOLUTION_LINES: Record<AuntyId, string> = {
  ngozi: "From today, na me and you. We fix everything.",
  marcia: "From today, we heal. One step at a time.",
  denise: "That stops today. I got you.",
  fatou: "From this moment, we address each one. With precision.",
  carmen: "Starting right now, we change everything.",
  amara: "Today we start rebuilding. Together.",
  salma: "Today, we find balance. I promise you.",
};

// ─── Personalized interlude helpers ────────────────────────────────
// Weave the user's name + the aunty's endearment into the interlude beats
// so each pause feels like she's talking to *them*, not reciting copy.

/** V1 "The Read" — she reacts to your curl type, opening with your name. */
export function getCurlRead(auntyId: AuntyId, curlType: string | undefined, name?: string): string[] {
  const reads = AUNTY_CURL_READS[auntyId];
  const prefix = curlType ? curlType.charAt(0) : '';
  const read = (curlType && reads[prefix]) || reads.default;
  return [`${addressUser(auntyId, name)}.`, read];
}

/** V2 "The Profile" — her read on your goal, then a personal closer. */
export function getGoalRead(
  auntyId: AuntyId,
  primaryGoal: PrimaryGoal | undefined,
  name?: string,
): string[] {
  const goalReads = AUNTY_GOAL_READS[auntyId];
  const lineOne = (primaryGoal && goalReads[primaryGoal]) || goalReads.default;
  const lineTwo = `${addressUser(auntyId, name)} — ${AUNTY_PROFILE_CLOSERS[auntyId]}`;
  return [lineOne, lineTwo];
}

/** V3 "The Release" — empathy for your struggles, then resolution. */
export function getStruggleRead(auntyId: AuntyId, count: number, name?: string): string[] {
  const empathy = AUNTY_EMPATHY_LINES[auntyId](count);
  const resolution = `${addressUser(auntyId, name)} — ${AUNTY_RESOLUTION_LINES[auntyId]}`;
  return [empathy, resolution];
}

// ─── Display Label Mappings ────────────────────────────────────────

export const POROSITY_LABELS: Record<string, string> = {
  low: 'Low porosity',
  normal: 'Normal porosity',
  high: 'High porosity',
};

export const GOAL_LABELS: Record<string, string> = {
  moisture: 'Moisture',
  growth: 'Growth',
  definition: 'Definition',
  'damage-repair': 'Damage repair',
  'scalp-health': 'Scalp health',
  'simplify-routine': 'Simpler routine',
  transition: 'Transitioning',
};

export const STRUGGLE_LABELS: Record<string, string> = {
  dryness: 'Dryness',
  breakage: 'Breakage',
  frizz: 'Frizz',
  'no-growth': 'No growth',
  'scalp-issues': 'Scalp issues',
  'product-buildup': 'Buildup',
  time: 'Takes too long',
  confusion: "Don't know what to do",
};
