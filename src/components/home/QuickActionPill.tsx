import React from 'react';
import { Text, StyleSheet, type ViewStyle } from 'react-native';
import { PressableScale } from '../PressableScale';
import { colors, fonts, fontSize, radius, spacing } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  tintColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
}

export function QuickActionPill({
  label,
  onPress,
  icon,
  tintColor = colors.ink,
  backgroundColor = colors.surfaceTinted,
  borderColor = colors.borderLight,
  style,
}: Props) {
  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.text, { color: tintColor }]} numberOfLines={1}>
        {label}
      </Text>
      {icon}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
  },
});
