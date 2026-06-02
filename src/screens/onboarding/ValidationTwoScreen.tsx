/**
 * ValidationTwoScreen — "The Profile"
 *
 * After goal selection, before hair habits.
 * Editorial beat: the aunty's read of you set as quiet type on cream —
 * no card, no chrome. Whitespace and a single accent hairline carry it.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { SpeechBubble } from '../../components/SpeechBubble';
import { TapToContinue } from '../../components/TapToContinue';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  AUNTY_GOAL_READS,
  AUNTY_PROFILE_CLOSERS,
  POROSITY_LABELS,
  GOAL_LABELS,
} from '../../constants/validationCopy';
import type { AuntyId } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Validation2'>;

interface ProfileRowProps {
  label: string;
  value: string;
  delay: number;
}

function ProfileRow({ label, value, delay }: ProfileRowProps) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(460)} style={styles.profileItem}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function ValidationTwoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];

  const curlType = state.data.hairProfile.curlType;
  const porosity = state.data.hairProfile.porosity;
  const primaryGoal = state.data.hairProfile.primaryGoal;

  const goalReads = AUNTY_GOAL_READS[auntyId];
  const lineOne = primaryGoal
    ? (goalReads[primaryGoal] || goalReads.default)
    : goalReads.default;
  const lineTwo = AUNTY_PROFILE_CLOSERS[auntyId];

  const [showSpeech, setShowSpeech] = useState(false);
  const [canTap, setCanTap] = useState(false);
  const navigatingRef = useRef(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── Single accent hairline ──
  const lineWidth = useSharedValue(0);
  const lineAnimStyle = useAnimatedStyle(() => ({ width: lineWidth.value }));

  // Build rows
  const rows: { label: string; value: string }[] = [];
  if (curlType) rows.push({ label: 'Curl pattern', value: curlType.toUpperCase() });
  if (porosity) rows.push({ label: 'Porosity', value: POROSITY_LABELS[porosity] || porosity });
  if (primaryGoal) rows.push({ label: 'Your goal', value: GOAL_LABELS[primaryGoal] || primaryGoal });

  // ── Choreography ──
  useEffect(() => {
    const lastRowTime = 300 + rows.length * 120 + 200;

    rows.forEach((_, i) => {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 300 + i * 120 + 200);
    });

    const t1 = setTimeout(() => {
      lineWidth.value = withTiming(40, { duration: 600, easing: Easing.out(Easing.cubic) });
    }, lastRowTime);

    const t2 = setTimeout(() => setShowSpeech(true), lastRowTime + 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [rows.length]);

  const handleLineLanded = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSpeechComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCanTap(true), 500);

    autoAdvanceRef.current = setTimeout(() => {
      if (!navigatingRef.current) {
        navigatingRef.current = true;
        navigation.replace('HairHabits');
      }
    }, 8000);
  }, [navigation]);

  const handleTap = useCallback(() => {
    if (!canTap || navigatingRef.current) return;
    navigatingRef.current = true;
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => navigation.replace('HairHabits'), 180);
  }, [canTap, navigation]);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.pressable, { paddingTop: insets.top + spacing.xxl }]}
        onPress={handleTap}
        disabled={!canTap}
      >
        {/* Avatar */}
        <Animated.View entering={FadeInUp.delay(120).duration(600)} style={styles.avatarWrap}>
          <AuntyAvatar auntyId={auntyId} size={60} showRing glowing />
        </Animated.View>

        {/* Overline */}
        <Animated.Text entering={FadeIn.delay(200).duration(440)} style={styles.overline}>
          What she sees
        </Animated.Text>

        {/* Profile — quiet floating type, no card */}
        <View style={styles.profileBlock}>
          {rows.map((row, index) => (
            <ProfileRow
              key={row.label}
              label={row.label}
              value={row.value}
              delay={300 + index * 120}
            />
          ))}
        </View>

        {/* Single accent hairline */}
        <View style={styles.lineCenter}>
          <Animated.View style={[styles.decorLine, { backgroundColor: ac.accent }, lineAnimStyle]} />
        </View>

        {/* Speech */}
        <View style={styles.lines}>
          {showSpeech && (
            <SpeechBubble
              lines={[lineOne, lineTwo]}
              holdMs={1800}
              fadeMs={420}
              shimmer
              quoteMarkColor={ac.accent}
              textStyle={[styles.line, { color: colors.ink }]}
              onLineLanded={handleLineLanded}
              onComplete={handleSpeechComplete}
            />
          )}
        </View>

        <TapToContinue visible={canTap} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  pressable: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  profileBlock: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  profileItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  rowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  lineCenter: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  decorLine: {
    height: 1,
  },
  lines: {
    width: '100%',
    minHeight: 160,
    justifyContent: 'center',
  },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.ink,
    lineHeight: fontSize.xxl * 1.35,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
});
