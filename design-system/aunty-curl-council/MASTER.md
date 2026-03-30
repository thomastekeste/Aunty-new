# Aunty — Design System Master

> **LOGIC:** When building a specific page, check `design-system/pages/[page].md` first.
> If it exists, its rules **override** this file. Otherwise, follow this exclusively.

---

**Project:** Aunty — The Curl Council
**Brand Essence:** Black aunties in your corner. Warm, authoritative, culturally proud.
**Stack:** React Native + TypeScript + Expo

---

## The Two Worlds

Aunty has two distinct visual modes. Every screen belongs to one:

| World | When | Background | Text | Feel |
|-------|------|-----------|------|------|
| **Council World** | Splash, MeetCouncil, CouncilSpeaks, CouncilConvening, SendOff | `#180800` ink | `#FAF3E8` canvas | Ceremonial. Gathering. Ritual. |
| **Care World** | All onboarding questions, Home, Routine, Check-in, Progress | `#FAF3E8` canvas | `#180800` ink | Kitchen counter. Practice. Daily care. |

Never mix worlds on the same screen. Transitions between worlds use a fade (400ms).

---

## Color Palette

### Core
| Token | Value | Use |
|-------|-------|-----|
| `ink` | `#180800` | Council World backgrounds, heavy headings |
| `canvas` | `#FAF3E8` | Care World backgrounds, light text on dark |
| `offWhite` | `#F5EAD4` | Card backgrounds in Care World |
| `surface` | `#EDD9A3` | Honey. Raised cards, input backgrounds |
| `border` | `#C9A96E` | Gold-honey. All borders |
| `muted` | `#8A6840` | Secondary text, placeholder text |
| `text` | `#220F00` | Primary body text |
| `textSecondary` | `#5C3A1E` | Secondary body text |

### Signature Accent
| Token | Value | Use |
|-------|-------|-----|
| `amber` | `#D4681E` | **The house color.** CTAs, active states, progress |
| `amberLight` | `#F5C48A` | Tags, subtle highlights |
| `amberDark` | `#8C3E08` | Pressed amber states |

### Rich Secondary
| Token | Value | Use |
|-------|-------|-----|
| `wine` | `#6B2D3E` | Authority, depth. Check-in CTA, premium moments |
| `wineLight` | `#C48EA0` | Wine at low intensity |

### Aunty Signature Colors
| Aunty | Name | Color |
|-------|------|-------|
| 1 — Ngozi | Vivid amber-orange | `#B55A1C` |
| 2 — Marcia | Deep purple | `#5B1F6C` |
| 3 — Denise | Dark teal | `#1A4A5E` |
| 4 — Fatou | Forest green | `#2A5E1A` |
| 5 — Carmen | Deep red | `#B01C1C` |
| 6 — Amara | Emerald | `#1A5E2A` |
| 7 — Salma | Rich gold | `#7A5C1A` |

### What to NEVER use
- `#EC4899` pink — this is not Glossier
- Cold white `#FFFFFF` — always use canvas or offWhite
- Generic grey palettes

---

## Typography

**Two fonts only. No exceptions.**

| Font | Role |
|------|------|
| **Fraunces** | Aunty voice, headings, big moments, screen titles — always italic when large |
| **DM Sans** | Navigation, labels, body copy, functional UI |

### Rules
- **Aunty speaking** → Fraunces italic, xxl+, ink or canvas
- **UI functional** → DM Sans regular/semibold
- **Aunty name tag** → DM Sans black, uppercase, aunty color, letterSpacing 1
- **Section eyebrow** → DM Sans black, uppercase, muted, letterSpacing 2-3
- Body text minimum: **16px (fontSize.md)** — never smaller on mobile
- Headline letter spacing: `-0.5` to `-2` (tighter = more editorial)
- Body line height: `1.6`

### What to NEVER use
- Playfair Display — Fraunces is the brand
- Inter — DM Sans is the brand

---

## Spacing & Radius
```
Spacing: xs=4  sm=8  md=16  lg=24  xl=32  xxl=48
Radius:  sm=8  md=14  lg=24  full=999
```

---

## Components

### Button (Primary)
- Background: `amber`, text: `canvas`
- Border radius: `radius.full`
- Font: DM Sans black, uppercase, letterSpacing 1.5
- Height minimum: **48px**
- Disabled: surface bg, muted text
- Loading: spinner replaces label, still amber

### AuntyBubble
- Avatar: 48px, aunty `AUNTY_COLORS` background
- Left border: 4px solid, aunty signature color
- Bubble: 1px `border` color, subtle aunty color tint bg (5-8% opacity)
- Name: DM Sans black, uppercase, aunty color, fontSize xs, letterSpacing 1
- Message: **Fraunces italic**, fontSize md, lineHeight 24
- Animation: FadeInDown 400ms, stagger +150ms per bubble

### AuntyAvatar
- Circle, `AUNTY_COLORS[id]` background
- No portrait yet: initial letter, white, Fraunces bold, size * 0.38
- Border: 2-3px matching world background (for overlap stacking effect)

### Back Button
- **Always SVG** (never ← text)
- Touch area: **minimum 44x44px**
- Color: ink on canvas, canvas on ink

### OptionCard
- Default: canvas bg, border color
- Selected: surface bg, amber border 1.5px
- Height minimum: 48px

---

## Aunty Character System

Full character data for `aunties.ts` expansion:

```
Ngozi (1) — The Moisture Authority
  dialect:     Nigerian Pidgin
  quote:       "Ahn ahn! Dis hair need shea, not excuse o."
  personality: Direct, urgent, deeply caring
  ingredient:  Shea butter, hot oil, steam
  win:         "Ah ah! Now we dey talk o!"
  fail:        "Dis hair dey cry — you dey hear am?"

Marcia (2) — The Root Whisperer
  dialect:     Jamaican Patois
  quote:       "Roots first, yuh hear mi? Always."
  personality: Patient, methodical, growth-obsessed
  ingredient:  JBCO, scalp massage, fenugreek
  win:         "Yes pickney, di roots dem singing!"
  fail:        "Roots first. Yuh forget already?"

Denise (3) — The Cultural Elder
  dialect:     AAVE
  quote:       "Chile, I been natural before it was a whole trend."
  personality: Confident, no excuses, culturally proud
  ingredient:  LOC method, satin bonnet, protective styling
  win:         "Now THAT'S what I'm talking about."
  fail:        "Uh uh. We not doing this."

Fatou (4) — The Technician
  dialect:     French-accented English
  quote:       "La technique, ma chérie, c'est tout."
  personality: Methodical, elegant, teaches process over product
  ingredient:  Thread stretching, karité, braiding technique
  win:         "Voilà. C'est parfait, ma chérie."
  fail:        "La patience. Sans technique, rien n'est possible."

Carmen (5) — The Joy Bringer
  dialect:     Spanglish
  quote:       "Ay mija, esos rizos son un regalo de Dios."
  personality: Warm, buoyant, sees beauty before anyone else
  ingredient:  Flaxseed gel, finger coiling, wash-and-go
  win:         "¡Ay! Those curls came OUT today, mami!"
  fail:        "Oye, we try again. It's okay, corazón."

Amara (6) — The Strength Builder
  dialect:     East African lilt (Amharic/English)
  quote:       "Konjo, strong roots, strong hair. Abatochihn yawqu neberu."
  personality: Quiet authority, long-game thinker, builds from within
  ingredient:  Fenugreek protein mask, castor oil, strengthening
  win:         "Strong hair. Like I knew it would be, konjo."
  fail:        "The roots know. Keep going. Betam."

Salma (7) — The Remedy Keeper
  dialect:     North African (Darija/Arabic lilt)
  quote:       "Yalla habibti — argan, haba saouda, ghassoul. Allah gave us everything."
  personality: Ancient wisdom, mystical but practical, remedy-keeper
  ingredient:  Argan, ghassoul clay, henna, black seed
  win:         "Mashallah. This is what the plants promised, habibti."
  fail:        "Sabr habibti. Patience is its own treatment."
```

---

## Animation Language
| Moment | Animation | Duration |
|--------|-----------|----------|
| Aunty bubble reveal | FadeInDown | 400ms |
| Multiple bubbles | +150ms stagger per bubble | — |
| Care ↔ Council world transition | Fade | 400ms |
| CTA press | Scale 0.97 | 100ms |
| Progress bar fill | Width transition | 300ms |
| Reveal/result moment | Scale 0.95→1.0 + fade | 600ms |

Always respect `prefers-reduced-motion`.

---

## Pre-Delivery Checklist

- [ ] Screen belongs clearly to Council or Care World
- [ ] Back button is SVG, 44x44px minimum touch area
- [ ] No emoji used as icon
- [ ] Body text ≥ 16px
- [ ] Hosting aunty's signature color visible somewhere
- [ ] CTA minimum 48px height, radius.full
- [ ] AuntyBubble: Fraunces italic message, DM Sans name tag
- [ ] Loading states use aunty-voiced copy, never "Loading..."
- [ ] Error states designed (not just Alert)
