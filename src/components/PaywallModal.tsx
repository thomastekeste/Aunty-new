/**
 * PaywallModal — RevenueCat-powered subscription screen.
 *
 * Gold/creme editorial design. Feature carousel showing every tab.
 * Real pricing from RevenueCat offerings.
 * Monthly, 3-month, yearly, and lifetime options. Handles purchase, restore, and close.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useSubscription } from '../context/SubscriptionContext';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  gradients,
  letterSpacing,
} from '../constants/theme';
import { PaywallFeatureCarousel } from './PaywallFeatureCarousel';
import { LEGAL_URLS } from '../constants/legal';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: (plan: 'monthly' | 'yearly' | 'threeMonth' | 'lifetime') => void;
  onRestore?: () => void;
  /** When false the ✕ button is hidden — use for mandatory paywalls. Default true. */
  dismissible?: boolean;
}

type PlanKey = 'monthly' | 'yearly' | 'threeMonth' | 'lifetime';

interface PlanOption {
  key: PlanKey;
  pkg: PurchasesPackage | null | undefined;
  price: string;
  period: string;
  label: string;
  sub: string;
  badge?: string;
}

const VALUE_SECTIONS = [
  {
    title: 'Personalized Product Picks',
    desc: 'Every product hand-selected for your exact curl type, porosity, and goals. Not random — researched.',
  },
  {
    title: 'Your Weekly Hair Ritual',
    desc: 'A structured wash-to-rest cycle with step-by-step guidance. Know exactly what to do and when.',
  },
  {
    title: 'AI Aunty Companion',
    desc: 'Chat with your AI aunty anytime. She knows your hair, remembers your journey, and gives advice built for textured hair.',
  },
  {
    title: 'Track Your Progress',
    desc: 'See your hair transform over weeks. Check-ins, milestones, and a journey you can look back on.',
  },
];

export function SubscriptionModal({ visible, onClose, onSubscribe, onRestore, dismissible = true }: Props) {
  const { currentOffering, purchasePackage, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('yearly');

  // Get packages from RevenueCat offering
  const yearlyPkg = currentOffering?.annual;
  const monthlyPkg = currentOffering?.monthly;
  const threeMonthPkg = currentOffering?.threeMonth;
  const lifetimePkg = currentOffering?.lifetime;

  // Display real prices from RevenueCat — never show hardcoded fallbacks
  const yearlyPrice = yearlyPkg?.product?.priceString;
  const monthlyPrice = monthlyPkg?.product?.priceString;
  const threeMonthPrice = threeMonthPkg?.product?.priceString;
  const lifetimePrice = lifetimePkg?.product?.priceString;

  // Full plan ladder. Order = how they're shown (best value first).
  const allPlans: PlanOption[] = [
    {
      key: 'yearly',
      pkg: yearlyPkg,
      price: yearlyPrice ?? '',
      period: '/year',
      label: 'Yearly',
      sub: 'Billed once a year',
      badge: 'BEST VALUE',
    },
    {
      key: 'threeMonth',
      pkg: threeMonthPkg,
      price: threeMonthPrice ?? '',
      period: '/3 mo',
      label: '3 Months',
      sub: 'Billed every 3 months',
      badge: 'SAVE 20%',
    },
    {
      key: 'monthly',
      pkg: monthlyPkg,
      price: monthlyPrice ?? '',
      period: '/mo',
      label: 'Monthly',
      sub: 'Cancel anytime',
    },
    {
      key: 'lifetime',
      pkg: lifetimePkg,
      price: lifetimePrice ?? '',
      period: 'once',
      label: 'Lifetime',
      sub: 'Pay once · yours forever',
      badge: 'BEST DEAL',
    },
  ];

  // Only plans that actually exist in the RevenueCat offering are shown —
  // a plan without a package can't be purchased, so it must never render.
  // In Expo Go (no RevenueCat), show the full ladder so flows stay testable.
  const plans: PlanOption[] = __DEV__ && !currentOffering
    ? allPlans
    : allPlans.filter((p) => !!p.pkg);

  const offeringsLoaded = plans.length > 0;

  // Snap the selection to an available plan once offerings load.
  useEffect(() => {
    if (offeringsLoaded && !plans.some((p) => p.key === selectedPlan)) {
      setSelectedPlan(plans[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringsLoaded, currentOffering]);

  const selectedPlanObj = plans.find((p) => p.key === selectedPlan) ?? plans[0];

  const ctaLabel = selectedPlan === 'lifetime' ? 'Unlock Lifetime Access' : 'Subscribe';

  // Purchase the selected package. Access is granted only on a verified
  // purchase — the sole exception is dev builds without RevenueCat (Expo Go).
  const buy = useCallback(
    async (pkg: PurchasesPackage | null | undefined, plan: PlanKey) => {
      if (!pkg) {
        if (__DEV__) {
          onSubscribe?.(plan);
          onClose();
          return;
        }
        Alert.alert(
          'Plan Unavailable',
          'This plan isn’t available right now. Please choose another plan or try again later.',
        );
        return;
      }
      const success = await purchasePackage(pkg);
      if (success) {
        onSubscribe?.(plan);
        onClose();
      }
    },
    [purchasePackage, onSubscribe, onClose],
  );

  const handleSubscribe = useCallback(() => {
    if (!selectedPlanObj) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return buy(selectedPlanObj.pkg, selectedPlanObj.key);
  }, [buy, selectedPlanObj]);

  const selectPlan = useCallback((key: PlanKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(key);
  }, []);

  const handlePromoCode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      Purchases.presentCodeRedemptionSheet();
    }
  }, []);

  const handleRestore = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (restorePurchases) {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Restored', 'Your subscription has been restored.');
        onClose();
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases.');
      }
    }
    onRestore?.();
  }, [restorePurchases, onRestore, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {dismissible && (
            <Pressable onPress={onClose} style={styles.close} hitSlop={12}>
              <Text style={styles.closeText}>{'✕'}</Text>
            </Pressable>
          )}

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Gold gradient hook */}
            <LinearGradient colors={[...gradients.gold]} style={styles.hook}>
              <Text style={styles.hookOverline}>MADE FOR TEXTURED HAIR</Text>
              <Text style={styles.hookTitle}>Stop guessing.{'\n'}Start knowing.</Text>
              <Text style={styles.hookSub}>
                Generic advice wastes your time and money. This app was built specifically for coily, curly, and textured hair.
              </Text>
            </LinearGradient>

            {/* Feature carousel — sweep through every tab of the app */}
            <PaywallFeatureCarousel cardWidth={SCREEN_W} />

            {/* Value props — supporting detail */}
            <View style={styles.values}>
              {VALUE_SECTIONS.map((v, i) => (
                <View key={i} style={styles.valueRow}>
                  <View style={styles.valueDot}>
                    <Text style={styles.valueDotText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.valueTitle}>{v.title}</Text>
                    <Text style={styles.valueDesc}>{v.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Social proof */}
            <View style={styles.proof}>
              <Text style={styles.proofText}>
                &ldquo;I spent more on wrong products last month than this costs for a full year.&rdquo;
              </Text>
            </View>

            {/* Pricing — all plans visible, tap to select */}
            {!offeringsLoaded ? (
              <View style={[styles.pricing, { alignItems: 'center', paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.planSub, { marginTop: 12 }]}>Loading plans…</Text>
              </View>
            ) : (
            <View style={styles.pricing}>
              {plans.map((p) => {
                const isSel = selectedPlan === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => selectPlan(p.key)}
                    style={[styles.planCard, isSel && styles.planCardSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSel }}
                    accessibilityLabel={`${p.label}, ${p.price} ${p.period}`}
                  >
                    <View style={[styles.planRadio, isSel && styles.planRadioOn]}>
                      {isSel && <View style={styles.planRadioDot} />}
                    </View>
                    <View style={styles.planInfo}>
                      <View style={styles.planTopRow}>
                        <Text style={[styles.planLabel, isSel && styles.planLabelSel]}>{p.label}</Text>
                        {p.badge && (
                          <View style={[styles.planBadge, isSel && styles.planBadgeSel]}>
                            <Text style={[styles.planBadgeText, isSel && styles.planBadgeTextSel]}>{p.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.planSub}>{p.sub}</Text>
                    </View>
                    <View style={styles.planPriceWrap}>
                      <Text style={[styles.planPrice, isSel && styles.planLabelSel]}>{p.price}</Text>
                      <Text style={styles.planPeriod}>{p.period}</Text>
                    </View>
                  </Pressable>
                );
              })}

              {/* Single CTA — acts on the selected plan */}
              <Pressable onPress={handleSubscribe} style={styles.ctaBtn}>
                <LinearGradient colors={[...gradients.gold]} style={styles.ctaGradient}>
                  <Text style={styles.ctaLabel}>{ctaLabel}</Text>
                </LinearGradient>
              </Pressable>
            </View>
            )}

            {/* Guarantee */}
            <Text style={styles.guarantee}>
              {selectedPlan === 'lifetime'
                ? 'One payment. No subscription, no renewals — yours for good.'
                : 'Cancel anytime in your Apple account settings.'}
            </Text>

            {/* Restore + Promo code */}
            <View style={styles.restoreRow}>
              <Pressable onPress={handleRestore} hitSlop={8}>
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </Pressable>
              <Text style={styles.restoreDot}>·</Text>
              <Pressable onPress={handlePromoCode} hitSlop={8}>
                <Text style={styles.restoreText}>Have a promo code?</Text>
              </Pressable>
            </View>

            {/* Auto-renew disclosure — always shown (Apple Guideline 3.1.2) */}
            <Text style={styles.legalText}>
              Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple ID and managed in your account settings. The Lifetime option is a one-time purchase and does not renew.
            </Text>

            {/* Terms + Privacy links (Apple Guideline 3.1.2) */}
            <View style={styles.legalLinks}>
              <Pressable onPress={() => Linking.openURL(LEGAL_URLS.terms)} hitSlop={8}>
                <Text style={styles.legalLink}>Terms of Use</Text>
              </Pressable>
              <Text style={styles.legalDot}>·</Text>
              <Pressable onPress={() => Linking.openURL(LEGAL_URLS.privacy)} hitSlop={8}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Backward-compatible alias
export const PaywallModal = SubscriptionModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  card: { maxHeight: SCREEN_H * 0.92, backgroundColor: colors.dark.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden' },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: fontSize.lg, color: colors.dark.textMuted },
  scroll: { paddingBottom: spacing.xxl },

  hook: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl + spacing.md, paddingBottom: spacing.xl, alignItems: 'center' },
  hookOverline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.ink, letterSpacing: letterSpacing.widest, marginBottom: spacing.sm },
  hookTitle: { fontFamily: fonts.display, fontSize: fontSize.xxxl, color: colors.ink, textAlign: 'center', letterSpacing: letterSpacing.tight, lineHeight: fontSize.xxxl * 1.1 },
  hookSub: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.inkLight, textAlign: 'center', marginTop: spacing.md, lineHeight: fontSize.md * 1.5, paddingHorizontal: spacing.md },

  values: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.lg },
  valueRow: { flexDirection: 'row', gap: spacing.md },
  valueDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  valueDotText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.ink },
  valueTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.dark.text, marginBottom: 2 },
  valueDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted, lineHeight: fontSize.sm * 1.5 },

  proof: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, alignItems: 'center' },
  proofText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.dark.text, textAlign: 'center', fontStyle: 'italic', lineHeight: fontSize.md * 1.6 },

  pricing: { paddingHorizontal: spacing.lg, gap: spacing.sm },

  // Plan card (tap to select)
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  planCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(212,160,74,0.10)',
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioOn: { borderColor: colors.primary },
  planRadioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  planInfo: { flex: 1 },
  planTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  planLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, color: colors.dark.text },
  planLabelSel: { color: colors.dark.text },
  planBadge: { backgroundColor: 'rgba(212,160,74,0.22)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  planBadgeSel: { backgroundColor: colors.primary },
  planBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.primary, letterSpacing: letterSpacing.wider },
  planBadgeTextSel: { color: colors.ink },
  planSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.dark.textMuted, marginTop: 2 },
  planPriceWrap: { alignItems: 'flex-end' },
  planPrice: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.dark.text },
  planPeriod: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.dark.textMuted },

  // Single CTA button
  ctaBtn: { borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.sm, ...shadows.gold },
  ctaGradient: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radius.lg },
  ctaLabel: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink },

  guarantee: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.primary, textAlign: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },

  legalText: { fontFamily: fonts.body, fontSize: 10, color: colors.dark.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, lineHeight: 14, opacity: 0.6 },

  legalLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  legalLink: { fontFamily: fonts.body, fontSize: 11, color: colors.dark.textMuted, textDecorationLine: 'underline' },
  legalDot: { fontFamily: fonts.body, fontSize: 11, color: colors.dark.textMuted },

  restoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
  restoreDot: { color: colors.dark.textMuted, fontSize: fontSize.sm },
  restoreText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted, textDecorationLine: 'underline' },
});
