import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { getAllProducts, getFreeProducts } from '@/constants/products';
import { productService } from '@/services/supabase';
import { getAunty } from '@/constants/aunties';
import AuntyAvatar from '@/components/AuntyAvatar';
import Button from '@/components/Button';
import { colors, fonts, spacing, fontSize, fontWeight, radius } from '@/constants/theme';

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isActive } = useSubscription();

  const products = isActive ? getAllProducts() : getFreeProducts();

  const handleProductPress = async (productId: string, affiliateLink: string) => {
    if (user) {
      productService.trackClick(user.id, productId).catch(console.error);
    }
    await Linking.openURL(affiliateLink);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Product Shelf</Text>
        <Text style={styles.subtitle}>
          {isActive ? 'Your full shelf.' : '3 starting products. Upgrade for the full shelf.'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {!isActive && (
          <View style={styles.upgradeBanner}>
            <Text style={styles.upgradeText}>Unlock 7+ products + full routine for $1.99/month</Text>
            <Button label="Upgrade" onPress={() => {}} variant="secondary" style={{ marginTop: spacing.sm }} />
          </View>
        )}

        {products.map(product => {
          const aunty = getAunty(product.recommended_by_aunty_id);
          return (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => handleProductPress(product.id, product.affiliate_link)}
              activeOpacity={0.75}
            >
              <View style={styles.productMain}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{product.category}</Text>
                  </View>
                </View>
                {product.price_usd && (
                  <Text style={styles.productPrice}>${product.price_usd.toFixed(2)}</Text>
                )}
              </View>

              <View style={styles.recommendedBy}>
                <AuntyAvatar auntyId={product.recommended_by_aunty_id} size={20} />
                <Text style={styles.recommendedByText}>
                  Recommended by {aunty.name}
                </Text>
              </View>

              <Text style={styles.shopLink}>Shop on Amazon →</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.ink, letterSpacing: -0.5, fontFamily: fonts.display },
  subtitle: { fontSize: fontSize.md, color: colors.muted, marginTop: 2, fontFamily: fonts.body },
  content: { padding: spacing.md },
  upgradeBanner: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  upgradeText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, fontFamily: fonts.body },
  productCard: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  productMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  productInfo: { flex: 1, marginRight: spacing.sm },
  productName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink, fontFamily: fonts.body },
  productBrand: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2, fontFamily: fonts.body },
  categoryPill: {
    alignSelf: 'flex-start', marginTop: spacing.xs,
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  categoryText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.3, fontFamily: fonts.body },
  productPrice: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink, fontFamily: fonts.body },
  recommendedBy: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  recommendedByText: { fontSize: fontSize.xs, color: colors.muted, fontFamily: fonts.body },
  shopLink: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.amber, fontFamily: fonts.body },
});
