import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, letterSpacing, radius, spacing, shadows } from '../../constants/theme';
import { HomeSectionHeader } from './HomeSectionHeader';
import {
  getRitualLog,
  computeStreak,
  toDateKey,
  type RitualLogEntry,
} from '../../services/ritualLog';
import type { RitualDayType } from '../../types';

export interface WeekProgressDay {
  key: string;
  dayName: string;
  date: number;
  ritualLabel: string;
  type: RitualDayType;
  accent: string;
  gradient: readonly [string, string];
  isToday: boolean;
  isPast: boolean;
  dateObj: Date;
}

interface Props {
  title: string;
  subtitle: string;
  days: WeekProgressDay[];
  renderIcon: (day: WeekProgressDay) => React.ReactNode;
}

export function WeekProgressStrip({ title, subtitle, days, renderIcon }: Props) {
  const [ritualLog, setRitualLog] = useState<Record<string, RitualLogEntry>>({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getRitualLog().then((log) => {
      setRitualLog(log);
      setStreak(computeStreak(log).current);
    });
  }, []);

  const getStatus = (day: WeekProgressDay): 'completed' | 'skipped' | 'none' => {
    const key = toDateKey(day.dateObj);
    const e = ritualLog[key];
    if (!e) return 'none';
    if (e.completed) return 'completed';
    if (e.skipped) return 'skipped';
    return 'none';
  };

  const streakSubtitle = streak > 0 ? `${streak}-day streak · ${subtitle}` : subtitle;

  return (
    <View>
      <HomeSectionHeader title={title} subtitle={streakSubtitle} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        snapToInterval={72}
      >
        {days.map((day) => {
          const status = getStatus(day);

          const statusBadge = status === 'completed' ? (
            <View style={[styles.statusBadge, { backgroundColor: day.accent }]}>
              <Text style={styles.statusBadgeGlyph}>✓</Text>
            </View>
          ) : status === 'skipped' ? (
            <View style={[styles.statusBadge, styles.statusBadgeSkipped]}>
              <Text style={[styles.statusBadgeGlyph, { color: colors.muted }]}>–</Text>
            </View>
          ) : null;

          if (day.isToday) {
            return (
              <View
                key={day.key}
                style={[
                  styles.dayCard,
                  styles.dayCardToday,
                  { borderColor: day.accent, backgroundColor: day.accent + '14' },
                ]}
              >
                <Text style={[styles.dayName, { color: day.accent }]}>{day.dayName}</Text>
                <Text style={[styles.dayDate, { color: colors.ink }]}>{day.date}</Text>
                <View style={styles.iconWrap}>
                  <View style={[styles.dayIconCircle, { backgroundColor: day.accent }]}>{renderIcon(day)}</View>
                  {statusBadge && <View style={styles.badgeOverlay}>{statusBadge}</View>}
                </View>
                <Text style={[styles.dayRitual, { color: day.accent, fontFamily: fonts.bodySemiBold }]} numberOfLines={1}>
                  {day.ritualLabel}
                </Text>
              </View>
            );
          }

          return (
            <View key={day.key} style={[styles.dayCard, day.isPast && styles.dayCardPast]}>
              <Text style={styles.dayName}>{day.dayName}</Text>
              <Text style={[styles.dayDate, day.isPast && styles.dayDatePast]}>{day.date}</Text>
              <View style={styles.iconWrap}>
                <View
                  style={[
                    styles.dayIconCircle,
                    day.isPast
                      ? { backgroundColor: day.accent + '20' }
                      : { backgroundColor: colors.borderLight },
                  ]}
                >
                  {renderIcon(day)}
                </View>
                {statusBadge && <View style={styles.badgeOverlay}>{statusBadge}</View>}
              </View>
              <Text style={[styles.dayRitual, day.isPast && { color: day.accent }]} numberOfLines={1}>
                {day.ritualLabel}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.sm,
  },
  dayCard: {
    width: 64,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
  },
  dayCardPast: {
    backgroundColor: colors.surfaceTinted,
  },
  dayCardToday: {
    borderWidth: 2,
    ...shadows.sm,
  },
  dayName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  dayDate: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.muted,
    letterSpacing: letterSpacing.tight,
  },
  dayDatePast: {
    color: colors.ink,
  },
  iconWrap: {
    position: 'relative',
  },
  dayIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  statusBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.canvas,
  },
  statusBadgeSkipped: {
    backgroundColor: colors.canvasDeep,
  },
  statusBadgeGlyph: {
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    lineHeight: fontSize.xs + 2,
  },
  dayRitual: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});
