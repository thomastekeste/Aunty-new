import React, { createContext, useContext, useState } from 'react';
import { OnboardingData, GeminiVisionAnalysis, CouncilResponse, DailyRoutine } from '@/types';

interface OnboardingContextType {
  data: Partial<OnboardingData>;
  setData: (updates: Partial<OnboardingData>) => void;
  hairAnalysis: GeminiVisionAnalysis | null;
  setHairAnalysis: (a: GeminiVisionAnalysis) => void;
  councilResponse: CouncilResponse | null;
  setCouncilResponse: (r: CouncilResponse) => void;
  routine: DailyRoutine | null;
  setRoutine: (r: DailyRoutine) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const DEFAULTS: Partial<OnboardingData> = {
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
  const [data, setDataState] = useState<Partial<OnboardingData>>(DEFAULTS);
  const [hairAnalysis, setHairAnalysis] = useState<GeminiVisionAnalysis | null>(null);
  const [councilResponse, setCouncilResponse] = useState<CouncilResponse | null>(null);
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);

  const setData = (updates: Partial<OnboardingData>) => {
    setDataState(prev => ({ ...prev, ...updates }));
  };

  const reset = () => {
    setDataState(DEFAULTS);
    setHairAnalysis(null);
    setCouncilResponse(null);
    setRoutine(null);
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
