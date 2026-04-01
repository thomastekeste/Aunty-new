import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, fontWeight, radius, spacing } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'gold' | 'aunty';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label?: string;
  count?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  dot?: boolean;
  auntyColor?: string;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default:  { bg: colors.surfaceAlt,    text: colors.textSecondary, border: colors.border },
  success:  { bg: '#E6F9F0',            text: '#0A6B38',            border: '#B3EDD4' },
  error:    { bg: '#FFF0F5',            text: '#A00060',            border: '#FFB3D1' },
  warning:  { bg: '#FFF8E6',            text: '#8B5E00',            border: '#FFE08A' },
  info:     { bg: '#E4F6FD',            text: '#00668A',            border: '#B3E6F7' },
  gold:     { bg: '#FDF8E1',            text: '#7A5E00',            border: '#F5C542' },
  aunty:    { bg: 'transparent',        text: colors.ink,           border: 'transparent' },
};

export default function Badge({
  label,
  count,
  variant = 'default',
  size = 'md',
  style,
  dot = false,
  auntyColor,
}: BadgeProps) {
  const { bg, text, border } = auntyColor
    ? { bg: `${auntyColor}20`, text: auntyColor, border: `${auntyColor}50` }
    : variantColors[variant];

  const displayText = count !== undefined
    ? count > 99 ? '99+' : String(count)
    : label ?? '';

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          size === 'sm' && styles.dotSm,
          { backgroundColor: auntyColor ?? colors.accent },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: bg, borderColor: border },
        style,
      ]}
    >
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: text }]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  dotSm: {
    width: 7,
    height: 7,
  },
});
