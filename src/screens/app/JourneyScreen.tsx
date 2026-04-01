import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTabParamList } from '@/types';
import RoutineDetailScreen from './RoutineDetailScreen';
import ProgressScreen from './ProgressScreen';
import { colors, fonts, spacing, fontSize, fontWeight, radius, shadows, gradients, typography } from '@/constants/theme';

type Props = NativeStackScreenProps<AppTabParamList, 'Journey'>;
type JourneyView = 'routine' | 'progress';

export default function JourneyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<JourneyView>('routine');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleSwitch = (view: JourneyView) => {
    if (view === activeView) return;
    Animated.spring(slideAnim, {
      toValue: view === 'routine' ? 0 : 1,
      tension: 100,
      friction: 12,
      useNativeDriver: false,
    }).start();
    setActiveView(view);
  };

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Premium Header */}
      <LinearGradient colors={gradients.canvas} style={styles.header}>
        <Text style={styles.eyebrow}>Your Hair Journey</Text>
        <Text style={styles.title}>Journey</Text>

        {/* Segmented toggle */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggleTrack}>
            {/* Sliding indicator */}
            <Animated.View style={[styles.toggleIndicator, { left: indicatorLeft }]} />

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => handleSwitch('routine')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, activeView === 'routine' && styles.toggleTextActive]}>
                Routine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => handleSwitch('progress')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, activeView === 'progress' && styles.toggleTextActive]}>
                Progress
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {activeView === 'routine' ? (
          <RoutineDetailScreen navigation={navigation as any} />
        ) : (
          <ProgressScreen navigation={navigation as any} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: 2,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  toggleWrap: {
    alignSelf: 'flex-start',
  },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: colors.offWhite,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    ...shadows.sm,
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    width: '50%',
    bottom: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    ...shadows.gold,
  },
  toggleBtn: {
    width: 100,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.muted,
  },
  toggleTextActive: {
    color: colors.ink,
  },
  content: {
    flex: 1,
  },
});
