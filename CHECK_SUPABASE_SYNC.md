# Task: Verify Supabase project is shared between web and mobile

## Context

There are two repos:
- `aunty-curl-council/` — React Native/Expo mobile app + Express backend on Railway
- `aunty-web/` — Next.js marketplace at auntycurlcouncil.com, deployed on Vercel

Both must point at the **same** Supabase project. The web has an `offer_codes` table that assigns App Store promo codes to customer emails after a Stripe purchase — this only works if mobile and web share the same database.

## What to check

1. **Compare Supabase URLs across all three environments:**
   - Mobile app: `EXPO_PUBLIC_SUPABASE_URL` in `aunty-curl-council/.env`
   - Mobile server: `SUPABASE_URL` in `aunty-curl-council/server/.env`
   - Web: `NEXT_PUBLIC_SUPABASE_URL` in `aunty-web/.env` (or `.env.local`)

   All three should be the **same URL**. If any differ, flag it.

2. **Check Vercel env vars** (if Claude in Chrome is available):
   - Navigate to the Vercel dashboard for the aunty-web project
   - Confirm `NEXT_PUBLIC_SUPABASE_URL` matches the local `.env`

3. **Check Railway env vars** (if Claude in Chrome is available):
   - Navigate to the Railway dashboard for aunty-curl-council-server
   - Confirm `SUPABASE_URL` matches

## Expected result

All three should resolve to the same Supabase project URL (e.g. `https://abcdefgh.supabase.co`). Report any mismatches.
