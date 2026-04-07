/**
 * ValidationTwoScreen — After goal selection.
 *
 * Reflects their primary goal back with two WordReveal lines.
 * No buttons. No interaction. Just a moment.
 * Auto-advances to HairHabits after line 2 completes.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { WordReveal } from '../../components/WordReveal';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
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
import type { OnboardingStackParamList, PrimaryGoal } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Validation2'>;

const { height: SCREEN_H } = Dimensions.get('window');

const GOAL_LINES: Record<PrimaryGoal, string> = {
  moisture: "Moisture. That's your priority.",
  growth: "Growth. That's what you're after.",
  definition: 'Definition. You want curls that pop.',
  'damage-repair': 'Repair. Your hair needs healing.',
  'scalp-health': 'Scalp health. Smart. Everything starts there.',
  'simplify-routine': 'Simplify. Less chaos, more results.',
  transition: 'Transitioning. A new chapter.',
};

const LINE_TWO = "I've built plans for this exact goal before. Yours is next.";

export default function ValidationTwoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];
  const primaryGoal = state.data.hairProfile.primaryGoal;
  const lineOne = primaryGoal ? GOAL_LINES[primaryGoal] : "Your goal. I hear you.";

  const [phase, setPhase] = useState(1); // 1=line1, 2=line2

  const handleLineOneComplete = useCallback(() => {
    setTimeout(() => setPhase(2), 900);
  }, []);

  const handleLineTwoComplete = useCallback(() => {
    setTimeout(() => {
      navigation.replace('HairHabits');
    }, 1500);
  }, [navigation]);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        {/* Aunty avatar with glow */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
        </Animated.View>

        {/* Two validation lines */}
        <View style={styles.lines}>
          <WordReveal
            text={lineOne}
            stagger={85}
            onComplete={handleLineOneComplete}
            style={styles.line}
          />

          {phase >= 2 && (
            <Animated.View entering={FadeIn.duration(250)} style={{ marginTop: spacing.lg }}>
              <WordReveal
                text={LINE_TWO}
                stagger={85}
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
