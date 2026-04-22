/**
 * EditorialCard — Framed answer bubble for consultation questions.
 *
 *   • Proper card body: hairline border all around, radius 10, real vertical
 *     presence so answers feel substantial, not like list rows.
 *   • Left: no index number — answers are unordered choices.
 *   • Middle: serif label (20pt) + italic muted description.
 *   • Right: hairline ring → filled aunty-accent bullet with cream tick.
 *   • Selected: accent-tinted fill + accent border + subtle elevation.
 *   • Press: 0.99 scale + 0.9 opacity (no layout shift).
 *   • Entrance: staggered fade-up.
 *
 * The `icon` prop is accepted for API compat but not rendered.
 */

import React, { useCallback, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  interpolate,
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
  /** Kept for API compat — not rendered in the editorial design. */
  icon?: string | React.ReactNode;
  selected: boolean;
  onPress: () => void;
  auntyId: AuntyId;
  index?: number;
  /** Deprecated — retained for prop compatibility. */
  compact?: boolean;
  /** Optional magazine-style tag (e.g. "MOST ASKED"). */
  tag?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 16, stiffness: 220, mass: 0.35 };

const BORDER_IDLE = 'rgba(254, 248, 236, 0.14)';
const FILL_IDLE = 'rgba(254, 248, 236, 0.025)';
const LABEL_IDLE = 'rgba(254, 248, 236, 0.92)';
const LABEL_ACTIVE = colors.dark.text;
const DESC_IDLE = 'rgba(254, 248, 236, 0.48)';

export function EditorialCard({
  label,
  description,
  selected,
  onPress,
  auntyId,
  index = 0,
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
      [FILL_IDLE, `${ac.accent}14`], // ~8% accent tint when selected
    ),
    borderColor: interpolateColor(
      sel.value,
      [0, 1],
      [BORDER_IDLE, ac.accent],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(sel.value, [0, 1], [LABEL_IDLE, LABEL_ACTIVE]),
  }));

  const bulletRingStyle = useAnimatedStyle(() => ({
    opacity: 1 - sel.value,
  }));

  const bulletFillStyle = useAnimatedStyle(() => ({
    opacity: sel.value,
    transform: [{ scale: 0.6 + sel.value * 0.4 }],
  }));

  const accentBarStyle = useAnimatedStyle(() => ({
    opacity: sel.value,
    transform: [{ translateX: interpolate(sel.value, [0, 1], [-6, 0]) }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(50 * index).duration(340)}
      style={styles.wrap}
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
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Left accent bar — slides in on selection */}
          <Animated.View
            pointerEvents="none"
            style={[styles.accentBar, accentBarStyle, { backgroundColor: ac.accent }]}
          />

          {/* Label + description */}
          <View style={styles.text}>
            <View style={styles.labelRow}>
              <Animated.Text
                style={[styles.label, labelStyle]}
                numberOfLines={2}
              >
                {label}
              </Animated.Text>
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

          {/* Selection bullet — hairline ring → filled accent */}
          <View style={styles.bulletCol}>
            <Animated.View
              style={[
                styles.bulletRing,
                bulletRingStyle,
                { borderColor: 'rgba(254, 248, 236, 0.32)' },
              ]}
            />
            <Animated.View
              style={[
                styles.bulletFill,
                bulletFillStyle,
                { backgroundColor: ac.accent },
              ]}
            >
              <Text style={styles.bulletTick}>{'\u2713'}</Text>
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
    marginBottom: spacing.sm + 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingLeft: spacing.md + 4,
    paddingRight: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
    gap: spacing.sm,
    minHeight: 64,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 20,
    letterSpacing: -0.3,
    lineHeight: 24,
    flexShrink: 1,
  },
  description: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm + 1,
    color: DESC_IDLE,
    lineHeight: (fontSize.sm + 1) * 1.45,
    letterSpacing: 0.08,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
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
    borderWidth: StyleSheet.hairlineWidth * 2,
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
