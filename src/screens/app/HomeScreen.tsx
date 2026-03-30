import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { routineService } from '@/services/supabase';
import { AUNTIES } from '@/constants/aunties';
import { DailyRoutine } from '@/types';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, auntyColors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';
import { AUNTY_COLORS } from '@/constants/aunties';

const ROTATING_GREETINGS: Array<{ auntyId: string; text: string }> = [
  { auntyId: '1', text: 'Moisture is not optional, baby.' },
  { auntyId: '2', text: 'How are those roots feeling today?' },
  { auntyId: '3', text: "Your retention matters. Don't sleep on it." },
  { auntyId: '4', text: 'Technique is everything. Stay consistent.' },
  { auntyId: '5', text: 'Mija, your curls are a gift. Treat them right.' },
  { auntyId: '6', text: 'Strong roots, strong hair. Keep going, love.' },
  { auntyId: '7', text: 'Nature gave us everything we need.' },
];

const DAY_KEYS = ['wash_day', 'style_day', 'refresh_day', 'rest_day'] as const;
const DAY_LABELS: Record<string, string> = {
  wash_day: 'Wash Day',
  style_day: 'Style Day',
  refresh_day: 'Refresh Day',
  rest_day: 'Rest Day',
};

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [routine, setRoutine] = useState<{ routine_json: DailyRoutine } | null>(null);
  const greeting = ROTATING_GREETINGS[new Date().getDay() % ROTATING_GREETINGS.length];
  const auntyColor = AUNTY_COLORS[greeting.auntyId] ?? colors.amber;

  useEffect(() => {
    if (user?.id && !user.id.startsWith('demo-')) {
      routineService.get(user.id).then(setRoutine).catch(console.error);
    }
  }, [user?.id]);

  const todayDayKey = DAY_KEYS[new Date().getDay() % 4];
  const todayRoutine = routine?.routine_json?.[todayDayKey];
  const firstName = user?.name?.split(' ')[0] ?? 'friend';

  return (
    <View style={styles.root}>
      {/* Dark editorial header */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.heroEyebrow}>{getTimeOfDay()}</Text>
        <Text style={styles.heroName}>{firstName}.</Text>
        {/* Amber signature rule */}
        <View style={styles.heroRule} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Aunty greeting — aunty's signature color as left border */}
        <View style={[styles.greetingCard, { borderLeftColor: auntyColor }]}>
          <AuntyAvatar auntyId={greeting.auntyId} size={48} />
          <View style={styles.greetingRight}>
            <Text style={[styles.greetingAuntyName, { color: auntyColor }]}>
              {AUNTIES[greeting.auntyId].name.toUpperCase()} · {AUNTIES[greeting.auntyId].region}
            </Text>
            <Text style={styles.greetingText}>"{greeting.text}"</Text>
          </View>
        </View>

        {/* Today */}
        <View style={styles.section}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionEyebrow}>Today</Text>
            {todayRoutine && (
              <Text style={styles.sectionMeta}>{todayRoutine.estimated_time_minutes} min</Text>
            )}
          </View>
          <Text style={styles.sectionTitle}>{DAY_LABELS[todayDayKey]}</Text>
          <View style={styles.sectionDivider} />

          {todayRoutine ? (
            <>
              {todayRoutine.steps.slice(0, 3).map(step => (
                <View key={step.step_number} style={styles.stepRow}>
                  <Text style={styles.stepNum}>{String(step.step_number).padStart(2, '0')}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepName}>{step.name}</Text>
                    <Text style={styles.stepDesc} numberOfLines={2}>{step.description}</Text>
                  </View>
                </View>
              ))}
              {todayRoutine.steps.length > 3 && (
                <Text style={styles.moreSteps}>{todayRoutine.steps.length - 3} more steps</Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>
              Complete your onboarding to unlock your personalized routine.
            </Text>
          )}
        </View>

        {/* Journey */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Your Journey</Text>
          <Text style={styles.sectionTitle}>Week by week</Text>
          <View style={styles.sectionDivider} />
          <View style={styles.weekStrip}>
            {['1', '2', '3', '4'].map((w, i) => (
              <View key={i} style={[styles.weekBlock, i === 0 && styles.weekBlockActive]}>
                <Text style={[styles.weekLabel, i === 0 && styles.weekLabelActive]}>Week</Text>
                <Text style={[styles.weekNum, i === 0 && styles.weekNumActive]}>{w}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Check-in CTA */}
        <TouchableOpacity
          style={styles.checkinBtn}
          onPress={() => navigation.navigate('CheckinModal', { auntyId: '1', userInitiated: true })}
          activeOpacity={0.85}
        >
          <View style={styles.checkinLeft}>
            <Text style={styles.checkinEyebrow}>The council is ready</Text>
            <Text style={styles.checkinTitle}>Check in now</Text>
          </View>
          <View style={styles.checkinAvatars}>
            {['1', '2', '3'].map((id, i) => (
              <View key={id} style={[styles.checkinAvatar, { marginLeft: i === 0 ? 0 : -12, borderColor: AUNTY_COLORS[id] }]}>
                <AuntyAvatar auntyId={id} size={34} />
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  // Dark editorial hero
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.amberLight,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  heroName: {
    fontFamily: fonts.display,
    fontSize: 58,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -2,
    lineHeight: 60,
  },
  heroRule: {
    marginTop: spacing.md,
    height: 3,
    width: 48,
    backgroundColor: colors.amber,
    borderRadius: 2,
  },

  content: { padding: spacing.md, gap: spacing.md },

  // Aunty greeting with left-border signature
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingRight: { flex: 1 },
  greetingAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  greetingText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },

  // Sections
  section: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.amber,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  stepNum: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.amberLight,
    lineHeight: 26,
    width: 32,
  },
  stepName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    lineHeight: 18,
  },
  moreSteps: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.amber,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 22,
  },

  // Week strip
  weekStrip: { flexDirection: 'row', gap: spacing.sm },
  weekBlock: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekBlockActive: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  weekLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: fontWeight.black,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weekLabelActive: { color: colors.canvas },
  weekNum: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.muted,
  },
  weekNumActive: { color: colors.canvas },

  // Check-in
  checkinBtn: {
    backgroundColor: colors.wine,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkinLeft: {},
  checkinEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.wineLight,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  checkinTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.canvas,
  },
  checkinAvatars: { flexDirection: 'row', alignItems: 'center' },
  checkinAvatar: { borderWidth: 2, borderRadius: 20 },
});
