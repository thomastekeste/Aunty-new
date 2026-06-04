# Aunty Curl Council — Product Overview

**One sentence:** Personalized natural hair care guidance from AI-powered aunty characters matched to your specific curl type, porosity, and hair goals.

---

## Core Value Proposition

✨ **Get a personalized hair routine from YOUR aunty**
- Take a quick quiz about your curl type, porosity, scalp health, and hair goals
- Meet 7 aunties from different cultural backgrounds (Caribbean, Nigerian, Senegalese, Afro-Latina, Ethiopian-Eritrean, Moroccan, African American)
- They "convene as a council" and use AI to build a weekly ritual customized to YOU
- Weekly wash, style, refresh, and rest day guidance
- Chat with your chosen aunty anytime for hair advice

---

## The 7 Aunties

| Name | ID | Region | Specialty | Vibe |
|------|----|--------|-----------|------|
| **Ngozi** | `ngozi` | Nigerian | Scalp health, growth | Nurturing, no-nonsense |
| **Marcia** | `marcia` | Jamaican | Moisture, edge care | Fun, energetic |
| **Denise** | `denise` | African American | Protective styles, thickness | Strong, protective |
| **Fatou** | `fatou` | Senegalese | Natural oils, texture | Calm, traditional |
| **Carmen** | `carmen` | Afro-Latina | Curl definition, shine | Warm, playful |
| **Senayt** | `amara` | Ethiopian-Eritrean | Strength, protein, traditions | Wise, grounded |
| **Salma** | `salma` | Moroccan | Moisture rituals, oils | Luxe, sensual |

> **Note on IDs:** the canonical persona ID for Senayt is `amara` in the mobile app and backend; the web store historically uses `senayt`. Both resolve to the same aunty via an alias (`senayt` ⇄ `amara`), so a saved preferred aunty works across platforms.

Each aunty is illustrated as a distinct character with her own face, style, and personality.

---

## Key Features

### 📋 Onboarding Quiz
- Curl type (coily, kinky, wavy, mixed)
- Porosity (low, medium, high)
- Hair habits & routine
- Primary goals (growth, definition, health, moisture)
- Struggles (breakage, dryness, frizz, etc.)
- Budget for products
- Care scope (wash day only, full routine)

### 🎯 Personalized Weekly Ritual
After the quiz, the council generates a customized **4-day ritual:**
- **Wash Day** — specific products & steps for YOUR hair
- **Style Day** — curl-enhancing techniques
- **Refresh Day** — quick mid-week maintenance
- **Rest Day** — protective styling or air dry

Each recommendation is tailored to:
- Your curl type & porosity
- Your specific hair struggles
- Your budget
- Your available time

### 💬 Chat with Your Aunty
- Ask her about anything hair-related
- She responds in her unique voice/dialect
- She stays in character as a warm, knowledgeable aunty (not clinical AI)
- Can request alternative product recommendations

### ✅ Weekly Check-Ins
- Answer simple questions about your hair that week
- Build a streak of consistency
- See progress in your Hair Profile

### 📊 Hair Profile
- View your curl type, porosity, goals, struggles
- See which products match YOUR profile (not generic recommendations)
- Track progress over time

### 🎓 Learn Section
- Educational articles about natural hair care
- Featured content on trending topics
- Practical tips and science explained simply

### 🏪 Recommended Products
- Curated product recommendations matched to your profile
- Filter by budget, type (shampoo, leave-in, oil, etc.)
- Products are hand-selected and vetted, not auto-generated

---

## Recent Updates (Phase 2)

### 🎨 Cultural Authenticity
- **7 distinct aunty portraits** redesigned for realism:
  - Unique face shapes (round, elongated, wide, slim, heart-shaped, etc.)
  - Realistic skin tones across the Black diaspora (#6B3A1C–#9A6844)
  - Individual hairstyles and accessories reflecting their region
  - Warm clothing in signature colors (gold, emerald, indigo, plum, rose, cream, teal)
  - Expressive smiles with visible teeth and cheekbone highlights
  
- **Region-specific language** in AI prompts:
  - Aunties use culturally grounded dialect and references
  - Changed from generic "African" to specific identities (Nigerian, Senegalese, Ethiopian-Eritrean, etc.)
  - Removed appropriative language like "sacred ceremony" → "consultation"

- **AI transparency:**
  - Clear labeling: "AI-powered character" on every interaction
  - Honest framing: "You are playing the character of [Aunty]" not "You are [Aunty]"
  - Compliant with App Store & Google Play AI disclosure policies

### 🔒 Security & Compliance
- Input sanitization on all endpoints (prevents prompt injection)
- Rate limiting on API calls
- Validation of user input (curl type, porosity, budget, etc.)
- RLS (Row-Level Security) policies on Supabase
- Proper error handling and timeouts (30s fetch abort)
- Medical/prescription disclaimers in AI prompts

### 💳 Subscription Model
**Free Tier:**
- Full chat with aunties ✓
- Product recommendations ✓
- Unlimited check-ins ✓
- Onboarding & quiz ✓

**Premium Tier:** (coming soon)
- (TBD — may include advanced hair tracking, personalized video tutorials, exclusive product partnerships, etc.)

### 📱 Platform Support
- **iOS** — native app via Expo
- **Android** — native app via Expo
- **Web** — full marketplace at auntycurlcouncil.com (Next.js, separate repo: aunty-web)

---

## Tech Stack

- **Frontend:** React Native + Expo 55 (TypeScript)
- **Backend:** Express.js + Node.js (hosted on Railway)
- **Database:** Supabase (PostgreSQL + Auth)
- **AI:** Claude Haiku (Anthropic) — council convening, ritual generation, aunty chat
- **Subscriptions:** RevenueCat
- **Animations:** React Native Reanimated
- **SVG:** React Native SVG (for aunty portraits)

---

## Marketing Angles

### For TikTok / Reels:
- "Your hair stopped growing" → show the council → Aunty X's personalized plan
- Quick curl care tips from each aunty
- Before/after hair transformations
- "This aunty gets it" (cultural moments)

### For Instagram / Waitlist:
- Meet the 7 aunties (carousel, individual spotlights)
- "Your aunty is waiting" — personalization hook
- Hair care myths debunked by aunties
- Product reviews / recommendations

### For Landing Page Copy:
- **Headline:** "Your Aunty's Personalized Hair Ritual"
- **Subhead:** "A council of 7 AI aunties from the diaspora, each with her own expertise. Download and find YOUR aunty."
- **Problem:** Hair care advice online is generic, one-size-fits-all, or appropriative
- **Solution:** Real, warm, culturally grounded guidance personalized to YOUR curl type and life
- **Social proof:** (coming — app store reviews, user testimonials)

---

## What Makes It Different

1. **Cultural specificity** — Not "African aunty" but *Nigerian, Senegalese, Ethiopian-Eritrean,* etc.
2. **Character-driven** — Seven distinct personalities, not a faceless app
3. **Truly personalized** — Based on curl type, porosity, goals, struggles, AND budget
4. **Transparent about AI** — Honest framing, not trying to be deceptive
5. **Warm, not clinical** — Feels like talking to a real aunty, not a chatbot
6. **Free core features** — Full chat, product recommendations, and check-ins included
7. **Hand-curated products** — Not auto-generated; we choose products that actually work

---

## Web (aunty-web repo)

The web is a full Next.js marketplace at auntycurlcouncil.com. It is a separate repo and not just a landing page. It includes:
- **Marketplace** — own products + CJ affiliate products, Stripe checkout
- **Aunty chat** — same 7 characters, powered by Claude (Anthropic AI SDK), rate-limited via Upstash
- **Account management** — Supabase auth, customer portal
- **Waitlist mode** — `NEXT_PUBLIC_LAUNCH_MODE` env flag toggles between waitlist and live
- **Pages** — /, /products, /app, /science, /checkout, /account, /login, /privacy, /terms, /refund

---

*Last updated: 2026-06-03*
