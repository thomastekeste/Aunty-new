/**
 * Button — Solid-fill button with variants, haptic feedback, and spring animation.
 * No gradient — flat solid backgrounds only.
 */

import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing, radius, shadows, animation } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'accent';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  icon,
  fullWidth = true,
}: Props) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    opacity.value = withTiming(0.84, { duration: animation.fast });
    scale.value = withSpring(0.985, { damping: 16, stiffness: 220, mass: 0.35 });
  }, []);

  const handlePressOut = useCallback(() => {
    opacity.value = withTiming(1, { duration: animation.normal });
    scale.value = withSpring(1, { damping: 16, stiffness: 220, mass: 0.35 });
  }, []);

  const handlePress = useCallback(() => {
    if (!loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  }, [loading, disabled, onPress]);

  const heights = { sm: 44, md: 52, lg: 60 };
  const fontSizes = { sm: fontSize.sm, md: fontSize.md, lg: fontSize.base };
  const isDisabled = disabled || loading;

  const bgColors: Record<Variant, string> = {
    primary: colors.primary,
    accent: colors.accent ?? colors.primary,
    dark: colors.ink,
    secondary: colors.canvas,
    ghost: 'transparent',
  };

  const textColors: Record<Variant, string> = {
    primary: colors.ink,
    accent: '#FFFFFF',
    dark: colors.canvas,
    secondary: colors.primary,
    ghost: colors.ink,
  };

  const shadowStyle = {
    primary: shadows.gold,
    accent: shadows.accent,
    dark: shadows.md,
    secondary: {},
    ghost: {},
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[animatedStyle, fullWidth && styles.fullWidth]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      <View
        style={[
          styles.btn,
          {
            height: heights[size],
            borderRadius: radius.lg,
            backgroundColor: bgColors[variant],
          },
          variant === 'secondary' && styles.secondaryBorder,
          variant === 'ghost' && styles.ghostBorder,
          isDisabled && styles.disabled,
          shadowStyle[variant],
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColors[variant]} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.label,
                {
                  fontSize: fontSizes[size],
                  color: textColors[variant],
                  fontFamily: fonts.bodySemiBold,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    letterSpacing: 0.3,
  },
  icon: {
    marginRight: 2,
  },
  secondaryBorder: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghostBorder: {
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.42,
  },
});
