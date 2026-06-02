/**
 * TapToContinue — Pulsing hint text for validation interludes.
 *
 * Fades in when visible, then gently pulses opacity to draw attention.
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing } from '../constants/theme';

interface Props {
  visible: boolean;
}

export function TapToContinue({ visible }: Props) {
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // infinite
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  if (!visible) return null;

  return (
    <Animated.Text
      entering={FadeIn.duration(500)}
      style={[styles.text, animatedStyle]}
    >
      Tap to continue
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
    letterSpacing: 0.5,
  },
});
