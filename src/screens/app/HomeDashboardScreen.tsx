import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { PressableScale } from '../../components/PressableScale';
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
import { AUNTIES, type AuntyId, getAuntyQuoteForSession, getAuntyTipForToday } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { useLocalHumidity, getHumidityOneLiner } from '../../hooks/useLocalHumidity';
import {
  getRitualLog,
  computeStreak,
  computeWeekStats,
  getTodayStatus,
  type RitualLogEntry,
} from '../../services/ritualLog';
import type { RitualDayType } from '../../types';

// ─── Static Data ──────────────────────────────────────────────────

const DAILY_RITUAL: Record<number, { type: RitualDayType; label: string; purpose: string; time: string }> = {
  0: { type: 'rest', label: 'Rest Day', purpose: 'Let your hair breathe. Minimal touch.', time: '5 min' },
  1: { type: 'wash', label: 'Wash Day', purpose: 'Deep cleanse and moisture reset.', time: '45 min' },
  2: { type: 'scalp', label: 'Scalp Day', purpose: 'Nourish the roots. Oil and massage.', time: '15 min' },
  3: { type: 'protect', label: 'Protect Day', purpose: 'Low-manipulation styling.', time: '30 min' },
  4: { type: 'refresh', label: 'Refresh Day', purpose: 'Mid-week touch-up.', time: '10 min' },
  5: { type: 'style', label: 'Style Day', purpose: 'Define and celebrate your curls.', time: '25 min' },
  6: { type: 'protein', label: 'Strength Day', purpose: 'Protein treatment for resilience.', time: '20 min' },
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

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Icon Components ──────────────────────────────────────────────

function RitualTypeIcon({ type, size = 20, color = '#FFFFFF' }: { type: RitualDayType; size?: number; color?: string }) {
  const c = color;
  const paths: Record<RitualDayType, React.ReactNode> = {
    wash: <Path d="M12 2C12 2 5 9 5 14C5 17.866 8.134 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
    style: <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
    refresh: (<><Path d="M1 4V10H7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M23 20V14H17" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14L18.36 18.36A9 9 0 013.51 15" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></>),
    rest: <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
    scalp: <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
    protein: <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
    protect: (<><Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M9 12L11 14L15 10" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></>),
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">{paths[type]}</Svg>;
}

function FlameIcon({ color = '#D4A04A', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C12 2 4 8.5 4 14.5C4 18.642 7.358 22 11.5 22H12.5C16.642 22 20 18.642 20 14.5C20 8.5 12 2 12 2Z"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 18C13.657 18 15 16.657 15 15C15 12 12 10 12 10C12 10 9 12 9 15C9 16.657 10.343 18 12 18Z"
        fill="#FEF8EC"
        stroke="#FEF8EC"
        strokeWidth={1}
      />
    </Svg>
  );
}

function GearIcon({ color = colors.muted, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgCircle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
      <Path
        d="M19.4 15A1.65 1.65 0 0019.74 16.81L19.8 16.87A2 2 0 1117 19.7L16.94 19.64A1.65 1.65 0 0015.13 19.3 1.65 1.65 0 0014.18 20.81V21A2 2 0 1110.18 21V20.91A1.65 1.65 0 009.18 19.4 1.65 1.65 0 007.37 19.74L7.31 19.8A2 2 0 114.49 17L4.55 16.94A1.65 1.65 0 004.89 15.13 1.65 1.65 0 003.38 14.18H3.19A2 2 0 113.19 10.18H3.28A1.65 1.65 0 004.79 9.18 1.65 1.65 0 004.45 7.37L4.39 7.31A2 2 0 117.21 4.49L7.27 4.55A1.65 1.65 0 009.08 4.89H9.18A1.65 1.65 0 0010.18 3.38V3.19A2 2 0 1114.18 3.19V3.28A1.65 1.65 0 0015.13 4.79 1.65 1.65 0 0016.94 4.45L17 4.39A2 2 0 1119.82 7.21L19.76 7.27A1.65 1.65 0 0019.42 9.08V9.18A1.65 1.65 0 0020.81 10.18H21A2 2 0 1121 14.18H20.91A1.65 1.65 0 0019.4 15Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ color = colors.muted, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckCircleIcon({ color = colors.success, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgCircle cx={12} cy={12} r={10} fill={color} />
      <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GridIcon({ type, size = 22, color }: { type: 'checkin' | 'journey' | 'products' | 'chat'; size?: number; color: string }) {
  const paths: Record<string, React.ReactNode> = {
    checkin: <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z M8.5 12L11 14.5L15.5 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
    journey: <Path d="M22 12H18L15 21L9 3L6 12H2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
    products: (<><SvgCircle cx={9} cy={21} r={1} stroke={color} strokeWidth={2} /><SvgCircle cx={20} cy={21} r={1} stroke={color} strokeWidth={2} /><Path d="M1 1H5L7.68 14.39A2 2 0 009.68 16H19.4A2 2 0 0021.32 14.39L23 6H6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></>),
    chat: <Path d="M21 12C21 16.418 16.97 20 12 20C10.805 20 9.662 19.8 8.608 19.434L3 21L4.49 16.375C3.55 15.091 3 13.596 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />,
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">{paths[type]}</Svg>;
}

function HumidityIcon({ color = colors.muted, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 5 9 5 14C5 17.866 8.134 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2Z" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.15} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Progress Ring Component ──────────────────────────────────────

const RING_SIZE = 160;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ done, total }: { done: number; total: number }) {
  const progress = total > 0 ? done / total : 0;
  const offset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <View style={ringStyles.container}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Background track */}
        <SvgCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={colors.border}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <SvgCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={colors.primary}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${RING_CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          rotation={-90}
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      {/* Center content */}
      <View style={ringStyles.centerContent}>
        <Text style={ringStyles.bigNumber}>{done}</Text>
        <Text style={ringStyles.ofTotal}>/{total} days</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.ink,
    lineHeight: 48,
    letterSpacing: -1,
  },
  ofTotal: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: -2,
  },
});

// ─── Day Dots Row ─────────────────────────────────────────────────

function DayDots({ completedDays, todayIndex }: { completedDays: boolean[]; todayIndex: number }) {
  return (
    <View style={dotStyles.row}>
      {DAY_LABELS.map((label, i) => {
        const isCompleted = completedDays[i];
        const isToday = i === todayIndex;
        return (
          <View key={`${label}-${i}`} style={dotStyles.dayCol}>
            <View
              style={[
                dotStyles.dot,
                isCompleted && dotStyles.dotCompleted,
                isToday && !isCompleted && dotStyles.dotToday,
                !isCompleted && !isToday && dotStyles.dotUpcoming,
              ]}
            />
            <Text
              style={[
                dotStyles.label,
                isToday && dotStyles.labelToday,
                isCompleted && dotStyles.labelCompleted,
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const DOT_SIZE = 10;

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
  },
  dotToday: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dotUpcoming: {
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.3,
  },
  labelToday: {
    color: colors.primary,
  },
  labelCompleted: {
    color: colors.inkLight,
  },
});

// ─── Skeleton ─────────────────────────────────────────────────────

function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: colors.skeleton, borderRadius: radius.md },
        anim,
        style,
      ]}
    />
  );
}

function HomeScreenSkeleton({ paddingTop }: { paddingTop: number }) {
  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SkeletonBlock width={44} height={44} style={{ borderRadius: 22 }} />
          <View style={{ gap: 6 }}>
            <SkeletonBlock width={130} height={16} />
            <SkeletonBlock width={80} height={12} />
          </View>
        </View>
        <SkeletonBlock width={40} height={40} style={{ borderRadius: 20 }} />
      </View>
      <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
        <SkeletonBlock width={160} height={160} style={{ borderRadius: 80 }} />
      </View>
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md, marginTop: spacing.lg }}>
        <SkeletonBlock width="100%" height={150} style={{ borderRadius: radius.xl }} />
        <SkeletonBlock width="100%" height={64} style={{ borderRadius: radius.lg }} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <SkeletonBlock width="48%" height={80} style={{ borderRadius: radius.lg }} />
          <SkeletonBlock width="48%" height={80} style={{ borderRadius: radius.lg }} />
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function HomeDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state: ob } = useOnboarding();
  const auntyId: AuntyId = (ob.data.chosenAuntyId as AuntyId) || 'denise';
  const aunty = AUNTIES[auntyId] ?? AUNTIES.denise;
  const ac = auntyColors[auntyId] ?? auntyColors.denise;
  const name = ob.data.name || 'Queen';

  const dayOfWeek = new Date().getDay();
  const today = DAILY_RITUAL[dayOfWeek];
  const todayGradient = TYPE_GRADIENTS[today.type];

  const [weekNumber, setWeekNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [ritualLog, setRitualLog] = useState<Record<string, RitualLogEntry>>({});
  const { percent: outdoorHumidity, band: humidityBand, ready: humidityReady } = useLocalHumidity();
  const humidityLine = getHumidityOneLiner(outdoorHumidity, humidityBand);

  // Load initial data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dateStr, log] = await Promise.all([
          AsyncStorage.getItem('onboarding_completed_at'),
          getRitualLog(),
        ]);
        if (cancelled) return;
        if (dateStr) {
          const diff = Date.now() - new Date(dateStr).getTime();
          setWeekNumber(Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
        }
        setRitualLog(log);
      } catch (err) {
        if (__DEV__) console.warn('[Home] load failed', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Refresh ritual log when tab is focused
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getRitualLog().then((log) => {
        if (!cancelled) setRitualLog(log);
      });
      return () => { cancelled = true; };
    }, [])
  );

  // Computed stats
  const streak = useMemo(() => computeStreak(ritualLog), [ritualLog]);
  const weekStats = useMemo(() => computeWeekStats(ritualLog), [ritualLog]);
  const todayStatus = useMemo(() => getTodayStatus(ritualLog), [ritualLog]);
  const isTodayDone = todayStatus === 'completed' || todayStatus === 'skipped';

  // Day completion array for dots (Sun=0 through Sat=6)
  const completedDays = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun
    return DAY_LABELS.map((_, i) => {
      if (i > currentDay) return false; // future
      // Build the date key for this day of the current week
      const d = new Date(now);
      d.setDate(now.getDate() - currentDay + i);
      d.setHours(0, 0, 0, 0);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = ritualLog[key];
      return entry ? (entry.completed || entry.skipped === true) : false;
    });
  }, [ritualLog]);

  // Rotating whisper content (alternates between quote and tip each session)
  const whisperText = useMemo(() => {
    const session = Math.floor(Date.now() / (1000 * 60 * 60 * 2)); // changes every 2 hours
    if (session % 2 === 0) return getAuntyQuoteForSession(auntyId);
    return getAuntyTipForToday(auntyId);
  }, [auntyId]);

  if (isLoading) {
    return <HomeScreenSkeleton paddingTop={insets.top} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. Compact Header ─────────────────────── */}
        <Animated.View entering={FadeIn.duration(380)} style={styles.header}>
          <PressableScale
            onPress={() => navigation.navigate('ChangeAunty')}
            scaleTo={0.97}
            haptic="light"
            style={styles.headerLeft}
            accessibilityRole="button"
            accessibilityLabel={`Change aunty, currently ${aunty.name}`}
          >
            <AuntyAvatar auntyId={auntyId} size={40} showRing />
            <View style={styles.headerGreeting}>
              <Text style={styles.greetingText} numberOfLines={1}>
                {getGreeting()}, {name}
              </Text>
              <Text style={[styles.signOffText, { color: ac.accent }]} numberOfLines={1}>
                {aunty.signOff}
              </Text>
            </View>
          </PressableScale>
          <View style={styles.headerRight}>
            {streak.current > 0 && (
              <View style={styles.streakBadge}>
                <FlameIcon size={16} />
                <Text style={styles.streakCount}>{streak.current}</Text>
              </View>
            )}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Settings');
              }}
              style={styles.settingsBtn}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <GearIcon />
            </Pressable>
          </View>
        </Animated.View>

        {/* ─── 2. Weekly Progress Ring ────────────────── */}
        <Animated.View entering={FadeInDown.delay(40).duration(380)}>
          <PressableScale
            onPress={() => navigation.navigate('Journey')}
            accessibilityRole="button"
            accessibilityLabel={`Week ${weekNumber} progress: ${weekStats.done} of ${weekStats.total} days completed`}
            scaleTo={0.97}
            haptic="light"
          >
            <View style={styles.ringSection}>
              <ProgressRing done={weekStats.done} total={7} />
              <View style={styles.ringMeta}>
                <View style={styles.streakRow}>
                  <FlameIcon size={14} color={streak.current > 0 ? colors.primary : colors.muted} />
                  <Text style={[styles.streakLabel, streak.current > 0 && { color: colors.ink }]}>
                    {streak.current > 0 ? `${streak.current} day streak` : 'Start your streak'}
                  </Text>
                </View>
                <Text style={styles.weekLabel}>Week {weekNumber}</Text>
              </View>
              <DayDots completedDays={completedDays} todayIndex={dayOfWeek} />
            </View>
          </PressableScale>
        </Animated.View>

        {/* ─── 3. Today's Ritual Hero ─────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.sectionPad}>
          <PressableScale
            onPress={() => {
              if (!isTodayDone) navigation.navigate('RitualSteps');
            }}
            accessibilityRole="button"
            accessibilityLabel={isTodayDone ? `${today.label} completed` : `Start today's ${today.label}, ${today.time}`}
            scaleTo={isTodayDone ? 1 : 0.985}
            haptic={isTodayDone ? 'none' : 'medium'}
          >
            <LinearGradient
              colors={isTodayDone ? ['#1A7A4A', '#0A5C30'] : [...todayGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.heroOverlineRow}>
                  <RitualTypeIcon type={today.type} size={16} />
                  <Text style={styles.heroOverline}>
                    {isTodayDone ? 'COMPLETED' : 'TODAY'}
                  </Text>
                </View>
                <View style={styles.heroTimePill}>
                  <Text style={styles.heroTimeText}>{today.time}</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>{today.label}</Text>
              <Text style={styles.heroPurpose}>{today.purpose}</Text>

              {humidityLine && !isTodayDone ? (
                <Text style={styles.heroHumidity}>{humidityLine}</Text>
              ) : null}

              {isTodayDone ? (
                <View style={styles.heroDoneBadge}>
                  <CheckCircleIcon color="#FFFFFF" size={18} />
                  <Text style={styles.heroDoneText}>
                    {todayStatus === 'completed' ? 'Done for today!' : 'Skipped today'}
                  </Text>
                </View>
              ) : (
                <View style={styles.heroCta}>
                  <Text style={styles.heroCtaText}>Start Ritual</Text>
                  <ChevronRightIcon color="#FFFFFF" size={17} />
                </View>
              )}
            </LinearGradient>
          </PressableScale>
        </Animated.View>

        {/* ─── 4. Aunty Whisper Card ─────────────────── */}
        <Animated.View entering={FadeInDown.delay(120).duration(360)} style={styles.sectionPad}>
          <PressableScale
            onPress={() => navigation.navigate('Chat')}
            scaleTo={0.985}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={`Wisdom from Aunty ${aunty.name}. Tap to chat.`}
          >
            <View style={[styles.whisperCard, { borderLeftColor: ac.accent }]}>
              <AuntyAvatar auntyId={auntyId} size={32} showRing={false} />
              <View style={styles.whisperContent}>
                <Text style={styles.whisperText} numberOfLines={2}>
                  "{whisperText}"
                </Text>
                <Text style={[styles.whisperName, { color: ac.accent }]}>
                  — Aunty {aunty.name}
                </Text>
              </View>
              <ChevronRightIcon color={colors.muted} size={14} />
            </View>
          </PressableScale>
        </Animated.View>

        {/* ─── 5. Quick Actions Grid (2×2) ────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(360)} style={styles.sectionPad}>
          <View style={styles.grid}>
            {/* Check-In */}
            <PressableScale
              onPress={() => navigation.navigate('CheckIn')}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel="Weekly check-in"
            >
              <GridIcon type="checkin" color={ac.accent} />
              <Text style={styles.gridLabel}>Check-In</Text>
              <Text style={styles.gridSub}>How's this week?</Text>
            </PressableScale>

            {/* Journey */}
            <PressableScale
              onPress={() => navigation.navigate('Journey')}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={`Journey, Week ${weekNumber}`}
            >
              <GridIcon type="journey" color={colors.jewel.emerald} />
              <Text style={styles.gridLabel}>Journey</Text>
              <Text style={styles.gridSub}>Week {weekNumber}</Text>
            </PressableScale>

            {/* Products */}
            <PressableScale
              onPress={() => navigation.navigate('Tabs', { screen: 'Products' })}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel="Your product picks"
            >
              <GridIcon type="products" color={colors.jewel.plum} />
              <Text style={styles.gridLabel}>Products</Text>
              <Text style={styles.gridSub}>Your picks</Text>
            </PressableScale>

            {/* Ask Aunty */}
            <PressableScale
              onPress={() => navigation.navigate('Tabs', { screen: 'Chat' })}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={`Chat with Aunty ${aunty.name}`}
            >
              <AuntyAvatar auntyId={auntyId} size={22} showRing={false} />
              <Text style={styles.gridLabel}>Ask {aunty.name}</Text>
              <Text style={styles.gridSub}>Get advice</Text>
            </PressableScale>
          </View>
        </Animated.View>

        {/* ─── 6. Hair Weather Strip (conditional) ───── */}
        {humidityReady && outdoorHumidity !== null && (
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.sectionPad}>
            <View style={styles.weatherStrip}>
              <HumidityIcon color={colors.muted} size={16} />
              <Text style={styles.weatherText}>
                {humidityBand === 'humid' ? '💧' : humidityBand === 'dry' ? '☀️' : '✓'}{' '}
                Humidity {outdoorHumidity}% — {humidityBand}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  sectionPad: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerGreeting: {
    flex: 1,
  },
  greetingText: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  signOffText: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  streakCount: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // ── Progress Ring Section ──
  ringSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  ringMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  weekLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
  },

  // ── Hero Card ──
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroOverlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  heroTimePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  heroTimeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: '#FFFFFF',
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginTop: spacing.xs,
  },
  heroPurpose: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: fontSize.md * 1.45,
  },
  heroHumidity: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: fontSize.xs * 1.5,
    marginTop: 2,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.full,
    paddingVertical: spacing.sm + 2,
  },
  heroCtaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: '#FFFFFF',
  },
  heroDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  heroDoneText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.95)',
  },

  // ── Aunty Whisper ──
  whisperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  whisperContent: {
    flex: 1,
  },
  whisperText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    fontStyle: 'italic',
    lineHeight: fontSize.sm * 1.45,
  },
  whisperName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    marginTop: 2,
  },

  // ── Quick Actions Grid ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: 4,
    ...shadows.sm,
  },
  gridLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginTop: 4,
  },
  gridSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  // ── Weather Strip ──
  weatherStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceTinted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  weatherText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.muted,
    flex: 1,
  },
});
