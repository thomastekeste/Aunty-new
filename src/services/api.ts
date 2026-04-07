import { supabase } from './supabase';
import type { HairProfile, CouncilResponse, WeeklyRitual } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Helpers ────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  let token: string | undefined;
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiCall<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ─── Onboarding ─────────────────────────────────────────────────

export async function submitIntake(data: {
  name: string;
  hairProfile: HairProfile;
}): Promise<{ councilResponse: CouncilResponse; routine: WeeklyRitual }> {
  return apiCall('/api/onboarding/intake', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Photos ─────────────────────────────────────────────────────

export async function analyzePhoto(imageUri: string): Promise<{
  analysis: Record<string, unknown>;
  photoId: string;
  storagePath: string;
}> {
  // Convert local URI to base64 for upload
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data:image/...;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return apiCall('/api/photos/analyze', {
    method: 'POST',
    body: JSON.stringify({ imageBase64: base64, type: 'analysis' }),
  });
}

// ─── Council ────────────────────────────────────────────────────

export async function generateCouncil(
  hairProfile: HairProfile
): Promise<CouncilResponse> {
  return apiCall('/api/council/generate', {
    method: 'POST',
    body: JSON.stringify({ hairProfile }),
  });
}

// ─── Routine ────────────────────────────────────────────────────

export async function generateRoutine(
  hairProfile: HairProfile,
  councilResponse: CouncilResponse
): Promise<WeeklyRitual> {
  return apiCall('/api/routine/generate', {
    method: 'POST',
    body: JSON.stringify({ hairProfile, councilResponse }),
  });
}

// ─── Check-ins ──────────────────────────────────────────────────

export async function submitCheckin(data: {
  weekNumber: number;
  hostingAuntyId: string;
  mood: string;
  notes?: string;
  photoUri?: string;
}): Promise<{ checkin: Record<string, unknown>; auntyResponse: string }> {
  return apiCall('/api/checkin/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Notifications ──────────────────────────────────────────────

export async function registerPushToken(
  token: string
): Promise<{ success: boolean }> {
  return apiCall('/api/notifications/register', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// ─── User Profile ───────────────────────────────────────────────

export async function getUserProfile(): Promise<{
  user: Record<string, unknown>;
  hairProfile: HairProfile | null;
  routine: Record<string, unknown> | null;
  checkins: Record<string, unknown>[];
}> {
  return apiCall('/api/user/profile');
}
