/**
 * EditorialCard — Selection card for consultation answers.
 *
 * Light canvas design: white card on cream background.
 *   - Warm border (idle) -> accent border (selected)
 *   - Clean white surface -> soft accent tint (selected)
 *   - Radio/check circle with accent fill
 *   - Press: 0.99 scale + 0.9 opacity (no layout shift)
 *   - Entrance: staggered fade-up
 */

import React, { useCallback, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
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
} from '../constants/theme';
import type { AuntyId } from '../constants/aunties';

interface Props {
  label: string;
  description?: string;
  /** Kept for API compat -- not rendered. */
  icon?: string | React.ReactNode;
  selected: boolean;
  onPress: () => void;
  auntyId: AuntyId;
  index?: number;
  /** Compact variant with smaller padding. */
  compact?: boolean;
  /** Optional tag (e.g. "MOST ASKED"). */
  tag?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 16, stiffness: 220, mass: 0.35 };

const BORDER_IDLE = colors.border;
const FILL_IDLE = colors.surface;
const LABEL_IDLE = colors.ink;
const LABEL_ACTIVE = colors.ink;
const DESC_IDLE = colors.muted;

export function EditorialCard({
  label,
  description,
  selected,
  onPress,
  auntyId,
  index = 0,
  compact = false,
  tag,
}: Props) {
  const ac = auntyColors[auntyId];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const sel = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    sel.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.99, PRESS_SPRING);
    opacity.value = withTiming(0.88, { duration: 90 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, PRESS_SPRING);
    opacity.value = withTiming(1, { duration: 140 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      sel.value,
      [0, 1],
      [FILL_IDLE, `${ac.accent}0D`], // ~5% accent tint when selected
    ),
    borderColor: interpolateColor(
      sel.value,
      [0, 1],
      [BORDER_IDLE, ac.accent],
    ),
  }));

  const bulletRingStyle = useAnimatedStyle(() => ({
    opacity: 1 - sel.value,
  }));

  const bulletFillStyle = useAnimatedStyle(() => ({
    opacity: sel.value,
    transform: [{ scale: 0.6 + sel.value * 0.4 }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(50 * index).duration(340)}
      style={compact ? styles.wrapCompact : styles.wrap}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label}${selected ? ', selected' : ''}`}
        accessibilityHint={description}
      >
        <Animated.View style={[compact ? styles.cardCompact : styles.card, cardStyle]}>
          {/* Label + description */}
          <View style={styles.text}>
            <View style={styles.labelRow}>
              <Text
                style={compact ? styles.labelCompact : styles.label}
                numberOfLines={2}
              >
                {label}
              </Text>
              {tag ? (
                <View style={[styles.tag, { borderColor: ac.accent }]}>
                  <Text style={[styles.tagText, { color: ac.accent }]}>{tag}</Text>
                </View>
              ) : null}
            </View>
            {description ? (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
          </View>

          {/* Selection bullet */}
          <View style={styles.bulletCol}>
            <Animated.View
              style={[styles.bulletRing, bulletRingStyle]}
            />
            <Animated.View
              style={[
                styles.bulletFill,
                bulletFillStyle,
                { backgroundColor: ac.accent },
              ]}
            >
              <Text style={styles.bulletTick}>{'✓'}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const BULLET_COL_W = 28;
const BULLET = 22;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  wrapCompact: {
    marginBottom: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 60,
  },
  cardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 48,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    letterSpacing: -0.2,
    lineHeight: fontSize.base * 1.3,
    color: LABEL_IDLE,
    flexShrink: 1,
  },
  labelCompact: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    letterSpacing: -0.15,
    lineHeight: fontSize.md * 1.3,
    color: LABEL_IDLE,
    flexShrink: 1,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: DESC_IDLE,
    lineHeight: fontSize.sm * 1.45,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderRadius: 3,
  },
  tagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  bulletCol: {
    width: BULLET_COL_W,
    height: BULLET + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletRing: {
    position: 'absolute',
    width: BULLET,
    height: BULLET,
    borderRadius: BULLET / 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  bulletFill: {
    position: 'absolute',
    width: BULLET,
    height: BULLET,
    borderRadius: BULLET / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletTick: {
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 13,
  },
});
