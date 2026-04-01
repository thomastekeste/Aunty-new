import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, fontSize, fontWeight, spacing, fonts, shadows, gradients, animation } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark' | 'accent' | 'glass';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        tension: animation.spring.tension,
        friction: animation.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: animation.micro,
        useNativeDriver: true,
      }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: animation.spring.tension,
        friction: animation.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: spacing.lg, gap: spacing.xs },
    md: { height: 52, paddingHorizontal: spacing.xl, gap: spacing.sm },
    lg: { height: 60, paddingHorizontal: spacing.xxl, gap: spacing.sm },
  };

  const labelColors: Record<string, string> = {
    primary: colors.ink,
    secondary: colors.ink,
    ghost: colors.ink,
    dark: colors.canvas,
    accent: colors.white,
    glass: colors.ink,
  };

  const labelSizeStyles = {
    sm: { fontSize: fontSize.sm, letterSpacing: 0.5 },
    md: { fontSize: fontSize.md, letterSpacing: 0.8 },
    lg: { fontSize: fontSize.lg, letterSpacing: 1 },
  };

  const spinnerColor = ['primary', 'accent', 'dark'].includes(variant) ? colors.canvas : colors.ink;

  const content = (
    <View style={[styles.inner, sizeStyles[size]]}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} size={size === 'sm' ? 'small' : 'small'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[
              styles.label,
              labelSizeStyles[size],
              { color: labelColors[variant] },
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconWrap}>{icon}</View>}
        </>
      )}
    </View>
  );

  const containerStyle = [
    styles.base,
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
      ]}
    >
      {variant === 'primary' ? (
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={containerStyle}
        >
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { borderRadius: radius.full }]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      ) : variant === 'accent' ? (
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[containerStyle, styles.accent]}
        >
          <LinearGradient
            colors={gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { borderRadius: radius.full }]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      ) : variant === 'dark' ? (
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={[containerStyle, styles.dark]}
        >
          <LinearGradient
            colors={gradients.dark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { borderRadius: radius.full }]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[containerStyle, styles[variant]]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={variant === 'ghost' ? 0.6 : 0.85}
        >
          {content}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.gold,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  gradient: {
    flex: 1,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  dark: {
    overflow: 'hidden',
    borderRadius: radius.full,
    ...shadows.md,
  },
  accent: {
    overflow: 'hidden',
    borderRadius: radius.full,
    ...shadows.accent,
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadows.sm,
  },
  disabled: {
    opacity: 0.42,
  },
  label: {
    fontFamily: fonts.body,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
  },
});
