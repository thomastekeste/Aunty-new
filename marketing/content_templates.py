"""
Aunty Curl Council — Marketing Content Templates
Reusable copy, colors, hooks, and CTAs for all 7 aunties.
"""

# ── Accent Colors (R, G, B) ──────────────────────────────────────────────────

AUNTY_COLORS = {
    "ngozi":  (212, 160, 74),   # gold #D4A04A
    "marcia": (45, 139, 94),    # emerald #2D8B5E
    "denise": (74, 59, 143),    # indigo #4A3B8F
    "fatou":  (139, 58, 106),   # plum #8B3A6A
    "carmen": (199, 91, 122),   # rose #C75B7A
    "amara":  (160, 82, 45),    # sienna #A0522D
    "salma":  (46, 139, 139),   # teal #2E8B8B
}

# ── Segment Scripts ──────────────────────────────────────────────────────────
# Each entry: (start_sec, end_sec, text, font_size, is_headline)
# Timing is approximate and will be scaled to match actual audio length.

AUNTY_SCRIPTS = {
    "ngozi": [
        (0.0,  3.5,  "Your scalp\nis crying.",                   72, True),
        (3.5,  8.0,  "Dandruff. Itching.\nThinning edges.",      54, False),
        (8.0,  13.0, "Growth starts\nat the scalp.",             62, True),
        (13.0, 19.5, "I'm Aunty Ngozi\nfrom Nigeria.\n\nThe app reads your scalp,\nfinds the blockages,\nbuilds your growth plan.", 44, False),
        (19.5, 24.0, "Jamaican Black\nCastor Oil",               72, True),
        (24.0, 27.5, "Hot oil treatments",                       72, True),
        (27.5, 31.0, "Weekly scalp detox",                       72, True),
        (31.0, 36.0, "Everything personalized\nto your scalp type.", 54, False),
        (36.0, 45.0, "Download\nAunty Curl Council\non the App Store", 58, True),
    ],
    "marcia": [
        (0.0,  3.0,  "Your hair\nstopped growing.",              72, True),
        (3.0,  7.5,  "Your scalp is itchy.\nYour edges are thinning.", 54, False),
        (7.5,  13.0, "Healthy hair\nstarts at your roots.",      62, True),
        (13.0, 19.5, "I'm Aunty Marcia\nfrom the Caribbean.\n\nThe app sees your hair,\nunderstands your scalp,\nbuilds your growth plan.", 44, False),
        (19.5, 24.0, "JBCO",                                    90, True),
        (24.0, 27.5, "Rice water rinses",                        72, True),
        (27.5, 31.0, "Scalp massage",                            72, True),
        (31.0, 36.0, "Everything personalized\nto your routine.", 54, False),
        (36.0, 45.0, "Download\nAunty Curl Council\non the App Store", 58, True),
    ],
    "denise": [
        (0.0,  3.5,  "You've been frying\nyour hair.",           72, True),
        (3.5,  8.0,  "Heat damage. Breakage.\nNo moisture left.", 54, False),
        (8.0,  13.0, "Protective styles\nsave your strands.",    62, True),
        (13.0, 19.5, "I'm Aunty Denise\nfrom the South.\n\nThe app assesses your damage,\nmaps your porosity,\nbuilds your recovery plan.", 44, False),
        (19.5, 24.0, "Deep conditioning\nmasque",                72, True),
        (24.0, 27.5, "Silk press\nalternatives",                 72, True),
        (27.5, 31.0, "Braids that\nprotect + grow",             72, True),
        (31.0, 36.0, "Everything personalized\nto your texture.", 54, False),
        (36.0, 45.0, "Download\nAunty Curl Council\non the App Store", 58, True),
    ],
    "fatou": [
        (0.0,  3.5,  "Your texture\nhas potential.",             72, True),
        (3.5,  8.0,  "Dull. Undefined.\nLacking shine.",         54, False),
        (8.0,  13.0, "Precision unlocks\nyour pattern.",         62, True),
        (13.0, 19.5, "I'm Aunty Fatou\nfrom Senegal.\n\nThe app maps your curl pattern,\nfinds your ideal oils,\nbuilds your LOC routine.", 44, False),
        (19.5, 24.0, "Baobab +\nmarula oils",                   72, True),
        (24.0, 27.5, "LOC method\nperfected",                   72, True),
        (27.5, 31.0, "Defined twist-outs",                      72, True),
        (31.0, 36.0, "Everything personalized\nto your pattern.", 54, False),
        (36.0, 45.0, "Download\nAunty Curl Council\non the App Store", 58, True),
    ],
    "carmen": [
        (0.0,  3.5,  "Your curls lost\ntheir bounce.",           72, True),
        (3.5,  8.0,  "Frizzy. Flat.\nNo definition.",           54, False),
        (8.0,  13.0, "Curl definition\nis a ritual.",            62, True),
        (13.0, 19.5, "I'm Aunty Carmen\nAfro-Latina born.\n\nThe app reads your curl type,\nfinds your hold level,\nbuilds your wash day plan.", 44, False),
        (19.5, 24.0, "Flaxseed gel +\ncurl cream",              72, True),
        (24.0, 27.5, "Diffuser technique",                      72, True),
        (27.5, 31.0, "Pineapple\npreserve method",              72, True),
        (31.0, 36.0, "Everything personalized\nto your curl type.", 54, False),
        (36.0, 45.0, "Download\nAunty Curl Council\non the App Store", 58, True),
    ],
    "amara": [
        (0.0,  3.5,  "Your hair tells\nyour story.",             72, True),
        (3.5,  8.0,  "Weak. Breaking.\nLosing length.",          54, False),
        (8.0,  13.0, "Strength comes from\ntradition.",          62, True),
        (13.0, 19.5, "I'm Aunty Amara\nfrom East Africa.\n\nThe app honors your texture,\nassesses your protein balance,\nbuilds your strength plan.", 44, False),
        (19.5, 24.0, "Protein treatments",                      72, True),
        (24.0, 27.5, "Shea + coffee\nrinse",                    72, True),
        (27.5, 31.0, "Traditional braiding\nfor retention",     72, True),
        (31.0, 36.0, "Everything personalized\nto your heritage.", 54, False),
        (36.0, 45.0, "Download\nAunty Curl Council\non the App Store", 58, True),
    ],
    "salma": [
        (0.0,  3.5,  "Your hair\nis thirsty.",                  72, True),
        (3.5,  8.0,  "Dry. Brittle.\nCraving moisture.",        54, False),
        (8.0,  13.0, "Moisture rituals\nchange everything.",     62, True),
        (13.0, 19.5, "I'm Aunty Salma\nfrom Morocco.\n\nThe app measures your dryness,\nfinds your porosity level,\nbuilds your hydration plan.", 44, False),
        (19.5, 24.0, "Argan oil\ndeep soak",                    72, True),
        (24.0, 27.5, "Steam treatments",                        72, True),
        (27.5, 31.0, "Overnight moisture\nwraps",               72, True),
        (31.0, 36.0, "Everything personalized\nto your moisture needs.", 54, False),
        (36.0, 45.0, "Download\nAunty Curl Council\non the App Store", 58, True),
    ],
}

# ── Hook Lines (for different TikTok concepts) ───────────────────────────────

AUNTY_HOOKS = {
    "ngozi": [
        "Your scalp is SCREAMING for help.",
        "Nobody told you about scalp health? Let me fix that.",
        "Growth doesn't start at your ends, sis.",
        "POV: an African aunty sees your dandruff.",
        "This is why your hair stopped growing.",
    ],
    "marcia": [
        "Your hair stopped growing and you don't know why.",
        "Nobody taught you about your roots? Sit down.",
        "POV: a Caribbean aunty looks at your edges.",
        "This is why rice water changed everything.",
        "Your scalp is itchy because you're ignoring it.",
    ],
    "denise": [
        "Girl, that flat iron is NOT your friend.",
        "You've been frying your hair and calling it styling.",
        "POV: a Southern aunty catches you with heat damage.",
        "Protective styles aren't just braids. Let me show you.",
        "Your hair is begging for a break.",
    ],
    "fatou": [
        "Your texture is beautiful — you just don't know it yet.",
        "Precision is the difference between frizz and definition.",
        "POV: a Senegalese aunty does your twist-out.",
        "You've been using the wrong oils for YOUR hair.",
        "LOC method but make it elegant.",
    ],
    "carmen": [
        "Your curls used to pop. What happened?",
        "Frizz isn't your curl type — it's a cry for help.",
        "POV: your Afro-Latina tia sees your wash day routine.",
        "The gel isn't the problem. Your technique is.",
        "Bounce-back curls in 3 steps.",
    ],
    "amara": [
        "Your hair carries generations of strength.",
        "Breaking hair doesn't mean weak hair.",
        "POV: an East African aunty sees your breakage.",
        "Protein and moisture — you need both.",
        "Traditional methods your grandmother knew.",
    ],
    "salma": [
        "Your hair hasn't had a real drink in weeks.",
        "Dryness isn't texture — it's dehydration.",
        "POV: a Moroccan aunty touches your dry ends.",
        "Argan oil alone isn't enough. Here's why.",
        "The moisture ritual that changed my hair.",
    ],
}

# ── CTAs ─────────────────────────────────────────────────────────────────────

AUNTY_CTAS = {
    "ngozi": [
        "Download Aunty Curl Council — your scalp will thank you.",
        "Get the app. Let Aunty Ngozi build your growth plan.",
        "Link in bio — your scalp needs this.",
    ],
    "marcia": [
        "Download Aunty Curl Council — your roots deserve it.",
        "Get the app. Let Aunty Marcia guide your journey.",
        "Link in bio — real growth starts here.",
    ],
    "denise": [
        "Download Aunty Curl Council — put down the flat iron.",
        "Get the app. Aunty Denise has your recovery plan.",
        "Link in bio — your hair needs protection, not heat.",
    ],
    "fatou": [
        "Download Aunty Curl Council — unlock your texture.",
        "Get the app. Let Aunty Fatou perfect your routine.",
        "Link in bio — precision makes the difference.",
    ],
    "carmen": [
        "Download Aunty Curl Council — your curls miss you.",
        "Get the app. Aunty Carmen brings the bounce back.",
        "Link in bio — defined curls are waiting.",
    ],
    "amara": [
        "Download Aunty Curl Council — honor your hair's story.",
        "Get the app. Aunty Amara builds your strength plan.",
        "Link in bio — tradition meets modern care.",
    ],
    "salma": [
        "Download Aunty Curl Council — hydrate from within.",
        "Get the app. Aunty Salma's moisture rituals await.",
        "Link in bio — your hair is ready to drink.",
    ],
}

# ── Campaign Templates ───────────────────────────────────────────────────────

CAMPAIGN_TEMPLATES = {
    "hair_problem": {
        "structure": ["problem", "aunty_solution", "product", "cta"],
        "description": "Open with a relatable hair problem, present the aunty's "
                       "approach as the solution, highlight a specific product/method, "
                       "close with CTA.",
    },
    "meet_your_aunty": {
        "structure": ["intro", "personality", "specialty", "cta"],
        "description": "Introduce the aunty character — where she's from, "
                       "her vibe, what she specializes in, and why the user "
                       "should listen to her.",
    },
    "quick_tip": {
        "structure": ["one_tip", "more_in_app", "cta"],
        "description": "Single actionable tip from the aunty delivered fast, "
                       "tease more personalized advice inside the app, close with CTA.",
    },
}

# ── Aunty Metadata (for templates and captions) ─────────────────────────────

AUNTY_META = {
    "ngozi": {
        "name": "Aunty Ngozi",
        "origin": "Nigeria",
        "archetype": "The Bold One",
        "voice_style": "Pidgin English, direct",
        "specialty": "scalp health & growth",
    },
    "marcia": {
        "name": "Aunty Marcia",
        "origin": "Jamaica",
        "archetype": "The Roots Queen",
        "voice_style": "Caribbean patois, warm",
        "specialty": "moisture & root care",
    },
    "denise": {
        "name": "Aunty Denise",
        "origin": "African American (South)",
        "archetype": "The Wise One",
        "voice_style": "Southern warmth, no-nonsense",
        "specialty": "protective styles & recovery",
    },
    "fatou": {
        "name": "Aunty Fatou",
        "origin": "Senegal",
        "archetype": "The Precise One",
        "voice_style": "elegant French-African",
        "specialty": "oils & texture definition",
    },
    "carmen": {
        "name": "Aunty Carmen",
        "origin": "Afro-Latina",
        "archetype": "The Joyful One",
        "voice_style": "Spanglish energy",
        "specialty": "curl definition & bounce",
    },
    "amara": {
        "name": "Aunty Amara",
        "origin": "Ethiopian-Eritrean",
        "archetype": "The Strong One",
        "voice_style": "quiet power, intentional",
        "specialty": "strength & cultural traditions",
    },
    "salma": {
        "name": "Aunty Salma",
        "origin": "Morocco",
        "archetype": "The Calm One",
        "voice_style": "serene wisdom",
        "specialty": "moisture rituals & hydration",
    },
}
