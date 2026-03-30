import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, radius, fontSize, fontWeight, spacing, fonts } from '@/constants/theme';

interface OptionCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
}

export default function OptionCard({ label, selected, onPress, multiSelect = false }: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {multiSelect && (
        <View style={[styles.check, selected && styles.checkSelected]}>
          {selected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.canvas,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flex: 1,
  },
  labelSelected: {
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
});
