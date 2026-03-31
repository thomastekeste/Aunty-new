import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, fontSize, fontWeight, spacing, fonts, shadows } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  size = 'md',
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 10,
      tension: 100,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 10,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: spacing.lg },
    md: { height: 54, paddingHorizontal: spacing.xl },
    lg: { height: 60, paddingHorizontal: spacing.xxl },
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.base,
          sizeStyles[size],
          styles[variant],
          (disabled || loading) && styles.disabled,
          style,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'dark' ? colors.canvas : colors.ink}
            size={size === 'sm' ? 'small' : 'large'}
          />
        ) : (
          <Text
            style={[
              styles.label,
              size === 'sm' && styles.labelSm,
              (variant === 'secondary' || variant === 'ghost') && styles.labelDark,
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  dark: {
    backgroundColor: colors.ink,
    ...shadows.md,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelSm: {
    fontSize: fontSize.sm,
    letterSpacing: 0.5,
  },
  labelDark: {
    color: colors.ink,
  },
});
