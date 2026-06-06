/**
 * Public legal pages, served straight from the API so the app always has a
 * live Privacy Policy / Terms URL (Apple requires this) without depending on a
 * separate marketing site.
 *
 * Routes registered:
 *   GET /privacy         — Privacy Policy
 *   GET /terms           — Terms of Use
 *   GET /reset-password  — functional Supabase password-reset form
 *
 * ⚠️  Two placeholders to confirm before launch (search "REVIEW:"):
 *   1. Operating entity / legal name
 *   2. Governing-law jurisdiction
 */

import config from './config.js';

const BRAND = 'Aunty Curl';
const CONTACT_EMAIL = 'support@auntycurl.com';
const EFFECTIVE_DATE = 'June 1, 2026';
const LEGAL_ENTITY = 'Aunty Council';
const GOVERNING_LAW = 'the State of New York, United States';

const SUPABASE_URL = config.supabaseUrl || 'https://bazqbwyqxxlctdbwkhwn.supabase.co';
const SUPABASE_ANON_KEY =
  config.supabaseAnonKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenFid3lxeHhsY3RkYndraHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjE5NDMsImV4cCI6MjA5MDM5Nzk0M30.As1xBRj7445FoYoD4lf_K-4HPkT9iuJ849r9M51f7tg';

const baseStyle = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #1A0F08; color: #F3E9DD;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.65; -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 720px; margin: 0 auto; padding: 56px 22px 96px; }
  h1 { font-size: 28px; letter-spacing: -0.5px; margin: 0 0 6px; color: #F8F0E5; }
  .eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 12px; color: #C9A24B; margin: 0 0 18px; font-weight: 600; }
  .updated { font-size: 13px; color: #B7A593; margin: 0 0 36px; }
  h2 { font-size: 18px; margin: 34px 0 10px; color: #E9C97A; }
  p, li { font-size: 15.5px; color: #E6D8C7; }
  a { color: #E9C97A; }
  ul { padding-left: 20px; }
  li { margin: 6px 0; }
  .note { background: #241509; border: 1px solid #3a2613; border-radius: 12px; padding: 16px 18px; margin: 22px 0; font-size: 14.5px; color: #D8C7B2; }
  footer { margin-top: 48px; padding-top: 22px; border-top: 1px solid #3a2613; font-size: 13px; color: #9b8a78; }
  .btn { display: inline-block; background: #C9A24B; color: #1A0F08; font-weight: 700; border: none; border-radius: 12px; padding: 14px 18px; font-size: 16px; cursor: pointer; width: 100%; }
  .btn:disabled { opacity: .5; }
  input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #3a2613; background: #241509; color: #F3E9DD; font-size: 16px; margin: 8px 0 16px; }
  label { font-size: 14px; color: #C9A24B; font-weight: 600; }
  .msg { margin: 16px 0; font-size: 14.5px; }
  .ok { color: #8FD19E; } .err { color: #E89B9B; }
`;

function page(title, bodyHtml, extraHead = '') {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="robots" content="index" />
<title>${title} · ${BRAND}</title>
<style>${baseStyle}</style>
${extraHead}
</head><body><div class="wrap">${bodyHtml}
<footer>© ${new Date().getFullYear()} ${LEGAL_ENTITY}. ${BRAND} is a hair-care guidance app and is not a medical service.</footer>
</div></body></html>`;
}

const privacyHtml = page(
  'Privacy Policy',
  `
  <p class="eyebrow">${BRAND}</p>
  <h1>Privacy Policy</h1>
  <p class="updated">Effective ${EFFECTIVE_DATE}</p>

  <p>${BRAND} ("we", "us") provides a personalized hair-care guidance app. This policy explains what we collect, why, and your choices. By using the app you agree to this policy.</p>

  <div class="note">${BRAND} offers educational and cosmetic guidance only. It is not medical advice and is not a substitute for a licensed dermatologist or trichologist.</div>

  <h2>Information we collect</h2>
  <ul>
    <li><strong>Account</strong> — your email address and a securely hashed password (handled by our authentication provider, Supabase).</li>
    <li><strong>Hair profile &amp; quiz answers</strong> — curl type, porosity, goals, struggles, budget and brand preferences, and the routines, check-ins, and notes you create.</li>
    <li><strong>Photos</strong> — if you choose to add hair photos, we process them to analyze your hair texture and condition and to track your progress. Photos may be captured with your camera or selected from your photo library, with your permission.</li>
    <li><strong>Approximate location</strong> — only if you allow it, we use coarse location to show humidity-aware tips. We do not store a location history.</li>
    <li><strong>Purchases</strong> — subscription status and transaction identifiers from Apple, via our payments provider (RevenueCat). We never receive your full card details.</li>
    <li><strong>Diagnostics</strong> — crash and error reports (via Sentry) to keep the app stable.</li>
    <li><strong>Push token</strong> — if you enable notifications, a device token used to deliver reminders.</li>
  </ul>

  <h2>How we use your information</h2>
  <ul>
    <li>To generate your personalized routine, product suggestions, and "council" guidance.</li>
    <li>To analyze hair photos you submit and tailor recommendations.</li>
    <li>To operate accounts, process subscriptions, send reminders you opt into, and fix bugs.</li>
  </ul>

  <h2>Photos &amp; AI analysis</h2>
  <p>When you submit a photo or your quiz answers for analysis, they are sent to our AI provider, <strong>Anthropic</strong>, solely to generate your results. Per Anthropic's API terms, this data is <strong>not used to train their models</strong>. Photos you save are stored in our secure storage (Supabase) and are linked to your account. You can delete them at any time by deleting your account.</p>

  <h2>How we share information</h2>
  <p>We currently share data only with service providers that help us run the app, under contract and only as needed:</p>
  <ul>
    <li><strong>Supabase</strong> — authentication, database, and photo storage.</li>
    <li><strong>Anthropic</strong> — AI analysis of your answers/photos (not used for training).</li>
    <li><strong>RevenueCat &amp; Apple</strong> — subscription processing and management.</li>
    <li><strong>Sentry</strong> — crash/error diagnostics.</li>
    <li><strong>A weather data provider</strong> — to convert coarse location into local humidity.</li>
    <li><strong>Railway</strong> — backend hosting.</li>
  </ul>
  <p>We may in the future share or license aggregated, de-identified data (data that cannot reasonably identify you) with analytics partners, researchers, or other third parties for product improvement, research, or commercial purposes. We may also partner with advertising or data platforms, which may involve sharing certain personal information. If we begin doing so in a way that constitutes a "sale" or "sharing" of personal information under applicable law (such as CCPA), we will update this policy, provide notice in the app, and offer you an opt-out mechanism before such sharing begins.</p>

  <h2>Affiliate links</h2>
  <p>Some product links in the app may be affiliate links. If you buy through them, we may earn a small commission at no extra cost to you. This never changes which products we recommend to you.</p>

  <h2>Data retention</h2>
  <p>We keep your information for as long as your account is active. When you delete your account, we delete your profile, routines, check-ins, and photos. Backups and legally required records may persist for a limited time.</p>

  <h2>Your choices &amp; rights (all users)</h2>
  <ul>
    <li><strong>Delete your account &amp; data</strong> directly in the app: Settings → Account → Delete Account.</li>
    <li>Control camera, photo, location, and notification permissions in your device settings at any time.</li>
    <li>Opt out of marketing emails via the unsubscribe link in any such email.</li>
  </ul>

  <h2>EU &amp; UK users — GDPR rights</h2>
  <p>If you are in the European Economic Area (EEA) or United Kingdom, we process your personal data on the following legal bases: <strong>contract performance</strong> (to provide the app), <strong>legitimate interests</strong> (security, fraud prevention, improving the service), and <strong>consent</strong> (location access, push notifications, optional analytics). You have the right to:</p>
  <ul>
    <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
    <li><strong>Rectification</strong> — ask us to correct inaccurate or incomplete data.</li>
    <li><strong>Erasure ("right to be forgotten")</strong> — request deletion of your data, subject to legal obligations.</li>
    <li><strong>Restriction</strong> — ask us to restrict processing in certain circumstances.</li>
    <li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</li>
    <li><strong>Objection</strong> — object to processing based on legitimate interests or for direct marketing.</li>
    <li><strong>Withdraw consent</strong> — where processing is based on consent, withdraw it at any time without affecting prior lawful processing.</li>
    <li><strong>Lodge a complaint</strong> — with your local data protection authority (e.g. ICO in the UK, or your EU Member State's supervisory authority).</li>
  </ul>
  <p>To exercise any of these rights, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. We will respond within 30 days.</p>

  <h2>California users — CCPA / CPRA rights</h2>
  <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) as amended by the CPRA:</p>
  <ul>
    <li><strong>Right to know</strong> — request disclosure of the categories and specific pieces of personal information we have collected about you, and how it is used and shared.</li>
    <li><strong>Right to delete</strong> — request deletion of personal information we have collected, subject to certain exceptions.</li>
    <li><strong>Right to correct</strong> — request correction of inaccurate personal information.</li>
    <li><strong>Right to opt out of sale or sharing</strong> — we do not currently sell or share your personal information. If we begin doing so, we will provide a "Do Not Sell or Share My Personal Information" link before that practice starts.</li>
    <li><strong>Right to limit use of sensitive personal information</strong> — you may direct us to limit our use of sensitive personal information (such as biometric or health-related data) to what is necessary to perform the services.</li>
    <li><strong>Right to non-discrimination</strong> — we will not discriminate against you for exercising your CCPA rights.</li>
  </ul>
  <p>To submit a CCPA request, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. We will verify your identity before processing the request and respond within 45 days (extendable by a further 45 days with notice).</p>

  <h2>Other international users</h2>
  <p>Users in other jurisdictions (including Canada, Australia, Brazil, and others) may have rights under their local privacy laws. We are committed to honoring reasonable data requests regardless of jurisdiction. Contact us and we will do our best to assist.</p>

  <h2>Children</h2>
  <p>${BRAND} is not directed to children under 13 (or under 16 in the EEA/UK), and we do not knowingly collect their data. If you believe a child has provided us personal information, contact us and we will delete it.</p>

  <h2>Security &amp; international transfers</h2>
  <p>We use industry-standard security measures (encryption in transit and at rest, access controls) to protect your data. Our service providers are based in the United States. If you are located outside the US, your data will be transferred to and processed in the US. For transfers from the EEA or UK, we rely on appropriate safeguards such as Standard Contractual Clauses (SCCs) approved by the European Commission, or equivalent transfer mechanisms. By using the app, you acknowledge this transfer.</p>

  <h2>Changes</h2>
  <p>We may update this policy. Material changes will be reflected by the "Effective" date above and, where required by law, we will notify you via the app or email before changes take effect.</p>

  <h2>Contact &amp; Data Controller</h2>
  <p>${LEGAL_ENTITY} is the data controller for personal data collected through ${BRAND}. For questions, requests, or complaints: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  `,
);

const termsHtml = page(
  'Terms of Use',
  `
  <p class="eyebrow">${BRAND}</p>
  <h1>Terms of Use</h1>
  <p class="updated">Effective ${EFFECTIVE_DATE}</p>

  <p>These Terms govern your use of the ${BRAND} app. By using the app, you agree to them.</p>

  <div class="note">${BRAND} provides educational and cosmetic hair-care guidance only. It is not medical advice. For any hair-loss, scalp, allergy, or health concern, consult a licensed professional. Always patch-test new products and read their labels. Individual results vary.</div>

  <h2>Eligibility &amp; accounts</h2>
  <p>You must be at least 13 years old to use the app. You are responsible for your account credentials and the activity under your account.</p>

  <h2>Subscriptions &amp; billing</h2>
  <ul>
    <li>${BRAND} offers auto-renewing subscriptions and a one-time lifetime purchase. Payment is charged to your Apple ID at confirmation of purchase.</li>
    <li>Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours prior to the end of the period.</li>
    <li>Manage or cancel auto-renewing subscriptions anytime in your Apple ID subscription settings. The lifetime option is a one-time purchase that does not auto-renew.</li>
  </ul>

  <h2>Your content</h2>
  <p>You keep ownership of the photos and notes you add. You grant us a limited license to process and store them solely to provide the app's features to you. You are responsible for the content you submit.</p>

  <h2>Affiliate links</h2>
  <p>The app may contain affiliate links; purchases through them may earn us a commission at no extra cost to you.</p>

  <h2>Acceptable use</h2>
  <p>Don't misuse the app, attempt to disrupt it, reverse engineer it, or use it unlawfully.</p>

  <h2>Disclaimers &amp; limitation of liability</h2>
  <p>The app is provided "as is" without warranties of any kind. To the maximum extent permitted by law, ${LEGAL_ENTITY} is not liable for indirect or consequential damages, and our total liability is limited to the amount you paid us in the 12 months before the claim.</p>

  <h2>Termination</h2>
  <p>You may stop using the app and delete your account at any time. We may suspend or terminate access for violations of these Terms.</p>

  <h2>Governing law</h2>
  <p>These Terms are governed by the laws of ${GOVERNING_LAW}, without regard to conflict-of-law rules.</p>

  <h2>Changes &amp; contact</h2>
  <p>We may update these Terms; continued use means you accept the changes. Questions: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  `,
);

const resetPasswordHtml = page(
  'Reset Password',
  `
  <p class="eyebrow">${BRAND}</p>
  <h1>Reset your password</h1>
  <p class="updated">Choose a new password for your account.</p>

  <div id="form-area">
    <label for="pw">New password</label>
    <input id="pw" type="password" autocomplete="new-password" placeholder="At least 8 characters" />
    <label for="pw2">Confirm new password</label>
    <input id="pw2" type="password" autocomplete="new-password" placeholder="Re-enter password" />
    <button id="submit" class="btn">Update password</button>
  </div>
  <div id="msg" class="msg"></div>
  `,
  `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const SUPABASE_URL = ${JSON.stringify(SUPABASE_URL)};
  const SUPABASE_ANON_KEY = ${JSON.stringify(SUPABASE_ANON_KEY)};
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const msg = document.getElementById('msg');
  const formArea = document.getElementById('form-area');

  function show(text, ok) { msg.textContent = text; msg.className = 'msg ' + (ok ? 'ok' : 'err'); }

  // Supabase recovery links carry tokens in the URL hash; the SDK picks them up.
  let recovered = false;
  client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') recovered = true;
  });

  document.getElementById('submit').addEventListener('click', async () => {
    const pw = document.getElementById('pw').value;
    const pw2 = document.getElementById('pw2').value;
    if (pw.length < 8) return show('Password must be at least 8 characters.', false);
    if (pw !== pw2) return show('Passwords do not match.', false);
    show('Updating…', true);
    const { error } = await client.auth.updateUser({ password: pw });
    if (error) {
      show(error.message || 'This reset link is invalid or has expired. Request a new one from the app.', false);
    } else {
      formArea.style.display = 'none';
      show('Password updated. You can now return to the app and sign in.', true);
    }
  });
</script>`,
);

const supportHtml = page(
  'Support',
  `
  <p class="eyebrow">${BRAND}</p>
  <h1>Get Help</h1>
  <p class="updated">We're here for you, love.</p>

  <p>Having trouble with the app, a billing question, or need your account deleted? Reach out and we'll get back to you within 1–2 business days.</p>

  <h2>Email support</h2>
  <p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

  <h2>Common questions</h2>
  <ul>
    <li><strong>How do I cancel my subscription?</strong> — Open your iPhone Settings → Apple ID → Subscriptions → Aunty Curl, then tap Cancel.</li>
    <li><strong>How do I restore a purchase?</strong> — Open the app → Settings → Restore Purchases.</li>
    <li><strong>How do I delete my account and data?</strong> — Open the app → Settings → Account → Delete Account. This permanently removes all your data.</li>
    <li><strong>My routine isn't showing up.</strong> — Try closing and reopening the app. If the issue persists, email us.</li>
  </ul>

  <h2>Privacy &amp; legal</h2>
  <p>
    <a href="/privacy">Privacy Policy</a> &nbsp;·&nbsp;
    <a href="/terms">Terms of Use</a>
  </p>
  `,
);

export function registerLegalRoutes(app) {
  const sendHtml = (res, html) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(html);
  };
  app.get('/privacy', (_req, res) => sendHtml(res, privacyHtml));
  app.get('/terms', (_req, res) => sendHtml(res, termsHtml));
  app.get('/support', (_req, res) => sendHtml(res, supportHtml));
  app.get('/reset-password', (_req, res) => {
    // The reset form needs Supabase JS from a CDN, so relax frame/script headers for this route.
    res.removeHeader('X-Frame-Options');
    sendHtml(res, resetPasswordHtml);
  });
}
