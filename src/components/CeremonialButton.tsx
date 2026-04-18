/**
 * CeremonialButton — The CTA for onboarding & key moments.
 *
 * Layered, embossed gold:
 *   • outer warm shadow (gold cast)
 *   • body: vertical 3-stop gold gradient (light top → mid → deep)
 *   • inner gold ring (1.5px) + soft top-edge highlight
 *   • subtle gold shimmer sweep loops gently when enabled (~5s cadence)
 *   • press: spring scale 0.96 + ring tightens + brightness flash
 *
 * Variants:
 *   primary  — full ceremonial gold (default)
 *   soft     — dark glass with gold underline (secondary actions)
 *   ghost    — text-only with gold underline
 *
 * Sizes: sm | md | lg
 */

import React, { useCallback, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  gradients,
  letterSpacing,
} from '../constants/theme';

type Variant = 'primary' | 'soft' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  /** Disable the idle gold shimmer (saves a tiny bit of work). */
  shimmer?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 14, stiffness: 240, mass: 0.4 };

const HEIGHTS: Record<Size, number> = { sm: 46, md: 54, lg: 62 };
const FONT_SIZES: Record<Size, number> = { sm: fontSize.sm, md: fontSize.md, lg: fontSize.base };

export function CeremonialButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
  shimmer = true,
}: Props) {
  const scale = useSharedValue(1);
  const ringTighten = useSharedValue(0);
  const flash = useSharedValue(0);
  const idleShimmer = useSharedValue(-1);

  const isDisabled = disabled || loading;
  const canShimmer = shimmer && !isDisabled && variant === 'primary';

  useEffect(() => {
    if (!canShimmer) {
      idleShimmer.value = withTiming(-1, { duration: 0 });
      return;
    }
    idleShimmer.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 0 }),
        withDelay(
          1200,
          withTiming(1.2, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        ),
        withDelay(3200, withTiming(-1, { duration: 0 })),
      ),
      -1,
      false,
    );
  }, [canShimmer]);

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.965, SPRING);
    ringTighten.value = withTiming(1, { duration: 120 });
    flash.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 240 }),
    );
  }, [isDisabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING);
    ringTighten.value = withTiming(0, { duration: 220 });
  }, []);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [isDisabled, onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringTighten.value, [0, 1], [0.55, 0.95]),
    transform: [{ scale: interpolate(ringTighten.value, [0, 1], [1, 0.985]) }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value * 0.32,
  }));

  const idleShimmerStyle = useAnimatedStyle(() => {
    const x = interpolate(idleShimmer.value, [-1, 1.2], [-160, 360]);
    return {
      transform: [{ translateX: x }, { rotate: '12deg' }],
      opacity: interpolate(idleShimmer.value, [-1, -0.4, 0.4, 1.2], [0, 0.7, 0.7, 0]),
    };
  });

  const height = HEIGHTS[size];
  const labelFontSize = FONT_SIZES[size];

  if (variant === 'ghost') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[containerStyle, fullWidth && styles.fullWidth, styles.ghost, { height }]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text style={[styles.ghostLabel, { fontSize: labelFontSize }, isDisabled && styles.disabled]}>
          {label}
        </Text>
      </AnimatedPressable>
    );
  }

  if (variant === 'soft') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[containerStyle, fullWidth && styles.fullWidth, styles.softWrap, { height }, isDisabled && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
      >
        <View style={[styles.softInner, { borderRadius: radius.lg }]}>
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <View style={styles.row}>
              {icon ? <View style={styles.icon}>{icon}</View> : null}
              <Text style={[styles.softLabel, { fontSize: labelFontSize }]}>{label}</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[containerStyle, fullWidth && styles.fullWidth]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      <View
        style={[
          styles.primaryShadow,
          { height, borderRadius: radius.lg },
          isDisabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={[...gradients.goldEmboss]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.primaryFill, { borderRadius: radius.lg }]}
        />

        {/* top-edge inner highlight */}
        <View pointerEvents="none" style={[styles.topHighlight, { borderRadius: radius.lg }]} />

        {/* idle shimmer sweep */}
        {canShimmer ? (
          <View pointerEvents="none" style={[styles.shimmerClip, { borderRadius: radius.lg }]}>
            <Animated.View style={[styles.shimmerBar, idleShimmerStyle]}>
              <LinearGradient
                colors={[...gradients.goldShimmer]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        ) : null}

        {/* press flash */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle, { borderRadius: radius.lg }]} />

        {/* gold ring */}
        <Animated.View pointerEvents="none" style={[styles.ring, ringStyle, { borderRadius: radius.lg }]} />

        {/* content */}
        <View style={styles.contentLayer}>
          {loading ? (
            <ActivityIndicator color={colors.ink} size="small" />
          ) : (
            <View style={styles.row}>
              {icon ? <View style={styles.icon}>{icon}</View> : null}
              <Text style={[styles.primaryLabel, { fontSize: labelFontSize }]}>{label}</Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { marginLeft: -2 },

  // ── primary ─────────────────────────────────────
  primaryShadow: {
    overflow: 'hidden',
    shadowColor: '#7A5210',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 8,
  },
  primaryFill: {
    ...StyleSheet.absoluteFillObject,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: 'rgba(255, 248, 225, 0.18)',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(122, 82, 30, 0.55)',
  },
  flash: {
    backgroundColor: '#FFF8E1',
  },
  contentLayer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryLabel: {
    fontFamily: fonts.serifSemiBold,
    color: '#3A2208',
    letterSpacing: letterSpacing.wide,
  },

  // ── shimmer ─────────────────────────────────────
  shimmerClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 80,
    left: 0,
  },

  // ── soft ────────────────────────────────────────
  softWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  softInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(254, 248, 236, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 74, 0.55)',
  },
  softLabel: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    letterSpacing: letterSpacing.wide,
  },

  // ── ghost ───────────────────────────────────────
  ghost: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ghostLabel: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    letterSpacing: letterSpacing.wide,
    textDecorationLine: 'underline',
  },

  disabled: { opacity: 0.4 },
});
