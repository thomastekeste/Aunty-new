/**
 * ValidationThreeScreen — After struggles. The empathy peak.
 *
 * Two WordReveal lines. No buttons. No interaction.
 * Auto-advances to BudgetQuestion after line 2 completes.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { WordReveal } from '../../components/WordReveal';
import { useOnboarding } from '../../context/OnboardingContext';
import type { AuntyId } from '../../constants/aunties';
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
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Validation3'>;

const { height: SCREEN_H } = Dimensions.get('window');

export default function ValidationThreeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];

  const [phase, setPhase] = useState(1); // 1=line1, 2=line2

  const handleLineOneComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setPhase(2), onboardingMotion.shortPauseMs);
  }, []);

  const handleLineTwoComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      navigation.replace('BudgetQuestion');
    }, onboardingMotion.autoAdvanceMs);
  }, [navigation]);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        {/* Aunty avatar with glow */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
        </Animated.View>

        {/* Two empathy lines */}
        <View style={styles.lines}>
          <WordReveal
            text="You've been carrying this alone."
            stagger={onboardingMotion.wordStaggerMs}
            onComplete={handleLineOneComplete}
            style={styles.line}
          />

          {phase >= 2 && (
            <Animated.View entering={FadeIn.duration(250)} style={{ marginTop: spacing.lg }}>
              <WordReveal
                text="That stops today."
                stagger={onboardingMotion.wordStaggerMs}
                onComplete={handleLineTwoComplete}
                style={styles.line}
              />
            </Animated.View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.18,
  },
  lines: {
    width: '100%',
    minHeight: SCREEN_H * 0.22,
  },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.35,
    letterSpacing: letterSpacing.tight,
    textAlign: 'center',
  },
});
