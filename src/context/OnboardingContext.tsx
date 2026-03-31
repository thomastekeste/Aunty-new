import React, { createContext, useContext, useState } from 'react';
import { OnboardingData, GeminiVisionAnalysis, CouncilResponse, DailyRoutine, OnboardingPhase, UserPreferences } from '@/types';

const PREFERENCE_DEFAULTS: UserPreferences = {
  preferred_aunty_id: undefined,
  preferred_routine_length: 'standard',
  communication_style: 'nurturing',
  allow_personalization: true,
  allow_checkin_reminders: true,
};

interface OnboardingContextType {
  data: Partial<OnboardingData>;
  setData: (updates: Partial<OnboardingData>) => void;
  hairAnalysis: GeminiVisionAnalysis | null;
  setHairAnalysis: (a: GeminiVisionAnalysis) => void;
  councilResponse: CouncilResponse | null;
  setCouncilResponse: (r: CouncilResponse) => void;
  routine: DailyRoutine | null;
  setRoutine: (r: DailyRoutine) => void;
  currentPhase: OnboardingPhase;
  setCurrentPhase: (phase: OnboardingPhase) => void;
  completionPercentage: number;
  setCompletionPercentage: (percentage: number) => void;
  preferences: UserPreferences;
  setPreferences: (updates: Partial<UserPreferences>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const DATA_DEFAULTS: Partial<OnboardingData> = {
  name: '',
  city: '',
  water_hardness: 'medium',
  porosity: 'normal',
  elasticity: 'normal',
  density: 'medium',
  failed_attempts: [],
  scalp_concerns: [],
  primary_goal: 'moisture',
  wash_frequency: 'weekly',
  heat_use: 'never',
  relaxer_history: 'never_relaxed',
  protective_styling: 'sometimes',
  time_available: '1_2h',
  intake_photos: {},
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<Partial<OnboardingData>>(DATA_DEFAULTS);
  const [hairAnalysis, setHairAnalysis] = useState<GeminiVisionAnalysis | null>(null);
  const [councilResponse, setCouncilResponse] = useState<CouncilResponse | null>(null);
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>('welcome');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [preferences, setPreferencesState] = useState<UserPreferences>(PREFERENCE_DEFAULTS);

  const setData = (updates: Partial<OnboardingData>) => {
    setDataState(prev => ({ ...prev, ...updates }));
  };

  const setPreferences = (updates: Partial<UserPreferences>) => {
    setPreferencesState(prev => ({ ...prev, ...updates }));
  };

  const reset = () => {
    setDataState(DATA_DEFAULTS);
    setHairAnalysis(null);
    setCouncilResponse(null);
    setRoutine(null);
    setCurrentPhase('welcome');
    setCompletionPercentage(0);
    setPreferencesState(PREFERENCE_DEFAULTS);
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setData,
        hairAnalysis,
        setHairAnalysis,
        councilResponse,
        setCouncilResponse,
        routine,
        setRoutine,
        currentPhase,
        setCurrentPhase,
        completionPercentage,
        setCompletionPercentage,
        preferences,
        setPreferences,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be inside OnboardingProvider');
  return ctx;
}
