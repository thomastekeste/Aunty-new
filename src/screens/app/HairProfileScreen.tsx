/**
 * HairProfileScreen — View & edit your complete hair profile.
 *
 * Tap any row to edit it via an inline picker. Changes save instantly
 * through OnboardingContext (auto-persisted to AsyncStorage).
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import type { HairProfile } from '../../types';
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

const BOOLEAN_LABELS: Record<string, string> = {
  true: 'Yes',
  false: 'No',
};

// ─── Picker field config ────────────────────────────────────────

interface FieldConfig {
  key: keyof HairProfile;
  label: string;
  labels: Record<string, string>;
  isBoolean?: boolean;
}

// ─── Section / Row Components ───────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>;
}

function PencilIcon() {
  return (
    <Text style={styles.editIcon}>{'✎'}</Text>
  );
}

function EditableRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.profileRow}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
      accessibilityHint="Tap to change"
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || 'Not set'}</Text>
      </View>
      <PencilIcon />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Picker Modal ───────────────────────────────────────────────

function PickerModal({
  visible,
  title,
  options,
  currentValue,
  onSelect,
  onClose,
  accentColor,
}: {
  visible: boolean;
  title: string;
  options: { key: string; label: string }[];
  currentValue?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  accentColor: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.key}
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item.key === currentValue;
              return (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelect(item.key);
                  }}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: accentColor + '15', borderColor: accentColor },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && { color: accentColor, fontFamily: fonts.bodySemiBold },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Text style={[styles.checkmark, { color: accentColor }]}>{'✓'}</Text>
                  )}
                </Pressable>
              );
            }}
          />
          <Pressable onPress={onClose} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ────────────────────────────────────────────────

export default function HairProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { state, updateHairProfile, reset } = useOnboarding();
  const { hairProfile: hp, name, chosenAuntyId } = state.data;
  const auntyId: AuntyId = chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [pickerField, setPickerField] = useState<FieldConfig | null>(null);

  const openPicker = useCallback((field: FieldConfig) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPickerField(field);
  }, []);

  const handleSelect = useCallback(
    (key: string) => {
      if (!pickerField) return;
      const val = pickerField.isBoolean ? key === 'true' : key;
      updateHairProfile({ [pickerField.key]: val } as Partial<HairProfile>);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPickerField(null);
    },
    [pickerField, updateHairProfile],
  );

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

  const pickerOptions = useMemo(() => {
    if (!pickerField) return [];
    return Object.entries(pickerField.labels).map(([key, label]) => ({ key, label }));
  }, [pickerField]);

  const pickerCurrentValue = useMemo(() => {
    if (!pickerField) return undefined;
    const raw = hp[pickerField.key];
    if (pickerField.isBoolean) return raw == null ? undefined : String(raw);
    return raw as string | undefined;
  }, [pickerField, hp]);

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
            <Text style={styles.backArrow}>{'‹'}</Text>
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
                Tap any row to update your profile
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ─── Hair Type ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="Hair Type" />
          <View style={[styles.card, shadows.sm]}>
            <EditableRow
              label="Curl Type"
              value={hp.curlType ? CURL_TYPE_LABELS[hp.curlType] : undefined}
              onPress={() => openPicker({ key: 'curlType', label: 'Curl Type', labels: CURL_TYPE_LABELS })}
            />
            <Divider />
            <EditableRow
              label="Porosity"
              value={hp.porosity ? POROSITY_LABELS[hp.porosity] : undefined}
              onPress={() => openPicker({ key: 'porosity', label: 'Porosity', labels: POROSITY_LABELS })}
            />
            <Divider />
            <EditableRow
              label="Density"
              value={hp.density ? DENSITY_LABELS[hp.density] : undefined}
              onPress={() => openPicker({ key: 'density', label: 'Density', labels: DENSITY_LABELS })}
            />
            <Divider />
            <EditableRow
              label="Elasticity"
              value={hp.elasticity ? ELASTICITY_LABELS[hp.elasticity] : undefined}
              onPress={() => openPicker({ key: 'elasticity', label: 'Elasticity', labels: ELASTICITY_LABELS })}
            />
          </View>
        </Animated.View>

        {/* ─── Hair History ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <SectionHeader title="Hair History" />
          <View style={[styles.card, shadows.sm]}>
            <EditableRow
              label="Relaxer History"
              value={hp.relaxerHistory == null ? undefined : hp.relaxerHistory ? 'Yes' : 'No'}
              onPress={() => openPicker({ key: 'relaxerHistory', label: 'Relaxer History', labels: BOOLEAN_LABELS, isBoolean: true })}
            />
            <Divider />
            <EditableRow
              label="Color Treated"
              value={hp.colorTreated == null ? undefined : hp.colorTreated ? 'Yes' : 'No'}
              onPress={() => openPicker({ key: 'colorTreated', label: 'Color Treated', labels: BOOLEAN_LABELS, isBoolean: true })}
            />
            <Divider />
            <EditableRow
              label="Protective Styling"
              value={hp.protectiveStyling == null ? undefined : hp.protectiveStyling ? 'Yes' : 'No'}
              onPress={() => openPicker({ key: 'protectiveStyling', label: 'Protective Styling', labels: BOOLEAN_LABELS, isBoolean: true })}
            />
          </View>
        </Animated.View>

        {/* ─── Goals ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SectionHeader title="Goals" />
          <View style={[styles.card, shadows.sm]}>
            <EditableRow
              label="Primary Goal"
              value={hp.primaryGoal ? GOAL_LABELS[hp.primaryGoal] : undefined}
              onPress={() => openPicker({ key: 'primaryGoal', label: 'Primary Goal', labels: GOAL_LABELS })}
            />
            {hp.secondaryGoals && hp.secondaryGoals.length > 0 && (
              <>
                <Divider />
                <View style={styles.profileRow}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowLabel}>Other Goals</Text>
                    <Text style={styles.rowValue}>
                      {hp.secondaryGoals.map((g) => GOAL_LABELS[g] || g).join(', ')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {/* ─── Routine ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <SectionHeader title="Routine" />
          <View style={[styles.card, shadows.sm]}>
            <EditableRow
              label="Wash Frequency"
              value={hp.washFrequency ? WASH_LABELS[hp.washFrequency] : undefined}
              onPress={() => openPicker({ key: 'washFrequency', label: 'Wash Frequency', labels: WASH_LABELS })}
            />
            <Divider />
            <EditableRow
              label="Heat Use"
              value={hp.heatUse ? HEAT_LABELS[hp.heatUse] : undefined}
              onPress={() => openPicker({ key: 'heatUse', label: 'Heat Use', labels: HEAT_LABELS })}
            />
          </View>
        </Animated.View>

        {/* ─── Budget ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <SectionHeader title="Budget" />
          <View style={[styles.card, shadows.sm]}>
            <EditableRow
              label="Product Scope"
              value={hp.productScope ? SCOPE_LABELS[hp.productScope] : undefined}
              onPress={() => openPicker({ key: 'productScope', label: 'Product Scope', labels: SCOPE_LABELS })}
            />
            <Divider />
            <EditableRow
              label="Budget Range"
              value={hp.productBudget ? BUDGET_LABELS[hp.productBudget] : undefined}
              onPress={() => openPicker({ key: 'productBudget', label: 'Budget Range', labels: BUDGET_LABELS })}
            />
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
          <Text style={styles.retakeHint}>
            Start from scratch with a full new consultation
          </Text>
        </Animated.View>
      </ScrollView>

      {/* ─── Picker Modal ──────────────────────────────── */}
      <PickerModal
        visible={!!pickerField}
        title={pickerField?.label || ''}
        options={pickerOptions}
        currentValue={pickerCurrentValue}
        onSelect={handleSelect}
        onClose={() => setPickerField(null)}
        accentColor={ac.accent}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  rowLeft: {
    flex: 1,
    gap: 2,
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
  },
  editIcon: {
    fontSize: fontSize.md,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },

  retakeWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  retakeHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: letterSpacing.tight,
  },
  modalList: {
    paddingHorizontal: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: spacing.xs,
  },
  optionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.ink,
    flex: 1,
  },
  checkmark: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    marginLeft: spacing.sm,
  },
  modalCancel: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  modalCancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.muted,
  },
});
