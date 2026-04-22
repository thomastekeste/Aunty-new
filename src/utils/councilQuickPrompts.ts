import type { HairProfile } from '../types';
import type { AuntyId } from '../constants/aunties';
import { AUNTIES } from '../constants/aunties';

const BASE: string[] = [
  'What should I do on wash day?',
  'How do I reduce frizz?',
  'What products do you recommend?',
  'How often should I deep condition?',
];

const POROSITY: Record<string, string> = {
  high: 'My hair loses moisture fast — help!',
  low: 'Products just sit on my hair. What do I do?',
  normal: 'How do I keep porosity balance?',
};

const GOAL: Record<string, string> = {
  growth: 'How do I retain length?',
  definition: 'How do I get better curl definition?',
  moisture: 'What is my weekly moisture plan?',
  'damage-repair': 'Where do I start with damage control?',
  'scalp-health': 'My scalp needs attention — what first?',
  'simplify-routine': 'What can I cut from my routine?',
  transition: 'How do I care for two textures at once?',
};

function curlTypePrompt(ct: string | undefined): string | null {
  if (!ct) return null;
  if (ct.startsWith('2')) return 'Fighting flat roots — any tips?';
  if (ct.startsWith('3')) return 'How do I clump my curls on wash day?';
  if (ct.startsWith('4')) return 'Detangling 4C without breakage — walk me through it';
  return null;
}

/**
 * Templated follow-ups for Council — uses quiz hair profile + aunty flavor.
 */
export function buildCouncilQuickPrompts(
  hairProfile: HairProfile,
  auntyId: AuntyId,
): string[] {
  const out: string[] = [];
  const hp = hairProfile || {};
  const a = AUNTIES[auntyId];

  if (hp.porosity && POROSITY[hp.porosity]) out.push(POROSITY[hp.porosity]!);
  if (hp.primaryGoal && GOAL[hp.primaryGoal]) out.push(GOAL[hp.primaryGoal]!);
  const ctQ = curlTypePrompt(hp.curlType);
  if (ctQ) out.push(ctQ);

  if (hp.colorTreated) out.push('Color-treated: how do I keep moisture?');
  if (hp.protectiveStyling) out.push('Protective style maintenance — your rules?');
  if (hp.timeAvailable === '10min' || hp.timeAvailable === '20min') {
    out.push('I only have 20 minutes on busy days. What is the minimum?');
  }
  if (hp.productBudget === 'under-30') out.push('Best budget products that still work?');
  if (hp.productScope === 'basics' || hp.productScope === 'routine') {
    out.push("I'm keeping a tight kit — what is essential?");
  }
  if (Array.isArray(hp.failedAttempts) && hp.failedAttempts.length > 0) {
    out.push("Things that have not worked for me before — what should I try instead?");
  }
  if (a?.ingredient) {
    out.push(`How do I get the most from ${a.ingredient.toLowerCase()}?`);
  }

  const seen = new Set<string>();
  const merged: string[] = [];
  for (const s of out) {
    if (!seen.has(s)) {
      seen.add(s);
      merged.push(s);
    }
  }
  for (const b of BASE) {
    if (!seen.has(b)) {
      seen.add(b);
      merged.push(b);
    }
  }

  // Cap for chip row; preserve most personalized first
  return merged.slice(0, 6);
}
