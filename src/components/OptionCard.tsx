/**
 * OptionCard — Selection card for single/multi-select consultation answers.
 *
 * Dark surface styling tuned for warm-modern "ceremony" backgrounds.
 *   • Animated left accent bar slides in on selection (sister to EditorialCard).
 *   • Interpolated border + fill colors — no jarring snap between states.
 *   • Icon box tints to the aunty's accent when selected.
 *   • Press: 0.985 scale + 0.88 opacity. No layout shift.
 *   • Entrance: staggered fade-up.
 */

import React, { useCallback, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
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
  radius,
} from '../constants/theme';
import type { AuntyId } from '../constants/aunties';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 16, stiffness: 220, mass: 0.35 };

const BORDER_IDLE = colors.dark.border;
const FILL_IDLE = colors.dark.surfaceLight;
const LABEL_IDLE = 'rgba(254, 248, 236, 0.78)';
const LABEL_ACTIVE = colors.dark.text;
const DESC_IDLE = 'rgba(254, 248, 236, 0.55)';

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
      [FILL_IDLE, `${ac.accent}1F`],
    ),
    borderColor: interpolateColor(sel.value, [0, 1], [BORDER_IDLE, ac.accent]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(sel.value, [0, 1], [LABEL_IDLE, LABEL_ACTIVE]),
  }));

  const accentBarStyle = useAnimatedStyle(() => ({
    opacity: sel.value,
    transform: [{ translateX: interpolate(sel.value, [0, 1], [-6, 0]) }],
  }));

  const iconBoxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      sel.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.06)', `${ac.accent}28`],
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
          {/* Left accent bar — slides in on selection */}
          <Animated.View
            pointerEvents="none"
            style={[styles.accentBar, accentBarStyle, { backgroundColor: ac.accent }]}
          />

          {icon && icon.length > 0 ? (
            <Animated.View style={[styles.iconBox, iconBoxStyle]}>
              <Text style={styles.iconText}>{icon}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.textContainer}>
            <Animated.Text style={[styles.label, labelStyle]} numberOfLines={2}>
              {label}
            </Animated.Text>
            {description ? (
              <Text style={styles.description} numberOfLines={3}>
                {description}
              </Text>
            ) : null}
          </View>

          <View style={styles.checkCol}>
            <View style={[styles.checkRing, { borderColor: 'rgba(254, 248, 236, 0.30)' }]} />
            <Animated.View style={[styles.checkFill, checkStyle, { backgroundColor: ac.accent }]}>
              <Text style={styles.checkText}>{'\u2713'}</Text>
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
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingLeft: spacing.md + 4,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    marginBottom: 4,
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
    borderWidth: StyleSheet.hairlineWidth * 2,
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
