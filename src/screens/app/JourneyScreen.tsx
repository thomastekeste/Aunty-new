/**
 * JourneyScreen — Your hair transformation timeline.
 *
 * Purpose: Track progress over time. See how far you've come.
 * Weekly check-ins, milestones, and stats.
 * Single aunty companion throughout.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import { AUNTIES } from '../../constants/aunties';
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

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

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
        <View style={styles.header}>
          <Text style={styles.overline}>YOUR JOURNEY</Text>
          <Text style={styles.title}>Hair Timeline</Text>
          <View style={[styles.weekBadge, { backgroundColor: ac.bgDark }]}>
            <Text style={[styles.weekText, { color: ac.text }]}>Week {weekNumber}</Text>
          </View>
        </View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.stats}>
          {[
            { num: `${weekNumber}`, label: 'Weeks' },
            { num: '0', label: 'Check-ins' },
            { num: '0', label: 'Rituals' },
            { num: '0', label: 'Streak' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statNum, { color: ac.accent }]}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Check-in CTA */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.checkinCard}>
          <View style={styles.checkinRow}>
            <AuntyAvatar auntyId={auntyId} size={40} showRing />
            <View style={{ flex: 1 }}>
              <Text style={styles.checkinTitle}>Weekly Check-in</Text>
              <Text style={styles.checkinSub}>How's your hair this week?</Text>
            </View>
          </View>
          <Button label="Check In Now" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); navigation.navigate('CheckIn'); }} variant="primary" size="md" />
        </Animated.View>

        {/* Milestones */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {[
            { title: 'First Wash Day', desc: 'Complete your first ritual', week: 1 },
            { title: 'Week 1 Done', desc: 'Finish all rituals this week', week: 1 },
            { title: 'First Check-in', desc: 'Tell your aunty how it went', week: 1 },
            { title: '4 Week Streak', desc: 'Four weeks of consistency', week: 4 },
            { title: 'Transformation', desc: 'Compare week 1 and week 8', week: 8 },
          ].map((m, i) => (
            <View key={i} style={[styles.milestone, { borderLeftColor: colors.border }]}>
              <View style={[styles.milestoneNum, { backgroundColor: colors.border }]}>
                <Text style={styles.milestoneNumText}>{m.week}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.milestoneTitle, { color: colors.muted }]}>{m.title}</Text>
                <Text style={styles.milestoneDesc}>{m.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Empty state */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.empty}>
          <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
          <Text style={styles.emptyTitle}>Your journey starts now</Text>
          <Text style={styles.emptyText}>
            Complete your first week and check in. {aunty.name} will track every milestone with you.
          </Text>
        </Animated.View>

        {/* Aunty quote */}
        <Animated.View entering={FadeInDown.delay(600)} style={[styles.quoteCard, { borderColor: ac.accent + '30' }]}>
          <Text style={[styles.quote, { color: ac.accent }]}>"{aunty.quote}"</Text>
          <Text style={styles.quoteAttrib}>— {aunty.name}</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  overline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxxl, color: colors.ink, letterSpacing: letterSpacing.tight, marginTop: spacing.xs },
  weekBadge: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm },
  weekText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm },

  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  statItem: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  statNum: { fontFamily: fonts.display, fontSize: fontSize.xxl },
  statLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted, marginTop: 2 },

  checkinCard: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, ...shadows.sm, marginBottom: spacing.lg },
  checkinRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkinTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink },
  checkinSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.ink, marginBottom: spacing.md },

  milestone: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 3, marginBottom: spacing.sm, ...shadows.sm },
  milestoneNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  milestoneNumText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: '#fff' },
  milestoneTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md },
  milestoneDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted, marginTop: 1 },

  empty: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.ink },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, textAlign: 'center', lineHeight: fontSize.sm * 1.5 },

  quoteCard: { marginHorizontal: spacing.lg, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center' },
  quote: { fontFamily: fonts.body, fontSize: fontSize.md, textAlign: 'center', fontStyle: 'italic', lineHeight: fontSize.md * 1.5 },
  quoteAttrib: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.sm },
});
