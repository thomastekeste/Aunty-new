import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const IS_DEMO_MODE = !process.env.EXPO_PUBLIC_SUPABASE_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Auth ─────────────────────────────────────────────────────────────
export const authService = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange: (cb: (userId: string | null) => void) =>
    supabase.auth.onAuthStateChange((_e, session) => cb(session?.user?.id ?? null)),
};

// ── Users ────────────────────────────────────────────────────────────
export const userService = {
  create: async (userId: string, name: string, email: string) => {
    const { data, error } = await supabase
      .from('users')
      .insert({ id: userId, name, email })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (userId: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ── Hair profiles ────────────────────────────────────────────────────
export const hairService = {
  upsert: async (userId: string, profile: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('hair_profiles')
      .upsert({ user_id: userId, ...profile }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('hair_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

// ── Photos ───────────────────────────────────────────────────────────
export const photoService = {
  upload: async (
    userId: string,
    fileUri: string,
    type: 'intake_front' | 'intake_back' | 'intake_closeup' | 'checkin'
  ) => {
    const fileName = `${userId}/${type}/${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append('file', { uri: fileUri, type: 'image/jpeg', name: fileName } as any);

    const { data: storageData, error: storageError } = await supabase.storage
      .from('hair-photos')
      .upload(fileName, formData as any);
    if (storageError) throw storageError;

    const { data, error } = await supabase
      .from('photos')
      .insert({ user_id: userId, type, storage_path: storageData.path })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  saveAnalysis: async (photoId: string, analysis: Record<string, unknown>) => {
    const { error } = await supabase
      .from('photos')
      .update({ analysis_json: analysis })
      .eq('id', photoId);
    if (error) throw error;
  },

  getSignedUrl: async (path: string) => {
    const { data } = await supabase.storage
      .from('hair-photos')
      .createSignedUrl(path, 3600);
    return data?.signedUrl;
  },

  getIntakePhotos: async (userId: string) => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['intake_front', 'intake_back', 'intake_closeup'])
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

// ── Routines ─────────────────────────────────────────────────────────
export const routineService = {
  save: async (userId: string, routine: object, councilResponse: object) => {
    const { data, error } = await supabase
      .from('routines')
      .upsert(
        { user_id: userId, routine_json: routine, council_response_json: councilResponse },
        { onConflict: 'user_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

// ── Checkins ─────────────────────────────────────────────────────────
export const checkinService = {
  create: async (userId: string, auntyId: string, initiatedBy: 'system' | 'user', weekNumber: number) => {
    const { data, error } = await supabase
      .from('checkins')
      .insert({
        user_id: userId,
        hosting_aunty_id: auntyId,
        initiated_by: initiatedBy,
        week_number: weekNumber,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (checkinId: string, updates: Record<string, unknown>) => {
    const { error } = await supabase
      .from('checkins')
      .update(updates)
      .eq('id', checkinId);
    if (error) throw error;
  },

  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

// ── Product interactions ─────────────────────────────────────────────
export const productService = {
  trackClick: async (userId: string, productId: string) => {
    await supabase.from('product_interactions').insert({
      user_id: userId,
      product_id: productId,
      action: 'click',
      affiliate_link_used: true,
    });
  },
};
