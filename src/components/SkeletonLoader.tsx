import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonRect({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#f0e8d8', '#e0d4be'],
    ),
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
}

// Preset skeleton layouts
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <SkeletonRect width={44} height={44} borderRadius={22} />
        <View style={styles.cardHeaderText}>
          <SkeletonRect width="60%" height={14} borderRadius={7} />
          <SkeletonRect width="40%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      </View>
      <SkeletonRect width="100%" height={12} borderRadius={6} style={{ marginTop: 12 }} />
      <SkeletonRect width="85%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
      <SkeletonRect width="70%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonText({ lines = 3, style }: { lines?: number; style?: ViewStyle }) {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonRect
          key={i}
          width={i === lines - 1 ? '65%' : '100%'}
          height={13}
          borderRadius={6}
          style={{ marginTop: i > 0 ? 8 : 0 }}
        />
      ))}
    </View>
  );
}

export function SkeletonAvatar({ size = 48, style }: { size?: number; style?: ViewStyle }) {
  return <SkeletonRect width={size} height={size} borderRadius={size / 2} style={style} />;
}

export function SkeletonRoutineCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.routineCard, style]}>
      <View style={styles.routineRow}>
        <SkeletonRect width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonRect width="55%" height={14} borderRadius={7} />
          <SkeletonRect width="35%" height={11} borderRadius={5} style={{ marginTop: 6 }} />
        </View>
        <SkeletonRect width={60} height={28} borderRadius={14} />
      </View>
    </View>
  );
}

export default SkeletonRect;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 0,
  },
  routineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
