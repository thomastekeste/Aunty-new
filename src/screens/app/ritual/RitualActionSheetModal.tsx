import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, fonts, fontSize, spacing, radius, letterSpacing } from '../../../constants/theme';
import { TYPE_COLORS } from './ritualConstants';
import type { RitualDayType } from '../../../types';

type WeeklyEntry = { type: RitualDayType; label: string };

interface Props {
  visible: boolean;
  actionSheetDay: number | null;
  viewYear: number;
  viewMonth: number;
  actionSheetRitual: WeeklyEntry | null;
  onClose: () => void;
  onMarkComplete: (day: number) => void;
  onViewSteps: () => void;
  onSkip: (day: number, reason: 'traveling' | 'busy' | 'not-feeling-it') => void;
  getDayStatus: (day: number) => 'completed' | 'skipped' | 'none';
}

export function RitualActionSheetModal({
  visible,
  actionSheetDay,
  viewYear,
  viewMonth,
  actionSheetRitual,
  onClose,
  onMarkComplete,
  onViewSteps,
  onSkip,
  getDayStatus,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={() => {}}>
          {actionSheetDay && actionSheetRitual && (
            <>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>
                {new Date(viewYear, viewMonth, actionSheetDay).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'short', day: 'numeric',
                })}
              </Text>
              <Text style={[styles.sheetRitualLabel, { color: TYPE_COLORS[actionSheetRitual.type] }]}>
                {actionSheetRitual.label} Day
              </Text>

              <View style={styles.sheetActions}>
                {getDayStatus(actionSheetDay) !== 'completed' && (
                  <Pressable
                    style={[styles.sheetAction, styles.sheetActionPrimary]}
                    onPress={() => onMarkComplete(actionSheetDay)}
                  >
                    <Text style={styles.sheetActionPrimaryText}>✓ Mark Complete</Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.sheetAction}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onViewSteps();
                    onClose();
                  }}
                >
                  <Text style={styles.sheetActionText}>▶ View Check-In Steps</Text>
                </Pressable>

                <Text style={styles.sheetSkipLabel}>SKIP THIS DAY</Text>
                <View style={styles.skipReasonRow}>
                  {(['traveling', 'busy', 'not-feeling-it'] as const).map((r) => (
                    <Pressable
                      key={r}
                      style={styles.skipReasonPill}
                      onPress={() => onSkip(actionSheetDay, r)}
                    >
                      <Text style={styles.skipReasonText}>
                        {r === 'traveling' ? '✈ Traveling' : r === 'busy' ? '⏰ Too busy' : '💤 Not feeling it'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable style={styles.sheetCancel} onPress={onClose}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.widest,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sheetRitualLabel: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    letterSpacing: letterSpacing.tight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sheetActions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetAction: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sheetActionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sheetActionPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  sheetActionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  sheetSkipLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.widest,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  skipReasonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  skipReasonPill: {
    backgroundColor: colors.canvasDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  skipReasonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  sheetCancel: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.muted,
  },
});
