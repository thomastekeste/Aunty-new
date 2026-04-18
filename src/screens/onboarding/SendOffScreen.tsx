/**
 * SendOffScreen — The emotional close.
 *
 * Word-by-word reveal. Three lines that land.
 * Not a motivational poster — a personal moment between
 * the aunty and the user about what their hair means.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { WordReveal } from '../../components/WordReveal';
import { Button } from '../../components/Button';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  gradients,
  letterSpacing,
} from '../../constants/theme';
import { onboardingMotion } from '../../constants/onboardingMotion';

const { height: SCREEN_H } = Dimensions.get('window');

export default function SendOffScreen() {
  const insets = useSafeAreaInsets();
  const { state, complete } = useOnboarding();
  const name = state.data.name || 'Queen';
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  // 0=avatar entrance, 1=line1, 2=line2, 3=line3, 4=button
  const [phase, setPhase] = useState(0);

  const btnOpacity = useSharedValue(0);
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
  }));

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), onboardingMotion.linePauseMs);
    return () => clearTimeout(t);
  }, []);

  const showButton = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    btnOpacity.value = withTiming(1, { duration: 400 });
    setPhase(4);
  };

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

  const handleBegin = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try { await AsyncStorage.setItem('onboarding_completed_at', new Date().toISOString()); } catch {}
    try { fetch(`${API_URL}/api/onboarding/intake`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state.data) }).catch(() => {}); } catch {}
    complete();
  }, [complete, state.data]);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>

        {/* Aunty avatar with glow */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={80} showRing glowing />
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(800)} style={[styles.label, { color: ac.accent }]}>
          {aunty.name.toUpperCase()}
        </Animated.Text>

        {/* The monologue — three lines, word by word */}
        <View style={styles.monologue}>

          {phase >= 1 && (
            <WordReveal
              key="line1"
              text={`${name}, your crown was never broken.`}
              stagger={onboardingMotion.wordStaggerMs}
              onComplete={() => setTimeout(() => setPhase(2), onboardingMotion.linePauseMs)}
              style={styles.line}
            />
          )}

          {phase >= 2 && (
            <Animated.View entering={FadeIn.duration(250)} style={{ marginTop: spacing.lg }}>
              <WordReveal
                key="line2"
                text="It just needed someone who speaks its language."
                stagger={onboardingMotion.wordStaggerMs}
                onComplete={() => setTimeout(() => setPhase(3), onboardingMotion.linePauseMs)}
                style={[styles.line, { color: ac.accent }]}
              />
            </Animated.View>
          )}

          {phase >= 3 && (
            <Animated.View entering={FadeIn.duration(250)} style={{ marginTop: spacing.lg }}>
              <WordReveal
                key="line3"
                text="Now go wear it like you mean it."
                stagger={onboardingMotion.wordStaggerMs}
                onComplete={() => setTimeout(showButton, onboardingMotion.shortPauseMs)}
                style={styles.line}
              />
            </Animated.View>
          )}
        </View>

        {/* Gold accent */}
        {phase >= 3 && (
          <Animated.View entering={FadeIn.delay(300)} style={[styles.rule, { backgroundColor: ac.accent }]} />
        )}

        <View style={{ flex: 1 }} />

        {/* Button */}
        <Animated.View style={[styles.btnWrap, btnStyle]}>
          <Button label="Let's Go" onPress={handleBegin} variant="primary" size="lg" />
        </Animated.View>

        {phase >= 4 && (
          <Animated.Text entering={FadeIn.delay(200)} style={styles.footer}>
            — {aunty.name}
          </Animated.Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, justifyContent: 'center' },

  avatarWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  glow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, opacity: 0.18 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, marginBottom: spacing.xxl },

  monologue: { width: '100%', minHeight: SCREEN_H * 0.28 },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.35,
    letterSpacing: letterSpacing.tight,
  },

  rule: { width: 32, height: 2, opacity: 0.5, borderRadius: 1, marginTop: spacing.xl },

  btnWrap: { width: '100%', marginBottom: spacing.md },
  footer: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted, letterSpacing: letterSpacing.wide },
});
