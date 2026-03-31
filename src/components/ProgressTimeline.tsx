import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

interface Phase {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  currentPhaseId: string;
  timeRemaining?: number; // in minutes
}

const PHASES: Phase[] = [
  { id: 'welcome', label: 'Meet', icon: '👋' },
  { id: 'know-you', label: 'Know You', icon: '📝' },
  { id: 'hair', label: 'Your Hair', icon: '🔬' },
  { id: 'story', label: 'Build', icon: '🎯' },
  { id: 'reveal', label: 'Reveal', icon: '🎉' },
];

const PHASE_ORDER = ['welcome', 'know-you', 'hair', 'story', 'reveal'];

export default function ProgressTimeline({ currentPhaseId, timeRemaining }: Props) {
  const currentPhaseIndex = PHASE_ORDER.indexOf(currentPhaseId);
  const completionPercentage = ((currentPhaseIndex + 1) / PHASE_ORDER.length) * 100;

  return (
    <View style={styles.root}>
      <View style={styles.timelineContainer}>
        {/* Progress bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.max(completionPercentage, 15)}%`, // Min 15% for visibility
              },
            ]}
          />
        </View>

        {/* Phase markers */}
        <View style={styles.phasesRow}>
          {PHASES.map((phase, index) => {
            const isActive = index === currentPhaseIndex;
            const isCompleted = index < currentPhaseIndex;

            return (
              <View key={phase.id} style={styles.phaseMarker}>
                <View
                  style={[
                    styles.phaseCircle,
                    isActive && styles.phaseCircleActive,
                    isCompleted && styles.phaseCircleCompleted,
                  ]}
                >
                  {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  {isActive && <Text style={styles.phaseIcon}>{phase.icon}</Text>}
                </View>
                <Text
                  style={[
                    styles.phaseLabel,
                    isActive && styles.phaseLabelActive,
                    isCompleted && styles.phaseLabelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {phase.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Time remaining */}
      {timeRemaining !== undefined && (
        <View style={styles.timeRemainingContainer}>
          <Text style={styles.timeRemainingLabel}>
            ~{timeRemaining} {timeRemaining === 1 ? 'minute' : 'minutes'} left
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  timelineContainer: {
    gap: spacing.md,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  phasesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phaseMarker: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  phaseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseCircleActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  phaseCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  phaseIcon: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.surface,
  },
  phaseLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.mutedLight,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  phaseLabelActive: {
    color: colors.ink,
    fontWeight: fontWeight.semibold,
  },
  phaseLabelCompleted: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  timeRemainingContainer: {
    alignItems: 'center',
  },
  timeRemainingLabel: {
    fontSize: fontSize.xs,
    color: colors.mutedBase,
    fontFamily: fonts.body,
  },
});
