/**
 * Affiliate link decoration.
 *
 * Product `affiliateUrl`s in the catalog are plain product-page links. Before
 * we open one, we run it through here to attach the tracking that actually
 * earns commission + first-party attribution.
 *
 * Drop your real tags in AFFILIATE_CONFIG below. Until they're set, links still
 * work — they just open the plain product page (no commission), so the app is
 * never broken by a missing tag.
 *
 * Two layers:
 *   1. Network attribution — Amazon Associates tag, or a network redirect
 *      wrapper (ShareASale / Rakuten / Impact / Sovrn etc.) per merchant domain.
 *   2. UTM params — so your own analytics + many DTC programs can attribute the
 *      click to the app even without a formal network.
 */

export interface AffiliateConfig {
  /** Amazon Associates store tag, e.g. "auntycurl-20". Empty = no Amazon tag. */
  amazonTag: string;
  /** UTM params appended to every outbound product link. */
  utm: { source: string; medium: string; campaign: string } | null;
  /**
   * Per-merchant network wrappers. Key = bare domain (no www).
   * Use {URL} as the placeholder for the URL-encoded destination.
   * Example (Sovrn/Viglink): "https://redirect.viglink.com/?key=KEY&u={URL}"
   */
  networkWrappers: Record<string, string>;
}

// ─── CONFIGURE ME ───────────────────────────────────────────────
// TODO: fill these in with your real affiliate credentials.
export const AFFILIATE_CONFIG: AffiliateConfig = {
  amazonTag: 'auntycurl-20', // Amazon Associates store ID
  utm: { source: 'auntycurl', medium: 'app', campaign: 'lineup' },
  networkWrappers: {
    // 'sheamoisture.com': 'https://shareasale.com/r.cfm?b=BANNER&u=USER&m=MERCH&urllink={URL}',
  },
};

function bareDomain(host: string): string {
  return host.replace(/^www\./i, '').toLowerCase();
}

/** Append/override query params on a URL. */
function withParams(url: URL, params: Record<string, string>): URL {
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url;
}

/**
 * Decorate a raw product URL with affiliate tracking. Returns the original
 * string unchanged if it can't be parsed (so we never break the open).
 */
export function buildAffiliateUrl(
  raw: string,
  config: AffiliateConfig = AFFILIATE_CONFIG,
): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }

  const domain = bareDomain(url.hostname);

  // 1. Amazon Associates tag.
  const isAmazon = domain === 'amazon.com' || domain.endsWith('.amazon.com') || domain.startsWith('amzn.');
  if (isAmazon && config.amazonTag) {
    withParams(url, { tag: config.amazonTag });
  }

  // 2. UTM attribution (skip on Amazon — it strips/penalizes extra params).
  if (config.utm && !isAmazon) {
    withParams(url, {
      utm_source: config.utm.source,
      utm_medium: config.utm.medium,
      utm_campaign: config.utm.campaign,
    });
  }

  // 3. Network redirect wrapper (e.g. ShareASale/Rakuten/Impact deep link).
  const wrapper = config.networkWrappers[domain];
  if (wrapper) {
    return wrapper.replace('{URL}', encodeURIComponent(url.toString()));
  }

  return url.toString();
}

/** True once at least one real attribution method is configured. */
export function affiliateConfigured(config: AffiliateConfig = AFFILIATE_CONFIG): boolean {
  return Boolean(config.amazonTag) || Object.keys(config.networkWrappers).length > 0;
}
