/**
 * OnboardingContext — Manages all state collected during the consultation.
 * Persists progress to AsyncStorage so it survives crashes/restarts.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingData, HairProfile, CouncilResponse, WeeklyRitual, PhotoAnalysis } from '../types';
import type { AuntyId } from '../constants/aunties';

const STORAGE_KEY = 'onboarding_progress';

interface OnboardingState {
  data: OnboardingData;
  currentPhase: number; // 0-4
  isComplete: boolean;
  isRestored: boolean; // true after we attempt restore from storage
}

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_CITY'; payload: string }
  | { type: 'SET_CHOSEN_AUNTY'; payload: AuntyId }
  | { type: 'SET_DEMOGRAPHICS'; payload: { ageRange?: string; gender?: string } }
  | { type: 'UPDATE_HAIR_PROFILE'; payload: Partial<HairProfile> }
  | { type: 'SET_PHOTOS'; payload: Partial<OnboardingData['photos']> }
  | { type: 'SET_PHOTO_ANALYSIS'; payload: PhotoAnalysis }
  | { type: 'SET_COUNCIL_RESPONSE'; payload: CouncilResponse }
  | { type: 'SET_ROUTINE'; payload: WeeklyRitual }
  | { type: 'SET_PHASE'; payload: number }
  | { type: 'COMPLETE' }
  | { type: 'RESTORE'; payload: OnboardingState }
  | { type: 'RESET' };

const initialState: OnboardingState = {
  data: {
    name: '',
    hairProfile: {},
    photos: {},
  },
  currentPhase: 0,
  isComplete: false,
  isRestored: false,
};

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, data: { ...state.data, name: action.payload } };
    case 'SET_CITY':
      return { ...state, data: { ...state.data, city: action.payload } };
    case 'SET_CHOSEN_AUNTY':
      return { ...state, data: { ...state.data, chosenAuntyId: action.payload } };
    case 'SET_DEMOGRAPHICS':
      return { ...state, data: { ...state.data, ageRange: action.payload.ageRange as any, gender: action.payload.gender } };
    case 'UPDATE_HAIR_PROFILE':
      return {
        ...state,
        data: {
          ...state.data,
          hairProfile: { ...state.data.hairProfile, ...action.payload },
        },
      };
    case 'SET_PHOTOS':
      return {
        ...state,
        data: { ...state.data, photos: { ...state.data.photos, ...action.payload } },
      };
    case 'SET_PHOTO_ANALYSIS':
      return { ...state, data: { ...state.data, photoAnalysis: action.payload } };
    case 'SET_COUNCIL_RESPONSE':
      return { ...state, data: { ...state.data, councilResponse: action.payload } };
    case 'SET_ROUTINE':
      return { ...state, data: { ...state.data, routine: action.payload } };
    case 'SET_PHASE':
      return { ...state, currentPhase: action.payload };
    case 'COMPLETE':
      return { ...state, isComplete: true };
    case 'RESTORE':
      return { ...action.payload, isRestored: true };
    case 'RESET':
      return { ...initialState, isRestored: true };
    default:
      return state;
  }
}

// Persist state to AsyncStorage (debounced by the caller)
async function persistState(state: OnboardingState) {
  try {
    const serializable = {
      data: state.data,
      currentPhase: state.currentPhase,
      isComplete: state.isComplete,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (e) {
    console.warn('[OnboardingContext] Failed to persist state:', e);
  }
}

interface ContextValue {
  state: OnboardingState;
  setName: (name: string) => void;
  setCity: (city: string) => void;
  setChosenAunty: (auntyId: AuntyId) => void;
  setDemographics: (data: { ageRange?: string; gender?: string }) => void;
  updateHairProfile: (data: Partial<HairProfile>) => void;
  setPhotos: (photos: Partial<OnboardingData['photos']>) => void;
  setPhotoAnalysis: (analysis: PhotoAnalysis) => void;
  setCouncilResponse: (response: CouncilResponse) => void;
  setRoutine: (routine: WeeklyRitual) => void;
  setPhase: (phase: number) => void;
  complete: () => void;
  reset: () => void;
}

const OnboardingCtx = createContext<ContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isInitialized = useRef(false);

  // Restore state from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({
            type: 'RESTORE',
            payload: {
              data: parsed.data || initialState.data,
              currentPhase: parsed.currentPhase ?? 0,
              isComplete: parsed.isComplete ?? false,
              isRestored: true,
            },
          });
        } else {
          // Nothing stored, mark as restored anyway
          dispatch({ type: 'RESTORE', payload: { ...initialState, isRestored: true } });
        }
      } catch (e) {
        console.warn('[OnboardingContext] Failed to restore state:', e);
        dispatch({ type: 'RESTORE', payload: { ...initialState, isRestored: true } });
      }
      isInitialized.current = true;
    })();
  }, []);

  // Debounced persist — write to storage at most once per 1.5 s
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isInitialized.current || !state.isRestored) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      persistState(state);
    }, 1500);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [state]);

  const value: ContextValue = {
    state,
    setName: useCallback((name) => dispatch({ type: 'SET_NAME', payload: name }), []),
    setCity: useCallback((city: string) => dispatch({ type: 'SET_CITY', payload: city }), []),
    setChosenAunty: useCallback((auntyId: AuntyId) => dispatch({ type: 'SET_CHOSEN_AUNTY', payload: auntyId }), []),
    setDemographics: useCallback((data: { ageRange?: string; gender?: string }) => dispatch({ type: 'SET_DEMOGRAPHICS', payload: data }), []),
    updateHairProfile: useCallback((data) => dispatch({ type: 'UPDATE_HAIR_PROFILE', payload: data }), []),
    setPhotos: useCallback((photos) => dispatch({ type: 'SET_PHOTOS', payload: photos }), []),
    setPhotoAnalysis: useCallback((a: PhotoAnalysis) => dispatch({ type: 'SET_PHOTO_ANALYSIS', payload: a }), []),
    setCouncilResponse: useCallback((r) => dispatch({ type: 'SET_COUNCIL_RESPONSE', payload: r }), []),
    setRoutine: useCallback((r) => dispatch({ type: 'SET_ROUTINE', payload: r }), []),
    setPhase: useCallback((p) => dispatch({ type: 'SET_PHASE', payload: p }), []),
    complete: useCallback(() => dispatch({ type: 'COMPLETE' }), []),
    reset: useCallback(async () => {
      dispatch({ type: 'RESET' });
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('[OnboardingContext] Failed to clear storage:', e);
      }
    }, []),
  };

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
