/**
 * Aunty Voice — the single source for *how the chosen aunty talks to you*.
 *
 * The whole consultation is hosted by one aunty. To make it feel like tapping
 * into your actual aunty (not a form), every spoken line runs through here so
 * it carries her signature endearment and your name. Lightly seasoned: clear
 * English with a sprinkle of her own word, never hard to read.
 */

import { AUNTIES } from './aunties';
import type { AuntyId } from './aunties';

// ─── Endearments ───────────────────────────────────────────────────

/** Her signature endearment (e.g. Senayt -> "yene", Salma -> "habibti"). */
export function endearment(auntyId: AuntyId, index = 0): string {
  const list = AUNTIES[auntyId]?.endearments ?? AUNTIES.denise.endearments;
  return list[index % list.length];
}

function capitalize(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Just the name if we have it, else her endearment ("yene"). For mid-sentence use. */
export function inlineYou(auntyId: AuntyId, name?: string): string {
  const n = (name || '').trim();
  return n || endearment(auntyId);
}

/**
 * How she addresses you at the start of a sentence.
 * Before we know your name: "Yene". After: "Yene, Sara".
 * Capitalized so it can open a line.
 */
export function addressUser(auntyId: AuntyId, name?: string): string {
  const term = capitalize(endearment(auntyId));
  const n = (name || '').trim();
  return n ? `${term}, ${n}` : term;
}

// ─── Per-step consultation script ──────────────────────────────────
// Each question screen pulls its headline (and the SalonFrame "speakerVerb")
// from here, so the chosen aunty asks it in her voice, with your name.

export type ConsultStep =
  | 'location'
  | 'curlType'
  | 'porosity'
  | 'goal'
  | 'habitsWash'
  | 'habitsHeat'
  | 'products'
  | 'struggles';

export interface StepCopy {
  question: string;
  verb: string;
}

// ─── Progress bar source of truth ──────────────────────────────────
// The ordered consultation steps that show the segmented progress bar.
// Interludes (validations) and the optional photo step are intentionally
// excluded — they aren't "questions" and don't carry a step number.
export const PROGRESS_STEPS = [
  'name',
  'location',
  'curlType',
  'porosity',
  'goal',
  'habits',
  'products',
  'struggles',
  'budget',
] as const;

export type ProgressStep = (typeof PROGRESS_STEPS)[number];

export const TOTAL_STEPS = PROGRESS_STEPS.length;

/** Returns `{ step, totalSteps }` for a consultation screen's progress bar. */
export function progress(step: ProgressStep): { step: number; totalSteps: number } {
  return { step: PROGRESS_STEPS.indexOf(step) + 1, totalSteps: TOTAL_STEPS };
}

export function getStepCopy(step: ConsultStep, auntyId: AuntyId, name?: string): StepCopy {
  const you = inlineYou(auntyId, name); // lowercase-friendly inline address
  const Open = addressUser(auntyId, name); // sentence-opener address

  switch (step) {
    case 'location':
      return {
        question: `${Open} — your water shapes your hair more than you know.`,
        verb: 'wants to know',
      };
    case 'curlType':
      return {
        question: `${Open}, let me see — which pattern is yours?`,
        verb: 'wants to see',
      };
    case 'porosity':
      return {
        question: `Let's test your hair, ${you}. Drop a strand in a glass of water — what happened?`,
        verb: 'is testing',
      };
    case 'goal':
      return {
        question: `So tell me, ${you} — what would change everything?`,
        verb: 'is curious',
      };
    case 'habitsWash':
      return {
        question: `Tell me, ${you} — how often do you wash your hair?`,
        verb: 'is asking',
      };
    case 'habitsHeat':
      return {
        question: `And heat tools, ${you}? Be honest with me — I will not judge.`,
        verb: 'wants the truth',
      };
    case 'products':
      return {
        question: `Show me what you've been working with, ${you}.`,
        verb: 'wants to see',
      };
    case 'struggles':
      return {
        question: `Tell me where it hurts, ${you}.`,
        verb: 'is listening',
      };
    default:
      return { question: '', verb: 'is asking' };
  }
}
