/**
 * SendOffScreen — The emotional close.
 *
 * Three lines that flip in place. Auntie's signature in italic at the close.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { SpeechBubble } from '../../components/SpeechBubble';
import { CeremonialButton } from '../../components/CeremonialButton';
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
} from '../../constants/theme';

export default function SendOffScreen() {
  const insets = useSafeAreaInsets();
  const { state, complete } = useOnboarding();
  const name = state.data.name || 'Queen';
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [showButton, setShowButton] = useState(false);

  const lines = [
    `${name}, your crown was never broken.`,
    'It just needed someone who speaks its language.',
    'Now go wear it like you mean it.',
  ];

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowButton(true);
  }, []);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

  const handleBegin = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try { await AsyncStorage.setItem('onboarding_completed_at', new Date().toISOString()); } catch {}
    try {
      fetch(`${API_URL}/api/onboarding/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data),
      }).catch(() => {});
    } catch {}
    complete();
  }, [API_URL, complete, state.data]);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Animated.View entering={FadeInUp.delay(120).duration(700)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={88} showRing glowing />
        </Animated.View>

        <Animated.Text
          entering={FadeIn.delay(400).duration(500)}
          style={[styles.name, { color: ac.accent }]}
        >
          {aunty.name}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(520).duration(420)}
          style={styles.tagline}
        >
          {aunty.signOff}
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(620).duration(420)}
          style={[styles.nameRule, { backgroundColor: ac.accent }]}
        />

        <View style={styles.bubbleWrap}>
          <SpeechBubble
            lines={lines}
            holdMs={1900}
            fadeMs={420}
            shimmer
            quoteMarkColor={ac.accent}
            textStyle={[styles.line, { color: colors.dark.text }]}
            onComplete={handleComplete}
          />
        </View>

        <View style={{ flex: 1 }} />

        {showButton && (
          <>
            <Animated.View entering={FadeInDown.duration(420)} style={styles.btnWrap}>
              <CeremonialButton label="Let's go" onPress={handleBegin} size="lg" />
            </Animated.View>
            <Animated.Text entering={FadeIn.delay(280)} style={styles.signature}>
              {'\u2014 '}{aunty.name}
            </Animated.Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  avatarWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  glow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, opacity: 0.18 },
  name: {
    fontFamily: fonts.serifBold,
    fontSize: fontSize.xxl,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  tagline: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    letterSpacing: 0.2,
    marginBottom: spacing.md,
  },
  nameRule: {
    width: 48,
    height: StyleSheet.hairlineWidth * 2,
    opacity: 0.6,
    marginBottom: spacing.xl,
  },
  bubbleWrap: { width: '100%', minHeight: 200, justifyContent: 'center' },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.3,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  btnWrap: { width: '100%', marginBottom: spacing.md },
  signature: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    marginTop: spacing.sm,
  },
});
