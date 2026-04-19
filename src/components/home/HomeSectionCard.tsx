import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '../PressableScale';
import { colors, radius, shadows, spacing } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  haptic?: 'none' | 'light' | 'medium';
}

export function HomeSectionCard({
  children,
  style,
  contentStyle,
  onPress,
  accessibilityLabel,
  haptic = 'light',
}: Props) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  if (onPress) {
    return (
      <PressableScale
        style={[styles.card, style]}
        onPress={onPress}
        scaleTo={0.985}
        haptic={haptic}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </PressableScale>
    );
  }

  return <View style={[styles.card, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  content: {
    padding: spacing.md,
  },
});
