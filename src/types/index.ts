// ── User & Auth ─────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  city?: string;
  water_hardness?: 'soft' | 'medium' | 'hard';
  subscription_status: 'free' | 'active' | 'cancelled';
  onboarding_complete: boolean;
  onboarding_step_completed: number;
  expo_push_token?: string;
  created_at: string;
  updated_at: string;
}

// ── Hair Profile ─────────────────────────────────────────────────────
export type Porosity = 'low' | 'normal' | 'high';
export type Elasticity = 'low' | 'normal' | 'high';
export type Density = 'thin' | 'medium' | 'thick';
export type PrimaryGoal = 'length' | 'moisture' | 'definition' | 'volume' | 'health';
export type WashFrequency = 'weekly' | 'bi_weekly' | 'monthly' | 'less_frequent';
export type HeatUse = 'never' | 'rarely' | 'sometimes' | 'often';
export type RelaxerHistory = 'never_relaxed' | 'currently_relaxed' | 'transitioning' | 'big_chopped';
export type ProtectiveStyling = 'yes_regularly' | 'sometimes' | 'never';
export type TimeAvailable = 'under_1h' | '1_2h' | '3plus_h';
export type CurlType = '2a' | '2b' | '2c' | '3a' | '3b' | '3c' | '4a' | '4b' | '4c';

export interface HairProfile {
  id: string;
  user_id: string;
  curl_type?: CurlType;
  porosity: Porosity;
  elasticity?: Elasticity;
  protein_needs?: Elasticity;
  density?: Density;
  primary_goal?: PrimaryGoal;
  wash_frequency?: WashFrequency;
  heat_use?: HeatUse;
  relaxer_history?: RelaxerHistory;
  protective_styling?: ProtectiveStyling;
  time_available?: TimeAvailable;
  failed_attempts?: string[];
  scalp_concerns?: string[];
  created_at: string;
  updated_at: string;
}

// ── Photos ───────────────────────────────────────────────────────────
export interface GeminiVisionAnalysis {
  curl_type?: CurlType;
  texture_description?: string;
  visible_concerns?: string[];
  condition_assessment?: string;
}

export interface Photo {
  id: string;
  user_id: string;
  type: 'intake_front' | 'intake_back' | 'intake_closeup' | 'checkin';
  checkin_id?: string;
  storage_path: string;
  analysis_json?: GeminiVisionAnalysis;
  created_at: string;
}

// ── Routine ──────────────────────────────────────────────────────────
export interface RoutineStep {
  step_number: number;
  name: string;
  description: string;
  duration_minutes?: number;
  product_category?: 'cleanser' | 'conditioner' | 'leave_in' | 'oil' | 'styler' | 'treatment';
}

export interface DayRoutine {
  day_name: string;
  hosted_by_aunty_id: string;
  steps: RoutineStep[];
  estimated_time_minutes: number;
  purpose: string;
}

export interface DailyRoutine {
  wash_day: DayRoutine;
  style_day: DayRoutine;
  refresh_day: DayRoutine;
  rest_day: DayRoutine;
}

export interface AuntyCouncilMessage {
  aunty_id: string;
  aunty_name: string;
  message: string;
  timestamp: string;
}

export interface CouncilResponse {
  [key: string]: AuntyCouncilMessage | string;
  consensus: string;
}

export interface Routine {
  id: string;
  user_id: string;
  routine_json: DailyRoutine;
  council_response_json: CouncilResponse;
  generated_at: string;
  updated_at: string;
}

// ── Check-ins ────────────────────────────────────────────────────────
export interface GeminiCheckinAnalysis {
  progress_detected?: boolean;
  comparison_notes?: string;
  suggested_adjustments?: string[];
  next_steps?: string[];
}

export interface Checkin {
  id: string;
  user_id: string;
  hosting_aunty_id: string;
  initiated_by: 'system' | 'user';
  week_number: number;
  progress_notes?: string;
  ai_analysis_json?: GeminiCheckinAnalysis;
  created_at: string;
}

// ── Aunties ──────────────────────────────────────────────────────────
export interface Aunty {
  id: string;
  name: string;
  region: string;
  specialty: string;
  quote: string;
  // Character voice
  dialect: string;
  personality: string;
  title: string;
  ingredient: string;
  win: string;
  fail: string;
  greeting: string;
}

// ── Products ─────────────────────────────────────────────────────────
export interface Product {
  id: string;
  asin?: string;
  name: string;
  brand: string;
  category: 'shampoo' | 'conditioner' | 'leave_in' | 'oil' | 'styler' | 'treatment';
  recommended_by_aunty_id: string;
  free_tier_shown: boolean;
  affiliate_link: string;
  price_usd?: number;
}

// ── Navigation ───────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  App: undefined;
};

export type OnboardingStackParamList = {
  Splash: undefined;
  MeetCouncil: undefined;
  Name: undefined;
  SignUp: undefined;
  Location: undefined;
  PorosityTest: undefined;
  ElasticityTest: undefined;
  DensityTest: undefined;
  PhotoUpload: undefined;
  CurlTypeReveal: undefined;
  WashFrequency: undefined;
  PrimaryGoal: undefined;
  Failures: undefined;
  HeatUse: undefined;
  RelaxerHistory: undefined;
  ProtectiveStyling: undefined;
  ScalpConcerns: undefined;
  TimeAvailable: undefined;
  CouncilConvening: undefined;
  CouncilSpeaks: undefined;
  Routine: undefined;
  SendOff: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  RoutineTab: undefined;
  Progress: undefined;
  Products: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  CheckinModal: { auntyId: string; userInitiated: boolean };
};

// ── Onboarding State ─────────────────────────────────────────────────
export interface OnboardingData {
  name: string;
  city: string;
  water_hardness: 'soft' | 'medium' | 'hard';
  porosity: Porosity;
  elasticity: Elasticity;
  density: Density;
  failed_attempts: string[];
  scalp_concerns: string[];
  primary_goal: PrimaryGoal;
  wash_frequency: WashFrequency;
  heat_use: HeatUse;
  relaxer_history: RelaxerHistory;
  protective_styling: ProtectiveStyling;
  time_available: TimeAvailable;
  intake_photos: {
    front?: string;
    back?: string;
    closeup?: string;
  };
  hair_analysis?: GeminiVisionAnalysis;
}
