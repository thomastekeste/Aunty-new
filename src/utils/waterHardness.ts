/**
 * Water hardness lookup.
 *
 * Estimates tap-water hardness from a city name using a curated table of major
 * cities (approximate mg/L CaCO₃, classified soft / moderate / hard). Matching
 * is fuzzy: the entered string is lowercased and checked against known city
 * keys (handles "Atlanta, GA", "greater London", etc.). Returns null when we
 * don't recognise the city, so the UI can fall back to a manual choice.
 *
 * This is a guidance estimate, not a lab reading — phrased that way in the UI.
 */

export type WaterHardness = 'soft' | 'moderate' | 'hard';

export interface WaterResult {
  hardness: WaterHardness;
  /** City we matched on (canonical display). */
  matched: string;
}

// Canonical city key (lowercase) → hardness. Keys may include aliases.
const CITY_HARDNESS: Record<string, WaterHardness> = {
  // ── US — soft ──
  seattle: 'soft', portland: 'soft', 'san francisco': 'soft', boston: 'soft',
  'new york': 'soft', nyc: 'soft', brooklyn: 'soft', manhattan: 'soft',
  // ── US — moderate ──
  atlanta: 'soft', denver: 'moderate', nashville: 'moderate', charlotte: 'moderate',
  memphis: 'moderate', 'new orleans': 'moderate', sacramento: 'moderate',
  baltimore: 'moderate', pittsburgh: 'moderate', detroit: 'moderate',
  // ── US — hard ──
  'los angeles': 'hard', chicago: 'hard', houston: 'hard',
  phoenix: 'hard', dallas: 'hard', 'san antonio': 'hard', austin: 'hard',
  'las vegas': 'hard', 'san diego': 'hard', miami: 'hard',
  philadelphia: 'hard', philly: 'hard', 'washington': 'hard',
  minneapolis: 'hard', indianapolis: 'hard', columbus: 'hard', tampa: 'hard',
  orlando: 'hard', 'kansas city': 'hard', 'st louis': 'hard', 'saint louis': 'hard',
  'st. louis': 'hard', milwaukee: 'hard', cleveland: 'hard', tucson: 'hard',
  // ── UK / Ireland ──
  london: 'hard', bristol: 'hard', dublin: 'hard', cambridge: 'hard', oxford: 'hard',
  birmingham: 'soft', manchester: 'soft', glasgow: 'soft', edinburgh: 'soft',
  liverpool: 'soft', leeds: 'soft', newcastle: 'soft', sheffield: 'soft',
  // ── Canada ──
  toronto: 'hard', montreal: 'moderate', vancouver: 'soft', calgary: 'hard',
  ottawa: 'soft', edmonton: 'hard', winnipeg: 'hard',
  // ── Africa ──
  lagos: 'moderate', accra: 'moderate', abuja: 'moderate', nairobi: 'hard',
  johannesburg: 'moderate', 'cape town': 'soft', cairo: 'hard', kampala: 'moderate',
  'addis ababa': 'moderate', 'dar es salaam': 'moderate',
  // ── Europe / others ──
  paris: 'hard', madrid: 'hard', barcelona: 'hard', berlin: 'hard', munich: 'hard',
  rome: 'hard', amsterdam: 'moderate',
  sydney: 'soft', melbourne: 'soft', brisbane: 'moderate', auckland: 'soft',
  dubai: 'hard',
};

// Longer keys first so "new york" matches before "york"-like fragments.
const SORTED_KEYS = Object.keys(CITY_HARDNESS).sort((a, b) => b.length - a.length);

export function lookupWaterHardness(rawCity: string): WaterResult | null {
  const city = rawCity.trim().toLowerCase();
  if (city.length < 2) return null;

  for (const key of SORTED_KEYS) {
    // Match whole word-ish: the entered string contains the city name.
    if (city.includes(key)) {
      return { hardness: CITY_HARDNESS[key], matched: titleCase(key) };
    }
  }
  return null;
}

// ── Copy for each hardness level ──
export const HARDNESS_COPY: Record<WaterHardness, { label: string; blurb: string }> = {
  soft: {
    label: 'Soft',
    blurb: 'Gentle on your strands. Products lather easily and rinse clean — your curls drink moisture without a fight. Lucky you.',
  },
  moderate: {
    label: 'Moderate',
    blurb: 'A little mineral content, but manageable. An occasional clarifying wash keeps buildup from creeping in.',
  },
  hard: {
    label: 'Hard',
    blurb: 'High in calcium and magnesium. Minerals settle on the hair shaft, dry out curls, and block moisture from getting in. A clarifying or chelating wash is your best friend.',
  },
};

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
