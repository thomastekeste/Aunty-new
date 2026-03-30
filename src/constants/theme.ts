// Aunty Design System — African Aunty Energy
// Bold, vibrant, warm, authentic. Golds + purples + reds + greens mixed boldly.
export const colors = {
  // Core palette
  ink: '#1a0f0a',           // Deep brown — grounded, warm
  black: '#1a0f0a',
  canvas: '#fef9f3',        // Rich cream — inviting, generous
  white: '#fef9f3',
  offWhite: '#f8f4ed',
  surface: '#ffffff',       // Clean white cards
  surfaceAlt: '#f8f4ed',
  border: '#e8ddd1',        // Warm neutral border
  muted: '#a69080',
  text: '#1a0f0a',          // Deep brown text
  textSecondary: '#6b4e3e', // Medium brown

  // Primary brand colors — AFRICAN WARMTH & BOLDNESS
  primary: '#d4a574',       // Rich gold — heritage, prestige, warmth
  secondary: '#f5c48a',     // Light gold — accents, highlights
  accent: '#e8734f',        // Warm orange — energy, joy
  amberLight: '#f5c48a',    // legacy compat
  amberDark: '#8b5820',     // legacy compat
  amber: '#d4a574',         // legacy compat

  // VIBRANT JEWEL TONES — African textile energy
  gold: '#d4a574',
  orange: '#e8734f',
  terracotta: '#c85a3a',
  purple: '#6b3fa0',        // Deep purple
  magenta: '#d62d5f',       // Bold magenta
  red: '#b91c1c',           // Deep red
  wine: '#6b3fa0',
  wineLight: '#d62d5f',

  // Aunty signature colors — BOLD AFRICAN PALETTE
  ngozi: '#d4a574',         // Ngozi — rich gold
  marcia: '#2d7d4a',        // Marcia — forest green
  denise: '#1a4a5e',        // Denise — dark teal
  fatou: '#6b3fa0',         // Fatou — deep purple (updated!)
  carmen: '#d62d5f',        // Carmen — bold magenta (updated!)
  amara: '#c85a3a',         // Amara — terracotta (updated!)
  salma: '#1a6080',         // Salma — deep blue

  // Functional
  success: '#2d7d4a',
  error: '#d62d5f',
};

// Signature per aunty ID with BOLD tinted backgrounds
export const auntyColors: Record<string, { accent: string; bg: string }> = {
  '1': { accent: colors.ngozi, bg: '#faf4ed' },     // Ngozi — gold
  '2': { accent: colors.marcia, bg: '#f0f8f4' },    // Marcia — green
  '3': { accent: colors.denise, bg: '#eef5f9' },    // Denise — teal
  '4': { accent: colors.fatou, bg: '#f5f0fa' },     // Fatou — purple (updated!)
  '5': { accent: colors.carmen, bg: '#faf0f5' },    // Carmen — magenta (updated!)
  '6': { accent: colors.amara, bg: '#faf0eb' },     // Amara — terracotta (updated!)
  '7': { accent: colors.salma, bg: '#eef5fa' },     // Salma — blue
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 24,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const fonts = {
  display: 'Syne',   // Bold geometric, modern African energy
  body: 'DM Sans',   // Humanist sans-serif body
};
