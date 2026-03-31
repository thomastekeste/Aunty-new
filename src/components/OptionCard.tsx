import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, radius, fontSize, fontWeight, spacing, fonts } from '@/constants/theme';

interface OptionCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
  icon?: React.ReactNode;  // SVG icon component
  color?: string;          // icon background color
}

export default function OptionCard({
  label,
  selected,
  onPress,
  multiSelect = false,
  icon,
  color = colors.primary,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && { borderColor: color, backgroundColor: `${color}18` },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Icon square */}
      <View style={[styles.iconBox, { backgroundColor: selected ? color : `${color}25` }]}>
        {icon ?? null}
      </View>

      {/* Label */}
      <Text style={[styles.label, selected && { color: '#fff', fontWeight: fontWeight.bold }]}>
        {label}
      </Text>

      {/* Checkmark for multi-select / selection indicator */}
      {multiSelect ? (
        <View style={[styles.check, selected && { backgroundColor: color, borderColor: color }]}>
          {selected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      ) : selected ? (
        <View style={[styles.selectedDot, { backgroundColor: color }]} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: spacing.md,
    minHeight: 68,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.75)',
    flex: 1,
    lineHeight: 22,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkMark: {
    color: '#000',
    fontSize: 13,
    fontWeight: fontWeight.black,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
});
