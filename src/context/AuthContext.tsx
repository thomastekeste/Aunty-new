/**
 * AuthContext — Authentication provider using Supabase.
 *
 * When Supabase is not configured (no env vars), runs in "dev mode"
 * where auth is bypassed and the user goes straight to onboarding.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import Purchases from 'react-native-purchases';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { LEGAL_URLS } from '../constants/legal';
import type { User } from '../types';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

/** Tell RevenueCat which user is logged in so customer records are identifiable. */
async function syncRevenueCatUser(supabaseId: string | null) {
  try {
    if (supabaseId) {
      await Purchases.logIn(supabaseId);
    } else {
      await Purchases.logOut();
    }
  } catch {
    // RevenueCat not available in Expo Go / dev — ignore silently
  }
}

// ─── Types ──────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  /** Native Sign in with Apple. Returns { canceled: true } if the user dismissed the sheet. */
  signInWithApple: () => Promise<{ error?: string; canceled?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  /** Dev-only: instantly sets the dev user without any credentials. No-op in production. */
  devBypassAuth: () => void;
}

const CACHE_KEY = '@aunty_curl_user';

// ─── Context ────────────────────────────────────────────────────

const AuthCtx = createContext<AuthContextValue | null>(null);

// ─── Helpers ────────────────────────────────────────────────────

function mapSupabaseUser(supaUser: any): User {
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: supaUser.user_metadata?.name ?? '',
    onboardingComplete: supaUser.user_metadata?.onboardingComplete ?? false,
    subscriptionStatus: supaUser.user_metadata?.subscriptionStatus ?? 'free',
    createdAt: supaUser.created_at,
  };
}

async function cacheUser(user: User | null) {
  try {
    if (user) {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Caching is best-effort
  }
}

// Dev mode user when Supabase is not configured
const DEV_USER: User = {
  id: 'dev-user',
  email: 'dev@auntycurl.com',
  name: '',
  onboardingComplete: false,
  subscriptionStatus: 'free',
  createdAt: new Date().toISOString(),
};

// ─── Provider ───────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // Always skip auth in dev mode (Expo Go)
      if (__DEV__) {
        if (mounted) {
          setUser(DEV_USER);
          setIsLoading(false);
        }
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setUser(DEV_USER);
          setIsLoading(false);
        }
        return;
      }

      // Try cache first for instant splash avoidance
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (mounted && raw) {
          setUser(JSON.parse(raw));
        }
      } catch {}

      // Then verify with Supabase
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        if (data.session) {
          const mapped = mapSupabaseUser(data.session.user);
          setUser(mapped);
          setSession(data.session);
          cacheUser(mapped);
          syncRevenueCatUser(data.session.user.id);
        } else {
          setUser(null);
          setSession(null);
          cacheUser(null);
          syncRevenueCatUser(null);
        }
        setIsLoading(false);
      }
    }

    init();

    // Listen to auth state changes (only in production with Supabase)
    if (!__DEV__ && isSupabaseConfigured && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, newSession: Session | null) => {
          if (!mounted) return;
          if (newSession) {
            const mapped = mapSupabaseUser(newSession.user);
            setUser(mapped);
            setSession(newSession);
            cacheUser(mapped);
            syncRevenueCatUser(newSession.user.id);
          } else {
            setUser(null);
            setSession(null);
            cacheUser(null);
            syncRevenueCatUser(null);
          }
          setIsLoading(false);
        },
      );

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // ─── Auth Actions ───────────────────────────────────────────

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<{ error?: string }> => {
      if (!supabase) {
        setUser({ ...DEV_USER, name, email });
        return {};
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, onboardingComplete: false, subscriptionStatus: 'free' },
        },
      });
      if (error) return { error: error.message };
      if (data.user) {
        const mapped = mapSupabaseUser(data.user);
        setUser(mapped);
        cacheUser(mapped);
      }
      if (data.session) setSession(data.session);
      return {};
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      if (!supabase) {
        setUser(DEV_USER);
        return {};
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        const mapped = mapSupabaseUser(data.user);
        setUser(mapped);
        cacheUser(mapped);
      }
      if (data.session) setSession(data.session);
      return {};
    },
    [],
  );

  const signInWithApple = useCallback(
    async (): Promise<{ error?: string; canceled?: boolean }> => {
      if (!supabase) {
        // Dev mode (no Supabase) — drop straight into the dev user.
        setUser(DEV_USER);
        return {};
      }
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) {
          return { error: 'Apple sign-in didn’t return a token. Please try again.' };
        }
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) return { error: error.message };

        // Apple only sends the full name on the FIRST authorization — capture it.
        const name = [credential.fullName?.givenName, credential.fullName?.familyName]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (data.user) {
          if (name && !data.user.user_metadata?.name) {
            try {
              await supabase.auth.updateUser({ data: { name } });
            } catch {
              // Non-fatal — name can still be set during onboarding.
            }
          }
          const mapped = mapSupabaseUser(data.user);
          if (name && !mapped.name) mapped.name = name;
          setUser(mapped);
          cacheUser(mapped);
        }
        if (data.session) setSession(data.session);
        return {};
      } catch (e: any) {
        // User tapped "Cancel" on the Apple sheet — not an error.
        if (e?.code === 'ERR_REQUEST_CANCELED') return { canceled: true };
        return { error: e?.message || 'Apple sign-in failed. Please try again.' };
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<{ error?: string }> => {
      if (!supabase) return {};
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: LEGAL_URLS.resetPassword,
      });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    cacheUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (supabase) {
        await supabase.auth.updateUser({ data: data as Record<string, unknown> });
      }
      if (user) {
        const updated = { ...user, ...data };
        setUser(updated);
        cacheUser(updated);
      }
    },
    [user],
  );

  const devBypassAuth = useCallback(() => {
    if (__DEV__) setUser(DEV_USER);
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user, // In dev mode, user is always set
    signUp,
    signIn,
    signInWithApple,
    resetPassword,
    signOut,
    updateProfile,
    devBypassAuth,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
