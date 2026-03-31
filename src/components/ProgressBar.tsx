import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface ProgressBarProps {
  current: number;  // 1-based
  total: number;
  dark?: boolean;   // dark background variant (consultation screens)
}

export default function ProgressBar({ current, total, dark = false }: ProgressBarProps) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <View style={[styles.track, dark && styles.trackDark]}>
      <View style={[styles.fill, { width: `${pct}%` }, dark && styles.fillDark]} />
      {/* Dot at progress point */}
      <View
        style={[
          styles.dot,
          { left: `${pct}%` },
          dark && styles.dotDark,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  trackDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  fillDark: {
    backgroundColor: colors.primary,
  },
  dot: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginLeft: -6,
  },
  dotDark: {
    backgroundColor: colors.primary,
  },
});
