/**
 * SendOffScreen — The emotional close.
 *
 * "The Letter": the council's blessing writes itself in gold script and is
 * signed by your aunty (see HandwrittenBlessing). On complete, the "Let's go"
 * CTA rises over the warm cream ground.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HandwrittenBlessing } from '../../components/HandwrittenBlessing';
import { CeremonialButton } from '../../components/CeremonialButton';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/api';
import { supabase } from '../../services/supabase';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';

const INTAKE_MAX_ATTEMPTS = 3;

// Persist the consultation server-side with a few retries. Non-blocking: the
// user enters the app immediately while this runs in the background. Local
// state already persists via AsyncStorage, so this only syncs the server copy.
async function postIntakeWithRetry(body: unknown, token?: string): Promise<void> {
  for (let attempt = 1; attempt <= INTAKE_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API_URL}/api/onboarding/intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.ok) return;
    } catch {
      // network error — fall through to retry
    }
    if (attempt < INTAKE_MAX_ATTEMPTS) {
      // Exponential backoff: 1s, 2s.
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

export default function SendOffScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { state, complete } = useOnboarding();
  const { isAuthenticated, signInWithApple, signIn, signUp } = useAuth();
  const name = state.data.name || 'Queen';
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';

  const [showButton, setShowButton] = useState(false);
  const [runId, setRunId] = useState(0); // dev replay: remounts the animation
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Email/password fallback
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  const handleComplete = useCallback(() => {
    setShowButton(true);
  }, []);

  const handleReplay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowButton(false);
    setRunId((n) => n + 1);
  }, []);

  // Persist the consultation server-side (we now have a session) and enter the app.
  const finishOnboarding = useCallback(async () => {
    try { await AsyncStorage.setItem('onboarding_completed_at', new Date().toISOString()); } catch {}
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      // Fire-and-forget with retries — don't block entering the app.
      void postIntakeWithRetry(state.data, session?.access_token);
    } catch {}
    complete();
  }, [complete, state.data]);

  const handleBegin = useCallback(async () => {
    if (busy) return;
    setAuthError('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Already signed in (returning user, or dev mode) → straight in.
    if (isAuthenticated) {
      finishOnboarding();
      return;
    }

    // New user: sign in with Apple at the finish line, then enter the app.
    setBusy(true);
    const result = await signInWithApple();
    setBusy(false);
    if (result?.canceled) return;
    if (result?.error) { setAuthError(result.error); return; }
    finishOnboarding();
  }, [busy, isAuthenticated, signInWithApple, finishOnboarding]);

  // Email/password sign-in: try sign-in first; if the user doesn't exist yet, sign up.
  const handleEmailContinue = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setAuthError('Please enter your email and password.');
      return;
    }
    if (busy) return;
    setAuthError('');
    setBusy(true);

    // First try signing in (handles returning users + pre-created reviewer account)
    const signInResult = await signIn(trimmedEmail, trimmedPassword);
    if (!signInResult.error) {
      setBusy(false);
      finishOnboarding();
      return;
    }

    // If sign-in says no user, create a new account instead
    const noUser =
      signInResult.error.toLowerCase().includes('invalid login') ||
      signInResult.error.toLowerCase().includes('user not found') ||
      signInResult.error.toLowerCase().includes('no user');
    if (noUser) {
      const displayName = name !== 'Queen' ? name : trimmedEmail.split('@')[0];
      const signUpResult = await signUp(trimmedEmail, trimmedPassword, displayName);
      setBusy(false);
      if (signUpResult.error) {
        setAuthError(signUpResult.error);
        return;
      }
      finishOnboarding();
      return;
    }

    setBusy(false);
    setAuthError(signInResult.error);
  }, [email, password, busy, signIn, signUp, name, finishOnboarding]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HandwrittenBlessing key={runId} name={name} chosenAuntyId={auntyId} onComplete={handleComplete} />

      {__DEV__ && (
        <View
          pointerEvents="box-none"
          style={[styles.devBar, { paddingTop: insets.top + spacing.sm }]}
        >
          {navigation.canGoBack() && (
            <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.devPill}>
              <Text style={styles.devPillText}>{'‹'} Back</Text>
            </Pressable>
          )}
          <Pressable onPress={handleReplay} hitSlop={10} style={styles.devPill}>
            <Text style={styles.devPillText}>{'↻'} Replay</Text>
          </Pressable>
        </View>
      )}

      {showButton && (
        <View
          pointerEvents="box-none"
          style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.xl }]}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={styles.btnWrap}>
            {isAuthenticated ? (
              <CeremonialButton label="Let's go" onPress={handleBegin} size="lg" loading={busy} />
            ) : showEmailForm ? (
              /* ── Email / password form ── */
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.inputSpaced]}
                  placeholder="Password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  returnKeyType="done"
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleEmailContinue}
                />
                <CeremonialButton
                  label="Continue with email"
                  onPress={handleEmailContinue}
                  size="lg"
                  loading={busy}
                />
                <Pressable
                  onPress={() => { setShowEmailForm(false); setAuthError(''); }}
                  hitSlop={10}
                  style={styles.backLink}
                >
                  <Text style={styles.backLinkText}>← Back</Text>
                </Pressable>
                {authError ? <Text style={styles.errText}>{authError}</Text> : null}
              </>
            ) : (
              /* ── Default: Apple + email toggle ── */
              <>
                <Text style={styles.saveHint}>Save your plan to continue</Text>
                {appleAvailable ? (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={999}
                    style={styles.appleBtn}
                    onPress={handleBegin}
                  />
                ) : (
                  <CeremonialButton label="Let's go" onPress={handleBegin} size="lg" loading={busy} />
                )}
                <Pressable
                  onPress={() => { setShowEmailForm(true); setAuthError(''); }}
                  hitSlop={10}
                  style={styles.emailToggle}
                >
                  <Text style={styles.emailToggleText}>Use email instead</Text>
                </Pressable>
                {authError ? <Text style={styles.errText}>{authError}</Text> : null}
              </>
            )}
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  devBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 30,
  },
  devPill: {
    backgroundColor: 'rgba(45, 27, 14, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  devPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.canvas,
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  btnWrap: { width: '100%' },
  saveHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  appleBtn: {
    width: '100%',
    height: 52,
  },
  emailToggle: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emailToggleText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  // Email form
  input: {
    width: '100%',
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputSpaced: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backLink: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  errText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
