/**
 * ValidationOneScreen — "The Read"
 *
 * After curl type selection, before porosity test.
 * A warm, quiet beat: the chosen aunty appears on the cream canvas
 * and delivers her read on your curl type. No theatrics — just her,
 * her words, and her accent color.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
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
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { AuntyDialogue } from '../../components/AuntyDialogue';
import { TapToContinue } from '../../components/TapToContinue';
import { useOnboarding } from '../../context/OnboardingContext';
import { getCurlRead } from '../../constants/validationCopy';
import type { AuntyId } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  dialogueText,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Validation1'>;

export default function ValidationOneScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];
  const curlType = state.data.hairProfile.curlType;
  const lines = getCurlRead(auntyId, curlType, state.data.name);

  const [showSpeech, setShowSpeech] = useState(false);
  const [canTap, setCanTap] = useState(false);
  const navigatingRef = useRef(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── Soft accent halo behind the avatar ──
  const haloOpacity = useSharedValue(0.1);

  // ── Decorative accent line ──
  const lineWidth = useSharedValue(0);

  const haloStyle = useAnimatedStyle(() => ({ opacity: haloOpacity.value }));
  const lineAnimStyle = useAnimatedStyle(() => ({ width: lineWidth.value }));

  // ── Choreography ──
  useEffect(() => {
    // Decorative line extends
    const t1 = setTimeout(() => {
      lineWidth.value = withTiming(80, { duration: 600, easing: Easing.out(Easing.cubic) });
    }, 500);

    // She begins to speak
    const t2 = setTimeout(() => setShowSpeech(true), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleLineLanded = useCallback(() => {
    // Halo warms gently on each line landing
    haloOpacity.value = withSequence(
      withTiming(0.18, { duration: 240 }),
      withTiming(0.1, { duration: 480 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSpeechComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCanTap(true), 500);

    autoAdvanceRef.current = setTimeout(() => {
      if (!navigatingRef.current) {
        navigatingRef.current = true;
        navigation.replace('PorosityTest');
      }
    }, 8000);
  }, [navigation]);

  const handleTap = useCallback(() => {
    if (!canTap || navigatingRef.current) return;
    navigatingRef.current = true;
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => navigation.replace('PorosityTest'), 180);
  }, [canTap, navigation]);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.pressable, { paddingTop: insets.top + spacing.xxl }]}
        onPress={handleTap}
        disabled={!canTap}
      >
        {/* Avatar with soft accent halo */}
        <Animated.View entering={FadeInUp.delay(120).duration(600)} style={styles.avatarWrap}>
          <Animated.View style={[styles.halo, { backgroundColor: ac.accent }, haloStyle]} />
          <AuntyAvatar auntyId={auntyId} size={84} showRing glowing />
        </Animated.View>

        {/* Decorative accent line */}
        <View style={styles.lineCenter}>
          <Animated.View style={[styles.decorLine, { backgroundColor: ac.accent + '55' }, lineAnimStyle]} />
        </View>

        {/* Speech */}
        <View style={styles.lines}>
          {showSpeech && (
            <AuntyDialogue
              lines={lines}
              holdMs={1400}
              quoteMarkColor={ac.accent}
              textStyle={dialogueText}
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
    marginBottom: spacing.xl,
  },
  halo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
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
    minHeight: 120,
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
