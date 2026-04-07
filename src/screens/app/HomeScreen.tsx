/**
 * HomeScreen — Today's ritual is the hero. Everything actionable.
 *
 * Compact greeting + aunty avatar top bar.
 * Today's ritual card front and center.
 * Week progress dots. Quick questions. Check-in when due.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

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
import { AUNTIES, type AuntyId } from '../../constants/aunties';
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

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state: ob, reset } = useOnboarding();
  const auntyId: AuntyId = ob.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const name = ob.data.name || 'Queen';
  const dayOfWeek = new Date().getDay();
  const today = DAILY_RITUAL[dayOfWeek];
  const todayColor = TYPE_COLORS[today.type];

  const [weekNumber, setWeekNumber] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const d = await AsyncStorage.getItem('onboarding_completed_at');
        if (d) {
          const diff = Date.now() - new Date(d).getTime();
          setWeekNumber(Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
        }
      } catch {}
    })();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>

        {/* ─── Top bar: greeting + avatar ──────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {name}</Text>
            <Text style={styles.greetingSub}>Week {weekNumber} of your journey</Text>
          </View>
          <AuntyAvatar auntyId={auntyId} size={44} showRing />
        </Animated.View>

        {/* ─── Today's Ritual (THE HERO) ───────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.ritualCard, { borderLeftColor: todayColor }]}>
            <Text style={styles.ritualOverline}>TODAY'S RITUAL</Text>
            <View style={styles.ritualHeader}>
              <View style={[styles.ritualDot, { backgroundColor: todayColor }]} />
              <Text style={styles.ritualLabel}>{today.label}</Text>
              <View style={[styles.timePill, { backgroundColor: todayColor + '18' }]}>
                <Text style={[styles.timeText, { color: todayColor }]}>{today.time}</Text>
              </View>
            </View>
            <Text style={styles.ritualPurpose}>{today.purpose}</Text>
            <Button
              label="Start Today's Ritual"
              onPress={() => navigation.navigate('RitualSteps')}
              variant="primary"
              size="md"
            />
          </View>
        </Animated.View>

        {/* ─── Week Progress ───────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.weekSection}>
          <Text style={styles.weekLabel}>THIS WEEK</Text>
          <View style={styles.weekDots}>
            {DAY_LABELS.map((d, i) => {
              const isToday = i === dayOfWeek;
              const isPast = i < dayOfWeek;
              const dayRitual = DAILY_RITUAL[i];
              const dc = TYPE_COLORS[dayRitual.type];
              return (
                <View key={i} style={styles.weekDotCol}>
                  <View style={[
                    styles.weekDot,
                    { backgroundColor: isPast ? dc : 'transparent', borderColor: isToday ? dc : colors.border },
                    isToday && { borderWidth: 2.5, borderColor: dc },
                  ]} />
                  <Text style={[styles.weekDotLabel, isToday && { color: colors.ink, fontFamily: fonts.bodySemiBold }]}>{d}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ─── Ask Aunty ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionOverline}>ASK {aunty.name.toUpperCase()}</Text>
          <View style={styles.chips}>
            {QUICK_QUESTIONS[auntyId].map((q, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Chat');
                }}
                style={[styles.chip, { borderColor: ac.accent, backgroundColor: ac.bg }]}
              >
                <Text style={[styles.chipText, { color: ac.text }]}>{q}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ─── Check-in (only if relevant) ─────────────── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <LinearGradient colors={[...gradients.dark]} style={styles.checkinCard}>
            <View style={styles.checkinRow}>
              <AuntyAvatar auntyId={auntyId} size={40} showRing />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkinTitle}>Weekly Check-in</Text>
                <Text style={styles.checkinSub}>How's your hair this week?</Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('CheckIn');
              }}
              style={styles.checkinBtn}
            >
              <LinearGradient colors={[...gradients.gold]} style={styles.checkinBtnGradient}>
                <Text style={styles.checkinBtnText}>Check In</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* Dev reset */}
        <Pressable
          onPress={async () => { await AsyncStorage.clear(); ob.isComplete && reset(); }}
          style={styles.resetBtn}
        >
          <Text style={styles.resetText}>Sign Out & Reset</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  greeting: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, letterSpacing: letterSpacing.tight },
  greetingSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },

  // Today's ritual hero
  ritualCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  ritualOverline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary },
  ritualHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ritualDot: { width: 10, height: 10, borderRadius: 5 },
  ritualLabel: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.ink, flex: 1, letterSpacing: letterSpacing.tight },
  timePill: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  timeText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  ritualPurpose: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.inkLight, lineHeight: fontSize.md * 1.4 },

  // Week progress
  weekSection: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  weekLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.muted, marginBottom: spacing.sm },
  weekDots: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDotCol: { alignItems: 'center', gap: 4 },
  weekDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5 },
  weekDotLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },

  // Ask aunty
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionOverline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, minHeight: 44, justifyContent: 'center' },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm },

  // Check-in
  checkinCard: { marginHorizontal: spacing.lg, marginTop: spacing.xl, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  checkinRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkinTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.dark.text },
  checkinSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted },
  checkinBtn: { borderRadius: radius.md, overflow: 'hidden' },
  checkinBtnGradient: { paddingVertical: spacing.sm + 2, alignItems: 'center', borderRadius: radius.md },
  checkinBtnText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink },

  // Dev
  resetBtn: { marginTop: spacing.xxl, marginHorizontal: spacing.lg, marginBottom: spacing.lg, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error, borderRadius: radius.md },
  resetText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.error },
});
