/**
 * RitualScreen — Premium hair ritual calendar.
 *
 * Monthly calendar grid with ritual-type-colored cells.
 * Today highlighted with gradient. Tap to see ritual detail.
 * Warm editorial design, SVG icons, spring animations.
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  gradients,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, RITUAL_HOSTS, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import type { RitualDayType } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_PAD = spacing.lg;
const GAP = 6;
const CELL_SIZE = Math.floor((SCREEN_W - GRID_PAD * 2 - GAP * 6) / 7);

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Ritual data ────────────────────────────────────────────────

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

const TYPE_GRADIENTS: Record<RitualDayType, readonly [string, string]> = {
  wash: ['#D4A04A', '#B8862E'],
  style: ['#C2456E', '#9E3058'],
  refresh: ['#7B3F6B', '#5C2A4E'],
  rest: ['#2A7B7B', '#1A5C5C'],
  scalp: ['#1A7A4A', '#0A5C30'],
  protein: ['#B85C2A', '#8A3A10'],
  protect: ['#3D5A99', '#2A4070'],
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

// ─── SVG Icons ──────────────────────────────────────────────────

function ChevronLeft({ color = colors.ink, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight({ color = colors.ink, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon({ color = colors.muted, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth={2} />
      <Path d="M12 6V12L16 14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function PlayIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3L19 12L5 21V3Z" fill={color} />
    </Svg>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

// ─── Component ──────────────────────────────────────────────────

export default function RitualScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());

  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const ritualKeys = keys.filter((k) => k.startsWith('ritual_completed_'));
          const dates = ritualKeys.map((k) => k.replace('ritual_completed_', ''));
          setCompletedDates(new Set(dates));
        } catch {}
      })();
    }, []),
  );

  const { firstDay, daysInMonth } = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
  const isToday = (day: number) => day === now.getDate() && isCurrentMonth;
  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d < t;
  };

  const getRitualForDay = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    return WEEKLY_PATTERN[date.getDay()];
  };

  const isDayCompleted = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const key = d.toISOString().split('T')[0];
    return completedDates.has(key);
  };

  const selectedRitual = selectedDay ? getRitualForDay(selectedDay) : null;
  const selectedDetail = selectedRitual ? TYPE_DETAILS[selectedRitual.type] : null;
  const selectedColor = selectedRitual ? TYPE_COLORS[selectedRitual.type] : ac.accent;
  const selectedGradient = selectedRitual ? TYPE_GRADIENTS[selectedRitual.type] : (['#D4A04A', '#B8862E'] as const);
  const selectedHostId = selectedRitual ? (RITUAL_HOSTS[selectedRitual.type] || auntyId) : auntyId;

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

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
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ──────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.overline}>YOUR RITUAL</Text>
          <Text style={styles.title}>Hair Calendar</Text>
        </Animated.View>

        {/* ─── Month Navigator ─────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.monthNav}>
          <Pressable
            onPress={prevMonth}
            hitSlop={12}
            style={styles.navBtn}
            accessibilityLabel="Previous month"
            accessibilityRole="button"
          >
            <ChevronLeft />
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <Pressable
            onPress={nextMonth}
            hitSlop={12}
            style={styles.navBtn}
            accessibilityLabel="Next month"
            accessibilityRole="button"
          >
            <ChevronRight />
          </Pressable>
        </Animated.View>

        {/* ─── Day Name Headers ────────────────────────────── */}
        <View style={styles.dayNamesRow}>
          {DAY_LETTERS.map((d, i) => (
            <View key={i} style={[styles.dayNameCell, { width: CELL_SIZE }]}>
              <Text style={styles.dayNameText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* ─── Calendar Grid ──────────────────────────────── */}
        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (day === null) {
              return <View key={i} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
            }

            const ritual = getRitualForDay(day);
            const color = TYPE_COLORS[ritual.type];
            const dayGrad = TYPE_GRADIENTS[ritual.type];
            const selected = selectedDay === day;
            const todayMark = isToday(day);
            const pastMark = isPast(day);

            // Today: gradient cell
            if (todayMark && !selected) {
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDay(day);
                  }}
                  accessibilityLabel={`Today, ${day}, ${ritual.label} day`}
                >
                  <LinearGradient
                    colors={[...dayGrad]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.cell, styles.cellTodayGrad]}
                  >
                    <Text style={styles.cellDayToday}>{day}</Text>
                    <View style={styles.cellDotToday} />
                  </LinearGradient>
                </Pressable>
              );
            }

            // Selected cell
            if (selected) {
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDay(day);
                  }}
                  accessibilityLabel={`Selected, ${day}, ${ritual.label} day`}
                >
                  <View style={[styles.cell, styles.cellSelected, { borderColor: color }]}>
                    <Text style={[styles.cellDaySelected, { color }]}>{day}</Text>
                    <View style={[styles.cellDot, { backgroundColor: color }]} />
                  </View>
                </Pressable>
              );
            }

            // Normal or past cell
            const completed = isDayCompleted(day);
            return (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDay(day);
                }}
                accessibilityLabel={`${day}, ${ritual.label} day${completed ? ', completed' : ''}`}
              >
                <View style={[styles.cell, completed && { backgroundColor: color + '12' }]}>
                  <Text style={[styles.cellDay, pastMark && { color: colors.ink }]}>
                    {day}
                  </Text>
                  {completed ? (
                    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  ) : (
                    <View
                      style={[
                        styles.cellDot,
                        { backgroundColor: pastMark ? color : color + '40' },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ─── Legend ──────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendScroll}
        >
          {Object.entries(WEEKLY_PATTERN).map(([dow, r]) => (
            <View
              key={dow}
              style={[styles.legendPill, { backgroundColor: TYPE_COLORS[r.type] + '15', borderColor: TYPE_COLORS[r.type] + '30' }]}
            >
              <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[r.type] }]} />
              <Text style={[styles.legendText, { color: TYPE_COLORS[r.type] }]}>{r.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ─── Selected Day Detail ─────────────────────────── */}
        {selectedDay && selectedRitual && selectedDetail && (
          <Animated.View
            key={`${viewMonth}-${selectedDay}`}
            entering={FadeInDown.duration(300)}
            style={styles.detailCard}
          >
            {/* Gradient header strip */}
            <LinearGradient
              colors={[...selectedGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.detailGradientHeader}
            >
              <View style={styles.detailHeaderContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailDateText}>
                    {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.detailRitualName}>{selectedRitual.label} Day</Text>
                </View>
                <View style={styles.detailTimeBadge}>
                  <ClockIcon color="#FFFFFF" size={13} />
                  <Text style={styles.detailTimeText}>{selectedDetail.time}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Body */}
            <View style={styles.detailBody}>
              {/* Purpose */}
              <Text style={styles.detailPurpose}>{selectedDetail.purpose}</Text>

              {/* Aunty host */}
              <View style={styles.detailAuntyRow}>
                <AuntyAvatar auntyId={selectedHostId} size={32} showRing />
                <Text style={styles.detailAuntyText}>
                  Guided by Aunty {AUNTIES[selectedHostId].name}
                </Text>
              </View>

              {/* Steps */}
              <View style={styles.stepsContainer}>
                {selectedDetail.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepBadge, { backgroundColor: selectedColor + '15' }]}>
                      <Text style={[styles.stepBadgeNum, { color: selectedColor }]}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Completion badge or Start CTA */}
              {isDayCompleted(selectedDay) ? (
                <View style={styles.completedBadge}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17L4 12" stroke={colors.jewel.emerald} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              ) : !isPast(selectedDay) ? (
                <View style={styles.detailCta}>
                  <Button
                    label={isToday(selectedDay) ? 'Start Ritual' : 'Preview Ritual'}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      navigation.navigate('RitualSteps');
                    }}
                    variant="primary"
                    size="md"
                    icon={<PlayIcon size={14} color={colors.ink} />}
                  />
                </View>
              ) : null}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  // Header
  header: {
    paddingHorizontal: GRID_PAD,
    marginBottom: spacing.md,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
    marginTop: spacing.xs,
  },

  // Month navigator
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PAD,
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },

  // Day name headers
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: GRID_PAD,
    gap: GAP,
    marginBottom: spacing.xs,
  },
  dayNameCell: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayNameText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  // Calendar grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PAD,
    gap: GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    gap: 3,
  },
  cellTodayGrad: {
    ...shadows.sm,
  },
  cellSelected: {
    borderWidth: 2,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  cellDay: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  cellDayToday: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
  },
  cellDaySelected: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
  },
  cellDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  cellDotToday: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  // Legend
  legendScroll: {
    paddingHorizontal: GRID_PAD,
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
  },

  // Detail card
  detailCard: {
    marginHorizontal: GRID_PAD,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.md,
  },
  detailGradientHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailDateText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailRitualName: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.tight,
    marginTop: 2,
  },
  detailTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  detailTimeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: '#FFFFFF',
  },
  detailBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailPurpose: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.inkLight,
    lineHeight: fontSize.md * 1.5,
  },
  detailAuntyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailAuntyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  stepsContainer: {
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeNum: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },
  stepText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    flex: 1,
    lineHeight: fontSize.sm * 1.5,
  },
  detailCta: {
    marginTop: spacing.xs,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.jewel.emerald + '12',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  completedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.jewel.emerald,
  },
});
