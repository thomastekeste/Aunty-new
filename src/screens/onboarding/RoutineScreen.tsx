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
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Routine'>;

const DAY_KEYS = ['wash_day', 'style_day', 'refresh_day', 'rest_day'] as const;

export default function RoutineScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { routine, data, hairAnalysis } = useOnboarding();
  const freeProducts = getFreeProducts();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Routine</Text>
        <Text style={styles.subtitle}>Built by the council, just for you.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hair Profile Card */}
        <View style={styles.profileCard}>
          <Text style={styles.sectionLabel}>Your Profile</Text>
          <Text style={styles.curlTypeLarge}>{hairAnalysis?.curl_type?.toUpperCase() ?? '—'}</Text>
          <View style={styles.tagRow}>
            {[
              data.porosity && `${data.porosity} porosity`,
              data.density && `${data.density} density`,
              data.elasticity && `${data.elasticity} elasticity`,
            ].filter(Boolean).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {data.primary_goal && (
            <Text style={styles.goalText}>Goal: {data.primary_goal}</Text>
          )}
        </View>

        {/* Weekly Schedule */}
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>

        {routine && DAY_KEYS.map(dayKey => {
          const day = routine[dayKey];
          if (!day) return null;
          const aunty = getAunty(day.hosted_by_aunty_id);

          return (
            <View key={dayKey} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <AuntyAvatar auntyId={day.hosted_by_aunty_id} size={36} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.dayName}>{day.day_name}</Text>
                  <Text style={styles.dayHost}>{aunty.name} · ~{day.estimated_time_minutes} min</Text>
                </View>
              </View>
              <Text style={styles.dayPurpose}>{day.purpose}</Text>
              {day.steps.map(step => (
                <View key={step.step_number} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
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

        {/* Product Shelf (Free: 3 products) */}
        <Text style={styles.sectionTitle}>Your Product Shelf</Text>
        <Text style={styles.sectionSubtitle}>3 products to start. Upgrade for the full shelf.</Text>

        {freeProducts.map(product => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => Linking.openURL(product.affiliate_link)}
          >
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productBrand}>{product.brand}</Text>
              {product.price_usd && (
                <Text style={styles.productPrice}>${product.price_usd.toFixed(2)}</Text>
              )}
            </View>
            <Text style={styles.shopLink}>Shop →</Text>
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
    paddingHorizontal: spacing.md, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.canvas,
  },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  content: { padding: spacing.md },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.amberLight,
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: spacing.sm,
  },
  profileCard: {
    backgroundColor: colors.ink, borderRadius: radius.lg,
    padding: spacing.xl, marginBottom: spacing.lg,
    borderLeftWidth: 4, borderLeftColor: colors.amber,
  },
  curlTypeLarge: {
    fontFamily: fonts.display,
    fontSize: 56, fontWeight: fontWeight.black, color: colors.canvas,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { backgroundColor: 'rgba(201,123,58,0.2)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tagText: { fontFamily: fonts.body, color: colors.amberLight, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  goalText: { fontFamily: fonts.body, color: 'rgba(254,249,243,0.55)', fontSize: fontSize.sm, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.display, fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.ink, marginBottom: spacing.xs, marginTop: spacing.md },
  sectionSubtitle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, marginBottom: spacing.md },
  dayCard: {
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.canvas,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  dayName: { fontFamily: fonts.body, fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink },
  dayHost: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted, marginTop: 1 },
  dayPurpose: { fontFamily: fonts.display, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  stepNumber: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.amber,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  stepNum: { fontFamily: fonts.body, color: colors.canvas, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  stepName: { fontFamily: fonts.body, fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.ink },
  stepDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  productCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.canvas,
  },
  productInfo: { flex: 1 },
  productName: { fontFamily: fonts.body, fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink },
  productBrand: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
  productPrice: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.amber, marginTop: 4, fontWeight: fontWeight.semibold },
  shopLink: { fontFamily: fonts.body, fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.amber, marginLeft: spacing.sm },
  footer: {
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.canvas,
  },
});
