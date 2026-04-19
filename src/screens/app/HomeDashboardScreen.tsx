import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
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

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { PressableScale } from '../../components/PressableScale';
import { HomeSectionCard } from '../../components/home/HomeSectionCard';
import { HomeSectionHeader } from '../../components/home/HomeSectionHeader';
import { QuickActionPill } from '../../components/home/QuickActionPill';
import { WeekProgressStrip, type WeekProgressDay } from '../../components/home/WeekProgressStrip';
import { WeeklyCheckInCard } from '../../components/home/WeeklyCheckInCard';
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
import type { RitualDayType } from '../../types';

const DAILY_RITUAL: Record<number, { type: RitualDayType; label: string; purpose: string; time: string }> = {
  0: { type: 'rest', label: 'Rest Day', purpose: 'Let your hair breathe. Minimal touch.', time: '5 min' },
  1: { type: 'wash', label: 'Wash Day', purpose: 'Deep cleanse and moisture reset.', time: '45 min' },
  2: { type: 'scalp', label: 'Scalp Day', purpose: 'Nourish the roots. Oil and massage.', time: '15 min' },
  3: { type: 'protect', label: 'Protect Day', purpose: 'Low-manipulation styling.', time: '30 min' },
  4: { type: 'refresh', label: 'Refresh Day', purpose: 'Mid-week touch-up.', time: '10 min' },
  5: { type: 'style', label: 'Style Day', purpose: 'Define and celebrate your curls.', time: '25 min' },
  6: { type: 'protein', label: 'Strength Day', purpose: 'Protein treatment for resilience.', time: '20 min' },
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const QUICK_QUESTIONS: Record<AuntyId, string[]> = {
  ngozi: ['My hair feels dry', 'Deep conditioner rec?', 'Shea butter tips'],
  marcia: ['Scalp is itchy', 'Growth tips', 'JBCO help'],
  denise: ['Protective styles', 'Night routine', 'LOC method'],
  fatou: ['Detangling help', 'Trim schedule', 'Sectioning tips'],
  carmen: ['Wash-and-go tips', 'Curl definition', 'Gel vs cream'],
  amara: ['Need protein?', 'Hair feels weak', 'Henna treatment'],
  salma: ['Breakage remedies', 'Scalp balance', 'Argan oil tips'],
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getWeekDates(): Array<{ date: number; dateObj: Date }> {
  const now = new Date();
  const day = now.getDay();
  const results: Array<{ date: number; dateObj: Date }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - day + i);
    d.setHours(0, 0, 0, 0);
    results.push({ date: d.getDate(), dateObj: d });
  }
  return results;
}

function RitualTypeIcon({ type, size = 20, color = '#FFFFFF' }: { type: RitualDayType; size?: number; color?: string }) {
  const c = color;
  const paths: Record<RitualDayType, React.ReactNode> = {
    wash: (
      <Path d="M12 2C12 2 5 9 5 14C5 17.866 8.134 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    ),
    style: (
      <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    ),
    refresh: (
      <>
        <Path d="M1 4V10H7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M23 20V14H17" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14L18.36 18.36A9 9 0 013.51 15" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    rest: (
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    ),
    scalp: (
      <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    ),
    protein: (
      <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    ),
    // Distinct from `scalp`: shield + check
    protect: (
      <>
        <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 12L11 14L15 10" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths[type]}
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

function ChatIcon({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12C21 16.418 16.97 20 12 20C10.805 20 9.662 19.8 8.608 19.434L3 21L4.49 16.375C3.55 15.091 3 13.596 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GearIcon({ color = colors.muted, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
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
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <SkeletonBlock width={44} height={44} style={{ borderRadius: 22 }} />
          <View style={{ gap: 6 }}>
            <SkeletonBlock width={70} height={11} />
            <SkeletonBlock width={130} height={16} />
          </View>
        </View>
        <SkeletonBlock width={40} height={40} style={{ borderRadius: 20 }} />
      </View>
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <SkeletonBlock width="100%" height={150} style={{ borderRadius: radius.xl }} />
        <SkeletonBlock width="100%" height={110} style={{ borderRadius: radius.xl }} />
        <SkeletonBlock width="100%" height={200} style={{ borderRadius: radius.xl }} />
      </View>
    </View>
  );
}

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await AsyncStorage.getItem('onboarding_completed_at');
        if (d && !cancelled) {
          const diff = Date.now() - new Date(d).getTime();
          setWeekNumber(Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
        }
      } catch (err) {
        if (__DEV__) console.warn('[Home] week number load failed', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const weekDays = useMemo<WeekProgressDay[]>(() => {
    const dates = getWeekDates();
    return dates.map(({ date, dateObj }, i) => {
      const dayRitual = DAILY_RITUAL[i];
      return {
        key: `${DAY_NAMES[i]}-${date}`,
        dayName: DAY_NAMES[i],
        date,
        dateObj,
        type: dayRitual.type,
        ritualLabel: dayRitual.type.charAt(0).toUpperCase() + dayRitual.type.slice(1),
        accent: TYPE_COLORS[dayRitual.type],
        gradient: TYPE_GRADIENTS[dayRitual.type],
        isToday: i === dayOfWeek,
        isPast: i < dayOfWeek,
      };
    });
  }, [dayOfWeek]);

  if (isLoading) {
    return <HomeScreenSkeleton paddingTop={insets.top} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(380)} style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <AuntyAvatar auntyId={auntyId} size={44} showRing />
            <View style={styles.greetingCol}>
              <Text style={styles.greetingSub}>Week {weekNumber}</Text>
              <Text style={styles.greeting} numberOfLines={1}>
                {getGreeting()}, {name}
              </Text>
            </View>
          </View>
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
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(360)} style={styles.sectionPad}>
          <PressableScale
            onPress={() => navigation.navigate('RitualSteps')}
            accessibilityRole="button"
            accessibilityLabel={`Start today's ${today.label}, ${today.time}`}
            scaleTo={0.985}
            haptic="medium"
          >
            <LinearGradient
              colors={[...todayGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTop}>
                <View style={styles.heroOverlineRow}>
                  <Text style={styles.heroOverline}>TODAY'S RITUAL</Text>
                  <View style={styles.heroTimePill}>
                    <Text style={styles.heroTimeText}>{today.time}</Text>
                  </View>
                </View>
                <View style={styles.heroIconCircle}>
                  <RitualTypeIcon type={today.type} size={20} />
                </View>
              </View>
              <Text style={styles.heroLabel}>{today.label}</Text>
              <Text style={styles.heroPurpose}>{today.purpose}</Text>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Start Ritual</Text>
                <ChevronRightIcon color="#FFFFFF" size={17} />
              </View>
            </LinearGradient>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(360)} style={styles.sectionPad}>
          <WeekProgressStrip
            title="This Week"
            subtitle={`Week ${weekNumber}`}
            days={weekDays}
            renderIcon={(day) => {
              if (day.isPast) return <CheckIcon color={day.accent} size={13} />;
              return (
                <RitualTypeIcon
                  type={day.type}
                  size={day.isToday ? 16 : 14}
                  color={day.isToday ? '#FFFFFF' : colors.muted}
                />
              );
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(130).duration(360)} style={styles.sectionPad}>
          <HomeSectionCard contentStyle={styles.insightContent}>
            <HomeSectionHeader
              title={`Aunty ${aunty.name}'s Insights`}
              overline="Your Guidance"
              subtitle="Today"
            />

            <View style={[styles.quotePanel, { backgroundColor: ac.bg, borderLeftColor: ac.accent }]}>
              <View style={styles.quoteHead}>
                <AuntyAvatar auntyId={auntyId} size={36} showRing />
                <Text style={[styles.quoteName, { color: ac.text }]}>Aunty {aunty.name}</Text>
              </View>
              <Text style={[styles.quoteText, { color: ac.text }]}>
                "{getAuntyQuoteForSession(auntyId)}"
              </Text>
            </View>

            <View style={[styles.tipPanel, { borderLeftColor: ac.accent }]}>
              <Text style={[styles.tipOverline, { color: ac.accent }]}>AUNTY'S TIP</Text>
              <Text style={styles.tipText}>{getAuntyTipForToday(auntyId)}</Text>
            </View>

            <View style={styles.quickPills}>
              {QUICK_QUESTIONS[auntyId].map((q) => (
                <QuickActionPill
                  key={q}
                  label={q}
                  onPress={() => navigation.navigate('Chat')}
                  tintColor={ac.text}
                  borderColor={ac.accent + '55'}
                  backgroundColor={ac.bg}
                />
              ))}
            </View>

            <PressableScale
              onPress={() => navigation.navigate('Chat')}
              style={[styles.chatCta, { backgroundColor: ac.accent }]}
              scaleTo={0.985}
              accessibilityRole="button"
              accessibilityLabel={`Chat with ${aunty.name}`}
              haptic="light"
            >
              <ChatIcon color="#FFFFFF" size={16} />
              <Text style={styles.chatCtaText}>Chat with {aunty.name}</Text>
              <ChevronRightIcon color="#FFFFFF" size={16} />
            </PressableScale>
          </HomeSectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(360)} style={styles.sectionPad}>
          <WeeklyCheckInCard
            auntyId={auntyId}
            weekNumber={weekNumber}
            accentColor={ac.accent}
            accentBg={ac.bg}
            accentText={ac.text}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  sectionPad: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  greetingCol: {
    flex: 1,
  },
  greeting: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  greetingSub: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroOverlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  heroTimePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  heroTimeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: '#FFFFFF',
  },
  heroIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
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
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroCtaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
  },
  insightContent: {
    gap: spacing.sm,
  },
  quotePanel: {
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.md,
    gap: spacing.xs,
  },
  quoteHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quoteName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },
  quoteText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    fontStyle: 'italic',
  },
  tipPanel: {
    backgroundColor: colors.surfaceTinted,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tipOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.45,
  },
  quickPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chatCta: {
    minHeight: 48,
    borderRadius: radius.full,
    alignSelf: 'stretch',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  chatCtaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});
