/**
 * ProductRevealScreen — Paywall first, products after.
 *
 * Step 1: Trust badges + product count + paywall CTA
 * Step 2: AFTER paying → category tabs with full product cards
 * Skip path → straight to SendOff, no products shown
 */

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { CeremonialButton } from '../../components/CeremonialButton';
import { PaywallModal } from '../../components/PaywallModal';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { PRODUCTS, type Product, type ProductCategory } from '../../constants/products';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, auntyColors, fonts, fontSize, spacing, radius, shadows, letterSpacing } from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ProductReveal'>;

const SCOPE_TO_TIER: Record<string, number> = { basics: 1, routine: 2, full: 3, everything: 4 };
const BUDGET_TO_MAX: Record<string, number> = { 'under-30': 30, '30-60': 60, '60-100': 100, '100-plus': 999 };
const SCOPE_LABELS: Record<string, string> = {
  basics: 'Essentials',
  routine: 'Routine',
  full: 'Full Setup',
  everything: 'Complete Cabinet',
};
const BUDGET_LABELS: Record<string, string> = {
  'under-30': 'Under $30',
  '30-60': '$30-$60',
  '60-100': '$60-$100',
  '100-plus': '$100+',
};

const CAT_LABELS: Record<string, string> = {
  cleanser: 'Shampoo', conditioner: 'Conditioner', 'deep-conditioner': 'Mask',
  'leave-in': 'Leave-In', styler: 'Styler', gel: 'Gel', cream: 'Cream',
  oil: 'Oil', 'protein-treatment': 'Protein', 'scalp-treatment': 'Scalp',
  tool: 'Tools', accessory: 'Accessories',
};

function safeAunty(id: string | undefined) {
  const key = (id ?? 'denise') as AuntyId;
  return {
    aunty: AUNTIES[key] ?? AUNTIES.denise,
    ac: auntyColors[key] ?? auntyColors.denise,
  };
}

function StarIcon({ size = 12, color = colors.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
      />
    </Svg>
  );
}

function getProducts(scope?: string, budget?: string): Product[] {
  const maxTier = SCOPE_TO_TIER[scope || 'routine'] || 2;
  const maxPrice = BUDGET_TO_MAX[budget || '60-100'] || 100;
  return PRODUCTS.filter((p) => (p.scopeTier ?? 3) <= maxTier && (p.priceValue ?? 20) <= maxPrice);
}

function groupBy(products: Product[]): Map<ProductCategory, Product[]> {
  const map = new Map<ProductCategory, Product[]>();
  for (const p of products) {
    const list = map.get(p.category) || [];
    list.push(p);
    map.set(p.category, list);
  }
  return map;
}

export default function ProductRevealScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const [unlocked, setUnlocked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const profile = state.data.hairProfile ?? {};
  const products = useMemo(() => getProducts(profile.productScope, profile.productBudget), [profile.productScope, profile.productBudget]);
  const grouped = useMemo(() => groupBy(products), [products]);
  const tabs = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const [activeTab, setActiveTab] = useState<ProductCategory | null>(null);
  const firstRenderRef = useRef(true);

  const handleUnlock = () => {
    setShowPaywall(false);
    setUnlocked(true);
    setActiveTab(tabs[0] || null);
    firstRenderRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const activeProducts = activeTab ? grouped.get(activeTab) || [] : [];
  const chosenAuntyId = (state.data.chosenAuntyId || 'denise') as AuntyId;
  const { aunty: chosenAunty, ac } = safeAunty(chosenAuntyId);
  const scopeLabel = SCOPE_LABELS[profile.productScope || 'routine'] || 'Routine';
  const budgetLabel = BUDGET_LABELS[profile.productBudget || '60-100'] || '$60-$100';
  const curlLabel = profile.curlType ? profile.curlType.toUpperCase() : 'Your';

  // ─── PRE-PAYWALL: Trust + CTA ────────────────────────────────
  if (!unlocked) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={[styles.prePaywall, { paddingBottom: insets.bottom + spacing.lg }]} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.delay(200).duration(500)}>
            <Text style={styles.title}>We Found {products.length} Products{'\n'}For Your Hair</Text>
            <Text style={styles.subtitle}>
              Every one vetted for {profile.curlType || 'your'} texture. No silicones. No sulfates. Just what works.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).duration(380)} style={styles.categoryPreview}>
            <Text style={styles.previewTitle}>YOUR PRODUCT CATEGORIES</Text>
            {tabs.map((cat) => (
              <View key={cat} style={styles.categoryRow}>
                <View style={[styles.categoryDot, { backgroundColor: ac.accent }]} />
                <Text style={styles.categoryName}>{CAT_LABELS[cat] || cat}</Text>
                <Text style={styles.categoryCount}>{grouped.get(cat)?.length} picks</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(550).duration(380)} style={styles.ctaSection}>
            <CeremonialButton
              label="See my products"
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowPaywall(true); }}
              size="lg"
            />
            <Pressable
              onPress={() => navigation.navigate('SendOff')}
              style={styles.skipBtn}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip products and continue"
            >
              <Text style={styles.skipText}>Maybe later</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleUnlock}
        />
      </View>
    );
  }

  // ─── POST-PAYWALL: Tabs + Full Products ──────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header — single block, no competing summary */}
      <View style={styles.header}>
        <Text style={styles.overline}>YOUR RECOMMENDATIONS</Text>
        <Text style={styles.titleSmall}>Products For You</Text>
        <Text style={styles.headerMeta}>
          {products.length} picks for {curlLabel} hair · {scopeLabel} · {budgetLabel}
        </Text>
        <Text style={[styles.byAunty, { color: ac.text }]}>
          Curated by Aunty {chosenAunty.name}
        </Text>
      </View>

      {/* Category tabs */}
      {tabs.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
          {tabs.map((cat) => {
            const isActive = activeTab === cat;
            const count = grouped.get(cat)?.length ?? 0;
            const label = CAT_LABELS[cat] || cat;
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  firstRenderRef.current = true;
                  setActiveTab(cat);
                }}
                style={[styles.tab, isActive && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${label}, ${count} products`}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>{count}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Products — empty state OR list */}
      <ScrollView style={styles.productScroll} contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + spacing.lg }]} showsVerticalScrollIndicator={false}>
        {tabs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matches in your scope</Text>
            <Text style={styles.emptyText}>
              We couldn't find products in {scopeLabel.toLowerCase()} at {budgetLabel}. Try Continue and we'll widen the search later.
            </Text>
          </View>
        ) : (
          activeProducts.map((p, i) => {
            const { aunty: pAunty, ac: pac } = safeAunty(p.recommendedBy);
            const ProductBlock = (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.brandCol}>
                    <Text style={styles.cardBrand}>{p.brand}</Text>
                    {p.size ? <Text style={styles.cardSize}>{p.size}</Text> : null}
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.cardPrice}>{p.price}</Text>
                    <View style={styles.ratingRow}>
                      <StarIcon size={11} />
                      <Text style={styles.cardRating}>{p.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={styles.cardDesc}>{p.description}</Text>

                {(p.isBudgetFriendly || p.isPremiumPick) && (
                  <View style={styles.cardTagRow}>
                    {p.isBudgetFriendly && (
                      <View style={styles.budgetTag}><Text style={styles.budgetText}>BUDGET FRIENDLY</Text></View>
                    )}
                    {p.isPremiumPick && (
                      <View style={styles.premiumTag}><Text style={styles.premiumText}>PREMIUM PICK</Text></View>
                    )}
                  </View>
                )}

                <View style={[styles.auntyRow, { backgroundColor: pac.bg }]}>
                  <AuntyAvatar auntyId={p.recommendedBy} size={28} showRing />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.auntyName, { color: pac.text }]}>{pAunty.name} says</Text>
                    <Text style={styles.auntyQuote}>"{p.whyItWorks}"</Text>
                  </View>
                </View>
              </View>
            );

            // Only animate on first render of this tab — not on every tab switch
            if (firstRenderRef.current) {
              return (
                <Animated.View key={p.id} entering={FadeInDown.delay(i * 40).duration(280)}>
                  {ProductBlock}
                </Animated.View>
              );
            }
            return ProductBlock;
          })
        )}
        {/* Mark first-render as done after rendering */}
        {firstRenderRef.current ? <FirstRenderTracker onDone={() => { firstRenderRef.current = false; }} /> : null}
      </ScrollView>

      {/* Continue button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <CeremonialButton label="Continue" onPress={() => navigation.navigate('SendOff')} size="md" />
      </View>
    </View>
  );
}

function FirstRenderTracker({ onDone }: { onDone: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 0);
    return () => clearTimeout(t);
  }, [onDone]);
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  // Pre-paywall
  prePaywall: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  overline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.ink, letterSpacing: letterSpacing.tight, lineHeight: fontSize.xxl * 1.15, marginTop: spacing.xs },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, marginTop: spacing.sm, lineHeight: fontSize.md * 1.5 },

  categoryPreview: { gap: spacing.sm },
  previewTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.muted, letterSpacing: letterSpacing.wide, marginBottom: spacing.xs },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  categoryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  categoryName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.ink, flex: 1 },
  categoryCount: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },

  ctaSection: { gap: spacing.md, marginTop: spacing.md },
  skipBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.muted },

  // Post-paywall
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: 2 },
  titleSmall: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.ink, letterSpacing: letterSpacing.tight, marginTop: spacing.xs },
  headerMeta: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs },
  byAunty: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, marginTop: 2, letterSpacing: 0.2 },

  tabScroll: { maxHeight: 48, marginBottom: spacing.sm },
  tabRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTinted,
    minHeight: 40,
  },
  tabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.muted },
  tabLabelActive: { color: '#FFFFFF' },
  tabBadge: { backgroundColor: colors.canvasDeep, borderRadius: radius.full, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.28)' },
  tabBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.muted },
  tabBadgeTextActive: { color: '#FFFFFF' },

  productScroll: { flex: 1 },
  productList: { paddingHorizontal: spacing.lg, gap: spacing.sm },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandCol: { gap: 1, flexShrink: 1 },
  priceCol: { alignItems: 'flex-end', gap: 4 },
  cardBrand: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.muted, textTransform: 'uppercase', letterSpacing: letterSpacing.wide },
  cardSize: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },
  cardPrice: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.ink, letterSpacing: -0.2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRating: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.primaryDeep },
  cardName: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, letterSpacing: letterSpacing.tight, lineHeight: fontSize.xl * 1.15 },
  cardDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.5 },
  cardTagRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  auntyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: radius.md, padding: spacing.sm },
  auntyName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, marginBottom: 2 },
  auntyQuote: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, fontStyle: 'italic', lineHeight: fontSize.sm * 1.5 },
  budgetTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(26,122,74,0.1)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  budgetText: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.success, letterSpacing: letterSpacing.wider },
  premiumTag: { alignSelf: 'flex-start', backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  premiumText: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.primaryDeep, letterSpacing: letterSpacing.wider },

  emptyState: { paddingTop: spacing.xl, gap: spacing.sm, alignItems: 'center' },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: fontSize.lg, color: colors.ink },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, textAlign: 'center', lineHeight: fontSize.sm * 1.5, paddingHorizontal: spacing.lg },

  bottomBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, backgroundColor: colors.canvas, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
