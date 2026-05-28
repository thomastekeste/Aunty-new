/**
 * TypingIndicator — Animated bouncing dots like iMessage.
 *
 * Three circles in the aunty's accent color, bouncing with staggered timing.
 * Rendered inside the same bubble shape as aunty messages for consistency.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';

import { AuntyAvatar } from '../AuntyAvatar';
import { spacing, radius } from '../../constants/theme';
import type { AuntyId } from '../../constants/aunties';

interface Props {
  auntyId: AuntyId;
  accentColor: string;
  bgColor: string;
}

function Dot({ delay, color }: { delay: number; color: string }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 280 }),
          withTiming(0.4, { duration: 280 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

export function TypingIndicator({ auntyId, accentColor, bgColor }: Props) {
  return (
    <Animated.View entering={FadeInDown.duration(200)} style={styles.row}>
      <AuntyAvatar auntyId={auntyId} size={36} showRing={false} />
      <View style={[styles.bubble, { backgroundColor: bgColor, borderLeftColor: accentColor }]}>
        <View style={styles.dotsRow}>
          <Dot delay={0} color={accentColor} />
          <Dot delay={150} color={accentColor} />
          <Dot delay={300} color={accentColor} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '88%',
  },
  bubble: {
    borderRadius: radius.md,
    borderTopLeftRadius: radius.xs,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.md,
    borderLeftWidth: 3,
    minHeight: 44,
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
