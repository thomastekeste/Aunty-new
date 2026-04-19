/**
 * SalonFrame — Editorial consultation surface.
 *
 * Replaces ConsultationShell with the warm-salon × magazine direction:
 *   • bead-string progress (gold prayer beads instead of a line)
 *   • oversized aunty header: ringed avatar + serif name + italic "is asking"
 *   • subtle warm gradient overlay so the dark canvas isn't sterile
 *   • glass-blur footer carrying a CeremonialButton CTA
 *   • circular back button with pressed pill
 *
 * Use this for every quiz screen.
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
import { AuntyAvatar } from './AuntyAvatar';
import { CeremonialButton } from './CeremonialButton';
import { AUNTIES } from '../constants/aunties';
import type { AuntyId } from '../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  gradients,
  letterSpacing,
  salon,
} from '../constants/theme';

interface Props {
  auntyId: AuntyId;
  question: string;
  /** Italic helper line under the aunty name. Default: "is asking" */
  speakerVerb?: string;
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

  const beads = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const content = (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Warm gradient wash to soften the pure dark */}
      <LinearGradient
        colors={[
          'rgba(45, 27, 14, 0.0)',
          'rgba(45, 27, 14, 0.45)',
          'rgba(26, 15, 8, 0.85)',
        ]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Aunty-tinted radial glow at top — subtle */}
      <View
        pointerEvents="none"
        style={[
          styles.auntyHalo,
          { backgroundColor: ac.accent, top: insets.top + 8 },
        ]}
      />

      {/* Top row: back + bead progress */}
      <View style={styles.topRow}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}

        <View
          style={styles.beadRow}
          accessibilityRole="progressbar"
          accessibilityLabel={`Step ${step} of ${totalSteps}`}
          accessibilityValue={{ min: 0, max: totalSteps, now: step }}
        >
          {beads.map((b) => {
            const status = b < step ? 'done' : b === step ? 'active' : 'upcoming';
            const size =
              status === 'active'
                ? salon.bead.activeSize
                : status === 'done'
                ? salon.bead.completedSize
                : salon.bead.upcomingSize;
            const color =
              status === 'active'
                ? ac.accent
                : status === 'done'
                ? salon.bead.completed
                : salon.bead.upcoming;
            return (
              <View key={b} style={styles.beadWrap}>
                {status === 'active' ? (
                  <>
                    <View style={[styles.beadHalo, { backgroundColor: ac.accent + '33' }]} />
                    <View
                      style={[
                        styles.beadHaloOuter,
                        { backgroundColor: ac.accent + '14' },
                      ]}
                    />
                  </>
                ) : null}
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                  }}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.backButton} />
      </View>

      <Animated.View entering={FadeIn.duration(400)} style={styles.auntyHeader}>
        <AuntyAvatar auntyId={auntyId} size={36} showRing glowing />
        <View style={styles.auntyText}>
          <Text style={[styles.auntyName, { color: ac.accent }]} numberOfLines={1}>
            {aunty.name}
            <Text style={styles.auntyVerb}>  {speakerVerb}</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Question — editorial serif */}
      <Animated.Text
        entering={FadeInDown.delay(120).duration(420)}
        style={styles.question}
        accessibilityRole="header"
      >
        {question}
      </Animated.Text>

      {/* Body */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* Glass footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xs }]}>
        <LinearGradient
          colors={['rgba(26, 15, 8, 0)', 'rgba(26, 15, 8, 0.85)', colors.dark.bg]}
          style={styles.footerFade}
          pointerEvents="none"
        />
        <View style={styles.footerInner}>
          <CeremonialButton
            label={ctaLabel}
            onPress={onCtaPress}
            disabled={ctaDisabled}
            loading={ctaLoading}
            size="md"
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

  auntyHalo: {
    position: 'absolute',
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.08,
    transform: [{ translateY: -80 }],
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(254, 248, 236, 0.14)',
    backgroundColor: 'rgba(254, 248, 236, 0.03)',
  },
  backButtonPressed: {
    backgroundColor: colors.dark.surfaceLight,
    borderColor: 'rgba(254, 248, 236, 0.28)',
  },
  backArrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    color: colors.dark.text,
    marginTop: -1,
  },
  beadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  beadWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beadHalo: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    top: -2,
    left: -2,
  },
  beadHaloOuter: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    top: -6,
    left: -6,
  },

  auntyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  auntyText: { flexShrink: 1, flex: 1 },
  auntyName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.md,
    letterSpacing: -0.1,
    lineHeight: fontSize.md * 1.1,
  },
  auntyVerb: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    letterSpacing: 0.1,
  },

  question: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.lg + 2,
    lineHeight: (fontSize.lg + 2) * 1.18,
    letterSpacing: -0.3,
    color: colors.dark.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  scrollContent: { paddingHorizontal: spacing.lg },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerFade: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 40,
  },
  footerInner: {
    backgroundColor: colors.dark.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
});
