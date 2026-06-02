/**
 * OptionCard — Selection card for single/multi-select consultation answers.
 *
 * Light canvas design: white card on cream background.
 *   - Warm border (idle) -> accent border (selected)
 *   - Clean white surface -> soft accent tint (selected)
 *   - Optional icon box with accent tint on select
 *   - Press: 0.985 scale + 0.88 opacity. No layout shift.
 *   - Entrance: staggered fade-up.
 */

import React, { useCallback, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
} from '../constants/theme';
import type { AuntyId } from '../constants/aunties';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 16, stiffness: 220, mass: 0.35 };

const BORDER_IDLE = colors.border;
const FILL_IDLE = colors.surface;
const LABEL_IDLE = colors.ink;
const DESC_IDLE = colors.muted;

interface Props {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  auntyId: AuntyId;
  index?: number;
}

export function OptionCard({
  label,
  description,
  icon,
  selected,
  onPress,
  auntyId,
  index = 0,
}: Props) {
  const ac = auntyColors[auntyId];

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const sel = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    sel.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected]);

  const handlePressIn = useCallback(() => {
    opacity.value = withTiming(0.88, { duration: 90 });
    scale.value = withSpring(0.985, PRESS_SPRING);
  }, []);

  const handlePressOut = useCallback(() => {
    opacity.value = withTiming(1, { duration: 140 });
    scale.value = withSpring(1, PRESS_SPRING);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      sel.value,
      [0, 1],
      [FILL_IDLE, `${ac.accent}0D`],
    ),
    borderColor: interpolateColor(sel.value, [0, 1], [BORDER_IDLE, ac.accent]),
  }));

  const iconBoxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      sel.value,
      [0, 1],
      [colors.canvasDeep, `${ac.accent}1A`],
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: sel.value,
    transform: [{ scale: 0.6 + sel.value * 0.4 }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(80 * index).duration(400)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[containerStyle]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label}${selected ? ', selected' : ', not selected'}`}
        accessibilityHint={
          description ? description : `Tap to ${selected ? 'deselect' : 'select'} ${label}`
        }
      >
        <Animated.View style={[styles.card, cardStyle]}>
          {icon && icon.length > 0 ? (
            <Animated.View style={[styles.iconBox, iconBoxStyle]}>
              <Text style={styles.iconText}>{icon}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.textContainer}>
            <Text style={styles.label} numberOfLines={2}>
              {label}
            </Text>
            {description ? (
              <Text style={styles.description} numberOfLines={3}>
                {description}
              </Text>
            ) : null}
          </View>

          <View style={styles.checkCol}>
            <View style={styles.checkRing} />
            <Animated.View style={[styles.checkFill, checkStyle, { backgroundColor: ac.accent }]}>
              <Text style={styles.checkText}>{'✓'}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const CHECK_SIZE = 22;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    marginBottom: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: fontSize.xl,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    letterSpacing: -0.1,
    color: LABEL_IDLE,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: DESC_IDLE,
    marginTop: 2,
    lineHeight: fontSize.sm * 1.4,
  },
  checkCol: {
    width: CHECK_SIZE + 4,
    height: CHECK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkRing: {
    position: 'absolute',
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  checkFill: {
    position: 'absolute',
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontFamily: fonts.bodyBold,
    lineHeight: fontSize.xs + 2,
  },
});
