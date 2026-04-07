/**
 * Button — Premium tactile button with variants, haptic feedback, and spring animation.
 */

import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing, radius, shadows, gradients, animation } from '../constants/theme';

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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    opacity.value = withTiming(0.7, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePressOut = useCallback(() => {
    opacity.value = withTiming(1, { duration: 150 });
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

  const gradientColors = {
    primary: gradients.gold,
    accent: gradients.accent,
    dark: gradients.dark,
    secondary: [colors.canvas, colors.canvas] as const,
    ghost: ['transparent', 'transparent'] as const,
  };

  const textColors = {
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
      <LinearGradient
        colors={[...gradientColors[variant]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { height: heights[size], borderRadius: radius.lg },
          variant === 'secondary' && styles.secondaryBorder,
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
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gradient: {
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
  disabled: {
    opacity: 0.42,
  },
});
