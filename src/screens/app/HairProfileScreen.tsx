/**
 * HairProfileScreen — View your complete hair profile.
 *
 * Modal screen showing all hair attributes collected during onboarding.
 * Matches the warm editorial aesthetic of SettingsScreen.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  typography,
  letterSpacing,
} from '../../constants/theme';

// ─── Label Maps ─────────────────────────────────────────────────

const CURL_TYPE_LABELS: Record<string, string> = {
  '2a': '2A — Loose Waves',
  '2b': '2B — Defined Waves',
  '2c': '2C — Deep Waves',
  '3a': '3A — Loose Curls',
  '3b': '3B — Springy Curls',
  '3c': '3C — Tight Curls',
  '4a': '4A — Coily S-Pattern',
  '4b': '4B — Z-Pattern Coils',
  '4c': '4C — Tight Coils',
};

const POROSITY_LABELS: Record<string, string> = {
  low: 'Low Porosity',
  normal: 'Normal Porosity',
  high: 'High Porosity',
};

const DENSITY_LABELS: Record<string, string> = {
  thin: 'Thin / Fine',
  medium: 'Medium',
  thick: 'Thick / Dense',
};

const ELASTICITY_LABELS: Record<string, string> = {
  low: 'Low Elasticity',
  normal: 'Normal Elasticity',
  high: 'High Elasticity',
};

const GOAL_LABELS: Record<string, string> = {
  moisture: 'Moisture',
  growth: 'Growth',
  definition: 'Definition',
  'damage-repair': 'Damage Repair',
  'scalp-health': 'Scalp Health',
  'simplify-routine': 'Simplify Routine',
  transition: 'Transition',
};

const WASH_LABELS: Record<string, string> = {
  daily: 'Daily',
  'every-other': 'Every Other Day',
  'twice-weekly': 'Twice a Week',
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
};

const HEAT_LABELS: Record<string, string> = {
  never: 'Never',
  rarely: 'Rarely',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
};

const SCOPE_LABELS: Record<string, string> = {
  basics: 'Just the Basics',
  routine: 'Full Routine',
  full: 'Full Collection',
  everything: 'Everything',
};

const BUDGET_LABELS: Record<string, string> = {
  'under-30': 'Under $30',
  '30-60': '$30 - $60',
  '60-100': '$60 - $100',
  '100-plus': '$100+',
};

// ─── Section Components ─────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>;
}

function ProfileRow({ label, value, rawValue }: { label: string; value?: string; rawValue?: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || rawValue || 'Not set'}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Main Screen ────────────────────────────────────────────────

export default function HairProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { state, reset } = useOnboarding();
  const { hairProfile: hp, name, chosenAuntyId } = state.data;
  const auntyId: AuntyId = chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const handleRetakeQuiz = useCallback(() => {
    Alert.alert(
      'Retake Hair Quiz',
      'This will restart your onboarding. Your current profile will be replaced with new answers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake Quiz',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            reset();
          },
        },
      ],
    );
  }, [reset]);

  const goalsDisplay = [
    hp.primaryGoal ? GOAL_LABELS[hp.primaryGoal] : null,
    ...(hp.secondaryGoals || []).map((g) => GOAL_LABELS[g]),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>{'\u2039'}</Text>
          </Pressable>
          <Text style={[typography.h2]}>Hair Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ─── Aunty Card ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.auntyCard, shadows.sm, { borderColor: ac.accent + '30' }]}>
            <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
            <View style={{ flex: 1 }}>
              <Text style={styles.auntyName}>{aunty.name}</Text>
              <Text style={styles.auntyNote}>
                {name ? `${name}'s hair profile` : 'Your hair profile'} — curated by {aunty.name}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ─── Hair Type ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="Hair Type" />
          <View style={[styles.card, shadows.sm]}>
            <ProfileRow label="Curl Type" value={hp.curlType ? CURL_TYPE_LABELS[hp.curlType] : undefined} rawValue={hp.curlType} />
            <Divider />
            <ProfileRow label="Porosity" value={hp.porosity ? POROSITY_LABELS[hp.porosity] : undefined} rawValue={hp.porosity} />
            <Divider />
            <ProfileRow label="Density" value={hp.density ? DENSITY_LABELS[hp.density] : undefined} rawValue={hp.density} />
            <Divider />
            <ProfileRow label="Elasticity" value={hp.elasticity ? ELASTICITY_LABELS[hp.elasticity] : undefined} rawValue={hp.elasticity} />
          </View>
        </Animated.View>

        {/* ─── Hair History ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <SectionHeader title="Hair History" />
          <View style={[styles.card, shadows.sm]}>
            <ProfileRow label="Relaxer History" value={hp.relaxerHistory == null ? undefined : hp.relaxerHistory ? 'Yes' : 'No'} />
            <Divider />
            <ProfileRow label="Color Treated" value={hp.colorTreated == null ? undefined : hp.colorTreated ? 'Yes' : 'No'} />
            <Divider />
            <ProfileRow label="Protective Styling" value={hp.protectiveStyling == null ? undefined : hp.protectiveStyling ? 'Yes' : 'No'} />
          </View>
        </Animated.View>

        {/* ─── Goals ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SectionHeader title="Goals" />
          <View style={[styles.card, shadows.sm]}>
            <ProfileRow label="Primary Goal" value={hp.primaryGoal ? GOAL_LABELS[hp.primaryGoal] : undefined} rawValue={hp.primaryGoal} />
            {hp.secondaryGoals && hp.secondaryGoals.length > 0 && (
              <>
                <Divider />
                <ProfileRow label="Other Goals" value={hp.secondaryGoals.map((g) => GOAL_LABELS[g] || g).join(', ')} />
              </>
            )}
          </View>
        </Animated.View>

        {/* ─── Routine ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <SectionHeader title="Routine" />
          <View style={[styles.card, shadows.sm]}>
            <ProfileRow label="Wash Frequency" value={hp.washFrequency ? WASH_LABELS[hp.washFrequency] : undefined} rawValue={hp.washFrequency} />
            <Divider />
            <ProfileRow label="Heat Use" value={hp.heatUse ? HEAT_LABELS[hp.heatUse] : undefined} rawValue={hp.heatUse} />
            {hp.timeAvailable && (
              <>
                <Divider />
                <ProfileRow label="Time Available" value={hp.timeAvailable.replace('-', ' ').replace('plus', '+')} />
              </>
            )}
          </View>
        </Animated.View>

        {/* ─── Budget ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <SectionHeader title="Budget" />
          <View style={[styles.card, shadows.sm]}>
            <ProfileRow label="Product Scope" value={hp.productScope ? SCOPE_LABELS[hp.productScope] : undefined} rawValue={hp.productScope} />
            <Divider />
            <ProfileRow label="Budget Range" value={hp.productBudget ? BUDGET_LABELS[hp.productBudget] : undefined} rawValue={hp.productBudget} />
          </View>
        </Animated.View>

        {/* ─── Retake Quiz CTA ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.retakeWrap}>
          <Button
            label="Retake Hair Quiz"
            onPress={handleRetakeQuiz}
            variant="secondary"
            size="lg"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backArrow: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginTop: -2,
  },

  auntyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  auntyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  auntyNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 1,
  },

  sectionHeader: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  rowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  rowValue: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'right',
    maxWidth: '55%',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },

  retakeWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
