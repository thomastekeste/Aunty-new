import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTabParamList } from '@/types';
import RoutineDetailScreen from './RoutineDetailScreen';
import ProgressScreen from './ProgressScreen';
import { colors, fonts, spacing, fontSize, fontWeight, radius } from '@/constants/theme';

type Props = NativeStackScreenProps<AppTabParamList, 'Journey'>;

type JourneyView = 'routine' | 'progress';

export default function JourneyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<JourneyView>('routine');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Toggle Header */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            activeView === 'routine' && styles.toggleBtnActive,
          ]}
          onPress={() => setActiveView('routine')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, activeView === 'routine' && styles.toggleTextActive]}>
            Routine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            activeView === 'progress' && styles.toggleBtnActive,
          ]}
          onPress={() => setActiveView('progress')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, activeView === 'progress' && styles.toggleTextActive]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
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
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.muted,
    textTransform: 'capitalize',
  },
  toggleTextActive: {
    color: colors.ink,
  },
  contentContainer: {
    flex: 1,
  },
});
