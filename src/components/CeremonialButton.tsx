/**
 * CeremonialButton — The CTA for onboarding & key moments.
 *
 * Flat solid gold. No gradient, no shimmer.
 * Spring press scale + warm shadow.
 *
 * Variants:
 *   primary  — solid gold (default)
 *   soft     — dark glass with gold border (secondary actions)
 *   ghost    — text-only with gold underline
 *
 * Sizes: sm | md | lg
 */

import React, { useCallback } from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
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
  /** @deprecated shimmer removed — prop kept for API compatibility */
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
}: Props) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.965, SPRING);
  }, [isDisabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING);
  }, []);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [isDisabled, onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
        <View style={styles.softInner}>
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

  // primary
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
      <View style={[styles.primary, { height, borderRadius: radius.lg }, isDisabled && styles.disabled]}>
        {loading ? (
          <ActivityIndicator color={colors.ink} size="small" />
        ) : (
          <View style={styles.row}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={[styles.primaryLabel, { fontSize: labelFontSize }]}>{label}</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { marginLeft: -2 },

  // primary
  primary: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    shadowColor: '#7A5210',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryLabel: {
    fontFamily: fonts.serifSemiBold,
    color: '#3A2208',
    letterSpacing: 0.1,
  },

  // soft
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
    borderRadius: radius.lg,
  },
  softLabel: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    letterSpacing: letterSpacing.wide,
  },

  // ghost
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
