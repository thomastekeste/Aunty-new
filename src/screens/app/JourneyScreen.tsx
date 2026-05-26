/**
 * JourneyScreen — Your hair transformation timeline.
 *
 * Stats row, streak calendar, check-in history, dynamic milestones.
 * Single aunty companion throughout.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import { AUNTIES, getAuntyQuoteForSession } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
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

// ─── SVG Icons ──────────────────────────────────────────────────

function FireIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 5 9 5 14C5 17.866 8.134 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2Z" fill={color} />
    </Svg>
  );
}

function CheckCircleIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={color} />
      <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function SmileIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth={2} />
      <Path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M9 9H9.01M15 9H15.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Types ──────────────────────────────────────────────────────

interface SavedCheckIn {
  mood: string;
  notes: string;
  timestamp: string;
  auntyId: string;
}

const MOOD_LABELS: Record<string, { label: string; color: string }> = {
  great: { label: 'Great', color: colors.jewel.emerald },
  good: { label: 'Good', color: colors.jewel.amber },
  okay: { label: 'Okay', color: colors.jewel.indigo },
  struggling: { label: 'Struggling', color: colors.jewel.rose },
};

// ─── Streak Calendar ────────────────────────────────────────────

function StreakCalendar({ ritualDates }: { ritualDates: Set<string> }) {
  const today = new Date();
  const days: { date: string; label: string; isToday: boolean; completed: boolean }[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    days.push({
      date: key,
      label: i === 0 ? 'Today' : dayNames[d.getDay()],
      isToday: i === 0,
      completed: ritualDates.has(key),
    });
  }

  return (
    <View style={streakStyles.container}>
      <View style={streakStyles.grid}>
        {days.map((day) => (
          <View key={day.date} style={streakStyles.dayCol}>
            <Text style={[streakStyles.dayLabel, day.isToday && streakStyles.dayLabelToday]}>
              {day.label}
            </Text>
            <View
              style={[
                streakStyles.dot,
                day.completed ? streakStyles.dotCompleted : streakStyles.dotEmpty,
                day.isToday && !day.completed && streakStyles.dotToday,
              ]}
            >
              {day.completed && (
                <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const streakStyles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: spacing.xs },
  dayLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.muted },
  dayLabelToday: { fontFamily: fonts.bodySemiBold, color: colors.primary },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dotCompleted: { backgroundColor: colors.jewel.emerald },
  dotEmpty: { backgroundColor: colors.canvasDeep, borderWidth: 1, borderColor: colors.border },
  dotToday: { borderColor: colors.primary, borderWidth: 2 },
});

// ─── Check-in History Card ──────────────────────────────────────

function CheckInHistoryCard({ weekNum, checkIn, auntyId }: { weekNum: number; checkIn: SavedCheckIn; auntyId: AuntyId }) {
  const mood = MOOD_LABELS[checkIn.mood] || { label: checkIn.mood, color: colors.muted };
  const date = new Date(checkIn.timestamp);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={historyStyles.card}>
      <View style={historyStyles.header}>
        <View style={[historyStyles.weekBadge, { backgroundColor: mood.color + '15' }]}>
          <Text style={[historyStyles.weekNum, { color: mood.color }]}>W{weekNum}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={historyStyles.dateText}>{dateStr}</Text>
          <View style={historyStyles.moodRow}>
            <View style={[historyStyles.moodDot, { backgroundColor: mood.color }]} />
            <Text style={[historyStyles.moodText, { color: mood.color }]}>{mood.label}</Text>
          </View>
        </View>
        <AuntyAvatar auntyId={auntyId} size={28} />
      </View>
      {checkIn.notes ? (
        <Text style={historyStyles.notes} numberOfLines={2}>{checkIn.notes}</Text>
      ) : null}
    </View>
  );
}

const historyStyles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadows.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weekBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  weekNum: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  dateText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  moodDot: { width: 6, height: 6, borderRadius: 3 },
  moodText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm },
  notes: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.5, paddingLeft: spacing.sm },
});

// ─── Dynamic Milestone ──────────────────────────────────────────

function MilestoneRow({
  title,
  desc,
  achieved,
  accentColor,
  index,
}: {
  title: string;
  desc: string;
  achieved: boolean;
  accentColor: string;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(300)}>
      <View style={[milestoneStyles.row, achieved && { borderLeftColor: accentColor }]}>
        <View style={[milestoneStyles.iconWrap, { backgroundColor: achieved ? accentColor : colors.canvasDeep }]}>
          {achieved ? (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : (
            <View style={milestoneStyles.lockedDot} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[milestoneStyles.title, !achieved && { color: colors.muted }]}>{title}</Text>
          <Text style={milestoneStyles.desc}>{desc}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const milestoneStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.border, ...shadows.sm },
  iconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  lockedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  title: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink },
  desc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted, marginTop: 1 },
});

// ─── Main Screen ────────────────────────────────────────────────

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [weekNumber, setWeekNumber] = useState(1);
  const [checkInCount, setCheckInCount] = useState(0);
  const [ritualCount, setRitualCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [ritualDates, setRitualDates] = useState<Set<string>>(new Set());
  const [checkIns, setCheckIns] = useState<{ week: number; data: SavedCheckIn }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const d = await AsyncStorage.getItem('onboarding_completed_at');
        if (d) {
          const diff = Date.now() - new Date(d).getTime();
          setWeekNumber(Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
        }

        const allKeys = (await AsyncStorage.getAllKeys()) || [];
        const checkInKeys = allKeys.filter((k) => k.startsWith('checkin_week_'));
        const ritualKeys = allKeys.filter((k) => k.startsWith('ritual_completed_'));
        setCheckInCount(checkInKeys.length);
        setRitualCount(ritualKeys.length);

        // Build ritual dates set for streak calendar
        const dates = new Set<string>();
        for (const key of ritualKeys) {
          const datePart = key.replace('ritual_completed_', '');
          dates.add(datePart);
        }
        setRitualDates(dates);

        // Calculate streak
        if (ritualKeys.length > 0) {
          const today = new Date();
          let streak = 0;
          for (let i = 0; i < 30; i++) {
            const dt = new Date(today);
            dt.setDate(dt.getDate() - i);
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            const key = `ritual_completed_${yyyy}-${mm}-${dd}`;
            if (ritualKeys.includes(key)) {
              streak++;
            } else if (i > 0) {
              break;
            }
          }
          setStreakCount(streak);
        }

        // Load check-in history
        const loadedCheckIns: { week: number; data: SavedCheckIn }[] = [];
        for (const key of checkInKeys) {
          try {
            const raw = await AsyncStorage.getItem(key);
            if (raw) {
              const weekNum = parseInt(key.replace('checkin_week_', ''), 10);
              loadedCheckIns.push({ week: weekNum, data: JSON.parse(raw) });
            }
          } catch {}
        }
        loadedCheckIns.sort((a, b) => b.week - a.week);
        setCheckIns(loadedCheckIns);
      } catch {}
    })();
  }, []);

  const milestones = [
    { title: 'Started Your Journey', desc: 'Completed onboarding', achieved: true },
    { title: 'First Check-in', desc: 'Told your aunty how it went', achieved: checkInCount >= 1 },
    { title: 'First Ritual', desc: 'Completed your first ritual day', achieved: ritualCount >= 1 },
    { title: '3-Day Streak', desc: 'Three days of consistency', achieved: streakCount >= 3 },
    { title: 'Weekly Warrior', desc: 'A full week of rituals', achieved: streakCount >= 7 },
    { title: '4 Check-ins', desc: 'Four weeks of hair updates', achieved: checkInCount >= 4 },
    { title: 'Transformation', desc: 'Eight weeks of dedication', achieved: weekNumber >= 8 && checkInCount >= 4 },
  ];

  const achievedCount = milestones.filter((m) => m.achieved).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backArrow}>{'‹'}</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.overline}>YOUR JOURNEY</Text>
              <Text style={styles.title}>Hair Timeline</Text>
            </View>
            <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
          </View>
          <View style={[styles.weekBadge, { backgroundColor: ac.bgDark }]}>
            <CalendarIcon color={ac.text} size={14} />
            <Text style={[styles.weekText, { color: ac.text }]}>Week {weekNumber}</Text>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.stats}>
          <View style={styles.statItem}>
            <CalendarIcon color={ac.accent} size={18} />
            <Text style={[styles.statNum, { color: ac.accent }]}>{weekNumber}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
          <View style={styles.statItem}>
            <SmileIcon color={colors.jewel.emerald} size={18} />
            <Text style={[styles.statNum, { color: colors.jewel.emerald }]}>{checkInCount}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statItem}>
            <CheckCircleIcon color={colors.jewel.indigo} size={18} />
            <Text style={[styles.statNum, { color: colors.jewel.indigo }]}>{ritualCount}</Text>
            <Text style={styles.statLabel}>Rituals</Text>
          </View>
          <View style={styles.statItem}>
            <FireIcon color={streakCount > 0 ? colors.jewel.sienna : colors.muted} size={18} />
            <Text style={[styles.statNum, { color: streakCount > 0 ? colors.jewel.sienna : colors.muted }]}>{streakCount}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </Animated.View>

        {/* Streak Calendar */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionOverline}>LAST 2 WEEKS</Text>
            <Text style={styles.sectionTitle}>Activity</Text>
          </View>
          <StreakCalendar ritualDates={ritualDates} />
        </Animated.View>

        {/* Check-in CTA */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('CheckIn');
            }}
            style={styles.checkinCta}
          >
            <LinearGradient
              colors={[ac.accent, ac.accent + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkinGradient}
            >
              <AuntyAvatar auntyId={auntyId} size={36} showRing />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkinTitle}>Weekly Check-in</Text>
                <Text style={styles.checkinSub}>How's your hair this week?</Text>
              </View>
              <View style={styles.checkinArrow}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18L15 12L9 6" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Milestones */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionOverline}>MILESTONES</Text>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <Text style={[styles.progressCount, { color: ac.accent }]}>{achievedCount}/{milestones.length}</Text>
          </View>
        </View>
        <View style={styles.milestoneList}>
          {milestones.map((m, i) => (
            <MilestoneRow key={i} title={m.title} desc={m.desc} achieved={m.achieved} accentColor={ac.accent} index={i} />
          ))}
        </View>

        {/* Check-in History */}
        {checkIns.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionOverline}>HISTORY</Text>
              <Text style={styles.sectionTitle}>Past Check-ins</Text>
            </View>
            <View style={styles.historyList}>
              {checkIns.map((ci, i) => (
                <Animated.View key={ci.week} entering={FadeInDown.delay(50 + i * 40).duration(300)}>
                  <CheckInHistoryCard weekNum={ci.week} checkIn={ci.data} auntyId={(ci.data.auntyId as AuntyId) || auntyId} />
                </Animated.View>
              ))}
            </View>
          </>
        )}

        {/* Aunty encouragement */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={[styles.quoteCard, { borderColor: ac.accent + '30', backgroundColor: ac.bg }]}>
          <AuntyAvatar auntyId={auntyId} size={36} showRing />
          <View style={{ flex: 1 }}>
            <Text style={[styles.quoteAunty, { color: ac.accent }]}>Aunty {aunty.name}</Text>
            <Text style={[styles.quote, { color: ac.text }]}>"{getAuntyQuoteForSession(auntyId)}"</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  backArrow: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, marginTop: -2 },
  overline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxxl, color: colors.ink, letterSpacing: letterSpacing.tight, marginTop: spacing.xs },
  weekBadge: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: spacing.xs, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, marginTop: spacing.sm },
  weekText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm },

  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  statItem: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', gap: spacing.xs, ...shadows.sm },
  statNum: { fontFamily: fonts.display, fontSize: fontSize.xxl },
  statLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.muted },

  sectionHeader: { paddingHorizontal: spacing.lg, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionOverline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.muted, marginBottom: spacing.xs },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, letterSpacing: letterSpacing.tight },
  progressCount: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm },

  checkinCta: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  checkinGradient: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.xl, padding: spacing.md },
  checkinTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: '#FFFFFF' },
  checkinSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  checkinArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  milestoneList: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },

  historyList: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },

  quoteCard: { flexDirection: 'row', marginHorizontal: spacing.lg, borderWidth: 1, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, alignItems: 'center', marginBottom: spacing.lg },
  quoteAunty: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, marginBottom: spacing.xs },
  quote: { fontFamily: fonts.body, fontSize: fontSize.sm, fontStyle: 'italic', lineHeight: fontSize.sm * 1.5 },
});
