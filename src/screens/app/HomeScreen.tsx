/**
 * HomeScreen — Premium daily ritual hub. Aunty-personalized, warm editorial.
 *
 * Hero greeting with aunty personality.
 * Today's ritual as a gradient hero card.
 * Visual week strip. Aunty wisdom. Quick chat. Check-in.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
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
  withRepeat,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { AuntyAvatar } from '../../components/AuntyAvatar';
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
import { AUNTIES, type AuntyId, getAuntyQuoteForSession, getAuntyTipForToday } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import type { RitualDayType } from '../../types';

// ─── Today's ritual based on day of week ─────────────────────────

const DAILY_RITUAL: Record<number, { type: RitualDayType; label: string; purpose: string; time: string }> = {
  0: { type: 'rest', label: 'Rest Day', purpose: 'Let your hair breathe. Minimal touch.', time: '5 min' },
  1: { type: 'wash', label: 'Wash Day', purpose: 'Deep cleanse & moisture reset.', time: '45 min' },
  2: { type: 'scalp', label: 'Scalp Day', purpose: 'Nourish the roots. Oil + massage.', time: '15 min' },
  3: { type: 'protect', label: 'Protect Day', purpose: 'Low-manipulation styling.', time: '30 min' },
  4: { type: 'refresh', label: 'Refresh Day', purpose: 'Mid-week touch-up.', time: '10 min' },
  5: { type: 'style', label: 'Style Day', purpose: 'Define & celebrate your curls.', time: '25 min' },
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

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(): number[] {
  const now = new Date();
  const day = now.getDay();
  const dates: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - day + i);
    dates.push(d.getDate());
  }
  return dates;
}

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

// ─── Inline SVG Icons ───────────────────────────────────────────

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
      <>
        <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    protect: (
      <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

function SettingsIcon({ color = colors.muted, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M4 12H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M4 18H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Pressable Card with scale feedback ─────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressableCard({
  onPress,
  children,
  style,
  accessibilityLabel,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.975, { duration: 100 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Component ──────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state: ob } = useOnboarding();
  const auntyId: AuntyId = ob.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const name = ob.data.name || 'Queen';
  const dayOfWeek = new Date().getDay();
  const today = DAILY_RITUAL[dayOfWeek];
  const todayGradient = TYPE_GRADIENTS[today.type];

  const [weekNumber, setWeekNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [todayCompleted, setTodayCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await AsyncStorage.getItem('onboarding_completed_at');
        if (d) {
          const diff = Date.now() - new Date(d).getTime();
          setWeekNumber(Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const ritualKeys = keys.filter((k) => k.startsWith('ritual_completed_'));
          const dates = ritualKeys.map((k) => k.replace('ritual_completed_', ''));
          setCompletedDates(new Set(dates));
          const todayKey = new Date().toISOString().split('T')[0];
          setTodayCompleted(dates.includes(todayKey));
        } catch {}
      })();
    }, []),
  );

  if (isLoading) {
    return <HomeScreenSkeleton paddingTop={insets.top} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Top Bar: greeting + settings ───────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <AuntyAvatar auntyId={auntyId} size={48} showRing />
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
            <SettingsIcon />
          </Pressable>
        </Animated.View>

        {/* ─── Today's Ritual (HERO CARD) ─────────────────── */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <PressableCard
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('RitualSteps');
            }}
            accessibilityLabel={`Start today's ${today.label}, ${today.time}`}
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
                  <RitualTypeIcon type={today.type} size={22} />
                </View>
              </View>
              <Text style={styles.heroLabel}>{today.label}</Text>
              <Text style={styles.heroPurpose}>{today.purpose}</Text>
              <View style={styles.heroCta}>
                {todayCompleted ? (
                  <>
                    <CheckIcon color="#FFFFFF" size={14} />
                    <Text style={styles.heroCtaText}>Completed</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.heroCtaText}>Start Ritual</Text>
                    <ChevronRightIcon color="#FFFFFF" size={18} />
                  </>
                )}
              </View>
            </LinearGradient>
          </PressableCard>
        </Animated.View>

        {/* ─── Week Calendar Strip ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>This Week</Text>
            <Text style={styles.weekSubtitle}>Week {weekNumber}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekScroll}
            decelerationRate="fast"
            snapToInterval={72}
          >
            {getWeekDates().map((date, i) => {
              const isToday = i === dayOfWeek;
              const isPast = i < dayOfWeek;
              const dayRitual = DAILY_RITUAL[i];
              const dc = TYPE_COLORS[dayRitual.type];
              const dg = TYPE_GRADIENTS[dayRitual.type];

              const weekDate = new Date();
              weekDate.setDate(weekDate.getDate() - dayOfWeek + i);
              const dateKey = weekDate.toISOString().split('T')[0];
              const dayCompleted = completedDates.has(dateKey);

              if (isToday) {
                return (
                  <LinearGradient
                    key={i}
                    colors={[...dg]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.dayCard, styles.dayCardToday]}
                  >
                    <Text style={styles.dayNameToday}>{DAY_NAMES[i]}</Text>
                    <Text style={styles.dayDateToday}>{date}</Text>
                    <View style={styles.dayIconCircleToday}>
                      <RitualTypeIcon type={dayRitual.type} size={16} />
                    </View>
                    <Text style={styles.dayRitualToday} numberOfLines={1}>
                      {dayRitual.type.charAt(0).toUpperCase() + dayRitual.type.slice(1)}
                    </Text>
                  </LinearGradient>
                );
              }

              return (
                <View
                  key={i}
                  style={[
                    styles.dayCard,
                    isPast && styles.dayCardPast,
                  ]}
                >
                  <Text style={styles.dayName}>{DAY_NAMES[i]}</Text>
                  <Text style={[styles.dayDate, isPast && { color: colors.ink }]}>{date}</Text>
                  <View
                    style={[
                      styles.dayIconCircle,
                      dayCompleted
                        ? { backgroundColor: dc + '20' }
                        : { backgroundColor: colors.borderLight },
                    ]}
                  >
                    {dayCompleted ? (
                      <CheckIcon color={dc} size={13} />
                    ) : (
                      <RitualTypeIcon type={dayRitual.type} size={14} color={isPast ? dc + '60' : colors.muted} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dayRitual,
                      isPast && { color: dc },
                    ]}
                    numberOfLines={1}
                  >
                    {dayRitual.type.charAt(0).toUpperCase() + dayRitual.type.slice(1)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* ─── Aunty's Word ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <LinearGradient
            colors={[...ac.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wisdomCard}
          >
            <View style={styles.wisdomRow}>
              <AuntyAvatar auntyId={auntyId} size={44} showRing />
              <View style={styles.wisdomContent}>
                <Text style={styles.wisdomName}>Aunty {aunty.name}</Text>
                <Text style={[styles.wisdomQuote, { color: ac.text }]}>
                  "{getAuntyQuoteForSession(auntyId)}"
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Chat');
              }}
              style={[styles.wisdomCta, { borderColor: ac.accent + '30' }]}
            >
              <ChatIcon color={ac.text} size={16} />
              <Text style={[styles.wisdomCtaText, { color: ac.text }]}>
                Chat with {aunty.name}
              </Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* ─── Tip of the Day ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(175).duration(400)} style={styles.tipCard}>
          <View style={[styles.tipBorder, { borderLeftColor: ac.accent }]}>
            <Text style={[styles.tipOverline, { color: ac.accent }]}>AUNTY'S TIP</Text>
            <View style={styles.tipRow}>
              <AuntyAvatar auntyId={auntyId} size={28} />
              <Text style={styles.tipText}>{getAuntyTipForToday(auntyId)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ─── Quick Questions ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(225).duration(400)} style={styles.section}>
          <Text style={styles.sectionOverline}>QUICK QUESTIONS</Text>
          <View style={styles.chips}>
            {QUICK_QUESTIONS[auntyId].map((q, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Chat');
                }}
                style={[styles.chip, { borderColor: ac.accent + '30', backgroundColor: ac.bg }]}
              >
                <Text style={[styles.chipText, { color: ac.text }]}>{q}</Text>
                <ChevronRightIcon color={ac.accent} size={14} />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ─── Your Journey ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)}>
          <PressableCard
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Journey');
            }}
            accessibilityLabel="View your hair journey and progress"
          >
            <View style={styles.journeyCard}>
              <View style={styles.journeyLeft}>
                <View style={[styles.journeyIconCircle, { backgroundColor: ac.accent + '15' }]}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M22 12H18L15 21L9 3L6 12H2" stroke={ac.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.journeyTitle}>Your Journey</Text>
                  <Text style={styles.journeySub}>Track progress, streaks & milestones</Text>
                </View>
              </View>
              <ChevronRightIcon color={ac.accent} size={18} />
            </View>
          </PressableCard>
        </Animated.View>

        {/* ─── Weekly Check-in ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(290).duration(400)}>
          <PressableCard
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('CheckIn');
            }}
            accessibilityLabel="Weekly check-in, how's your hair this week?"
          >
            <LinearGradient
              colors={[...gradients.dark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkinCard}
            >
              <View style={styles.checkinLeft}>
                <View style={styles.checkinIconCircle}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke={colors.primaryLight}
                      strokeWidth={2}
                    />
                    <Path
                      d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
                      stroke={colors.primaryLight}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <Path d="M9 9H9.01" stroke={colors.primaryLight} strokeWidth={2.5} strokeLinecap="round" />
                    <Path d="M15 9H15.01" stroke={colors.primaryLight} strokeWidth={2.5} strokeLinecap="round" />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkinTitle}>Weekly Check-in</Text>
                  <Text style={styles.checkinSub}>How's your hair feeling this week?</Text>
                </View>
              </View>
              <View style={styles.checkinArrow}>
                <ChevronRightIcon color={colors.primaryLight} size={18} />
              </View>
            </LinearGradient>
          </PressableCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────

function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
  }, []);
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
          <SkeletonBlock width={48} height={48} style={{ borderRadius: 24 }} />
          <View style={{ gap: 6 }}>
            <SkeletonBlock width={60} height={12} />
            <SkeletonBlock width={140} height={18} />
          </View>
        </View>
        <SkeletonBlock width={44} height={44} style={{ borderRadius: 22 }} />
      </View>
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
        <SkeletonBlock width="100%" height={160} style={{ borderRadius: radius.xl }} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <SkeletonBlock key={i} width={64} height={80} style={{ borderRadius: radius.lg }} />
          ))}
        </View>
        <SkeletonBlock width="100%" height={100} style={{ borderRadius: radius.xl }} />
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  greetingCol: {
    flex: 1,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
  },
  greetingSub: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: 2,
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

  // Hero ritual card
  heroCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.lg,
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
    letterSpacing: letterSpacing.widest,
    color: 'rgba(255, 255, 255, 0.7)',
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
  heroIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.tight,
    marginTop: spacing.xs,
  },
  heroPurpose: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: fontSize.base * 1.4,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  heroCtaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
  },

  // Week calendar strip
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  weekTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  weekSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  weekScroll: {
    paddingHorizontal: spacing.lg,
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
    width: 64,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 0,
    gap: spacing.xs,
    ...shadows.md,
  },
  dayName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  dayNameToday: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dayDate: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.muted,
    letterSpacing: letterSpacing.tight,
  },
  dayDateToday: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.tight,
  },
  dayIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayIconCircleToday: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayRitual: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  dayRitualToday: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Aunty wisdom card
  wisdomCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  wisdomRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  wisdomContent: {
    flex: 1,
  },
  wisdomName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginBottom: 4,
  },
  wisdomQuote: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    fontStyle: 'italic',
  },
  wisdomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  wisdomCtaText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
  },

  // Tip of the day
  tipCard: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tipBorder: {
    borderLeftWidth: 3,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.sm,
  },
  tipOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    fontStyle: 'italic',
    lineHeight: fontSize.sm * 1.5,
  },

  // Quick questions
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 44,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
  },

  // Journey card
  journeyCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  journeyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  journeyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  journeySub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 2,
  },

  // Check-in
  checkinCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  checkinIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.dark.text,
  },
  checkinSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  checkinArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
