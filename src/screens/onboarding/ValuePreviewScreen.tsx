/**
 * ValuePreviewScreen — The promise. Three lines, then the CTA.
 *
 * Cinematic open: aunty enters from below with a glow,
 * her name fades in, then her three-line promise flips through
 * via SpeechBubble. The CeremonialButton appears at the close.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
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
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ValuePreview'>;

const LINES = [
  "In four weeks, you'll see what intention can do.",
  'No more guessing. No more wasted money.',
  "Let's build your plan.",
];

export default function ValuePreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [showButton, setShowButton] = useState(false);

  const handleComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowButton(true);
  }, []);

  const handleLineLanded = useCallback((i: number) => {
    if (i === 1) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

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
        <Animated.Text entering={FadeIn.delay(500).duration(500)} style={styles.region}>
          {aunty.region}
        </Animated.Text>

        <View style={styles.bubbleWrap}>
          <SpeechBubble
            lines={LINES}
            holdMs={1700}
            fadeMs={400}
            shimmer
            textStyle={[styles.line, { color: colors.dark.text }]}
            onComplete={handleComplete}
            onLineLanded={handleLineLanded}
          />
        </View>

        <View style={{ flex: 1 }} />

        {showButton && (
          <Animated.View entering={FadeInDown.duration(420)} style={styles.btnWrap}>
            <CeremonialButton
              label="Begin"
              onPress={() => navigation.navigate('NameEntry')}
              size="lg"
            />
          </Animated.View>
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
  },
  region: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    marginBottom: spacing.xl,
  },
  bubbleWrap: { width: '100%', minHeight: 180, justifyContent: 'center' },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.3,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  btnWrap: { width: '100%', marginBottom: spacing.md },
});
