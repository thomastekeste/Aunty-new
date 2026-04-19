/**
 * ProductsScreen — Premium product recommendations.
 *
 * Horizontal category tabs with count badges.
 * Cards show brand, name, price, aunty recommendation, rating.
 * Premium picks elevated. Budget-friendly tagged.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { AUNTIES } from '../../constants/aunties';
import { PRODUCTS, CATEGORY_LABELS, type Product, type ProductCategory } from '../../constants/products';
import { getRecommendations } from '../../services/recommendations';
import { useOnboarding } from '../../context/OnboardingContext';
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

// ─── SVG Icons ──────────────────────────────────────────────────

function StarIcon({ filled = true, size = 12 }: { filled?: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? colors.primary : 'none'}
        stroke={filled ? colors.primary : colors.border}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SparkleIcon({ color = colors.primary, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
      />
    </Svg>
  );
}

function LeafIcon({ color = colors.success, size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.18 20 15.58 17.01 17 13C18.44 8.94 18 4 18 4C18 4 17 4 17 8Z" fill={color} />
    </Svg>
  );
}

function TagIcon({ color = colors.muted, size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M7 7H7.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function EmptyBagIcon({ color = colors.muted, size = 48 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M3 6H21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Star Rating ────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  return (
    <View style={ratingStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= full || (i === full + 1 && hasHalf)} size={11} />
      ))}
      <Text style={ratingStyles.text}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  text: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.muted, marginLeft: 2 },
});

// ─── Pressable Card with scale ──────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressableCard({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withTiming(0.98, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      onPress={onPress}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function groupByCategory(products: Product[]): Map<ProductCategory, Product[]> {
  const map = new Map<ProductCategory, Product[]>();
  for (const p of products) {
    const list = map.get(p.category) || [];
    list.push(p);
    map.set(p.category, list);
  }
  return map;
}

// ─── Component ──────────────────────────────────────────────────

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const profile = state.data.hairProfile;

  // Use full recommendation engine — scored, sorted, personalized
  const bundle = useMemo(() => getRecommendations(profile), [
    profile.curlType,
    profile.porosity,
    profile.primaryGoal,
    profile.secondaryGoals,
    profile.scalpConcerns,
    profile.heatUse,
    profile.colorTreated,
  ]);

  // byCategory from recs; fall back to unscored products for completeness
  const grouped = useMemo<Map<ProductCategory, Product[]>>(() => {
    const map = new Map<ProductCategory, Product[]>();
    // Start with recommendation engine results
    for (const [cat, recs] of Object.entries(bundle.byCategory)) {
      map.set(cat as ProductCategory, recs.map((r) => r.product));
    }
    // Fill any missing categories with unfiltered products
    for (const p of PRODUCTS) {
      if (!map.has(p.category)) {
        const list = map.get(p.category) || [];
        list.push(p);
        map.set(p.category, list);
      }
    }
    return map;
  }, [bundle]);

  // Build a quick reason lookup: productId → reason string
  const reasonMap = useMemo<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const recs of Object.values(bundle.byCategory)) {
      for (const r of recs) {
        m[r.product.id] = r.reason;
      }
    }
    return m;
  }, [bundle]);

  const tabs = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const [activeTab, setActiveTab] = useState<ProductCategory>(tabs[0] || 'cleanser');
  const activeProducts = grouped.get(activeTab) || [];

  // Separate premium picks
  const premiumProducts = activeProducts.filter((p) => p.isPremiumPick);
  const regularProducts = activeProducts.filter((p) => !p.isPremiumPick);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* ─── Header ──────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.overline}>AUNTY'S PICKS</Text>
        <Text style={styles.title}>Your Products</Text>
        <Text style={styles.subtitle}>
          Personalised{profile.curlType ? ` for ${profile.curlType} hair` : ' for your profile'}
        </Text>
      </View>

      {/* ─── Category Tabs ─────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
        style={styles.tabScroll}
      >
        {tabs.map((cat) => {
          const active = activeTab === cat;
          const count = grouped.get(cat)?.length || 0;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(cat);
              }}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${CATEGORY_LABELS[cat] || cat}, ${count} products`}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {CATEGORY_LABELS[cat] || cat}
              </Text>
              <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ─── Product List ──────────────────────────────────── */}
      <ScrollView
        style={styles.productScroll}
        contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Picks Section */}
        {premiumProducts.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <SparkleIcon />
              <Text style={styles.sectionLabel}>Premium Picks</Text>
            </View>
            {premiumProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} isPremium reason={reasonMap[p.id]} />
            ))}
          </View>
        )}

        {/* Regular Products */}
        {regularProducts.length > 0 && (
          <View style={styles.sectionBlock}>
            {premiumProducts.length > 0 && (
              <View style={styles.sectionHeader}>
                <TagIcon />
                <Text style={styles.sectionLabel}>All {CATEGORY_LABELS[activeTab] || activeTab}</Text>
              </View>
            )}
            {regularProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={premiumProducts.length + i}
                reason={reasonMap[p.id]}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {activeProducts.length === 0 && (
          <View style={styles.emptyState}>
            <EmptyBagIcon />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>
              {!profile.curlType
                ? 'Complete your hair quiz so we can match products to your curl type.'
                : `We don't have ${CATEGORY_LABELS[activeTab]?.toLowerCase() || 'products'} matched to your hair type yet. Check back soon.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Product Card Component ─────────────────────────────────────

function ProductCard({
  product: p,
  index,
  isPremium = false,
  reason,
}: {
  product: Product;
  index: number;
  isPremium?: boolean;
  reason?: string;
}) {
  const ac = auntyColors[p.recommendedBy];
  const aunty = AUNTIES[p.recommendedBy];

  const handlePress = useCallback(() => {
    if (p.affiliateUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(p.affiliateUrl);
    }
  }, [p.affiliateUrl]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <PressableCard onPress={handlePress}>
        <View style={[styles.card, isPremium && styles.cardPremium]}>
          {/* Brand + Rating + Price row */}
          <View style={styles.cardTopRow}>
            <View style={styles.cardBrandCol}>
              <Text style={styles.cardBrand}>{p.brand}</Text>
              <Text style={styles.cardSizeInline}>{p.size}</Text>
            </View>
            <View style={styles.cardPriceCol}>
              <Text style={styles.cardPrice}>{p.price}</Text>
              <StarRating rating={p.rating} />
            </View>
          </View>

          {/* Name */}
          <Text style={styles.cardName} numberOfLines={2}>{p.name}</Text>

          {/* Description + Tags inline */}
          <Text style={styles.cardDesc} numberOfLines={2}>{p.description}</Text>

          {(p.isBudgetFriendly || isPremium) && (
            <View style={styles.tagRow}>
              {p.isBudgetFriendly && (
                <View style={styles.budgetPill}>
                  <LeafIcon size={11} />
                  <Text style={styles.budgetPillText}>Budget Friendly</Text>
                </View>
              )}
              {isPremium && (
                <View style={styles.premiumPill}>
                  <SparkleIcon size={10} color={colors.primary} />
                  <Text style={styles.premiumPillText}>Premium Pick</Text>
                </View>
              )}
            </View>
          )}

          {/* Why recommended — from engine */}
          {reason && (
            <View style={styles.reasonPill}>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          )}

          {/* Aunty recommendation — compact */}
          <View style={[styles.auntySection, { backgroundColor: ac.bg }]}>
            <AuntyAvatar auntyId={p.recommendedBy} size={28} showRing />
            <View style={styles.auntyContent}>
              <Text style={[styles.auntyLabel, { color: ac.accent }]}>
                {aunty.name} says
              </Text>
              <Text style={styles.auntyQuote} numberOfLines={2}>
                "{p.whyItWorks}"
              </Text>
            </View>
          </View>
        </View>
      </PressableCard>
    </Animated.View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  // Tabs
  tabScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 44,
  },
  tabActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.canvas,
  },
  tabBadge: {
    backgroundColor: colors.canvasDeep,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(254, 248, 236, 0.2)',
  },
  tabBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  tabBadgeTextActive: {
    color: colors.canvas,
  },

  // Product list
  productScroll: {
    flex: 1,
  },
  productList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Sections
  sectionBlock: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },

  // Product card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs + 2,
    ...shadows.sm,
  },
  cardPremium: {
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    ...shadows.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBrandCol: {
    gap: 1,
  },
  cardBrand: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
  },
  cardSizeInline: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  cardPriceCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  cardName: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
  },
  cardPrice: {
    fontFamily: fonts.display,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.5,
  },

  // Tags
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  budgetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26, 122, 74, 0.08)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  budgetPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  premiumPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primaryDeep,
  },

  // Recommendation reason chip
  reasonPill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '14',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 0.1,
  },

  // Aunty recommendation
  auntySection: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  auntyContent: {
    flex: 1,
  },
  auntyLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  auntyQuote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    fontStyle: 'italic',
    lineHeight: fontSize.sm * 1.5,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
    paddingHorizontal: spacing.xl,
  },
});
