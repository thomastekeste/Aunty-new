/**
 * Legal + transparency copy.
 *
 * Centralized so the disclaimer and "how we choose" explanation read the same
 * everywhere they appear (product reveal, products screen, settings).
 */

/**
 * Public legal page URLs. Privacy + Terms are served by our API (so they're
 * always live alongside the backend). The password-reset link is emailed by
 * Supabase and opened on any device, so it must point at the public prod host.
 */
const LEGAL_API_BASE =
  process.env.EXPO_PUBLIC_API_URL || 'https://aunty-curl-api-production.up.railway.app';

export const LEGAL_URLS = {
  privacy: `${LEGAL_API_BASE}/privacy`,
  terms: `${LEGAL_API_BASE}/terms`,
  resetPassword: 'https://aunty-curl-api-production.up.railway.app/reset-password',
};

/** Short one-liner for footers / under product lists. */
export const DISCLAIMER_SHORT =
  'For educational purposes only — not medical advice. Individual results vary.';

/** Full disclaimer for Settings / first-time product reveal. */
export const DISCLAIMER_FULL =
  'Aunty Curl offers personalized hair-care guidance and product suggestions for ' +
  'educational and cosmetic purposes only. It is not medical advice and is not a ' +
  'substitute for a dermatologist or trichologist. If you have hair loss, a scalp ' +
  'condition, an allergy, or any persistent concern, please see a licensed ' +
  'professional. Always patch-test new products and read their ingredient labels. ' +
  'Individual results vary.';

/** Affiliate transparency (FTC) — shown wherever we link to products. */
export const AFFILIATE_DISCLOSURE =
  'Some product links may earn Aunty Curl a small commission, at no extra cost to you.';

/** "How the Council chooses your products" — methodology, in plain language. */
export interface MethodStep {
  title: string;
  body: string;
}

export const RECOMMENDATION_METHOD: MethodStep[] = [
  {
    title: 'We start with your hair, not a trend',
    body: 'Your curl type and porosity decide the foundation — what your strands can actually absorb and hold.',
  },
  {
    title: 'We weigh your goals and struggles',
    body: 'Whether you told us moisture, growth, definition, repair, or scalp health, each product is scored on how well it serves those goals.',
  },
  {
    title: 'We respect your budget and brand preference',
    body: 'You set the range and whether you lean drugstore, premium, or a mix. We build a full routine to fit — and never leave a step empty.',
  },
  {
    title: 'One pick per step, with backups',
    body: 'For each part of your routine we prescribe the best match for your profile, favoring a variety of brands over a single-label lineup, plus alternates you can swap in.',
  },
  {
    title: 'An aunty signs off on every pick',
    body: 'Each product is endorsed by the council member whose expertise fits it best, with a plain-language note on why the ingredients work for your hair.',
  },
];

/** One-paragraph version of the method for tight spaces. */
export const RECOMMENDATION_METHOD_SUMMARY =
  'Your lineup is built from your curl type, porosity, goals, struggles, budget, ' +
  'and brand preference — one best-match product per routine step, each with an ' +
  'aunty’s reasoning. Suggestions are curated, not paid placements.';
