import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import { getAunty } from '@/constants/aunties';
import { getFreeProducts } from '@/constants/products';
import AuntyAvatar from '@/components/AuntyAvatar';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors, shadows } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Routine'>;

const DAY_KEYS = ['wash_day', 'style_day', 'refresh_day', 'rest_day'] as const;

export default function RoutineScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { routine, data, hairAnalysis } = useOnboarding();
  const freeProducts = getFreeProducts();

  const hairTags = [
    data.porosity && `${data.porosity} porosity`,
    data.density && `${data.density} density`,
    data.elasticity && `${data.elasticity} elasticity`,
  ].filter(Boolean) as string[];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Built by the council</Text>
        <Text style={styles.title}>Your Routine</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hair Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Text style={styles.profileLabel}>Hair Profile</Text>
            <Text style={styles.curlTypeLarge}>{hairAnalysis?.curl_type?.toUpperCase() ?? '—'}</Text>
            {data.primary_goal && (
              <Text style={styles.goalText}>Goal: {data.primary_goal}</Text>
            )}
          </View>
          <View style={styles.profileRight}>
            {hairTags.map((tag, i) => (
              <View key={i} style={styles.profileTag}>
                <Text style={styles.profileTagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {/* Gold accent rule */}
          <View style={styles.profileAccentBar} />
        </View>

        {/* Weekly Schedule */}
        <View style={styles.scheduleHeader}>
          <Text style={styles.sectionEyebrow}>Weekly Schedule</Text>
          <Text style={styles.sectionTitle}>Your 4-day cycle</Text>
        </View>

        {routine && DAY_KEYS.map(dayKey => {
          const day = routine[dayKey];
          if (!day) return null;
          const aunty = getAunty(day.hosted_by_aunty_id);
          const ac = auntyColors[day.hosted_by_aunty_id];

          return (
            <View key={dayKey} style={[styles.dayCard, { borderTopColor: ac.accent }]}>
              <View style={[styles.dayCardAccent, { backgroundColor: ac.accent }]} />
              <View style={styles.dayHeader}>
                <View style={[styles.auntyRing, { borderColor: `${ac.accent}70` }]}>
                  <AuntyAvatar auntyId={day.hosted_by_aunty_id} size={40} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.dayName}>{day.day_name}</Text>
                  <Text style={[styles.dayHost, { color: ac.accent }]}>
                    {aunty.name} · {day.estimated_time_minutes} min
                  </Text>
                </View>
                <View style={[styles.dayTimeBadge, { backgroundColor: `${ac.accent}15`, borderColor: `${ac.accent}30` }]}>
                  <Text style={[styles.dayTimeBadgeText, { color: ac.accent }]}>
                    {day.estimated_time_minutes}m
                  </Text>
                </View>
              </View>
              <Text style={styles.dayPurpose}>{day.purpose}</Text>
              {day.steps.map(step => (
                <View key={step.step_number} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { backgroundColor: ac.accent }]}>
                    <Text style={styles.stepNum}>{step.step_number}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepName}>{step.name}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Product Shelf */}
        <View style={styles.scheduleHeader}>
          <Text style={styles.sectionEyebrow}>Your Product Shelf</Text>
          <Text style={styles.sectionTitle}>3 products to start</Text>
          <Text style={styles.sectionSubtitle}>Upgrade for the full aunty-curated shelf.</Text>
        </View>

        {freeProducts.map(product => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => Linking.openURL(product.affiliate_link)}
            activeOpacity={0.8}
          >
            <View style={styles.productAccentDot} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productBrand}>{product.brand}</Text>
              {product.price_usd && (
                <Text style={styles.productPrice}>${product.price_usd.toFixed(2)}</Text>
              )}
            </View>
            <View style={styles.shopBtn}>
              <Text style={styles.shopBtnText}>Shop</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="The aunties have one more thing to say." onPress={() => navigation.navigate('SendOff')} />
      </View>
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
    backgroundColor: colors.canvas,
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
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  content: { padding: spacing.md, gap: spacing.md },

  // Profile Card
  profileCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    ...shadows.lg,
  },
  profileAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  profileLeft: { flex: 1 },
  profileLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.secondary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: spacing.sm,
  },
  curlTypeLarge: {
    fontFamily: fonts.display,
    fontSize: 52,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    lineHeight: 52,
  },
  goalText: {
    fontFamily: fonts.body,
    color: 'rgba(254,249,243,0.5)',
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  profileRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  profileTag: {
    backgroundColor: 'rgba(212,165,116,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,165,116,0.3)',
  },
  profileTagText: {
    fontFamily: fonts.body,
    color: colors.secondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section headers
  scheduleHeader: {
    paddingBottom: spacing.xs,
  },
  sectionEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.ink,
    marginTop: 2,
  },
  sectionSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 2,
  },

  // Day cards
  dayCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 3,
    padding: spacing.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.sm,
  },
  dayCardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    bottom: 0,
    opacity: 0.4,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  auntyRing: {
    borderWidth: 2,
    borderRadius: 24,
    padding: 1,
  },
  dayName: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  dayHost: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 1,
  },
  dayTimeBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  dayTimeBadgeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  dayPurpose: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNum: {
    fontFamily: fonts.body,
    color: colors.canvas,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
  },
  stepName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  stepDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },

  // Products
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadows.sm,
  },
  productAccentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  productInfo: { flex: 1 },
  productName: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  productBrand: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  productPrice: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: 4,
    fontWeight: fontWeight.semibold,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  shopBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
});
