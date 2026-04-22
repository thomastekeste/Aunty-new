/**
 * Verdict copy shared by Council Verdict + share card.
 */
import type { HairProfile } from '../types';

export function getVerdictFindingsFromProfile(profile: Partial<HairProfile> | undefined): string[] {
  const p = profile || {};
  const por = p.porosity || 'normal';
  const goal = p.primaryGoal || 'moisture';
  const ct = p.curlType || '3c';

  const porLine: Record<string, string> = {
    high: 'High porosity. Moisture leaves fast — we seal it.',
    low: 'Low porosity. Products sit on top — we go light.',
    normal: 'Balanced porosity. Absorbs well — we keep it.',
  };

  const goalLine: Record<string, string> = {
    moisture: 'Deep condition weekly. Humectants in, sealants on top.',
    growth: 'Growth is retention. Protect ends, feed scalp.',
    definition: 'Your curls want to clump. Right product, right method.',
    'damage-repair': 'Repair first. Protein rebuilds, moisture restores.',
    'scalp-health': 'Scalp is the foundation. Clarify, massage, nourish.',
    'simplify-routine': 'Cut the clutter. Only what works stays.',
    transition: 'Two textures, one plan. Protect the new growth.',
  };

  return [
    porLine[por] || porLine.normal,
    goalLine[goal] || goalLine.moisture,
    `No silicones. No sulfates. Vetted for ${ct} hair.`,
  ];
}
