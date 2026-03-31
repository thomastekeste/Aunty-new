import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { routineService } from '@/services/supabase';
import { AUNTIES } from '@/constants/aunties';
import { DailyRoutine } from '@/types';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, auntyColors, spacing, fontSize, fontWeight, radius, fonts, shadows } from '@/constants/theme';
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
const DAY_ICONS: Record<string, string> = {
  wash_day: '💧',
  style_day: '✨',
  refresh_day: '🌿',
  rest_day: '🌙',
};

const WEEK_AUNTY_IDS = ['1', '3', '5', '7'];

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [routine, setRoutine] = useState<{ routine_json: DailyRoutine } | null>(null);
  const greeting = ROTATING_GREETINGS[new Date().getDay() % ROTATING_GREETINGS.length];
  const acColor = auntyColors[greeting.auntyId];

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
      {/* Editorial hero — deep cosmic with decorative elements */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        {/* Subtle decorative glow */}
        <View style={[styles.heroGlow, { backgroundColor: acColor.accent }]} />

        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>{getTimeOfDay()}</Text>
          <Text style={styles.heroName}>{firstName}.</Text>
          <View style={styles.heroRuleRow}>
            <View style={[styles.heroRule, { backgroundColor: acColor.accent }]} />
            <View style={[styles.heroRuleDot, { backgroundColor: acColor.accent }]} />
            <View style={[styles.heroRuleFade, { backgroundColor: acColor.accent }]} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Aunty greeting — bold color card */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.greetingCard, { backgroundColor: acColor.accent }]}
        >
          <View style={styles.greetingInner}>
            <View style={[styles.greetingAvatarRing, { borderColor: 'rgba(255,255,255,0.4)' }]}>
              <AuntyAvatar auntyId={greeting.auntyId} size={52} />
            </View>
            <View style={styles.greetingRight}>
              <Text style={styles.greetingAuntyName}>
                {AUNTIES[greeting.auntyId].name}
              </Text>
              <Text style={styles.greetingAuntyRole}>
                {AUNTIES[greeting.auntyId].title}
              </Text>
            </View>
          </View>
          <View style={styles.greetingQuoteWrap}>
            <Text style={styles.greetingQuoteMark}>"</Text>
            <Text style={styles.greetingText}>{greeting.text}</Text>
          </View>
        </TouchableOpacity>

        {/* Today's Routine */}
        <View style={styles.section}>
          <View style={styles.sectionTop}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionEyebrowRow}>
                <View style={[styles.sectionAccentBar, { backgroundColor: colors.primary }]} />
                <Text style={styles.sectionEyebrow}>Today</Text>
              </View>
              <View style={styles.dayLabelRow}>
                <Text style={styles.dayIcon}>{DAY_ICONS[todayDayKey]}</Text>
                <Text style={styles.sectionTitle}>{DAY_LABELS[todayDayKey]}</Text>
              </View>
            </View>
            {todayRoutine && (
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{todayRoutine.estimated_time_minutes} min</Text>
              </View>
            )}
          </View>
          <View style={styles.sectionDivider} />

          {todayRoutine ? (
            <>
              {todayRoutine.steps.slice(0, 3).map((step, idx) => (
                <View key={step.step_number} style={styles.stepRow}>
                  <View style={[styles.stepNumBadge, idx === 0 && { backgroundColor: colors.primary }]}>
                    <Text style={[styles.stepNumText, idx === 0 && { color: 'rgba(0,0,0,0.65)' }]}>
                      {step.step_number}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepName}>{step.name}</Text>
                    <Text style={styles.stepDesc} numberOfLines={2}>{step.description}</Text>
                  </View>
                </View>
              ))}
              {todayRoutine.steps.length > 3 && (
                <TouchableOpacity
                  style={styles.moreStepsRow}
                  onPress={() => navigation.navigate('Routine')}
                  activeOpacity={0.7}
                >
                  <View style={styles.moreStepsDot} />
                  <Text style={styles.moreSteps}>{todayRoutine.steps.length - 3} more steps — see full routine</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Complete your onboarding to unlock your personalized routine.
              </Text>
            </View>
          )}
        </View>

        {/* Journey tracker */}
        <View style={styles.section}>
          <View style={styles.sectionEyebrowRow}>
            <View style={[styles.sectionAccentBar, { backgroundColor: colors.accent }]} />
            <Text style={styles.sectionEyebrow}>Your Journey</Text>
          </View>
          <Text style={styles.sectionTitle}>4-Week Cycle</Text>
          <View style={styles.sectionDivider} />
          <View style={styles.weekStrip}>
            {(['1', '2', '3', '4'] as const).map((w, i) => {
              const weekAuntyId = WEEK_AUNTY_IDS[i];
              const weekAccent = auntyColors[weekAuntyId]?.accent ?? colors.primary;
              const isActive = i === 0;
              return (
                <View
                  key={i}
                  style={[
                    styles.weekBlock,
                    isActive
                      ? { backgroundColor: weekAccent, borderColor: weekAccent }
                      : { borderColor: colors.borderLight },
                  ]}
                >
                  {isActive && <View style={styles.weekActiveDot} />}
                  <Text style={[styles.weekLabel, isActive && styles.weekLabelActive]}>WK</Text>
                  <Text style={[styles.weekNum, isActive && { color: 'rgba(0,0,0,0.6)' }]}>{w}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Check-in CTA — bold cosmic card */}
        <TouchableOpacity
          style={styles.checkinBtn}
          onPress={() => navigation.navigate('CheckinModal', { auntyId: '1', userInitiated: true })}
          activeOpacity={0.82}
        >
          {/* Decorative orb layers */}
          <View style={styles.checkinOrb1} />
          <View style={styles.checkinOrb2} />

          <View style={styles.checkinLeft}>
            <View style={styles.checkinPill}>
              <Text style={styles.checkinPillText}>The council is ready</Text>
            </View>
            <Text style={styles.checkinTitle}>Check in now</Text>
            <Text style={styles.checkinSub}>Track your progress with the aunties</Text>
          </View>
          <View style={styles.checkinAvatars}>
            {['1', '2', '3'].map((id, i) => (
              <View
                key={id}
                style={[
                  styles.checkinAvatar,
                  { marginLeft: i === 0 ? 0 : -14, borderColor: auntyColors[id].accent },
                ]}
              >
                <AuntyAvatar auntyId={id} size={38} />
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

  // Hero — warm dark
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.08,
  },
  heroContent: { position: 'relative' },
  heroEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(254,248,236,0.5)',
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 3.5,
    marginBottom: spacing.xs,
  },
  heroName: {
    fontFamily: fonts.display,
    fontSize: 64,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -3,
    lineHeight: 64,
  },
  heroRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  heroRule: {
    width: 48,
    height: 3,
    borderRadius: 2,
  },
  heroRuleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  heroRuleFade: {
    width: 20,
    height: 3,
    borderRadius: 2,
    opacity: 0.3,
  },

  content: { padding: spacing.md, gap: spacing.md },

  // Greeting card — full aunty color background
  greetingCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  greetingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  greetingAvatarRing: {
    borderRadius: 30,
    borderWidth: 2,
    padding: 2,
  },
  greetingRight: { flex: 1 },
  greetingAuntyName: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: 'rgba(0,0,0,0.75)',
    letterSpacing: -0.2,
  },
  greetingAuntyRole: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(0,0,0,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  greetingQuoteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  greetingQuoteMark: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 24,
    fontWeight: fontWeight.black,
    color: 'rgba(0,0,0,0.4)',
    marginTop: -2,
  },
  greetingText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: 'rgba(0,0,0,0.72)',
    lineHeight: 24,
    flex: 1,
  },

  // Sections
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitleGroup: { flex: 1 },
  sectionEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  sectionAccentBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  sectionEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  timeBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  timeBadgeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(0,0,0,0.65)',
    fontWeight: fontWeight.black,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm + 2,
    alignItems: 'flex-start',
  },
  stepNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNumText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.muted,
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
  moreStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingVertical: 2,
  },
  moreStepsDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  moreSteps: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
  emptyState: {
    paddingVertical: spacing.md,
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
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  weekActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  weekLabel: {
    fontFamily: fonts.body,
    fontSize: 8,
    fontWeight: fontWeight.black,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  weekLabelActive: { color: 'rgba(0,0,0,0.45)' },
  weekNum: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.muted,
    letterSpacing: -0.5,
  },

  // Check-in CTA — deep cosmic card
  checkinBtn: {
    backgroundColor: colors.wine,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(155,93,229,0.2)',
    ...shadows.lg,
  },
  checkinOrb1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.purple,
    opacity: 0.25,
  },
  checkinOrb2: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.carmen,
    opacity: 0.12,
  },
  checkinLeft: { flex: 1 },
  checkinPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  checkinPillText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(254,248,236,0.6)',
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  checkinTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -0.8,
  },
  checkinSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(254,248,236,0.4)',
    marginTop: 4,
  },
  checkinAvatars: { flexDirection: 'row', alignItems: 'center' },
  checkinAvatar: {
    borderWidth: 2.5,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
});
