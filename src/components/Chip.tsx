import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { colors, fonts, fontWeight, radius, spacing, shadows, animation } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  color?: string;
  style?: ViewStyle;
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  color = colors.primary,
  style,
  icon,
  disabled = false,
  size = 'md',
}: ChipProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const selectedBg = `${color}22`;
  const selectedBorder = `${color}80`;

  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.85}
        style={[
          styles.chip,
          size === 'sm' && styles.chipSm,
          selected
            ? [styles.selected, { backgroundColor: selectedBg, borderColor: selectedBorder }]
            : styles.unselected,
          disabled && styles.disabled,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text
          style={[
            styles.label,
            size === 'sm' && styles.labelSm,
            selected ? { color } : { color: colors.textSecondary },
          ]}
        >
          {label}
        </Text>
        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.removeBtn}
          >
            <Text style={[styles.removeIcon, { color: selected ? color : colors.muted }]}>×</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    gap: spacing.xs,
    ...shadows.xs,
  },
  chipSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selected: {
    ...shadows.sm,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: fontWeight.semibold,
  },
  labelSm: {
    fontSize: 12,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 18,
    fontWeight: fontWeight.bold,
    lineHeight: 18,
  },
});
