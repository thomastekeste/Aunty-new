/**
 * Product Recommendation Engine
 *
 * Matches products to a user's hair profile using a weighted scoring system.
 * Each product gets a relevance score based on curl type, porosity, and goals.
 * The aunty who recommends it adds personality to the recommendation.
 *
 * This is the money maker — personalized product picks drive affiliate revenue.
 */

import { PRODUCTS, type Product, type ProductCategory, CATEGORY_LABELS } from '../constants/products';
import type { HairProfile, CurlType, Porosity, PrimaryGoal } from '../types';
import type { AuntyId } from '../constants/aunties';

// ─── Scoring Weights ─────────────────────────────────────────────

const WEIGHTS = {
  curlTypeMatch: 30, // matching curl type is essential
  porosityMatch: 25, // porosity determines product absorption
  goalMatch: 35, // primary goal is the strongest signal
  secondaryGoalMatch: 10, // bonus for secondary goals
};

// ─── Scoring Function ────────────────────────────────────────────

function scoreProduct(product: Product, profile: HairProfile): number {
  let score = 0;

  // Curl type match
  if (profile.curlType && product.curlTypes.includes(profile.curlType)) {
    score += WEIGHTS.curlTypeMatch;
  }

  // Porosity match
  if (profile.porosity && product.porosity.includes(profile.porosity)) {
    score += WEIGHTS.porosityMatch;
  }

  // Primary goal match
  if (profile.primaryGoal && product.goals.includes(profile.primaryGoal)) {
    score += WEIGHTS.goalMatch;
  }

  // Secondary goals bonus
  if (profile.secondaryGoals) {
    const secondaryMatches = profile.secondaryGoals.filter((g) =>
      product.goals.includes(g)
    ).length;
    score += secondaryMatches * WEIGHTS.secondaryGoalMatch;
  }

  // Bonus: scalp concerns → boost scalp products
  if (
    profile.scalpConcerns &&
    profile.scalpConcerns.length > 0 &&
    (product.category === 'scalp-treatment' || product.tags.includes('scalp'))
  ) {
    score += 15;
  }

  // Bonus: damage history → boost protein and repair
  if (
    (profile.heatUse === 'weekly' || profile.heatUse === 'daily' || profile.colorTreated) &&
    (product.category === 'protein-treatment' || product.tags.includes('repair'))
  ) {
    score += 10;
  }

  // Bonus: low porosity → boost lightweight products
  if (profile.porosity === 'low' && product.tags.includes('lightweight')) {
    score += 10;
  }

  // Bonus: high porosity → boost sealing products
  if (profile.porosity === 'high' && (product.tags.includes('sealing') || product.tags.includes('butter'))) {
    score += 10;
  }

  return score;
}

// ─── Recommendation Types ────────────────────────────────────────

export interface ProductRecommendation {
  product: Product;
  score: number;
  reason: string; // why this was recommended
  auntyNote: string; // personalized note from the recommending aunty
}

export interface RecommendationBundle {
  essentials: ProductRecommendation[]; // must-haves based on profile
  routine: ProductRecommendation[]; // products for the weekly ritual
  upgrades: ProductRecommendation[]; // premium picks for advanced users
  byCategory: Record<string, ProductRecommendation[]>;
  byAunty: Record<AuntyId, ProductRecommendation[]>;
}

// ─── Reason Generator ────────────────────────────────────────────

function generateReason(product: Product, profile: HairProfile): string {
  const reasons: string[] = [];

  if (profile.curlType && product.curlTypes.includes(profile.curlType)) {
    reasons.push(`great for ${profile.curlType} hair`);
  }
  if (profile.porosity && product.porosity.includes(profile.porosity)) {
    reasons.push(`works with ${profile.porosity} porosity`);
  }
  if (profile.primaryGoal && product.goals.includes(profile.primaryGoal)) {
    const goalLabels: Record<PrimaryGoal, string> = {
      moisture: 'moisture',
      growth: 'growth',
      definition: 'curl definition',
      'damage-repair': 'damage repair',
      'scalp-health': 'scalp health',
      'simplify-routine': 'routine simplicity',
      transition: 'transitioning',
    };
    reasons.push(`supports your ${goalLabels[profile.primaryGoal]} goal`);
  }

  return reasons.length > 0
    ? reasons.join(', ').replace(/^./, (c) => c.toUpperCase())
    : 'Recommended for your hair type';
}

// ─── Main Recommendation Function ────────────────────────────────

export function getRecommendations(profile: HairProfile): RecommendationBundle {
  // Score all products
  const scored: ProductRecommendation[] = PRODUCTS.map((product) => {
    const score = scoreProduct(product, profile);
    return {
      product,
      score,
      reason: generateReason(product, profile),
      auntyNote: product.whyItWorks,
    };
  })
    .filter((r) => r.score > 20) // minimum relevance threshold
    .sort((a, b) => b.score - a.score);

  // Split into bundles
  const essentials = scored.filter(
    (r) => r.score >= 60 && !r.product.isPremiumPick
  ).slice(0, 6);

  const routine = scored.filter((r) => {
    const cat = r.product.category;
    return ['cleanser', 'conditioner', 'deep-conditioner', 'leave-in', 'styler', 'gel', 'cream'].includes(cat);
  }).slice(0, 8);

  const upgrades = scored.filter((r) => r.product.isPremiumPick).slice(0, 4);

  // Group by category
  const byCategory: Record<string, ProductRecommendation[]> = {};
  for (const rec of scored) {
    const cat = rec.product.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(rec);
  }

  // Group by aunty
  const byAunty: Record<string, ProductRecommendation[]> = {};
  for (const rec of scored) {
    const aunty = rec.product.recommendedBy;
    if (!byAunty[aunty]) byAunty[aunty] = [];
    byAunty[aunty].push(rec);
  }

  return {
    essentials,
    routine,
    upgrades,
    byCategory,
    byAunty: byAunty as Record<AuntyId, ProductRecommendation[]>,
  };
}

// ─── Quick Picks (for home screen cards) ─────────────────────────

export function getQuickPicks(profile: HairProfile, count = 3): ProductRecommendation[] {
  const bundle = getRecommendations(profile);
  return bundle.essentials.slice(0, count);
}

// ─── Category Recommendations (for ritual days) ──────────────────

export function getProductsForRitualDay(
  profile: HairProfile,
  dayType: string
): ProductRecommendation[] {
  const bundle = getRecommendations(profile);

  const categoryMap: Record<string, ProductCategory[]> = {
    wash: ['cleanser', 'deep-conditioner', 'conditioner'],
    style: ['styler', 'gel', 'cream', 'leave-in'],
    refresh: ['leave-in', 'oil'],
    rest: ['oil', 'scalp-treatment'],
    scalp: ['scalp-treatment', 'oil'],
    protein: ['protein-treatment', 'deep-conditioner'],
    protect: ['cream', 'accessory'],
  };

  const relevantCategories = categoryMap[dayType] || [];

  return bundle.routine.filter((r) =>
    relevantCategories.includes(r.product.category)
  ).slice(0, 4);
}
