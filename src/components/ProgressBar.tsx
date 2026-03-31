import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '@/constants/theme';

interface ProgressBarProps {
  current: number;  // 1-based
  total: number;
  dark?: boolean;
}

export default function ProgressBar({ current, total, dark = false }: ProgressBarProps) {
  const pct = Math.min((current / total) * 100, 100);
  const widthAnim = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(widthAnim, {
        toValue: pct,
        friction: 8,
        tension: 60,
        useNativeDriver: false,
      }),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [pct]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const dotLeft = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, dark && styles.trackDark]}>
      <Animated.View
        style={[
          styles.fill,
          dark && styles.fillDark,
          { width: animatedWidth },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          dark && styles.dotDark,
          { left: dotLeft, opacity: dotOpacity },
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
