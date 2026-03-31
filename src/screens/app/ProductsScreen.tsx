import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getAllProducts } from '@/constants/products';
import { productService } from '@/services/supabase';
import { getAunty } from '@/constants/aunties';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const products = getAllProducts();

  const handleProductPress = async (productId: string, affiliateLink: string) => {
    if (user) {
      productService.trackClick(user.id, productId).catch(console.error);
    }
    await Linking.openURL(affiliateLink);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Aunty-curated</Text>
        <Text style={styles.title}>Product Shelf</Text>
        <Text style={styles.subtitle}>Your full shelf — every product hand-picked.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {products.map(product => {
          const aunty = getAunty(product.recommended_by_aunty_id);
          const ac = auntyColors[product.recommended_by_aunty_id];
          return (
            <TouchableOpacity
              key={product.id}
              style={[styles.productCard, { borderTopColor: ac.accent }]}
              onPress={() => handleProductPress(product.id, product.affiliate_link)}
              activeOpacity={0.8}
            >
              <View style={styles.productTop}>
                <View style={styles.productInfo}>
                  <View style={[styles.categoryPill, { backgroundColor: `${ac.accent}15`, borderColor: `${ac.accent}35` }]}>
                    <Text style={[styles.categoryText, { color: ac.accent }]}>{product.category}</Text>
                  </View>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                </View>
                {product.price_usd && (
                  <Text style={[styles.productPrice, { color: ac.text }]}>${product.price_usd.toFixed(2)}</Text>
                )}
              </View>

              <View style={styles.productBottom}>
                <View style={styles.recommendedBy}>
                  <View style={[styles.avatarRing, { borderColor: `${ac.accent}50` }]}>
                    <AuntyAvatar auntyId={product.recommended_by_aunty_id} size={24} />
                  </View>
                  <Text style={[styles.recommendedByText, { color: ac.text }]}>
                    {aunty.name} recommends
                  </Text>
                </View>
                <View style={[styles.shopBtn, { backgroundColor: ac.accent }]}>
                  <Text style={styles.shopBtnText}>Shop →</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 4,
  },
  content: { padding: spacing.md, gap: spacing.md },

  // Upgrade banner
  upgradeBanner: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  upgradeBannerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  upgradeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeAvatar: {
    borderWidth: 2,
    borderRadius: 20,
  },
  upgradeTextBlock: {
    flex: 1,
  },
  upgradeTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -0.3,
  },
  upgradeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(254,248,236,0.45)',
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  upgrdeDescription: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(254,248,236,0.55)',
    lineHeight: 20,
  },
  upgradePricing: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(254,248,236,0.3)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Product cards
  productCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 3,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  productInfo: { flex: 1, marginRight: spacing.sm, gap: spacing.xs },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    marginBottom: 2,
  },
  categoryText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  productName: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  productBrand: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  productPrice: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: -0.5,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  recommendedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatarRing: {
    borderWidth: 1.5,
    borderRadius: 15,
    padding: 1,
  },
  recommendedByText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  shopBtn: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  shopBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
