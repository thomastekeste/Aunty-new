import { supabase } from './supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function apiPost(path, body) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data;
}

async function apiPostFormData(path, formData) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data;
}

// ─── Intake ───────────────────────────────────────────────────────────────────

export async function submitIntake(userId, sessionId, responses) {
  return apiPost('/api/onboarding/intake', { user_id: userId, session_id: sessionId, responses });
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function analyzePhoto(uri, userId, photoType, sessionId) {
  const formData = new FormData();
  formData.append('photo', { uri, type: 'image/jpeg', name: 'photo.jpg' });
  formData.append('user_id', userId);
  formData.append('photo_type', photoType);
  formData.append('session_id', sessionId);
  return apiPostFormData('/api/photos/analyze', formData);
}

export async function uploadProgressPhoto(uri, userId, weekNumber) {
  const formData = new FormData();
  formData.append('photo', { uri, type: 'image/jpeg', name: 'progress.jpg' });
  formData.append('user_id', userId);
  formData.append('week_number', String(weekNumber));
  return apiPostFormData('/api/photos/progress', formData);
}

// ─── Council ─────────────────────────────────────────────────────────────────

export async function generateCouncil(userId, routineId, intakeSessionId) {
  return apiPost('/api/council/generate', {
    user_id: userId,
    routine_id: routineId,
    intake_session_id: intakeSessionId,
  });
}

// ─── Routine ─────────────────────────────────────────────────────────────────

export async function generateRoutine(userId, hairProfileId, councilSessionId) {
  return apiPost('/api/routine/generate', {
    user_id: userId,
    hair_profile_id: hairProfileId,
    council_session_id: councilSessionId,
  });
}

// ─── Sendoff ─────────────────────────────────────────────────────────────────

export async function generateSendoff(userId, routineId, userName) {
  return apiPost('/api/sendoff/generate', { user_id: userId, routine_id: routineId, user_name: userName });
}

// ─── Checkin ─────────────────────────────────────────────────────────────────

export async function submitCheckin(data) {
  return apiPost('/api/checkin/submit', data);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function registerPushToken(userId, expoPushToken) {
  return apiPost('/api/notifications/register', { user_id: userId, expo_push_token: expoPushToken });
}
