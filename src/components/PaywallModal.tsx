/**
 * PaywallModal — RevenueCat-powered subscription screen.
 *
 * Gold/creme editorial design. Feature carousel showing every tab.
 * Real pricing from RevenueCat offerings.
 * Monthly and yearly options. Handles purchase, restore, and close.
 */

import React, { useCallback, useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
  onSubscribe?: (plan: 'monthly' | 'yearly') => void;
  onRestore?: () => void;
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

export function SubscriptionModal({ visible, onClose, onSubscribe, onRestore }: Props) {
  const { currentOffering, purchasePackage, restorePurchases } = useSubscription();
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Get packages from RevenueCat offering
  const yearlyPkg = currentOffering?.annual;
  const monthlyPkg = currentOffering?.monthly;

  // Check for intro offer / trial on yearly
  const yearlyProduct = yearlyPkg?.product as any;
  const yearlyIntro = yearlyProduct?.introPrice;
  const yearlyHasIntroOffer = !!yearlyIntro && yearlyIntro.price === 0;
  const trialDays = yearlyIntro?.periodNumberOfUnits ?? 7;

  // Display prices (real from RC or fallback)
  const yearlyPrice = yearlyPkg?.product?.priceString || '$59.99/year';
  const monthlyPrice = monthlyPkg?.product?.priceString || '$9.99/month';

  const trialLabel = yearlyHasIntroOffer
    ? `Start ${trialDays}-Day Free Trial`
    : 'Subscribe Yearly';

  const handleYearly = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (yearlyPkg) {
      const success = await purchasePackage(yearlyPkg);
      if (success) {
        onSubscribe?.('yearly');
        onClose();
      }
    } else {
      onSubscribe?.('yearly');
    }
  }, [yearlyPkg, purchasePackage, onSubscribe, onClose]);

  const handleMonthly = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (monthlyPkg) {
      const success = await purchasePackage(monthlyPkg);
      if (success) {
        onSubscribe?.('monthly');
        onClose();
      }
    } else {
      onSubscribe?.('monthly');
    }
  }, [monthlyPkg, purchasePackage, onSubscribe, onClose]);

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
          <Pressable onPress={onClose} style={styles.close} hitSlop={12}>
            <Text style={styles.closeText}>{'✕'}</Text>
          </Pressable>

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

            {/* Pricing */}
            <View style={styles.pricing}>
              {/* Primary CTA — yearly with trial */}
              <Pressable onPress={handleYearly} style={styles.yearlyBtn}>
                <LinearGradient colors={[...gradients.gold]} style={styles.yearlyGradient}>
                  <View style={styles.bestValue}>
                    <Text style={styles.bestValueText}>
                      {yearlyHasIntroOffer ? `${trialDays} DAYS FREE` : 'BEST VALUE'}
                    </Text>
                  </View>
                  <Text style={styles.yearlyCtaLabel}>{trialLabel}</Text>
                  <Text style={styles.yearlyPrice}>
                    {yearlyHasIntroOffer ? `Then ${yearlyPrice}` : yearlyPrice}
                  </Text>
                  <Text style={styles.yearlySub}>Less than one bad product purchase</Text>
                </LinearGradient>
              </Pressable>

              {/* More options toggle */}
              <Pressable
                style={styles.moreOptionsBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowMoreOptions((v) => !v);
                }}
              >
                <Text style={styles.moreOptionsText}>
                  {showMoreOptions ? 'Hide options ↑' : 'More options ↓'}
                </Text>
              </Pressable>

              {showMoreOptions && (
                <Pressable onPress={handleMonthly} style={styles.monthlyBtn}>
                  <Text style={styles.monthlyPrice}>{monthlyPrice}</Text>
                  <Text style={styles.monthlySub}>Month-to-month · Cancel anytime</Text>
                </Pressable>
              )}
            </View>

            {/* Guarantee */}
            <Text style={styles.guarantee}>7-day free trial. Cancel before it ends and pay nothing.</Text>

            {/* Restore */}
            <Pressable onPress={handleRestore} style={styles.restore}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </Pressable>

            {/* Auto-renew disclosure — always shown (Apple Guideline 3.1.2) */}
            <Text style={styles.legalText}>
              {yearlyHasIntroOffer
                ? `Your free trial starts on activation. The subscription then auto-renews at ${yearlyPrice} unless cancelled at least 24 hours before the trial ends.`
                : `Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple ID and managed in your account settings.`}
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

  pricing: { paddingHorizontal: spacing.lg, gap: spacing.md },
  yearlyBtn: { borderRadius: radius.lg, overflow: 'hidden', ...shadows.gold },
  yearlyGradient: { paddingVertical: spacing.lg, alignItems: 'center', borderRadius: radius.lg },
  bestValue: { backgroundColor: 'rgba(45,27,14,0.2)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, marginBottom: spacing.sm },
  bestValueText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.ink, letterSpacing: letterSpacing.wider },
  yearlyCtaLabel: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.ink, marginBottom: 2 },
  yearlyPrice: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, marginTop: 2 },
  yearlySub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, marginTop: spacing.xs, textAlign: 'center' },

  moreOptionsBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  moreOptionsText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.dark.textMuted },

  monthlyBtn: { borderWidth: 1.5, borderColor: colors.dark.border, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  monthlyPrice: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.dark.text },
  monthlySub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted, marginTop: 2 },

  guarantee: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.primary, textAlign: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },

  legalText: { fontFamily: fonts.body, fontSize: 10, color: colors.dark.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, lineHeight: 14, opacity: 0.6 },

  legalLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  legalLink: { fontFamily: fonts.body, fontSize: 11, color: colors.dark.textMuted, textDecorationLine: 'underline' },
  legalDot: { fontFamily: fonts.body, fontSize: 11, color: colors.dark.textMuted },

  restore: { alignItems: 'center', paddingVertical: spacing.sm },
  restoreText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.dark.textMuted, textDecorationLine: 'underline' },
});
