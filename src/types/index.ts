/**
 * Aunty Curl Council — Core Type Definitions
 */

import type { AuntyId } from '../constants/aunties';

// ─── Hair Science Types ──────────────────────────────────────────

export type CurlType =
  | '2a' | '2b' | '2c' // Wavy
  | '3a' | '3b' | '3c' // Curly
  | '4a' | '4b' | '4c'; // Coily

export type Porosity = 'low' | 'normal' | 'high';
export type Elasticity = 'low' | 'normal' | 'high';
export type Density = 'thin' | 'medium' | 'thick';
export type WashFrequency = 'daily' | 'every-other' | 'twice-weekly' | 'weekly' | 'biweekly' | 'monthly';
export type HeatUse = 'never' | 'rarely' | 'monthly' | 'weekly' | 'daily';
export type TimeAvailable = '10min' | '20min' | '30min' | '45min' | '60min' | '90min-plus';

export type PrimaryGoal =
  | 'moisture'
  | 'growth'
  | 'definition'
  | 'damage-repair'
  | 'scalp-health'
  | 'simplify-routine'
  | 'transition';

// ─── User & Profile ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  city?: string;
  waterHardness?: 'soft' | 'moderate' | 'hard';
  onboardingComplete: boolean;
  onboardingStep?: string;
  preferredAuntyId?: AuntyId;
  subscriptionStatus: 'free' | 'active' | 'cancelled';
  createdAt: string;
}

export interface HairProfile {
  curlType?: CurlType;
  porosity?: Porosity;
  elasticity?: Elasticity;
  density?: Density;
  primaryGoal?: PrimaryGoal;
  secondaryGoals?: PrimaryGoal[];
  washFrequency?: WashFrequency;
  heatUse?: HeatUse;
  relaxerHistory?: boolean;
  colorTreated?: boolean;
  protectiveStyling?: boolean;
  scalpConcerns?: string[];
  timeAvailable?: TimeAvailable;
  failedAttempts?: string[];
  productScope?: ProductScope;
  productBudget?: ProductBudget;
}

export type ProductScope = 'basics' | 'routine' | 'full' | 'everything';
export type ProductBudget = 'under-30' | '30-60' | '60-100' | '100-plus';

// ─── Onboarding State ────────────────────────────────────────────

export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55+';

export interface OnboardingData {
  name: string;
  chosenAuntyId?: AuntyId;
  ageRange?: AgeRange;
  gender?: string;
  hairProfile: HairProfile;
  photos: {
    front?: string;
    back?: string;
    closeup?: string;
  };
  councilResponse?: CouncilResponse;
  routine?: WeeklyRitual;
}

export interface CouncilResponse {
  auntyMessages: Record<AuntyId, string>;
  consensus: string;
  hairProfileSummary: string;
  keyFindings: string[];
}

// ─── Weekly Ritual System ────────────────────────────────────────

export type RitualDayType = 'wash' | 'style' | 'refresh' | 'rest' | 'scalp' | 'protein' | 'protect';

export interface RitualStep {
  name: string;
  description: string;
  duration?: string; // e.g. "5 min"
  product?: string;
}

export interface RitualDay {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  type: RitualDayType;
  label: string; // "Wash Day", "Style Day", etc.
  hostAunty: AuntyId;
  purpose: string;
  estimatedTime: string; // "45 min"
  steps: RitualStep[];
}

export interface WeeklyRitual {
  id: string;
  weekNumber: number;
  days: RitualDay[];
  theme?: string; // "Foundation Week", "Deep Moisture Week", etc.
  isActive: boolean;
}

// ─── Check-ins & Journey ─────────────────────────────────────────

export interface CheckIn {
  id: string;
  userId: string;
  weekNumber: number;
  hostingAuntyId: AuntyId;
  mood?: 'great' | 'good' | 'okay' | 'struggling';
  notes?: string;
  photoUri?: string;
  auntyResponse?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  weekNumber: number;
  achieved: boolean;
  achievedAt?: string;
  auntyId: AuntyId; // which aunty celebrates with you
}

// ─── Navigation Types ────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  App: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  NameEntry: undefined;
  CurlType: undefined;
  Validation1: undefined;
  PorosityTest: undefined;
  PrimaryGoal: undefined;
  Validation2: undefined;
  HairHabits: undefined;
  Struggles: undefined;
  Validation3: undefined;
  BudgetQuestion: undefined;
  CouncilConvening: undefined;
  CouncilVerdict: undefined;
  ProductReveal: undefined;
  SendOff: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Ritual: undefined;
  Products: undefined;
  Chat: undefined;
  Learn: undefined;
};

export type CheckInMood = 'great' | 'good' | 'okay' | 'struggling';

export type AppStackParamList = {
  Tabs: undefined;
  CheckIn: { mood?: CheckInMood } | undefined;
  RitualSteps: undefined;
  AuntyChat: { auntyId: AuntyId };
  HairProfile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangeAunty: undefined;
};
