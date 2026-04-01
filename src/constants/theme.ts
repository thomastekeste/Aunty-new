// Aunty Design System — Afro-Textural Maximalism
// Warm golden foundations. Fully saturated aunty colors. Bold, joyful, multicultural.

export const colors = {
  // Core palette — warm cream & gold base
  ink: '#3d2f1f',           // Warm deep brown — grounded, rich
  inkDeep: '#fef8ec',       // Light cream (for dark overlays on light, use ink)
  black: '#0e0a18',
  canvas: '#fef8ec',        // Warm golden cream — generous, inviting
  white: '#fef8ec',
  offWhite: '#f9f2e4',
  surface: '#ffffff',       // Clean white cards
  surfaceAlt: '#f9f2e4',
  border: '#e4d9c8',        // Warm cream border
  borderLight: '#ede5d4',   // Lighter cream for cards
  muted: '#9e8c7a',
  mutedLight: '#bfae9e',
  text: '#0e0a18',          // Deep ink for text
  textSecondary: '#5c4a38', // Warm medium brown

  // Primary brand colors — VIVID & BOLD
  primary: '#F5C542',       // Sunshine gold — vibrant, warm, iconic
  primaryDeep: '#D4A020',   // Deeper gold for press states
  secondary: '#FFE08A',     // Soft gold — accents, highlights
  accent: '#FB5607',        // Electric burnt orange — fire, joy, energy
  accentDeep: '#D44200',    // Deeper orange
  amberLight: '#FFE08A',    // legacy compat
  amberDark: '#8B5E00',     // legacy compat
  amber: '#F5C542',         // legacy compat

  // VIBRANT JEWEL TONES — full African textile spectrum
  gold: '#F5C542',
  orange: '#FB5607',
  terracotta: '#E8532A',
  purple: '#9B5DE5',        // Electric violet-purple
  magenta: '#F72585',       // Vivid hot pink
  red: '#E0142C',           // Bold crimson
  wine: '#1A0E3A',          // Deep cosmic indigo (darkened for contrast)
  wineLight: '#9B5DE5',     // Electric purple

  // Aunty signature colors — FULLY SATURATED, DISTINCTLY VIBRANT
  ngozi: '#F5C542',         // Ngozi — sunshine gold
  marcia: '#12C064',        // Marcia — vivid emerald
  denise: '#00B4D8',        // Denise — electric sky blue
  fatou: '#9B5DE5',         // Fatou — electric violet
  carmen: '#F72585',        // Carmen — vivid hot pink
  amara: '#FB5607',         // Amara — electric orange
  salma: '#0BBFAA',         // Salma — vivid teal

  // Functional
  success: '#12C064',
  error: '#F72585',
  warning: '#F5A623',
  info: '#00B4D8',
};

// Signature per aunty ID — vivid backgrounds + strong tints
export const auntyColors: Record<string, { accent: string; bg: string; bgDark: string; text: string }> = {
  '1': { accent: colors.ngozi,  bg: '#FDF8E1', bgDark: 'rgba(245,197,66,0.18)',   text: '#7A5E00' }, // Ngozi — gold
  '2': { accent: colors.marcia, bg: '#E6F9F0', bgDark: 'rgba(18,192,100,0.18)',   text: '#0A6B38' }, // Marcia — emerald
  '3': { accent: colors.denise, bg: '#E4F6FD', bgDark: 'rgba(0,180,216,0.18)',    text: '#00668A' }, // Denise — sky blue
  '4': { accent: colors.fatou,  bg: '#F2ECFC', bgDark: 'rgba(155,93,229,0.18)',   text: '#5B22B0' }, // Fatou — violet
  '5': { accent: colors.carmen, bg: '#FFEDF5', bgDark: 'rgba(247,37,133,0.18)',   text: '#A00060' }, // Carmen — hot pink
  '6': { accent: colors.amara,  bg: '#FFF0E8', bgDark: 'rgba(251,86,7,0.18)',     text: '#A83500' }, // Amara — orange
  '7': { accent: colors.salma,  bg: '#E5F8F6', bgDark: 'rgba(11,191,170,0.18)',   text: '#0A7268' }, // Salma — teal
};

// Gradient definitions
export const gradients = {
  primary: ['#F5C542', '#D4A020'] as const,
  primarySoft: ['#FDF3C0', '#F5C542'] as const,
  accent: ['#FB5607', '#D44200'] as const,
  canvas: ['#fef8ec', '#f5ead6'] as const,
  surface: ['#ffffff', '#faf5ec'] as const,
  dark: ['#3d2f1f', '#1a0e0a'] as const,
  warmOverlay: ['rgba(245,197,66,0.15)', 'rgba(245,197,66,0)'] as const,
  councilGold: ['#FDF3C0', '#FEF8EC', '#EDE5D4'] as const,
  aunty: (auntyId: string) => {
    const map: Record<string, readonly [string, string]> = {
      '1': ['#FDF8E1', '#FFFBF0'] as const,
      '2': ['#E6F9F0', '#F0FFF8'] as const,
      '3': ['#E4F6FD', '#EFF9FF'] as const,
      '4': ['#F2ECFC', '#F8F4FF'] as const,
      '5': ['#FFEDF5', '#FFF5FA'] as const,
      '6': ['#FFF0E8', '#FFF8F5'] as const,
      '7': ['#E5F8F6', '#F0FFFE'] as const,
    };
    return map[auntyId] ?? (['#fef8ec', '#fff'] as const);
  },
};

// Shadow tokens — deeper for dark-base design
export const shadows = {
  xs: {
    shadowColor: '#070411',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  } as const,
  sm: {
    shadowColor: '#070411',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  } as const,
  md: {
    shadowColor: '#070411',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  } as const,
  lg: {
    shadowColor: '#070411',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
    elevation: 8,
  } as const,
  xl: {
    shadowColor: '#070411',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 32,
    elevation: 12,
  } as const,
  // Colored shadows for brand elements
  gold: {
    shadowColor: '#F5C542',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  } as const,
  accent: {
    shadowColor: '#FB5607',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  } as const,
};

// Elevation z-index scale
export const elevation = {
  base: 0,
  card: 1,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 24,
  xl: 32,
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
  display: 48,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const fonts = {
  display: 'Outfit',           // Bold modern geometric — contemporary & striking
  body: 'Plus Jakarta Sans',   // Warm, modern sans-serif — friendly & accessible
};

// Typography presets for consistent hierarchy
export const typography = {
  display: {
    fontFamily: 'Outfit',
    fontSize: 48,
    fontWeight: '900' as const,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  h1: {
    fontFamily: 'Outfit',
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: -1,
    lineHeight: 40,
  },
  h2: {
    fontFamily: 'Outfit',
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  h3: {
    fontFamily: 'Outfit',
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h4: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  overline: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
  },
};

// Animation timing presets
export const animation = {
  micro: 120,      // Instant feedback (button press)
  fast: 200,       // Quick transitions
  normal: 300,     // Standard transitions
  slow: 450,       // Deliberate animations
  spring: {
    tension: 100,
    friction: 10,
  },
  springBouncy: {
    tension: 80,
    friction: 6,
  },
};
