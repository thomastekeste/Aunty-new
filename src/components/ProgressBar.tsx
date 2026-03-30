import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface ProgressBarProps {
  current: number;  // 1-based
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.amber,
    borderRadius: 2,
  },
});
