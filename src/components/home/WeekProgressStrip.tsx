import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, letterSpacing, radius, spacing, shadows } from '../../constants/theme';
import { HomeSectionHeader } from './HomeSectionHeader';
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
}

interface Props {
  title: string;
  subtitle: string;
  days: WeekProgressDay[];
  renderIcon: (day: WeekProgressDay) => React.ReactNode;
}

export function WeekProgressStrip({ title, subtitle, days, renderIcon }: Props) {
  return (
    <View>
      <HomeSectionHeader title={title} subtitle={subtitle} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        snapToInterval={72}
      >
        {days.map((day) => {
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
                <View style={[styles.dayIconCircle, { backgroundColor: day.accent }]}>{renderIcon(day)}</View>
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
  dayIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayRitual: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});
