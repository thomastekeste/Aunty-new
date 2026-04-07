/**
 * Aunty Curl Council — Premium Design System
 *
 * Visual direction: Editorial warmth, layered depth, culturally grounded luxury.
 * NOT generic minimalism. NOT cold tech. NOT sterile white.
 *
 * Think: luxury magazine meets family gathering meets hair salon ceremony.
 */

export const colors = {
  // ─── Core Canvas ───────────────────────────────────────────────
  canvas: '#FEF8EC', // warm golden cream — the world's base
  canvasDeep: '#F5EBD5', // slightly deeper for layering
  ink: '#2D1B0E', // rich dark brown — primary text
  inkLight: '#5C4433', // softer brown — secondary text
  muted: '#9E8C7A', // warm gray-brown — tertiary/caption
  surface: '#FFFFFF', // card surface
  surfaceTinted: '#FFFCF5', // barely warm white for elevated cards
  border: '#E8DCC8', // warm border
  borderLight: 'rgba(45, 27, 14, 0.08)', // subtle dividers

  // ─── Brand Gold ────────────────────────────────────────────────
  primary: '#D4A04A', // rich ceremonial gold
  primaryLight: '#F5DFA0', // soft gold for backgrounds
  primaryDeep: '#B8862E', // pressed/deep gold
  primaryMuted: 'rgba(212, 160, 74, 0.12)', // gold tint

  // ─── Accent Warmth ────────────────────────────────────────────
  accent: '#C75B2A', // warm terracotta/burnt sienna
  accentLight: '#F5C4A8', // soft terracotta bg
  accentDeep: '#A04420', // pressed terracotta

  // ─── Aunty Jewel Tones (the soul of the app) ──────────────────
  jewel: {
    amber: '#D4A04A', // Ngozi's gold — moisture richness
    emerald: '#1A7A4A', // Marcia's green — growth, roots
    indigo: '#3D5A99', // Denise's blue — wisdom, protection
    plum: '#7B3F6B', // Fatou's purple — technique, artistry
    rose: '#C2456E', // Carmen's pink — joy, definition
    sienna: '#B85C2A', // Amara's orange — strength, earth
    teal: '#2A7B7B', // Salma's teal — calm, remedies
  },

  // ─── Functional ────────────────────────────────────────────────
  success: '#1A7A4A',
  error: '#C42B2B',
  warning: '#D4A04A',
  info: '#3D5A99',

  // ─── Dark Mode (consultation shell) ────────────────────────────
  dark: {
    bg: '#1A0F08', // deep warm black
    surface: '#2D1B0E', // brown-black cards
    surfaceLight: 'rgba(255, 255, 255, 0.06)', // glass surface
    text: '#FEF8EC', // cream text on dark
    textMuted: 'rgba(254, 248, 236, 0.6)', // muted on dark
    border: 'rgba(254, 248, 236, 0.1)', // subtle dark borders
  },
} as const;

// ─── Per-Aunty Color System ──────────────────────────────────────
export const auntyColors: Record<
  string,
  { accent: string; bg: string; bgDark: string; text: string; gradient: [string, string] }
> = {
  ngozi: {
    accent: colors.jewel.amber,
    bg: '#FDF6E8',
    bgDark: 'rgba(212, 160, 74, 0.15)',
    text: '#7A5E00',
    gradient: ['#FDF6E8', '#F5DFA0'],
  },
  marcia: {
    accent: colors.jewel.emerald,
    bg: '#E8F5EE',
    bgDark: 'rgba(26, 122, 74, 0.15)',
    text: '#0A5C30',
    gradient: ['#E8F5EE', '#C5E8D5'],
  },
  denise: {
    accent: colors.jewel.indigo,
    bg: '#EBF0F8',
    bgDark: 'rgba(61, 90, 153, 0.15)',
    text: '#2A4070',
    gradient: ['#EBF0F8', '#C5D5EE'],
  },
  fatou: {
    accent: colors.jewel.plum,
    bg: '#F3ECF2',
    bgDark: 'rgba(123, 63, 107, 0.15)',
    text: '#5C2A4A',
    gradient: ['#F3ECF2', '#DCC5D8'],
  },
  carmen: {
    accent: colors.jewel.rose,
    bg: '#FBEEF2',
    bgDark: 'rgba(194, 69, 110, 0.15)',
    text: '#8A2A4A',
    gradient: ['#FBEEF2', '#F0C5D5'],
  },
  amara: {
    accent: colors.jewel.sienna,
    bg: '#F8F0E8',
    bgDark: 'rgba(184, 92, 42, 0.15)',
    text: '#7A3A10',
    gradient: ['#F8F0E8', '#F0D5B8'],
  },
  salma: {
    accent: colors.jewel.teal,
    bg: '#E8F3F3',
    bgDark: 'rgba(42, 123, 123, 0.15)',
    text: '#1A5C5C',
    gradient: ['#E8F3F3', '#C0E0E0'],
  },
};

// ─── Typography (One font: Plus Jakarta Sans — modern, warm, clean) ─
export const fonts = {
  display: 'PlusJakartaSans_700Bold',
  displayMedium: 'PlusJakartaSans_600SemiBold',
  displayItalic: 'PlusJakartaSans_700Bold', // no italic variant, use bold
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 19,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  display: 48,
  hero: 60,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const lineHeight = {
  tight: 1.1, // display text
  snug: 1.25, // headings
  normal: 1.5, // body text
  relaxed: 1.65, // long-form
};

export const letterSpacing = {
  tighter: -1.5,
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.5,
  widest: 3,
};

// ─── Typography Presets ──────────────────────────────────────────
export const typography = {
  hero: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
    letterSpacing: letterSpacing.tighter,
    lineHeight: fontSize.hero * lineHeight.tight,
    color: colors.ink,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: fontSize.display,
    letterSpacing: letterSpacing.tighter,
    lineHeight: fontSize.display * lineHeight.tight,
    color: colors.ink,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xxxl * lineHeight.snug,
    color: colors.ink,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xxl * lineHeight.snug,
    color: colors.ink,
  },
  h3: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.snug,
    color: colors.ink,
  },
  h4: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.snug,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    color: colors.ink,
  },
  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    color: colors.ink,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.muted,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
    color: colors.ink,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
    color: colors.primary,
  },
};

// ─── Spacing Scale (8pt grid) ────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96,
};

// ─── Border Radius (tighter = more sophisticated, less playful) ──
export const radius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

// ─── Shadows (warm-tinted, not gray) ─────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#2D1B0E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#2D1B0E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#2D1B0E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  xl: {
    shadowColor: '#2D1B0E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 10,
  },
  gold: {
    shadowColor: '#D4A04A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  accent: {
    shadowColor: '#C75B2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
};

// ─── Gradients ───────────────────────────────────────────────────
export const gradients = {
  gold: ['#D4A04A', '#B8862E'] as const,
  goldSoft: ['#FDF6E8', '#F5DFA0'] as const,
  accent: ['#C75B2A', '#A04420'] as const,
  canvas: ['#FEF8EC', '#F5EBD5'] as const,
  dark: ['#2D1B0E', '#1A0F08'] as const,
  darkWarm: ['#1A0F08', '#0D0704'] as const,
  warmOverlay: ['rgba(254, 248, 236, 0)', 'rgba(254, 248, 236, 1)'] as const,
  councilGold: ['#F5DFA0', '#D4A04A', '#B8862E'] as const,
  ceremony: ['#1A0F08', '#2D1B0E', '#3D2A1A'] as const, // dark ceremonial
};

// ─── Animation Presets ───────────────────────────────────────────
export const animation = {
  micro: 120,
  fast: 200,
  normal: 300,
  slow: 450,
  dramatic: 600,
  spring: {
    gentle: { damping: 20, stiffness: 150 },
    bouncy: { damping: 12, stiffness: 180 },
    snappy: { damping: 18, stiffness: 250 },
  },
};

// ─── Z-Index Scale ───────────────────────────────────────────────
export const zIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  overlay: 20,
  modal: 40,
  toast: 50,
};
