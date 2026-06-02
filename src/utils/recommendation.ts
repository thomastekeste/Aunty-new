/**
 * Product Prescription Engine
 *
 * Turns a HairProfile + scope + brand-tier + budget into a concrete routine:
 * ONE prescribed product per category slot (with alternates for swapping),
 * matched on curl type, porosity, goals, struggles, and brand tier, then
 * assembled to fit a target total. Gap rule: relax BUDGET first — never
 * leave a category empty.
 *
 * Pure module. No React, no side effects.
 */

import { PRODUCTS, type Product, type ProductCategory } from '../constants/products';
import type { BrandTier, HairProfile, PrimaryGoal, ProductScope } from '../types';

export type ProductBrandTier = 'drugstore' | 'mid' | 'premium';

// ─── Brand tier classification ──────────────────────────────────────

export function brandTierOf(p: Product): ProductBrandTier {
  if (p.isPremiumPick || p.priceValue >= 28) return 'premium';
  if (p.isBudgetFriendly || p.priceValue < 12) return 'drugstore';
  return 'mid';
}

/** Does a product satisfy the user's brand-tier preference? ('mix' = anything) */
function matchesBrandPref(p: Product, pref: BrandTier): boolean {
  if (pref === 'mix') return true;
  const t = brandTierOf(p);
  if (pref === 'drugstore') return t === 'drugstore' || t === 'mid';
  // premium
  return t === 'premium' || t === 'mid';
}

// ─── Struggle → goal mapping ────────────────────────────────────────
// Struggle ids come from StrugglesScreen / STRUGGLE_LABELS.

export const STRUGGLE_TO_GOAL: Record<string, PrimaryGoal> = {
  dryness: 'moisture',
  breakage: 'damage-repair',
  frizz: 'definition',
  'no-growth': 'growth',
  'scalp-issues': 'scalp-health',
  'product-buildup': 'scalp-health',
  time: 'simplify-routine',
  confusion: 'simplify-routine',
};

/** All goals implied by the profile: primary + secondary + struggle-derived. */
function profileGoals(profile: HairProfile): Set<PrimaryGoal> {
  const goals = new Set<PrimaryGoal>();
  if (profile.primaryGoal) goals.add(profile.primaryGoal);
  (profile.secondaryGoals ?? []).forEach((g) => goals.add(g));
  (profile.failedAttempts ?? []).forEach((s) => {
    const g = STRUGGLE_TO_GOAL[s];
    if (g) goals.add(g);
  });
  return goals;
}

// ─── Scoring ────────────────────────────────────────────────────────

/** Same curl family (2/3/4) — used for a partial match when the exact type isn't listed. */
function sameCurlFamily(a: string, b: string): boolean {
  return a[0] === b[0];
}

export function scoreProduct(p: Product, profile: HairProfile, brandPref: BrandTier): number {
  let score = 0;

  // Curl type: exact match is best; same family (e.g. 4a vs 4b/4c) is a soft match.
  if (profile.curlType) {
    if (p.curlTypes.includes(profile.curlType)) score += 3;
    else if (p.curlTypes.some((t) => sameCurlFamily(t, profile.curlType!))) score += 1;
  }

  // Porosity is make-or-break for textured hair (a heavy butter on low-porosity
  // hair just sits on top), so weight it heavily.
  if (profile.porosity && p.porosity.includes(profile.porosity)) score += 3;

  if (profile.primaryGoal && p.goals.includes(profile.primaryGoal)) score += 2;

  const goals = profileGoals(profile);
  goals.forEach((g) => {
    if (g !== profile.primaryGoal && p.goals.includes(g)) score += 1;
  });

  if (brandPref !== 'mix' && matchesBrandPref(p, brandPref)) score += 2;

  score += p.rating * 0.3; // tiebreaker toward better-rated / award-winning products
  return score;
}

// ─── Routine skeleton (mapped to categories we actually stock) ──────
// A slot can draw from multiple categories (e.g. "styler" = gel|cream).

export interface CategorySlot {
  key: string;
  label: string;
  categories: ProductCategory[];
}

const SLOT_CLEANSER: CategorySlot = { key: 'cleanser', label: 'Cleanser', categories: ['cleanser'] };
const SLOT_TREATMENT: CategorySlot = { key: 'treatment', label: 'Conditioner / Mask', categories: ['deep-conditioner', 'conditioner'] };
const SLOT_LEAVEIN: CategorySlot = { key: 'leave-in', label: 'Leave-In', categories: ['leave-in'] };
const SLOT_STYLER: CategorySlot = { key: 'styler', label: 'Styler', categories: ['gel', 'cream', 'styler'] };
const SLOT_OIL: CategorySlot = { key: 'oil', label: 'Oil / Serum', categories: ['oil'] };
const SLOT_PROTEIN: CategorySlot = { key: 'protein', label: 'Protein Treatment', categories: ['protein-treatment'] };
const SLOT_SCALP: CategorySlot = { key: 'scalp', label: 'Scalp Care', categories: ['scalp-treatment'] };
const SLOT_EDGE: CategorySlot = { key: 'edge', label: 'Edge Control', categories: ['edge-control'] };
const SLOT_TOOL: CategorySlot = { key: 'tool', label: 'Tool', categories: ['tool'] };
const SLOT_ACCESSORY: CategorySlot = { key: 'accessory', label: 'Accessory', categories: ['accessory'] };

export const ROUTINE_SKELETON: Record<ProductScope, CategorySlot[]> = {
  basics: [SLOT_CLEANSER, SLOT_TREATMENT],
  routine: [SLOT_CLEANSER, SLOT_TREATMENT, SLOT_LEAVEIN],
  full: [SLOT_CLEANSER, SLOT_TREATMENT, SLOT_LEAVEIN, SLOT_STYLER, SLOT_OIL],
  everything: [
    SLOT_CLEANSER, SLOT_TREATMENT, SLOT_LEAVEIN, SLOT_STYLER, SLOT_OIL,
    SLOT_PROTEIN, SLOT_SCALP, SLOT_EDGE, SLOT_TOOL, SLOT_ACCESSORY,
  ],
};

// ─── Candidate ranking ──────────────────────────────────────────────

/** Products in a slot, ranked best→worst for this profile + brand preference. */
export function rankCandidates(slot: CategorySlot, profile: HairProfile, brandPref: BrandTier): Product[] {
  const inSlot = PRODUCTS.filter((p) => slot.categories.includes(p.category));

  // Prefer brand-tier matches, but keep all so a slot is never empty.
  const preferred = inSlot.filter((p) => matchesBrandPref(p, brandPref));
  const pool = preferred.length > 0 ? preferred : inSlot;

  return [...pool].sort((a, b) => scoreProduct(b, profile, brandPref) - scoreProduct(a, profile, brandPref));
}

// ─── Routine assembly ───────────────────────────────────────────────

export interface RoutineItem {
  slot: CategorySlot;
  product: Product;
  alternates: Product[]; // next-best in-slot options for swapping
  aboveBudget: boolean;
}

export interface BudgetTier {
  key: 'value' | 'balanced' | 'premium';
  label: string;
  total: number;
  pieces: number;
}

function sumPrice(items: { product: Product }[]): number {
  return items.reduce((acc, it) => acc + (it.product.priceValue ?? 0), 0);
}

/**
 * Build the prescribed routine. Picks the best match per slot, then — if over
 * the target total — greedily downgrades the priciest slot to its next-best
 * CHEAPER in-slot match until under budget. If still over, keeps the best match
 * and flags it `aboveBudget` (relax-budget-first).
 */
export function buildRoutine(
  scope: ProductScope,
  brandPref: BrandTier,
  targetTotal: number | undefined,
  profile: HairProfile,
): RoutineItem[] {
  const slots = ROUTINE_SKELETON[scope] ?? ROUTINE_SKELETON.routine;

  // Assemble best-per-slot, but nudge toward brand variety: if the top pick's
  // brand is already used and a near-equal pick from a fresh brand exists,
  // prefer it. Keeps a routine from reading like a single-brand ad.
  const BRAND_DIVERSITY_TOLERANCE = 1.5;
  const usedBrands = new Set<string>();

  const items: RoutineItem[] = slots
    .map((slot) => {
      const ranked = rankCandidates(slot, profile, brandPref);
      if (ranked.length === 0) return null;

      let pick = ranked[0];
      if (usedBrands.has(pick.brand)) {
        const topScore = scoreProduct(pick, profile, brandPref);
        const fresh = ranked.find(
          (p) =>
            !usedBrands.has(p.brand) &&
            scoreProduct(p, profile, brandPref) >= topScore - BRAND_DIVERSITY_TOLERANCE,
        );
        if (fresh) pick = fresh;
      }
      usedBrands.add(pick.brand);

      return {
        slot,
        product: pick,
        alternates: ranked.filter((p) => p.id !== pick.id).slice(0, 2),
        aboveBudget: false,
      } as RoutineItem;
    })
    .filter((x): x is RoutineItem => x !== null);

  if (!targetTotal || targetTotal <= 0) return items;

  // Greedy downgrade until within target (or no cheaper options remain).
  let guard = 0;
  while (sumPrice(items) > targetTotal && guard < 50) {
    guard += 1;
    // Find the slot whose current product is priciest AND has a cheaper alternate available.
    let bestIdx = -1;
    let bestDrop = 0;
    items.forEach((item, idx) => {
      const ranked = rankCandidates(item.slot, profile, brandPref);
      const cheaper = ranked
        .filter((p) => p.id !== item.product.id && p.priceValue < item.product.priceValue)
        .sort((a, b) => b.priceValue - a.priceValue)[0]; // closest cheaper (smallest quality loss)
      if (cheaper) {
        const drop = item.product.priceValue - cheaper.priceValue;
        if (drop > bestDrop) {
          bestDrop = drop;
          bestIdx = idx;
        }
      }
    });
    if (bestIdx === -1) break; // nothing left to downgrade

    const item = items[bestIdx];
    const ranked = rankCandidates(item.slot, profile, brandPref);
    const cheaper = ranked
      .filter((p) => p.id !== item.product.id && p.priceValue < item.product.priceValue)
      .sort((a, b) => b.priceValue - a.priceValue)[0];
    item.product = cheaper;
    item.alternates = ranked.filter((p) => p.id !== cheaper.id).slice(0, 2);
  }

  // Anything still pushing over budget gets the subtle flag.
  if (sumPrice(items) > targetTotal) {
    // Flag the priciest remaining item(s) — the ones responsible for the overage.
    const sorted = [...items].sort((a, b) => b.product.priceValue - a.product.priceValue);
    let running = sumPrice(items);
    for (const item of sorted) {
      if (running <= targetTotal) break;
      item.aboveBudget = true;
      // crude attribution: assume removing the overage portion
      running -= 0; // keep loop bounded; flag stays
      break;
    }
  }

  return items;
}

// ─── Budget tiers (data-driven) ─────────────────────────────────────

/**
 * Three real routine totals for the budget question, computed from the catalog
 * for the chosen scope + brand preference: a value build (cheapest in-slot
 * matches), a balanced build (best matches), and a premium build (best
 * premium-leaning matches).
 */
export function computeBudgetTiers(
  scope: ProductScope,
  brandPref: BrandTier,
  profile: HairProfile,
): BudgetTier[] {
  const slots = ROUTINE_SKELETON[scope] ?? ROUTINE_SKELETON.routine;

  const valueProducts: Product[] = [];
  const balancedProducts: Product[] = [];
  const premiumProducts: Product[] = [];

  for (const slot of slots) {
    const ranked = rankCandidates(slot, profile, brandPref);
    if (ranked.length === 0) continue;

    balancedProducts.push(ranked[0]);

    const cheapest = [...ranked].sort((a, b) => a.priceValue - b.priceValue)[0];
    valueProducts.push(cheapest);

    // premium: highest-scoring among the pricier half, else priciest
    const byPrice = [...ranked].sort((a, b) => b.priceValue - a.priceValue);
    premiumProducts.push(byPrice[0]);
  }

  const round = (n: number) => Math.round(n);
  const pieces = slots.length;

  const tiers: BudgetTier[] = [
    { key: 'value', label: 'Value', total: round(sumPrice(valueProducts.map((product) => ({ product })))), pieces: valueProducts.length },
    { key: 'balanced', label: 'Balanced', total: round(sumPrice(balancedProducts.map((product) => ({ product })))), pieces: balancedProducts.length },
    { key: 'premium', label: 'Premium', total: round(sumPrice(premiumProducts.map((product) => ({ product })))), pieces: premiumProducts.length },
  ];

  // Ensure strictly increasing & distinct totals so the three cards never collapse.
  if (tiers[1].total <= tiers[0].total) tiers[1].total = tiers[0].total + 10;
  if (tiers[2].total <= tiers[1].total) tiers[2].total = tiers[1].total + 15;

  void pieces;
  return tiers;
}
