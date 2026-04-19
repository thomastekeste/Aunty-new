/**
 * EditProfileScreen — Edit hair profile fields.
 *
 * Pulls from OnboardingContext, lets user update each HairProfile field,
 * and saves via updateHairProfile().
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
  auntyColors,
  shadows,
} from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import type {
  CurlType,
  Porosity,
  Density,
  PrimaryGoal,
  HeatUse,
  HairProfile,
} from '../../types';
import type { AuntyId } from '../../constants/aunties';

// ─── Option groups ───────────────────────────────────────────────

const CURL_TYPES: CurlType[] = ['2a','2b','2c','3a','3b','3c','4a','4b','4c'];
const CURL_TYPE_LABELS: Record<CurlType, string> = {
  '2a': '2a – Loose waves',
  '2b': '2b – Defined waves',
  '2c': '2c – Wavy-curly',
  '3a': '3a – Loose curls',
  '3b': '3b – Springy curls',
  '3c': '3c – Tight curls',
  '4a': '4a – Soft coils',
  '4b': '4b – Z-pattern coils',
  '4c': '4c – Tight coils',
};

const POROSITY_OPTIONS: Porosity[] = ['low', 'normal', 'high'];
const POROSITY_LABELS: Record<Porosity, string> = {
  low: 'Low — products sit on top',
  normal: 'Normal — balanced moisture',
  high: 'High — absorbs & loses moisture fast',
};

const DENSITY_OPTIONS: Density[] = ['thin', 'medium', 'thick'];
const DENSITY_LABELS: Record<Density, string> = {
  thin: 'Thin — can see scalp easily',
  medium: 'Medium — average coverage',
  thick: 'Thick — dense, voluminous',
};

const GOALS: PrimaryGoal[] = [
  'moisture', 'growth', 'definition', 'damage-repair',
  'scalp-health', 'simplify-routine', 'transition',
];
const GOAL_LABELS: Record<PrimaryGoal, string> = {
  moisture: '💧 Moisture & hydration',
  growth: '🌱 Length retention & growth',
  definition: '✨ Curl definition',
  'damage-repair': '🔧 Damage repair',
  'scalp-health': '🌿 Scalp health',
  'simplify-routine': '⚡ Simplify routine',
  transition: '🔄 Transitioning to natural',
};

const HEAT_OPTIONS: HeatUse[] = ['never', 'rarely', 'monthly', 'weekly', 'daily'];
const HEAT_LABELS: Record<HeatUse, string> = {
  never: 'Never',
  rarely: 'Rarely',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
};

// ─── Small helpers ───────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function OptionRow<T extends string>({
  options,
  labels,
  selected,
  onSelect,
  accent,
}: {
  options: T[];
  labels: Record<T, string>;
  selected?: T;
  onSelect: (v: T) => void;
  accent: string;
}) {
  return (
    <View style={styles.optionList}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <Pressable
            key={opt}
            style={[styles.optionPill, active && { backgroundColor: accent + '18', borderColor: accent }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelect(opt); }}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
          >
            <Text style={[styles.optionPillText, active && { color: accent, fontFamily: fonts.bodySemiBold }]}>
              {labels[opt]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderLight, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : colors.muted}
      />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, updateHairProfile } = useOnboarding();

  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];
  const profile = state.data.hairProfile;

  // Local editable copy
  const [draft, setDraft] = useState<HairProfile>({ ...profile });

  const set = useCallback(<K extends keyof HairProfile>(key: K, val: HairProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateHairProfile(draft);
    Alert.alert('Updated!', 'Your hair profile has been saved.', [
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  }, [draft, updateHairProfile, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Edit Hair Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Curl Type */}
        <SectionTitle label="Curl Type" />
        <OptionRow
          options={CURL_TYPES}
          labels={CURL_TYPE_LABELS}
          selected={draft.curlType}
          onSelect={(v) => set('curlType', v)}
          accent={ac.accent}
        />

        {/* Porosity */}
        <SectionTitle label="Porosity" />
        <OptionRow
          options={POROSITY_OPTIONS}
          labels={POROSITY_LABELS}
          selected={draft.porosity}
          onSelect={(v) => set('porosity', v)}
          accent={ac.accent}
        />

        {/* Density */}
        <SectionTitle label="Hair Density" />
        <OptionRow
          options={DENSITY_OPTIONS}
          labels={DENSITY_LABELS}
          selected={draft.density}
          onSelect={(v) => set('density', v)}
          accent={ac.accent}
        />

        {/* Primary Goal */}
        <SectionTitle label="Primary Goal" />
        <OptionRow
          options={GOALS}
          labels={GOAL_LABELS}
          selected={draft.primaryGoal}
          onSelect={(v) => set('primaryGoal', v)}
          accent={ac.accent}
        />

        {/* Heat Use */}
        <SectionTitle label="Heat Use" />
        <OptionRow
          options={HEAT_OPTIONS}
          labels={HEAT_LABELS}
          selected={draft.heatUse}
          onSelect={(v) => set('heatUse', v)}
          accent={ac.accent}
        />

        {/* Toggles */}
        <SectionTitle label="Hair History" />
        <View style={styles.toggleBlock}>
          <ToggleRow
            label="Color treated"
            value={!!draft.colorTreated}
            onChange={(v) => set('colorTreated', v)}
          />
          <ToggleRow
            label="Protective styling"
            value={!!draft.protectiveStyling}
            onChange={(v) => set('protectiveStyling', v)}
          />
          <ToggleRow
            label="Relaxer history"
            value={!!draft.relaxerHistory}
            onChange={(v) => set('relaxerHistory', v)}
          />
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: ac.accent }]}
          onPress={handleSave}
          accessibilityRole="button"
        >
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  navTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.widest,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionPill: {
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  optionPillText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  toggleBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  toggleLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.sm,
  },
  saveBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.wide,
  },
});
