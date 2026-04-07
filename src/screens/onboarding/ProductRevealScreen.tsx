/**
 * ProductRevealScreen — Paywall first, products after.
 *
 * Step 1: Trust badges + blurred teaser count + paywall CTA
 * Step 2: AFTER paying → category tabs with full product cards
 * Skip path → straight to SendOff, no products shown
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import { PaywallModal } from '../../components/PaywallModal';
import { AUNTIES } from '../../constants/aunties';
import { PRODUCTS, type Product, type ProductCategory } from '../../constants/products';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, auntyColors, fonts, fontSize, spacing, radius, shadows, letterSpacing } from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ProductReveal'>;

const SCOPE_TO_TIER: Record<string, number> = { basics: 1, routine: 2, full: 3, everything: 4 };
const BUDGET_TO_MAX: Record<string, number> = { 'under-30': 30, '30-60': 60, '60-100': 100, '100-plus': 999 };

const CAT_LABELS: Record<string, string> = {
  cleanser: 'Shampoo', conditioner: 'Conditioner', 'deep-conditioner': 'Mask',
  'leave-in': 'Leave-In', styler: 'Styler', gel: 'Gel', cream: 'Cream',
  oil: 'Oil', 'protein-treatment': 'Protein', 'scalp-treatment': 'Scalp',
  tool: 'Tools', accessory: 'Accessories',
};

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

  const profile = state.data.hairProfile;
  const products = useMemo(() => getProducts(profile.productScope, profile.productBudget), [profile.productScope, profile.productBudget]);
  const grouped = useMemo(() => groupBy(products), [products]);
  const tabs = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const [activeTab, setActiveTab] = useState<ProductCategory | null>(null);

  // Set first tab when unlocked
  const handleUnlock = () => {
    setShowPaywall(false);
    setUnlocked(true);
    setActiveTab(tabs[0] || null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const activeProducts = activeTab ? grouped.get(activeTab) || [] : [];
  const chosenAuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[chosenAuntyId];

  // ─── PRE-PAYWALL: Trust + CTA ────────────────────────────────
  if (!unlocked) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={[styles.prePaywall, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          {/* Hook */}
          <Animated.View entering={FadeIn.delay(200).duration(500)}>
            <Text style={styles.title}>We Found {products.length} Products{'\n'}For Your Hair</Text>
            <Text style={styles.subtitle}>
              Every one vetted for {profile.curlType || 'your'} texture. No silicones. No sulfates. Just what works.
            </Text>
          </Animated.View>

          {/* Category preview */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.categoryPreview}>
            <Text style={styles.previewTitle}>YOUR PRODUCT CATEGORIES</Text>
            {tabs.map((cat) => (
              <View key={cat} style={styles.categoryRow}>
                <View style={[styles.categoryDot, { backgroundColor: ac.accent }]} />
                <Text style={styles.categoryName}>{CAT_LABELS[cat] || cat}</Text>
                <Text style={styles.categoryCount}>{grouped.get(cat)?.length} picks</Text>
              </View>
            ))}
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.delay(800)} style={styles.ctaSection}>
            <Button
              label="See My Products"
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowPaywall(true); }}
              variant="primary"
              size="lg"
            />
            <Pressable onPress={() => navigation.navigate('SendOff')} style={styles.skipBtn} hitSlop={12}>
              <Text style={styles.skipTextMuted}>Maybe later</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        <PaywallModal
          visible={showPaywall}
          onClose={() => { setShowPaywall(false); navigation.navigate('SendOff'); }}
          onSubscribe={handleUnlock}
        />
      </View>
    );
  }

  // ─── POST-PAYWALL: Tabs + Full Products ──────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.overline}>YOUR RECOMMENDATIONS</Text>
        <Text style={styles.titleSmall}>Products For You</Text>
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
        {tabs.map((cat) => {
          const isActive = activeTab === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(cat); }}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{CAT_LABELS[cat] || cat}</Text>
              <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>{grouped.get(cat)?.length}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Products for active tab */}
      <ScrollView style={styles.productScroll} contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {activeProducts.map((p, i) => {
          const ac = auntyColors[p.recommendedBy];
          return (
            <Animated.View key={p.id} entering={FadeInDown.delay(i * 60)}>
              <View style={[styles.card, { borderLeftColor: ac.accent }]}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardBrand}>{p.brand}</Text>
                  <Text style={styles.cardPrice}>{p.price}</Text>
                </View>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={styles.cardDesc}>{p.description}</Text>
                <View style={styles.auntyRow}>
                  <AuntyAvatar auntyId={p.recommendedBy} size={28} showRing />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.auntyName, { color: ac.accent }]}>{AUNTIES[p.recommendedBy].name} says:</Text>
                    <Text style={styles.auntyQuote}>"{p.whyItWorks}"</Text>
                  </View>
                </View>
                {p.isBudgetFriendly && (
                  <View style={styles.budgetTag}><Text style={styles.budgetText}>BUDGET FRIENDLY</Text></View>
                )}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Continue button */}
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

  sellSection: { gap: spacing.md },
  sellCard: { flexDirection: 'row', gap: spacing.md },
  sellNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  sellNumText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: '#fff' },
  sellTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.ink, marginBottom: 2 },
  sellDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, lineHeight: fontSize.sm * 1.5 },
  comparison: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, backgroundColor: colors.primaryMuted, borderRadius: radius.md },
  comparisonText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.primaryDeep, textAlign: 'center', lineHeight: fontSize.sm * 1.5 },

  categoryPreview: { gap: spacing.sm },
  previewTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.muted, letterSpacing: letterSpacing.wide, marginBottom: spacing.xs },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  categoryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  categoryName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.ink, flex: 1 },
  categoryCount: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },

  ctaSection: { gap: spacing.md, marginTop: spacing.md },
  skipBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  skipText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },
  skipTextMuted: { fontFamily: fonts.body, fontSize: fontSize.xs, color: 'rgba(0,0,0,0.25)' },

  // Post-paywall
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  titleSmall: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.ink, letterSpacing: letterSpacing.tight, marginTop: spacing.xs },

  tabScroll: { maxHeight: 44, marginBottom: spacing.sm },
  tabRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.muted },
  tabLabelActive: { color: colors.canvas },
  tabBadge: { backgroundColor: colors.canvasDeep, borderRadius: radius.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeActive: { backgroundColor: 'rgba(254,248,236,0.2)' },
  tabBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.muted },
  tabBadgeTextActive: { color: colors.canvas },

  productScroll: { flex: 1 },
  productList: { paddingHorizontal: spacing.lg, gap: spacing.sm },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderLeftWidth: 3, padding: spacing.md, gap: spacing.sm, ...shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.muted, textTransform: 'uppercase', letterSpacing: letterSpacing.wide },
  cardPrice: { fontFamily: fonts.display, fontSize: fontSize.lg, color: colors.ink },
  cardName: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, letterSpacing: letterSpacing.tight },
  cardDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.5 },
  auntyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  auntyName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  auntyQuote: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, fontStyle: 'italic', lineHeight: fontSize.sm * 1.5 },
  budgetTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(26,122,74,0.1)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  budgetText: { fontFamily: fonts.bodySemiBold, fontSize: 9, color: colors.success, letterSpacing: letterSpacing.wider },

  bottomBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.canvas, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
