/**
 * ProductRevealScreen — Paywall first, prescription after.
 *
 * Step 1: Trust teaser — "your aunty built your N-piece routine" + total
 * Step 2: AFTER paying → the prescribed routine, ONE product per category,
 *         each with a "Swap" control to cycle through alternates.
 * Skip path → straight to SendOff, no products shown.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { ProductThumb } from '../../components/ProductThumb';
import { Button } from '../../components/Button';
import { PaywallModal } from '../../components/PaywallModal';
import { AUNTIES } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, auntyColors, fonts, fontSize, spacing, radius, shadows, letterSpacing } from '../../constants/theme';
import { buildRoutine, type RoutineItem } from '../../utils/recommendation';
import type { OnboardingStackParamList, ProductScope, BrandTier } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ProductReveal'>;

export default function ProductRevealScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const [unlocked, setUnlocked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const profile = state.data.hairProfile;
  const chosenAuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[chosenAuntyId];
  const aunty = AUNTIES[chosenAuntyId];

  const routine = useMemo<RoutineItem[]>(
    () =>
      buildRoutine(
        (profile.productScope as ProductScope) || 'routine',
        (profile.brandTier as BrandTier) || 'mix',
        profile.productBudgetTotal,
        profile,
      ),
    [profile],
  );

  // Per-slot swap index (which option in [product, ...alternates] is shown).
  const [swapIdx, setSwapIdx] = useState<Record<string, number>>({});

  const total = useMemo(
    () =>
      routine.reduce((acc, item) => {
        const opts = [item.product, ...item.alternates];
        const chosen = opts[(swapIdx[item.slot.key] ?? 0) % opts.length];
        return acc + (chosen.priceValue ?? 0);
      }, 0),
    [routine, swapIdx],
  );

  const handleUnlock = () => {
    setShowPaywall(false);
    setUnlocked(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSwap = (slotKey: string, optionCount: number) => {
    if (optionCount <= 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSwapIdx((prev) => ({ ...prev, [slotKey]: ((prev[slotKey] ?? 0) + 1) % optionCount }));
  };

  // ─── PRE-PAYWALL: Trust + CTA ────────────────────────────────
  if (!unlocked) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={[styles.prePaywall, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.delay(200).duration(500)}>
            <Text style={styles.title}>Your Council Plan{'\n'}Is Ready</Text>
            <Text style={styles.subtitle}>
              {aunty.name} prepared a lot more than products. Here&rsquo;s everything waiting inside:
            </Text>
          </Animated.View>

          {/* Value stack — the FULL offer, personalized, shown BEFORE the
              paywall so users know they're buying a system, not a list */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.valueStack}>
            {[
              {
                title: `Your ${routine.length}-piece product prescription`,
                desc: `One pick per step for your ${profile.curlType || 'curl'} ${profile.porosity ? `${profile.porosity}-porosity ` : ''}hair — swap any pick. ~$${Math.round(total)} total.`,
              },
              {
                title: 'Your weekly ritual',
                desc: 'Wash, style, refresh & rest days — step-by-step, built from your answers.',
              },
              {
                title: 'Your exact wash schedule',
                desc: 'That number we blurred earlier? Unlocked — and tracked with you, wash day by wash day.',
              },
              {
                title: `Aunty ${aunty.name}, on call`,
                desc: 'Chat anytime. She knows your porosity, your struggles, your goals.',
              },
              {
                title: 'Weekly check-ins & progress',
                desc: 'Build a streak and watch your hair change month over month.',
              },
            ].map((item) => (
              <View key={item.title} style={styles.valueRow}>
                <View style={[styles.valueDot, { backgroundColor: ac.accent }]} />
                <View style={styles.valueText}>
                  <Text style={styles.valueTitle}>{item.title}</Text>
                  <Text style={styles.valueDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Routine preview */}
          <Animated.View entering={FadeInDown.delay(350)} style={styles.categoryPreview}>
            <Text style={styles.previewTitle}>YOUR ROUTINE</Text>
            {routine.map((item) => (
              <View key={item.slot.key} style={styles.categoryRow}>
                <View style={[styles.categoryDot, { backgroundColor: ac.accent }]} />
                <Text style={styles.categoryName}>{item.slot.label}</Text>
                <Text style={styles.categoryCount}>{item.product.price}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Routine total</Text>
              <Text style={[styles.totalValue, { color: ac.accent }]}>~${Math.round(total)}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(550)} style={styles.ctaSection}>
            <Button
              label="Unlock My Full Plan"
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowPaywall(true); }}
              variant="primary"
              size="lg"
            />
          </Animated.View>
        </ScrollView>

        <PaywallModal
          visible={showPaywall}
          dismissible={false}
          onClose={() => {}}
          onSubscribe={handleUnlock}
        />
      </View>
    );
  }

  // ─── POST-PAYWALL: The prescription ──────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.overline}>YOUR PRESCRIPTION</Text>
        <Text style={styles.titleSmall}>The {routine.length}-Piece Routine</Text>
      </View>

      <ScrollView style={styles.productScroll} contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {routine.map((item, i) => {
          const opts = [item.product, ...item.alternates];
          const idx = (swapIdx[item.slot.key] ?? 0) % opts.length;
          const p = opts[idx];
          const pac = auntyColors[p.recommendedBy];
          return (
            <Animated.View key={item.slot.key} entering={FadeInDown.delay(i * 60)}>
              <View style={[styles.card, { borderLeftColor: pac.accent }]}>
                <View style={styles.slotRow}>
                  <Text style={[styles.slotLabel, { color: ac.accent }]}>{item.slot.label.toUpperCase()}</Text>
                  {item.aboveBudget && <Text style={styles.aboveBudget}>slightly above budget</Text>}
                </View>
                <View style={styles.cardHead}>
                  <ProductThumb imageUrl={p.imageUrl} brand={p.brand} accent={pac.accent} size={64} />
                  <View style={styles.cardHeadText}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardBrand}>{p.brand}</Text>
                      <Text style={styles.cardPrice}>{p.price}</Text>
                    </View>
                    <Text style={styles.cardName} numberOfLines={2}>{p.name}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{p.description}</Text>
                <View style={styles.auntyRow}>
                  <AuntyAvatar auntyId={p.recommendedBy} size={28} showRing />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.auntyName, { color: pac.accent }]}>{AUNTIES[p.recommendedBy].name} says:</Text>
                    <Text style={styles.auntyQuote}>&ldquo;{p.whyItWorks}&rdquo;</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  {p.isBudgetFriendly && (
                    <View style={styles.budgetTag}><Text style={styles.budgetText}>BUDGET FRIENDLY</Text></View>
                  )}
                  <View style={{ flex: 1 }} />
                  {opts.length > 1 && (
                    <Pressable
                      onPress={() => handleSwap(item.slot.key, opts.length)}
                      style={({ pressed }) => [styles.swapBtn, { borderColor: ac.accent }, pressed && { opacity: 0.6 }]}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Swap ${item.slot.label} — option ${idx + 1} of ${opts.length}`}
                    >
                      <Text style={[styles.swapText, { color: ac.accent }]}>↻ Swap ({idx + 1}/{opts.length})</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Animated.View>
          );
        })}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Routine total</Text>
          <Text style={[styles.grandTotalValue, { color: ac.accent }]}>~${Math.round(total)}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button label="Continue" onPress={() => navigation.navigate('SendOff')} variant="primary" size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  // Pre-paywall
  prePaywall: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, gap: spacing.xl },
  overline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxxl, color: colors.ink, letterSpacing: letterSpacing.tight, lineHeight: fontSize.xxxl * 1.15, marginTop: spacing.xs },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, marginTop: spacing.sm, lineHeight: fontSize.md * 1.5 },

  valueStack: { gap: spacing.md, marginVertical: spacing.md },
  valueRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  valueDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  valueText: { flex: 1, gap: 2 },
  valueTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink },
  valueDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, lineHeight: 19 },

  categoryPreview: { gap: spacing.sm },
  previewTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.muted, letterSpacing: letterSpacing.wide, marginBottom: spacing.xs },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  categoryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  categoryName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.ink, flex: 1 },
  categoryCount: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  totalLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink },
  totalValue: { fontFamily: fonts.display, fontSize: fontSize.xl },

  ctaSection: { gap: spacing.md, marginTop: spacing.md },
  skipBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  skipTextMuted: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
    textDecorationLine: 'underline',
  },

  // Post-paywall
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  titleSmall: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.ink, letterSpacing: letterSpacing.tight, marginTop: spacing.xs },

  productScroll: { flex: 1 },
  productList: { paddingHorizontal: spacing.lg, gap: spacing.sm },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderLeftWidth: 3, padding: spacing.md, gap: spacing.sm, ...shadows.sm },
  slotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.wide },
  aboveBudget: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, fontStyle: 'italic' },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardHeadText: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.muted, textTransform: 'uppercase', letterSpacing: letterSpacing.wide },
  cardPrice: { fontFamily: fonts.display, fontSize: fontSize.lg, color: colors.ink },
  cardName: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, letterSpacing: letterSpacing.tight },
  cardDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.5 },
  auntyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  auntyName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  auntyQuote: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, fontStyle: 'italic', lineHeight: fontSize.sm * 1.5 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  budgetTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(26,122,74,0.1)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  budgetText: { fontFamily: fonts.bodySemiBold, fontSize: 9, color: colors.success, letterSpacing: letterSpacing.wider },
  swapBtn: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  swapText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: 0.2 },

  grandTotalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginTop: spacing.xs },
  grandTotalLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink },
  grandTotalValue: { fontFamily: fonts.display, fontSize: fontSize.xxl },

  bottomBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.canvas, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
