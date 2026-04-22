/**
 * SalonFrame — Sophisticated editorial consultation surface.
 *
 * Magazine masthead treatment: no halos, no bead progress, no avatar header.
 *
 * Layout, top → bottom:
 *   1. Masthead row: "BACK ◂" left · hairline divider · dot progress right
 *   2. Gold hairline rule across full width (0.5px)
 *   3. Overline label: "CONSULTATION" in tracked caps, faint (no number)
 *   4. Oversized editorial headline (serif, ~36–38pt, −1 tracking)
 *   5. Italic byline: "— with Aunty Senayt · wants to see"
 *   6. Scrollable body (children)
 *   7. Gold hairline above CTA footer (no caption)
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CeremonialButton } from './CeremonialButton';
import { AUNTIES } from '../constants/aunties';
import type { AuntyId } from '../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
} from '../constants/theme';

interface Props {
  auntyId: AuntyId;
  question: string;
  /** Italic helper line after the aunty name (e.g. "wants to see"). */
  speakerVerb?: string;
  /** Overline label. Defaults to "CONSULTATION". */
  chapter?: string;
  step: number;
  totalSteps: number;
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  onCtaPress: () => void;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
  keyboardAware?: boolean;
}

const GOLD_RULE = 'rgba(212, 160, 74, 0.32)';
const CREAM_RULE = 'rgba(254, 248, 236, 0.08)';

export function SalonFrame({
  auntyId,
  question,
  speakerVerb = 'is asking',
  chapter = 'Consultation',
  step,
  totalSteps,
  ctaLabel,
  ctaDisabled = false,
  ctaLoading = false,
  onCtaPress,
  onBack,
  showBack = true,
  children,
  keyboardAware = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) onBack();
    else navigation.goBack();
  };

  const content = (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Masthead: BACK  ◂  ——————————  02 / 07 */}
      <View style={styles.masthead}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backSlot, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backChevron}>{'\u2039'}</Text>
            <Text style={styles.backLabel}>BACK</Text>
          </Pressable>
        ) : (
          <View style={styles.backSlot} />
        )}

        <View style={styles.mastheadRule} />

        <View
          style={styles.dotRow}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${step} of ${totalSteps}`}
          accessibilityValue={{ min: 0, max: totalSteps, now: step }}
        >
          {Array.from({ length: totalSteps }).map((_, i) => {
            const idx = i + 1;
            const isCurrent = idx === step;
            const isPast = idx < step;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isCurrent && [styles.dotCurrent, { backgroundColor: ac.accent }],
                  isPast && styles.dotPast,
                  !isCurrent && !isPast && styles.dotFuture,
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Gold hairline under masthead — magazine rule */}
      <View style={styles.goldRule} />

      {/* Overline chapter label */}
      <Animated.Text
        entering={FadeIn.duration(320)}
        style={styles.overline}
        accessibilityLabel={`${chapter}, step ${step} of ${totalSteps}`}
      >
        {chapter.toUpperCase()}
      </Animated.Text>

      {/* Editorial headline */}
      <Animated.Text
        entering={FadeInDown.delay(90).duration(420)}
        style={styles.question}
        accessibilityRole="header"
      >
        {question}
      </Animated.Text>

      {/* Byline — italic attribution like a magazine author line */}
      <Animated.View entering={FadeIn.delay(220).duration(360)} style={styles.bylineRow}>
        <View style={[styles.bylineTick, { backgroundColor: ac.accent }]} />
        <Text style={styles.byline} numberOfLines={1}>
          with{' '}
          <Text style={[styles.bylineName, { color: ac.accent }]}>
            Aunty {aunty.name}
          </Text>
          <Text style={styles.bylineVerb}>{'  ·  '}{speakerVerb}</Text>
        </Text>
      </Animated.View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* Footer — gold hairline + CTA + step caption */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xs }]}>
        <LinearGradient
          colors={['rgba(26, 15, 8, 0)', 'rgba(26, 15, 8, 0.9)', colors.dark.bg]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <View style={styles.footerInner}>
          <View style={styles.footerGoldRule} />
          <CeremonialButton
            label={ctaLabel}
            onPress={onCtaPress}
            disabled={ctaDisabled}
            loading={ctaLoading}
            size="lg"
          />
        </View>
      </View>
    </View>
  );

  if (keyboardAware) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.dark.bg },
  container: { flex: 1, backgroundColor: colors.dark.bg },

  // ── Masthead ─────────────────────────────────────────────────
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs - 2,
    gap: spacing.sm,
  },
  backSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 68,
  },
  pressed: { opacity: 0.55 },
  backChevron: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 18,
    color: colors.dark.text,
    marginTop: -1,
  },
  backLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 2.2,
    color: colors.dark.textMuted,
  },
  mastheadRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: CREAM_RULE,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotCurrent: {
    width: 22,
    height: 7,
    borderRadius: 4,
  },
  dotPast: {
    backgroundColor: 'rgba(254, 248, 236, 0.42)',
  },
  dotFuture: {
    backgroundColor: 'rgba(254, 248, 236, 0.14)',
  },

  // Full-width gold rule under masthead
  goldRule: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: GOLD_RULE,
    marginHorizontal: spacing.lg,
  },

  // ── Overline / Headline / Byline ─────────────────────────────
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    letterSpacing: 2.6,
    color: 'rgba(254, 248, 236, 0.5)',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  question: {
    fontFamily: fonts.displayMedium,
    fontSize: 36,
    lineHeight: 36 * 1.08,
    letterSpacing: -0.9,
    color: colors.dark.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs + 2,
  },
  bylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  bylineTick: {
    width: 14,
    height: StyleSheet.hairlineWidth * 2,
    borderRadius: 1,
  },
  byline: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: 'rgba(254, 248, 236, 0.58)',
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  bylineName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  bylineVerb: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: 'rgba(254, 248, 236, 0.48)',
  },

  // ── Body ──────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerFade: {
    position: 'absolute',
    top: -56,
    left: 0,
    right: 0,
    height: 56,
  },
  footerInner: {
    backgroundColor: colors.dark.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm + 2,
  },
  footerGoldRule: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: GOLD_RULE,
    marginBottom: spacing.sm + 2,
  },
});
