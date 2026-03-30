# Aunty — The Curl Council

A mobile app for personalized textured hair care. Seven aunties. Your hair. One collective blessing.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React Native + Expo |
| Backend | Express.js (Node) |
| Database + Auth + Storage | Supabase (PostgreSQL) |
| AI | Google Gemini 1.5 Pro (text + vision) |
| Push Notifications | Expo Notifications |
| Payments | RevenueCat |

---

## Quick Start

### 1. Supabase Setup
- Create a new Supabase project at https://supabase.com
- Run `server/supabase/migration.sql` in the SQL editor
- Create two storage buckets: `hair-photos` and `progress-photos` (both private)

### 2. Backend
```bash
cd server
cp .env.example .env
# Fill in all env vars
npm run dev
```

### 3. Frontend
```bash
# In root directory
cp .env.example .env
# Fill in EXPO_PUBLIC_ vars
npx expo start --ios
```

---

## Backend API Routes

| Method | Route | Description |
|---|---|---|
| POST | /api/onboarding/intake | Save intake responses, build hair profile |
| POST | /api/photos/analyze | Upload photo + Gemini vision analysis |
| POST | /api/council/generate | Generate all 7 aunty messages in parallel |
| POST | /api/routine/generate | Build personalized weekly routine |
| POST | /api/sendoff/generate | Generate personalized send-off message |
| POST | /api/checkin/submit | Submit weekly check-in, get aunty response |
| POST | /api/photos/progress | Upload progress photo + baseline comparison |
| POST | /api/notifications/register | Register Expo push token |
| GET  | /admin | Admin dashboard (requires x-admin-password header) |
| GET  | /health | Health check |

---

## Subscription Tiers

**Free:** 1 routine · 4 check-ins · 3 photo uploads · 4 aunties · 3 products

**Premium ($6.99/mo or $49.99/yr):** All 7 aunties · Unlimited check-ins · Unlimited photos · Progress comparison · Seasonal updates · Full product shelf

---

## Environment Variables

### Server (`server/.env`)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=
REVENUECAT_API_KEY=
EXPO_PROJECT_ID=
ADMIN_PASSWORD=
PORT=3001
```

### Frontend (`.env`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_REVENUECAT_API_KEY=
```

---

## Data Model

The most valuable tables:
- **`intake_responses`** — every question answer as its own row, queryable individually
- **`checkins`** — longitudinal hair health data, weeks 1–4
- **`hair_profiles`** — detected + reported curl type, porosity, damage
- **`photos`** — full Gemini vision analysis JSON, never truncated
- **`council_messages`** — every aunty message with the exact prompt used
- **`product_interactions`** — every product shown, clicked, purchased
