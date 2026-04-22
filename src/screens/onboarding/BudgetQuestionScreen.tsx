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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  gradients,
  letterSpacing,
} from '../../constants/theme';
import { onboardingMotion } from '../../constants/onboardingMotion';
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
    setScope(key);
    setTimeout(() => setStep(2), onboardingMotion.shortPauseMs);
  };

  const handleBudgetSelect = (key: string) => {
    setBudget(key);
  };

  const canContinue = scope !== null && budget !== null;

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Animated.View entering={FadeIn.delay(200)} style={styles.auntyHeader}>
        <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.auntyName, { color: ac.accent }]}>{aunty.name}</Text>
          <Text style={styles.auntyMessage}>
            {step === 1 ? 'is shaping the plan' : 'is finalizing details'}
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
                <Animated.View key={opt.key} style={{ flex: 1 }} entering={FadeInDown.delay(80 + i * 50)}>
                  <PressableScale
                    onPress={() => handleScopeSelect(opt.key)}
                    haptic="medium"
                    scaleTo={0.985}
                    style={[
                      styles.scopeCard,
                      selected && { borderColor: ac.accent, borderWidth: 1.5, backgroundColor: ac.accent + '1F' },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${opt.label}: ${opt.items.join(', ')}`}
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
                  </PressableScale>
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
                <Animated.View key={opt.key} style={{ flex: 1 }} entering={FadeInDown.delay(80 + i * 50)}>
                  <PressableScale
                    onPress={() => handleBudgetSelect(opt.key)}
                    haptic="medium"
                    scaleTo={0.985}
                    style={[
                      styles.budgetCard,
                      selected && { borderColor: ac.accent, borderWidth: 1.5, backgroundColor: ac.accent + '1F' },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${opt.label}: ${opt.sub}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.budgetLabel, selected && { color: colors.dark.text }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.budgetSub, selected && { color: ac.accent }]}>
                        {opt.sub}
                      </Text>
                    </View>
                    {selected && (
                      <View style={[styles.budgetCheck, { backgroundColor: ac.accent }]}>
                        <Text style={styles.checkText}>{'\u2713'}</Text>
                      </View>
                    )}
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>

          <PressableScale
            onPress={() => setStep(1)}
            scaleTo={0.97}
            opacityTo={0.6}
            haptic="light"
            style={styles.backLink}
            accessibilityRole="button"
            accessibilityLabel="Change scope selection"
          >
            <Text style={[styles.backText, { color: ac.accent }]}>
              {'\u2190'}  Change selection
            </Text>
          </PressableScale>
        </Animated.View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {step === 2 && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <CeremonialButton
              label={canContinue ? 'Find my products' : 'Select your budget'}
              onPress={() => {
                updateHairProfile({ productScope: scope as any, productBudget: budget as any });
                navigation.navigate('CouncilConvening');
              }}
              size="lg"
              disabled={!canContinue}
            />
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  auntyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  auntyName: { fontFamily: fonts.serifSemiBold, fontSize: fontSize.lg, letterSpacing: -0.2, lineHeight: fontSize.lg * 1.1 },
  auntyMessage: { fontFamily: fonts.serifItalic, fontSize: fontSize.xs, color: colors.dark.textMuted, marginTop: 1, letterSpacing: 0.1 },

  optionsContainer: { flex: 1, paddingHorizontal: spacing.lg },
  question: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.dark.text, letterSpacing: -0.4, marginBottom: spacing.xs },
  hint: { fontFamily: fonts.serifItalic, fontSize: fontSize.sm, color: colors.dark.textMuted, marginTop: 2, marginBottom: spacing.md },

  // Scope cards — stretch to fill available vertical space
  scopeGrid: { flex: 1, gap: spacing.sm, paddingBottom: spacing.sm },
  scopeCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(254, 248, 236, 0.10)',
    backgroundColor: 'rgba(255, 250, 240, 0.04)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  scopeTag: { position: 'absolute', top: 0, right: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 3, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
  scopeTagText: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, color: '#fff', letterSpacing: 1.5 },
  scopeLabel: { fontFamily: fonts.serifSemiBold, fontSize: fontSize.lg, color: colors.dark.text, marginBottom: spacing.xs + 2, letterSpacing: -0.3 },
  scopeItems: { gap: 3 },
  scopeItemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  scopeItemDot: { width: 5, height: 5, borderRadius: 2.5 },
  scopeItemText: { fontFamily: fonts.serifItalic, fontSize: fontSize.sm, color: colors.dark.textMuted, letterSpacing: 0.1 },
  checkCircle: { position: 'absolute', top: spacing.md, right: spacing.md, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#fff' },

  // Budget cards — stretch to fill available vertical space
  budgetGrid: { flex: 1, gap: spacing.sm, paddingBottom: spacing.sm },
  budgetCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(254, 248, 236, 0.10)',
    backgroundColor: 'rgba(255, 250, 240, 0.04)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: { fontFamily: fonts.serifSemiBold, fontSize: fontSize.lg, color: colors.dark.text, letterSpacing: -0.3 },
  budgetSub: { fontFamily: fonts.serifItalic, fontSize: fontSize.sm, color: colors.dark.textMuted, marginTop: 2, letterSpacing: 0.1 },
  budgetCheck: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  backLink: { marginTop: spacing.sm, paddingVertical: spacing.xs, alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.serifMedium, fontSize: fontSize.sm, letterSpacing: 0.2 },

  footer: { paddingHorizontal: spacing.lg },
});
