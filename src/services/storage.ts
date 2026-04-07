import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingData } from '../types';

const KEYS = {
  ONBOARDING_PROGRESS: '@aunty_curl_council:onboarding_progress',
  USER_PREFERENCES: '@aunty_curl_council:user_preferences',
} as const;

// ─── Onboarding Progress ────────────────────────────────────────

export async function saveOnboardingProgress(
  data: Partial<OnboardingData>
): Promise<void> {
  await AsyncStorage.setItem(
    KEYS.ONBOARDING_PROGRESS,
    JSON.stringify(data)
  );
}

export async function getOnboardingProgress(): Promise<Partial<OnboardingData> | null> {
  const raw = await AsyncStorage.getItem(KEYS.ONBOARDING_PROGRESS);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearOnboardingProgress(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.ONBOARDING_PROGRESS);
}

// ─── User Preferences ──────────────────────────────────────────

export interface UserPreferences {
  notificationsEnabled?: boolean;
  preferredAuntyId?: string;
  darkMode?: boolean;
  reminderTime?: string; // e.g. "09:00"
}

export async function saveUserPreferences(
  prefs: UserPreferences
): Promise<void> {
  const existing = await getUserPreferences();
  const merged = { ...existing, ...prefs };
  await AsyncStorage.setItem(
    KEYS.USER_PREFERENCES,
    JSON.stringify(merged)
  );
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
