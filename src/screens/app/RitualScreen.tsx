/**
 * RitualScreen — 30-day calendar grid.
 *
 * Full month calendar view. Each day shows its ritual type
 * as a colored dot/label. Tap a day to see the ritual detail.
 * Today is highlighted. Past days show completion state.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import type { RitualDayType } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_W - spacing.lg * 2 - 6 * 4) / 7); // 7 cols, 4px gap
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Ritual assignment — which day types repeat weekly
const WEEKLY_PATTERN: Record<number, { type: RitualDayType; label: string }> = {
  0: { type: 'rest', label: 'Rest' },
  1: { type: 'wash', label: 'Wash' },
  2: { type: 'scalp', label: 'Scalp' },
  3: { type: 'protect', label: 'Protect' },
  4: { type: 'refresh', label: 'Refresh' },
  5: { type: 'style', label: 'Style' },
  6: { type: 'protein', label: 'Strength' },
};

const TYPE_COLORS: Record<RitualDayType, string> = {
  wash: colors.jewel.amber,
  style: colors.jewel.rose,
  refresh: colors.jewel.plum,
  rest: colors.jewel.teal,
  scalp: colors.jewel.emerald,
  protein: colors.jewel.sienna,
  protect: colors.jewel.indigo,
};

const TYPE_DETAILS: Record<RitualDayType, { purpose: string; time: string; steps: string[] }> = {
  wash: { purpose: 'Deep cleanse & moisture reset', time: '45 min', steps: ['Pre-poo with oil', 'Sulfate-free shampoo', 'Deep condition under cap', 'Rinse, detangle, seal'] },
  style: { purpose: 'Define & celebrate your curls', time: '25 min', steps: ['Take down style', 'Fluff & shape', 'Define with gel', 'Diffuse or air dry'] },
  refresh: { purpose: 'Mid-week touch-up', time: '10 min', steps: ['Light mist', 'Re-twist edges', 'Seal ends with oil'] },
  rest: { purpose: 'Let your hair breathe', time: '5 min', steps: ['Gentle scalp massage', 'Refresh edges if needed'] },
  scalp: { purpose: 'Nourish the roots', time: '15 min', steps: ['Apply scalp oil blend', 'Firm circular massage'] },
  protein: { purpose: 'Rebuild & strengthen', time: '20 min', steps: ['Protein treatment on lengths', 'Rinse & light condition'] },
  protect: { purpose: 'Low-manipulation styling', time: '30 min', steps: ['Moisturize sections', 'Twist or braid', 'Edge care & silk wrap'] },
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export default function RitualScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const { firstDay, daysInMonth } = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const getRitualForDay = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const dow = date.getDay();
    return WEEKLY_PATTERN[dow];
  };

  const selectedRitual = selectedDay ? getRitualForDay(selectedDay) : null;
  const selectedDetail = selectedRitual ? TYPE_DETAILS[selectedRitual.type] : null;
  const selectedColor = selectedRitual ? TYPE_COLORS[selectedRitual.type] : ac.accent;

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null); // leading blanks
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null); // trailing blanks

  const prevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.overline}>YOUR RITUAL</Text>
          <Text style={styles.title}>Hair Calendar</Text>
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} hitSlop={12} style={styles.navArrow} accessibilityLabel="Previous month">
            <Text style={styles.navArrowText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.monthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
          <Pressable onPress={nextMonth} hitSlop={12} style={styles.navArrow} accessibilityLabel="Next month">
            <Text style={styles.navArrowText}>{'>'}</Text>
          </Pressable>
        </View>

        {/* Day name headers */}
        <View style={styles.dayNamesRow}>
          {DAY_NAMES.map((d, i) => (
            <Text key={i} style={styles.dayName} accessibilityLabel={DAY_NAMES_FULL[i]}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (day === null) return <View key={i} style={styles.cellEmpty} />;

            const ritual = getRitualForDay(day);
            const color = TYPE_COLORS[ritual.type];
            const selected = selectedDay === day;
            const todayMark = isToday(day);

            return (
              <Pressable
                key={i}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDay(day); }}
                style={[
                  styles.cell,
                  selected && { backgroundColor: color, borderColor: color },
                  todayMark && !selected && styles.cellToday,
                ]}
              >
                <Text style={[
                  styles.cellDay,
                  selected && { color: colors.canvas },
                  todayMark && !selected && { color: ac.accent, fontFamily: fonts.bodyBold },
                ]}>
                  {day}
                </Text>
                <View style={[styles.cellDot, { backgroundColor: selected ? colors.canvas : color }]} />
              </Pressable>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {Object.entries(WEEKLY_PATTERN).map(([dow, r]) => (
            <View key={dow} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[r.type] }]} />
              <Text style={styles.legendText}>{r.label}</Text>
            </View>
          ))}
        </View>

        {/* Selected day detail */}
        {selectedDay && selectedRitual && selectedDetail && (
          <Animated.View
            key={selectedDay}
            entering={FadeInDown.duration(300)}
            style={[styles.detailCard, { borderLeftColor: selectedColor }]}
          >
            <View style={styles.detailHeader}>
              <AuntyAvatar auntyId={auntyId} size={36} showRing />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailDay}>
                  {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={[styles.detailType, { color: selectedColor }]}>{selectedRitual.label} Day</Text>
              </View>
              <View style={[styles.timePill, { backgroundColor: selectedColor + '20' }]}>
                <Text style={[styles.timeText, { color: selectedColor }]}>{selectedDetail.time}</Text>
              </View>
            </View>

            <Text style={styles.detailPurpose}>{selectedDetail.purpose}</Text>

            <View style={styles.steps}>
              {selectedDetail.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepNum, { backgroundColor: selectedColor }]}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  overline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxxl, color: colors.ink, letterSpacing: letterSpacing.tight, marginTop: spacing.xs },

  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  navArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navArrowText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xl, color: colors.ink },
  monthLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.ink },

  dayNamesRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
  dayName: { width: CELL_SIZE, textAlign: 'center', fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.muted },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 4 },
  cellEmpty: { width: CELL_SIZE, height: CELL_SIZE },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 2,
  },
  cellToday: { borderColor: colors.primary, borderWidth: 1.5 },
  cellDay: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.ink },
  cellDot: { width: 5, height: 5, borderRadius: 2.5 },

  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },

  detailCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.md,
    ...shadows.sm,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  detailDay: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink },
  detailType: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  timePill: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  timeText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  detailPurpose: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.5, marginBottom: spacing.md },

  steps: { gap: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.canvas },
  stepText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.ink, flex: 1 },
});
