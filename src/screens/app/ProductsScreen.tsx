/**
 * ProductsScreen — Premium product recommendations.
 *
 * Horizontal category tabs with count badges.
 * Cards show brand, name, price, aunty recommendation, rating.
 * Premium picks elevated. Budget-friendly tagged.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { ProductThumb } from '../../components/ProductThumb';
import { AUNTIES } from '../../constants/aunties';
import { PRODUCTS, CATEGORY_LABELS, type Product, type ProductCategory } from '../../constants/products';
import { useOnboarding } from '../../context/OnboardingContext';
import { buildRoutine } from '../../utils/recommendation';
import { buildAffiliateUrl } from '../../utils/affiliate';
import { DISCLAIMER_SHORT, AFFILIATE_DISCLOSURE } from '../../constants/legal';
import type { ProductScope, BrandTier } from '../../types';
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

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (profile.curlType && p.curlTypes.length > 0 && !p.curlTypes.includes(profile.curlType)) return false;
      if (profile.porosity && p.porosity.length > 0 && !p.porosity.includes(profile.porosity)) return false;
      return true;
    });
  }, [profile.curlType, profile.porosity]);

  const isMatchedForUser = useCallback((p: Product) => {
    let score = 0;
    if (profile.curlType && p.curlTypes.includes(profile.curlType)) score++;
    if (profile.porosity && p.porosity.includes(profile.porosity)) score++;
    if (profile.primaryGoal && p.goals.includes(profile.primaryGoal)) score++;
    return score >= 2;
  }, [profile.curlType, profile.porosity, profile.primaryGoal]);

  // Curated prescription — the saved routine, shown first.
  const lineup = useMemo(
    () =>
      buildRoutine(
        (profile.productScope as ProductScope) || 'routine',
        (profile.brandTier as BrandTier) || 'mix',
        profile.productBudgetTotal,
        profile,
      ),
    [profile],
  );

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);
  const tabs = useMemo(() => Array.from(grouped.keys()), [grouped]);
  const [activeTab, setActiveTab] = useState<ProductCategory>(tabs[0] || 'cleanser');
  const activeProducts = grouped.get(activeTab) || [];

  // ─── Product feedback (owned / bought / rating) ──────────────────
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [purchased, setPurchased] = useState<Record<string, { purchasedAt: string }>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      try {
        const [o, p, r] = await AsyncStorage.multiGet([
          'product_owned_v1',
          'product_purchased_v1',
          'product_ratings_v1',
        ]);
        if (o[1]) setOwned(JSON.parse(o[1]));
        if (p[1]) setPurchased(JSON.parse(p[1]));
        if (r[1]) setRatings(JSON.parse(r[1]));
      } catch {
        // best effort
      }
    })();
  }, []);

  const toggleOwned = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOwned((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem('product_owned_v1', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const markBought = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchased((prev) => {
      if (prev[id]) return prev; // record once
      const next = { ...prev, [id]: { purchasedAt: new Date().toISOString() } };
      AsyncStorage.setItem('product_purchased_v1', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const rateProduct = useCallback((id: string, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRatings((prev) => {
      const next = { ...prev, [id]: value };
      AsyncStorage.setItem('product_ratings_v1', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Separate premium picks
  const premiumProducts = activeProducts.filter((p) => p.isPremiumPick);
  const regularProducts = activeProducts.filter((p) => !p.isPremiumPick);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[lineup.length > 0 ? 2 : 1]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
      {/* ─── Header ──────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.overline}>AUNTY&apos;S PICKS</Text>
        <Text style={styles.title}>Your Products</Text>
        <Text style={styles.subtitle}>
          Matched to {[profile.curlType, profile.porosity ? `${profile.porosity} porosity` : null].filter(Boolean).join(', ') || 'your'} hair
        </Text>
      </View>

      {/* ─── Your Lineup (curated prescription) ────────────── */}
      {lineup.length > 0 && (
        <View style={styles.lineupSection}>
          <View style={styles.lineupHeader}>
            <SparkleIcon size={12} />
            <Text style={styles.sectionLabel}>Your Lineup</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lineupRow}
          >
            {lineup.map((item) => {
              const p = item.product;
              const pac = auntyColors[p.recommendedBy];
              return (
                <Pressable
                  key={item.slot.key}
                  onPress={() => {
                    if (p.affiliateUrl) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Linking.openURL(buildAffiliateUrl(p.affiliateUrl));
                    }
                  }}
                  style={styles.lineupCard}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.slot.label}: ${p.brand} ${p.name}, ${p.price}`}
                >
                  <Text style={[styles.lineupSlot, { color: pac.accent }]}>{item.slot.label.toUpperCase()}</Text>
                  <ProductThumb imageUrl={p.imageUrl} brand={p.brand} accent={pac.accent} size={84} />
                  <Text style={styles.lineupBrand} numberOfLines={1}>{p.brand}</Text>
                  <Text style={styles.lineupName} numberOfLines={2}>{p.name}</Text>
                  <Text style={styles.lineupPrice}>{p.price}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.exploreLabel}>EXPLORE MORE</Text>
        </View>
      )}

      {/* ─── Category Tabs (sticky) ───────────────────────── */}
      <View style={styles.tabStickyWrap}>
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
      </View>

      {/* ─── Product List ──────────────────────────────────── */}
      <View style={styles.productList}>
        {/* Premium Picks Section */}
        {premiumProducts.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <SparkleIcon />
              <Text style={styles.sectionLabel}>Premium Picks</Text>
            </View>
            {premiumProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                isPremium
                isMatched={isMatchedForUser(p)}
                owned={!!owned[p.id]}
                purchased={!!purchased[p.id]}
                userRating={ratings[p.id] ?? 0}
                onToggleOwned={() => toggleOwned(p.id)}
                onMarkBought={() => markBought(p.id)}
                onRate={(v) => rateProduct(p.id, v)}
              />
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
                isMatched={isMatchedForUser(p)}
                owned={!!owned[p.id]}
                purchased={!!purchased[p.id]}
                userRating={ratings[p.id] ?? 0}
                onToggleOwned={() => toggleOwned(p.id)}
                onMarkBought={() => markBought(p.id)}
                onRate={(v) => rateProduct(p.id, v)}
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
      </View>

      {/* ─── Disclosure footer ─────────────────────────────── */}
      <View style={styles.disclosure}>
        <Text style={styles.disclosureText}>{DISCLAIMER_SHORT}</Text>
        <Text style={styles.disclosureText}>{AFFILIATE_DISCLOSURE}</Text>
      </View>
      </ScrollView>
    </View>
  );
}

// ─── Product Card Component ─────────────────────────────────────

function ProductCard({
  product: p,
  index,
  isPremium = false,
  isMatched = false,
  owned = false,
  purchased = false,
  userRating = 0,
  onToggleOwned,
  onMarkBought,
  onRate,
}: {
  product: Product;
  index: number;
  isPremium?: boolean;
  isMatched?: boolean;
  owned?: boolean;
  purchased?: boolean;
  userRating?: number;
  onToggleOwned?: () => void;
  onMarkBought?: () => void;
  onRate?: (value: number) => void;
}) {
  const ac = auntyColors[p.recommendedBy];
  const aunty = AUNTIES[p.recommendedBy];

  const handlePress = useCallback(() => {
    if (p.affiliateUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(buildAffiliateUrl(p.affiliateUrl));
    }
  }, [p.affiliateUrl]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <PressableCard onPress={handlePress}>
        <View style={[styles.card, isPremium && styles.cardPremium]}>
          {/* Thumbnail + brand/name/price */}
          <View style={styles.cardHead}>
            <ProductThumb
              imageUrl={p.imageUrl}
              brand={p.brand}
              accent={ac.accent}
              size={72}
            />
            <View style={styles.cardHeadText}>
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
              <Text style={styles.cardName} numberOfLines={2}>{p.name}</Text>
            </View>
          </View>

          {/* Description + Tags inline */}
          <Text style={styles.cardDesc} numberOfLines={2}>{p.description}</Text>

          {(p.isBudgetFriendly || isPremium || isMatched) && (
            <View style={styles.tagRow}>
              {isMatched && (
                <View style={styles.matchedPill}>
                  <Text style={styles.matchedPillText}>Matched for You</Text>
                </View>
              )}
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

          {/* Aunty recommendation — compact */}
          <View style={[styles.auntySection, { backgroundColor: ac.bg }]}>
            <AuntyAvatar auntyId={p.recommendedBy} size={28} showRing />
            <View style={styles.auntyContent}>
              <Text style={[styles.auntyLabel, { color: ac.accent }]}>
                {aunty.name} says
              </Text>
              <Text style={styles.auntyQuote} numberOfLines={2}>
                &ldquo;{p.whyItWorks}&rdquo;
              </Text>
            </View>
          </View>

          {/* ─── Feedback actions ───────────────────────────── */}
          <View style={styles.feedbackRow}>
            <Pressable
              onPress={onToggleOwned}
              style={[styles.feedbackPill, owned && styles.feedbackPillActive]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityState={{ selected: owned }}
              accessibilityLabel="I already use this"
            >
              <Text style={[styles.feedbackPillText, owned && styles.feedbackPillTextActive]}>
                {owned ? '✓ I use this' : 'I already use this'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onMarkBought}
              style={[styles.feedbackPill, purchased && styles.feedbackPillActive]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityState={{ selected: purchased }}
              accessibilityLabel="I bought this"
            >
              <Text style={[styles.feedbackPillText, purchased && styles.feedbackPillTextActive]}>
                {purchased ? '✓ Bought' : 'I bought this'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.feedbackStars} accessibilityRole="adjustable" accessibilityLabel="Rate this product">
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => onRate?.(i)} hitSlop={6} style={styles.starBtn} accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`}>
                <StarIcon filled={i <= userRating} size={18} />
              </Pressable>
            ))}
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

  // Your Lineup band
  lineupSection: {
    marginBottom: spacing.sm,
  },
  lineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  lineupRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  lineupCard: {
    width: 130,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  lineupSlot: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: letterSpacing.wide,
    alignSelf: 'flex-start',
  },
  lineupBrand: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wide,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  lineupName: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.ink,
    alignSelf: 'flex-start',
    lineHeight: fontSize.sm * 1.3,
  },
  lineupPrice: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.ink,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  exploreLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    color: colors.muted,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
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
  tabStickyWrap: {
    backgroundColor: colors.canvas,
  },
  productList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.xs,
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
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardHeadText: {
    flex: 1,
    gap: spacing.xs,
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
  matchedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 160, 74, 0.20)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  matchedPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primaryDeep,
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

  // Feedback (owned / bought / rating)
  feedbackRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  feedbackPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  feedbackPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  feedbackPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  feedbackPillTextActive: {
    color: colors.surface,
  },
  feedbackStars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  starBtn: {
    padding: 2,
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
  disclosure: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  disclosureText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: fontSize.xs * 1.4,
  },
});
