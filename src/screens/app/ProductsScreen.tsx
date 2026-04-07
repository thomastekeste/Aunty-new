/**
 * ProductsScreen — Product recommendations tabbed by type.
 *
 * Horizontal tabs: Shampoo, Conditioner, Mask, Oil, etc.
 * Each tab shows products matched to the user's hair profile.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { AUNTIES } from '../../constants/aunties';
import { PRODUCTS, type Product, type ProductCategory } from '../../constants/products';
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

const CAT_LABELS: Record<string, string> = {
  cleanser: 'Shampoo', conditioner: 'Conditioner', 'deep-conditioner': 'Mask',
  'leave-in': 'Leave-In', styler: 'Styler', gel: 'Gel', cream: 'Cream',
  oil: 'Oil', 'protein-treatment': 'Protein', 'scalp-treatment': 'Scalp',
  tool: 'Tools', accessory: 'Accessories',
};

function groupByCategory(products: Product[]): Map<ProductCategory, Product[]> {
  const map = new Map<ProductCategory, Product[]>();
  for (const p of products) {
    const list = map.get(p.category) || [];
    list.push(p);
    map.set(p.category, list);
  }
  return map;
}

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const profile = state.data.hairProfile;

  // Filter products relevant to user's profile
  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (profile.curlType && p.curlTypes.length > 0 && !p.curlTypes.includes(profile.curlType)) return false;
      return true;
    });
  }, [profile.curlType]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);
  const tabs = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const [activeTab, setActiveTab] = useState<ProductCategory>(tabs[0] || 'cleanser');
  const activeProducts = grouped.get(activeTab) || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.overline}>AUNTY'S PICKS</Text>
        <Text style={styles.title}>Your Products</Text>
        <Text style={styles.subtitle}>
          Matched to {profile.curlType || 'your'} hair
        </Text>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {tabs.map((cat) => {
          const active = activeTab === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(cat); }}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {CAT_LABELS[cat] || cat}
              </Text>
              <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>
                  {grouped.get(cat)?.length || 0}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Products */}
      <ScrollView
        style={styles.productScroll}
        contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeProducts.map((p, i) => {
          const ac = auntyColors[p.recommendedBy];
          return (
            <Animated.View key={p.id} entering={FadeInDown.delay(i * 50)}>
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
                    <Text style={[styles.auntyName, { color: ac.accent }]}>
                      {AUNTIES[p.recommendedBy].name} says:
                    </Text>
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
        {activeProducts.length === 0 && (
          <Text style={styles.empty}>No products in this category for your hair type.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  overline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest, color: colors.primary },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxxl, color: colors.ink, letterSpacing: letterSpacing.tight, marginTop: spacing.xs },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, marginTop: spacing.xs },

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
  empty: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, textAlign: 'center', paddingVertical: spacing.xxl },
});
