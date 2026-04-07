import { createClient } from '@supabase/supabase-js';
import config from '../config.js';

/**
 * Supabase admin client — uses the service role key
 * for server-side operations that bypass RLS.
 */
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export { supabase };

// ─── Users ──────────────────────────────────────────────────────

export async function createUser(email, name) {
  const { data, error } = await supabase
    .from('users')
    .insert({ email, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUser(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Hair Profiles ──────────────────────────────────────────────

export async function saveHairProfile(userId, profile) {
  const { data, error } = await supabase
    .from('hair_profiles')
    .upsert(
      {
        user_id: userId,
        curl_type: profile.curlType,
        porosity: profile.porosity,
        elasticity: profile.elasticity,
        density: profile.density,
        primary_goal: profile.primaryGoal,
        secondary_goals: profile.secondaryGoals || [],
        wash_frequency: profile.washFrequency,
        heat_use: profile.heatUse,
        relaxer_history: profile.relaxerHistory ?? false,
        color_treated: profile.colorTreated ?? false,
        protective_styling: profile.protectiveStyling ?? false,
        scalp_concerns: profile.scalpConcerns || [],
        time_available: profile.timeAvailable,
        failed_attempts: profile.failedAttempts || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHairProfile(userId) {
  const { data, error } = await supabase
    .from('hair_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

// ─── Routines ───────────────────────────────────────────────────

export async function saveRoutine(userId, routineJson, councilResponseJson) {
  const { data, error } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      routine_json: routineJson,
      council_response_json: councilResponseJson,
      week_number: routineJson.weekNumber || 1,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;

  // Deactivate previous routines
  await supabase
    .from('routines')
    .update({ is_active: false })
    .eq('user_id', userId)
    .neq('id', data.id);

  return data;
}

export async function getRoutine(userId) {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ─── Check-ins ──────────────────────────────────────────────────

export async function saveCheckin(userId, checkinData) {
  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      hosting_aunty_id: checkinData.hostingAuntyId,
      week_number: checkinData.weekNumber,
      mood: checkinData.mood,
      notes: checkinData.notes,
      photo_uri: checkinData.photoUri,
      aunty_response: checkinData.auntyResponse,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCheckins(userId) {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ─── Photos ─────────────────────────────────────────────────────

export async function savePhoto(userId, type, storagePath, analysisJson) {
  const { data, error } = await supabase
    .from('photos')
    .insert({
      user_id: userId,
      type,
      storage_path: storagePath,
      analysis_json: analysisJson,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
