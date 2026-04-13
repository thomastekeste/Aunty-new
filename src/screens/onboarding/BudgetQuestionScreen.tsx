/**
 * BudgetQuestionScreen — Product scope + budget.
 *
 * This is the bridge between diagnosis and product recommendations.
 * Two-step progressive reveal: scope first, then budget.
 * Each option has visual weight and clear value communication.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
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
  shadows,
  gradients,
  letterSpacing,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BudgetQuestion'>;

interface ScopeOption {
  key: string;
  label: string;
  items: string[];
  tag?: string;
}

const SCOPE_OPTIONS: ScopeOption[] = [
  {
    key: 'basics',
    label: 'The Essentials',
    items: ['Shampoo', 'Conditioner'],
  },
  {
    key: 'routine',
    label: 'The Routine',
    items: ['Shampoo', 'Conditioner', 'Deep Treatment'],
    tag: 'POPULAR',
  },
  {
    key: 'full',
    label: 'The Full Setup',
    items: ['Shampoo', 'Conditioner', 'Treatment', 'Oil', 'Styler'],
    tag: 'RECOMMENDED',
  },
  {
    key: 'everything',
    label: 'The Complete Cabinet',
    items: ['All products', 'Tools', 'Accessories'],
  },
];

interface BudgetOption {
  key: string;
  label: string;
  sub: string;
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { key: 'under-30', label: 'Under $30', sub: 'Budget-friendly picks' },
  { key: '30-60', label: '$30 – $60', sub: 'Best value range' },
  { key: '60-100', label: '$60 – $100', sub: 'Premium selection' },
  { key: '100-plus', label: '$100+', sub: 'No limits' },
];

export default function BudgetQuestionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [scope, setScope] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1=scope, 2=budget

  const handleScopeSelect = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScope(key);
    // Auto-advance to budget after a beat
    setTimeout(() => setStep(2), 400);
  };

  const handleBudgetSelect = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBudget(key);
  };

  const canContinue = scope !== null && budget !== null;

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      {/* Aunty header */}
      <Animated.View entering={FadeIn.delay(200)} style={styles.auntyHeader}>
        <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
        <View>
          <Text style={[styles.auntyName, { color: ac.accent }]}>{aunty.name}</Text>
          <Text style={styles.auntyMessage}>
            {step === 1 ? 'How deep do you want to go?' : 'And what are you working with?'}
          </Text>
        </View>
      </Animated.View>

      {/* Step 1: Scope */}
      {step === 1 && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.optionsContainer}>
          <Text style={styles.question}>What do you need?</Text>
          <Text style={styles.hint}>One-time product investment. Not a subscription.</Text>

          <View style={styles.scopeGrid}>
            {SCOPE_OPTIONS.map((opt, i) => {
              const selected = scope === opt.key;
              return (
                <Animated.View key={opt.key} entering={FadeInDown.delay(80 + i * 50)}>
                  <Pressable
                    onPress={() => handleScopeSelect(opt.key)}
                    style={[
                      styles.scopeCard,
                      selected && { borderColor: ac.accent, borderWidth: 2, backgroundColor: ac.accent + '12' },
                    ]}
                  >
                    {opt.tag && (
                      <View style={[styles.scopeTag, { backgroundColor: opt.tag === 'RECOMMENDED' ? ac.accent : colors.primary }]}>
                        <Text style={styles.scopeTagText}>{opt.tag}</Text>
                      </View>
                    )}
                    <Text style={[styles.scopeLabel, selected && { color: colors.dark.text }]}>
                      {opt.label}
                    </Text>
                    <View style={styles.scopeItems}>
                      {opt.items.map((item, j) => (
                        <View key={j} style={styles.scopeItemRow}>
                          <View style={[styles.scopeItemDot, { backgroundColor: selected ? ac.accent : colors.dark.textMuted }]} />
                          <Text style={[styles.scopeItemText, selected && { color: colors.dark.text }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                    {selected && (
                      <View style={[styles.checkCircle, { backgroundColor: ac.accent }]}>
                        <Text style={styles.checkText}>{'\u2713'}</Text>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* Step 2: Budget */}
      {step === 2 && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.optionsContainer}>
          <Text style={styles.question}>What's your budget?</Text>
          <Text style={styles.hint}>For your {SCOPE_OPTIONS.find(s => s.key === scope)?.label.toLowerCase() || 'products'}.</Text>

          <View style={styles.budgetGrid}>
            {BUDGET_OPTIONS.map((opt, i) => {
              const selected = budget === opt.key;
              return (
                <Animated.View key={opt.key} entering={FadeInDown.delay(80 + i * 50)}>
                  <Pressable
                    onPress={() => handleBudgetSelect(opt.key)}
                    style={[
                      styles.budgetCard,
                      selected && { borderColor: ac.accent, borderWidth: 2, backgroundColor: ac.accent + '12' },
                    ]}
                  >
                    <Text style={[styles.budgetLabel, selected && { color: colors.dark.text }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.budgetSub, selected && { color: ac.accent }]}>
                      {opt.sub}
                    </Text>
                    {selected && (
                      <View style={[styles.budgetCheck, { backgroundColor: ac.accent }]}>
                        <Text style={styles.checkText}>{'\u2713'}</Text>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Back to scope */}
          <Pressable onPress={() => setStep(1)} style={styles.backLink}>
            <Text style={styles.backText}>{'<'} Change selection</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Bottom CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {step === 2 && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <Button
              label={canContinue ? 'Find My Products' : 'Select your budget'}
              onPress={() => {
                updateHairProfile({ productScope: scope as any, productBudget: budget as any });
                navigation.navigate('CouncilConvening');
              }}
              variant="primary"
              size="lg"
              disabled={!canContinue}
            />
          </Animated.View>
        )}

        {/* Progress */}
        <Text style={styles.progress}>
          {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  auntyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  auntyName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, letterSpacing: letterSpacing.wide },
  auntyMessage: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.dark.textMuted, marginTop: 2 },

  optionsContainer: { flex: 1, paddingHorizontal: spacing.lg },
  question: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.dark.text, letterSpacing: letterSpacing.tight, marginBottom: spacing.xs },
  hint: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },

  // Scope cards
  scopeGrid: { gap: spacing.sm },
  scopeCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surfaceLight,
    padding: spacing.md,
    position: 'relative',
  },
  scopeTag: { position: 'absolute', top: -1, right: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 2, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
  scopeTagText: { fontFamily: fonts.bodySemiBold, fontSize: 9, color: '#fff', letterSpacing: letterSpacing.wider },
  scopeLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.dark.text, marginBottom: spacing.sm },
  scopeItems: { gap: 4 },
  scopeItemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scopeItemDot: { width: 5, height: 5, borderRadius: 2.5 },
  scopeItemText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted },
  checkCircle: { position: 'absolute', top: spacing.md, right: spacing.md, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#fff' },

  // Budget cards
  budgetGrid: { gap: spacing.sm },
  budgetCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surfaceLight,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  budgetLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.dark.text },
  budgetSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted },
  budgetCheck: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  backLink: { marginTop: spacing.lg, paddingVertical: spacing.sm },
  backText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.dark.textMuted },

  footer: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  progress: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.dark.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
