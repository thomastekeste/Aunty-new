/**
 * SalonFrame — Warm editorial consultation surface.
 *
 * Light canvas redesign: cream background, compact header,
 * segmented progress bar, minimal aunty attribution.
 *
 * Layout, top to bottom:
 *   1. Compact header: back chevron + segmented progress + step label
 *   2. Aunty attribution: accent tick + "Aunty Name"
 *   3. Question headline (24pt, tight)
 *   4. Scrollable body (children)
 *   5. Footer with CTA button
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
      {/* Compact header: back + segmented progress + step */}
      <View style={styles.header}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backChevron}>{'‹'}</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}

        {/* Segmented progress bar */}
        <View
          style={styles.progressRow}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${step} of ${totalSteps}`}
          accessibilityValue={{ min: 0, max: totalSteps, now: step }}
        >
          {Array.from({ length: totalSteps }).map((_, i) => {
            const idx = i + 1;
            const isCurrent = idx === step;
            const isPast = idx < step;
            return (
              <View key={i} style={styles.segmentWrap}>
                <View
                  style={[
                    styles.segment,
                    isPast && { backgroundColor: ac.accent },
                    isCurrent && { backgroundColor: ac.accent, opacity: 0.5 },
                  ]}
                />
              </View>
            );
          })}
        </View>

        <Text style={styles.stepLabel}>
          {step}/{totalSteps}
        </Text>
      </View>

      {/* Aunty attribution */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.attribution}>
        <View style={[styles.attrTick, { backgroundColor: ac.accent }]} />
        <Text style={styles.attrText}>
          Aunty <Text style={[styles.attrName, { color: ac.accent }]}>{aunty.name}</Text>
        </Text>
      </Animated.View>

      {/* Question headline */}
      <Animated.Text
        entering={FadeInDown.delay(60).duration(380)}
        style={styles.question}
        accessibilityRole="header"
      >
        {question}
      </Animated.Text>

      {/* Body */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 130 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xs }]}>
        <LinearGradient
          colors={['rgba(254, 248, 236, 0)', 'rgba(254, 248, 236, 0.92)', colors.canvas]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <View style={styles.footerInner}>
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
  flex: { flex: 1, backgroundColor: colors.canvas },
  container: { flex: 1, backgroundColor: colors.canvas },

  // -- Header --
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  backChevron: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl,
    color: colors.ink,
  },
  progressRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  segmentWrap: {
    flex: 1,
    height: 3,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.border,
  },
  stepLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.muted,
    minWidth: 28,
    textAlign: 'right',
  },

  // -- Attribution --
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  attrTick: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  attrText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  attrName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },

  // -- Question --
  question: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.15,
    letterSpacing: -0.5,
    color: colors.ink,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  // -- Body --
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },

  // -- Footer --
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerFade: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
  },
  footerInner: {
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
