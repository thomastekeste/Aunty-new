import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllProducts } from '@/constants/products';
import { getAunty } from '@/constants/aunties';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';

export default function ProductChatScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const products = getAllProducts();

  const handleProductPress = (productId: string, auntyId: string) => {
    navigation.navigate('AuntyConversation', {
      auntyId,
      initialQuestion: `Tell me about this product and how it fits into my routine.`,
    });
  };

  const handleCouncilPress = () => {
    // Open AuntyConversation with no initial aunty selected, shows carousel
    navigation.navigate('AuntyConversation', {
      auntyId: '1', // Default, but user can switch in modal
      initialQuestion: undefined,
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Ask about products</Text>
        <Text style={styles.title}>Product Chat</Text>
        <Text style={styles.subtitle}>Tap a product or talk to the whole council</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Carousel */}
        <Text style={styles.sectionLabel}>Products</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productCarousel}
          scrollEventThrottle={16}
        >
          {products.map(product => {
            const aunty = getAunty(product.recommended_by_aunty_id);
            const ac = auntyColors[product.recommended_by_aunty_id];

            return (
              <TouchableOpacity
                key={product.id}
                style={[styles.productChip, { borderColor: `${ac.accent}40`, backgroundColor: `${ac.accent}12` }]}
                onPress={() => handleProductPress(product.id, product.recommended_by_aunty_id)}
                activeOpacity={0.8}
              >
                <View style={styles.chipContent}>
                  <Text style={styles.productChipName}>{product.name}</Text>
                  <Text style={[styles.productChipBrand, { color: ac.accent }]}>{aunty.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Talk to Council Section */}
        <View style={styles.councilSection}>
          <Text style={styles.sectionLabel}>Or talk to the council</Text>
          <TouchableOpacity
            style={styles.councilCard}
            onPress={handleCouncilPress}
            activeOpacity={0.8}
          >
            <View style={styles.councilAvatarRow}>
              {['1', '2', '3', '4', '5', '6', '7'].map((id, i) => (
                <View
                  key={id}
                  style={[
                    styles.councilAvatar,
                    { marginLeft: i === 0 ? 0 : -12, borderColor: auntyColors[id].accent },
                  ]}
                >
                  <AuntyAvatar auntyId={id} size={32} />
                </View>
              ))}
            </View>
            <Text style={styles.councilTitle}>Talk to the council</Text>
            <Text style={styles.councilSubtitle}>Get advice from all seven aunties</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoBullet}>
            <Text style={styles.infoBulletDot}>•</Text>
            <Text style={styles.infoBulletText}>Tap a product to chat with the aunty who recommends it</Text>
          </View>
          <View style={styles.infoBullet}>
            <Text style={styles.infoBulletDot}>•</Text>
            <Text style={styles.infoBulletText}>Ask questions about ingredients, application, or how it fits your routine</Text>
          </View>
          <View style={styles.infoBullet}>
            <Text style={styles.infoBulletDot}>•</Text>
            <Text style={styles.infoBulletText}>Or chat with the full council for broader hair advice</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
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
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  productCarousel: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  productChip: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    minWidth: 140,
    ...shadows.sm,
  },
  chipContent: {
    gap: spacing.xs,
  },
  productChipName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  productChipBrand: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  councilSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  councilCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  councilAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  councilAvatar: {
    borderWidth: 2,
    borderRadius: 20,
  },
  councilTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  councilSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  infoTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  infoBullet: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoBulletDot: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  infoBulletText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
