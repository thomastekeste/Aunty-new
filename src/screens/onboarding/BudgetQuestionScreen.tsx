/**
 * BudgetQuestionScreen — Scope → Brand tier → Budget (data-driven).
 *
 * The bridge between diagnosis and the prescribed routine.
 * Three-step progressive reveal:
 *   1. Scope   — how many products do you want?
 *   2. Brand   — drugstore / premium / mix
 *   3. Budget  — three REAL routine totals computed from the catalog
 *
 * The budget options are no longer abstract $ ranges; they are the actual
 * value / balanced / premium routine costs for the chosen scope + brand tier.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { CeremonialButton } from '../../components/CeremonialButton';
import { PressableScale } from '../../components/PressableScale';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
} from '../../constants/theme';
import { onboardingMotion } from '../../constants/onboardingMotion';
import { progress } from '../../constants/auntyVoice';
import { computeBudgetTiers } from '../../utils/recommendation';
import type { BrandTier, OnboardingStackParamList, ProductScope } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BudgetQuestion'>;

interface ScopeOption {
  key: ProductScope;
  label: string;
  items: string[];
  tag?: string;
}

// Item labels reflect categories we actually stock (deep-conditioner serves the
// conditioner/treatment slot; "Styler" is filled by gel/cream).
const SCOPE_OPTIONS: ScopeOption[] = [
  { key: 'basics', label: 'The Essentials', items: ['Cleanser', 'Conditioner / Mask'] },
  { key: 'routine', label: 'The Routine', items: ['Cleanser', 'Conditioner / Mask', 'Leave-In'], tag: 'POPULAR' },
  { key: 'full', label: 'The Full Setup', items: ['Cleanser', 'Conditioner', 'Leave-In', 'Styler', 'Oil'], tag: 'RECOMMENDED' },
  { key: 'everything', label: 'The Complete Cabinet', items: ['Full routine', 'Protein + scalp care', 'Tools & accessories'] },
];

interface BrandOption {
  key: BrandTier;
  label: string;
  sub: string;
}

const BRAND_OPTIONS: BrandOption[] = [
  { key: 'drugstore', label: 'Drugstore', sub: 'Budget brands you can grab anywhere' },
  { key: 'premium', label: 'Premium', sub: 'Salon-grade, higher-end formulas' },
  { key: 'mix', label: 'Mix of both', sub: 'Best value, whatever the brand' },
];

export default function BudgetQuestionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const profile = state.data.hairProfile;

  const [scope, setScope] = useState<ProductScope | null>(null);
  const [brandTier, setBrandTier] = useState<BrandTier | null>(null);
  const [budgetTotal, setBudgetTotal] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=scope, 2=brand, 3=budget

  // Consultation-wide progress (Budget is the final numbered step).
  const { step: barStep, totalSteps: barTotal } = progress('budget');

  // Real routine totals for the chosen scope + brand tier.
  const budgetTiers = useMemo(() => {
    if (!scope || !brandTier) return [];
    return computeBudgetTiers(scope, brandTier, profile);
  }, [scope, brandTier, profile]);

  const handleScopeSelect = (key: ProductScope) => {
    setScope(key);
    setTimeout(() => setStep(2), onboardingMotion.shortPauseMs);
  };

  const handleBrandSelect = (key: BrandTier) => {
    setBrandTier(key);
    setBudgetTotal(null);
    setTimeout(() => setStep(3), onboardingMotion.shortPauseMs);
  };

  const canContinue = scope !== null && brandTier !== null && budgetTotal !== null;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) navigation.goBack();
    else setStep((step - 1) as 1 | 2 | 3);
  };

  const scopeLabel = SCOPE_OPTIONS.find((s) => s.key === scope)?.label.replace(/^The\s+/i, '').toLowerCase() || 'routine';

  const stepMessage =
    step === 1 ? 'is shaping the plan' : step === 2 ? 'is choosing your shelf' : 'is finalizing the numbers';

  const tierSub: Record<string, string> = {
    value: 'Smart picks, lowest cost',
    balanced: "Aunty's best matches",
    premium: 'Top-shelf, no compromise',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress header */}
      <View style={styles.progressHeader}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backChevron}>{'‹'}</Text>
        </Pressable>

        <View
          style={styles.progressRow}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${barStep} of ${barTotal}`}
          accessibilityValue={{ min: 0, max: barTotal, now: barStep }}
        >
          {Array.from({ length: barTotal }).map((_, i) => {
            const idx = i + 1;
            return (
              <View key={i} style={styles.segmentWrap}>
                <View
                  style={[
                    styles.segment,
                    idx < barStep && { backgroundColor: ac.accent },
                    idx === barStep && { backgroundColor: ac.accent, opacity: 0.5 },
                  ]}
                />
              </View>
            );
          })}
        </View>

        <Text style={styles.stepLabel}>{barStep}/{barTotal}</Text>
      </View>

      <Animated.View entering={FadeIn.delay(200)} style={styles.auntyHeader}>
        <AuntyAvatar auntyId={auntyId} size={48} showRing />
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.auntyName, { color: ac.accent }]}>{aunty.name}</Text>
          <Text style={styles.auntyMessage}>{stepMessage}</Text>
        </View>
      </Animated.View>

      {/* Step 1: Scope */}
      {step === 1 && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.optionsContainer}>
          <Text style={styles.question}>What do you need?</Text>
          <Text style={styles.hint}>One-time product investment. Not a subscription.</Text>

          <View style={styles.grid}>
            {SCOPE_OPTIONS.map((opt, i) => {
              const selected = scope === opt.key;
              return (
                <Animated.View key={opt.key} style={{ flex: 1 }} entering={FadeInDown.delay(80 + i * 50)}>
                  <PressableScale
                    onPress={() => handleScopeSelect(opt.key)}
                    haptic="medium"
                    scaleTo={0.985}
                    style={[styles.scopeCard, selected && { borderColor: ac.accent, borderWidth: 1.5, backgroundColor: ac.accent + '0D' }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${opt.label}: ${opt.items.join(', ')}`}
                  >
                    {opt.tag && (
                      <View style={[styles.scopeTag, { backgroundColor: opt.tag === 'RECOMMENDED' ? ac.accent : colors.primary }]}>
                        <Text style={styles.scopeTagText}>{opt.tag}</Text>
                      </View>
                    )}
                    <Text style={[styles.scopeLabel, selected && { color: colors.ink }]}>{opt.label}</Text>
                    <View style={styles.scopeItems}>
                      {opt.items.map((item, j) => (
                        <View key={j} style={styles.scopeItemRow}>
                          <View style={[styles.scopeItemDot, { backgroundColor: selected ? ac.accent : colors.muted }]} />
                          <Text style={[styles.scopeItemText, selected && { color: colors.ink }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                    {selected && (
                      <View style={[styles.checkCircle, { backgroundColor: ac.accent }]}>
                        <Text style={styles.checkText}>{'✓'}</Text>
                      </View>
                    )}
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* Step 2: Brand tier */}
      {step === 2 && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.optionsContainer}>
          <Text style={styles.question}>Drugstore or premium?</Text>
          <Text style={styles.hint}>For your {scopeLabel}. This shapes which brands we pick.</Text>

          <View style={styles.grid}>
            {BRAND_OPTIONS.map((opt, i) => {
              const selected = brandTier === opt.key;
              return (
                <Animated.View key={opt.key} style={{ flex: 1 }} entering={FadeInDown.delay(80 + i * 50)}>
                  <PressableScale
                    onPress={() => handleBrandSelect(opt.key)}
                    haptic="medium"
                    scaleTo={0.985}
                    style={[styles.rowCard, selected && { borderColor: ac.accent, borderWidth: 1.5, backgroundColor: ac.accent + '0D' }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${opt.label}: ${opt.sub}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowLabel, selected && { color: colors.ink }]}>{opt.label}</Text>
                      <Text style={[styles.rowSub, selected && { color: ac.accent }]}>{opt.sub}</Text>
                    </View>
                    {selected && (
                      <View style={[styles.rowCheck, { backgroundColor: ac.accent }]}>
                        <Text style={styles.checkText}>{'✓'}</Text>
                      </View>
                    )}
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* Step 3: Budget (data-driven totals) */}
      {step === 3 && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.optionsContainer}>
          <Text style={styles.question}>What feels right?</Text>
          <Text style={styles.hint}>Real totals for your {scopeLabel}. Pick a number, we build to it.</Text>

          <View style={styles.grid}>
            {budgetTiers.map((tier, i) => {
              const selected = budgetTotal === tier.total;
              return (
                <Animated.View key={tier.key} style={{ flex: 1 }} entering={FadeInDown.delay(80 + i * 50)}>
                  <PressableScale
                    onPress={() => { setBudgetTotal(tier.total); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                    haptic="medium"
                    scaleTo={0.985}
                    style={[styles.rowCard, selected && { borderColor: ac.accent, borderWidth: 1.5, backgroundColor: ac.accent + '0D' }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${tier.label}: about $${tier.total} for ${tier.pieces} products`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowLabel, selected && { color: colors.ink }]}>
                        ~${tier.total}
                        <Text style={styles.budgetPieces}>  ·  {tier.pieces} products</Text>
                      </Text>
                      <Text style={[styles.rowSub, selected && { color: ac.accent }]}>
                        {tier.label} — {tierSub[tier.key]}
                      </Text>
                    </View>
                    {selected && (
                      <View style={[styles.rowCheck, { backgroundColor: ac.accent }]}>
                        <Text style={styles.checkText}>{'✓'}</Text>
                      </View>
                    )}
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {step === 3 && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <CeremonialButton
              label={canContinue ? 'Find my products' : 'Pick your number'}
              onPress={() => {
                updateHairProfile({
                  productScope: scope as ProductScope,
                  brandTier: brandTier as BrandTier,
                  productBudgetTotal: budgetTotal as number,
                });
                navigation.navigate('PhotoCapture');
              }}
              size="lg"
              disabled={!canContinue}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontFamily: fonts.body, fontSize: fontSize.xl, lineHeight: fontSize.xl, color: colors.ink },
  progressRow: { flex: 1, flexDirection: 'row', gap: 4, alignItems: 'center' },
  segmentWrap: { flex: 1, height: 3 },
  segment: { flex: 1, height: 3, borderRadius: 1.5, backgroundColor: colors.border },
  stepLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.muted, minWidth: 28, textAlign: 'right' },

  auntyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  auntyName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, letterSpacing: -0.2, lineHeight: fontSize.lg * 1.1 },
  auntyMessage: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.muted, marginTop: 1, letterSpacing: 0.1 },

  optionsContainer: { flex: 1, paddingHorizontal: spacing.lg },
  question: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, letterSpacing: -0.4, marginBottom: spacing.xs },
  hint: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.muted, marginTop: 2, marginBottom: spacing.md },

  grid: { flex: 1, gap: spacing.sm, paddingBottom: spacing.sm },

  // Scope cards
  scopeCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  scopeTag: { position: 'absolute', top: 0, right: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 3, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
  scopeTagText: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, color: '#fff', letterSpacing: 1.5 },
  scopeLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.ink, marginBottom: spacing.xs + 2, letterSpacing: -0.3 },
  scopeItems: { gap: 3 },
  scopeItemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  scopeItemDot: { width: 5, height: 5, borderRadius: 2.5 },
  scopeItemText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, letterSpacing: 0.1 },
  checkCircle: { position: 'absolute', top: spacing.md, right: spacing.md, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#fff' },

  // Row cards (brand + budget)
  rowCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.ink, letterSpacing: -0.3 },
  rowSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, marginTop: 2, letterSpacing: 0.1 },
  rowCheck: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  budgetPieces: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, letterSpacing: 0 },

  footer: { paddingHorizontal: spacing.lg },
});
