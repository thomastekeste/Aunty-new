/**
 * ConsultationShell — Dark-mode ceremonial wrapper for all consultation questions.
 *
 * Provides: progress bar, back navigation, aunty avatar + speech bubble,
 * scrollable content area, and a bottom CTA button.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from './AuntyAvatar';
import { Button } from './Button';
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
} from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  auntyId: AuntyId;
  question: string;
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

export function ConsultationShell({
  auntyId,
  question,
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
  const progress = step / totalSteps;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const content = (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress bar */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={styles.progressWrapper}
        accessibilityRole="progressbar"
        accessibilityLabel={`Step ${step} of ${totalSteps}`}
        accessibilityValue={{ min: 0, max: totalSteps, now: step }}
      >
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[...gradients.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {step} of {totalSteps}
        </Text>
      </Animated.View>

      {/* Back button */}
      {showBack && (
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>{'\u2190'}</Text>
        </Pressable>
      )}

      {/* Aunty + question */}
      <View style={styles.questionRow}>
        <AuntyAvatar auntyId={auntyId} size={32} showRing />
        <Text style={[styles.questionText, { color: ac.accent }]}>{aunty.name}</Text>
      </View>
      <Text style={styles.question} accessibilityRole="header">
        {question}
      </Text>

      {/* Options */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <LinearGradient
          colors={['rgba(26, 15, 8, 0)', 'rgba(26, 15, 8, 0.95)', colors.dark.bg]}
          style={styles.ctaGradient}
        />
        <View style={styles.ctaInner}>
          <Button
            label={ctaLabel}
            onPress={onCtaPress}
            variant="primary"
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
  flex: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    letterSpacing: letterSpacing.wide,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    minWidth: 44,
    minHeight: 36,
    justifyContent: 'center',
  },
  backArrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    color: colors.dark.text,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.25,
    letterSpacing: letterSpacing.tight,
    color: colors.dark.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  ctaGradient: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 40,
  },
  ctaInner: {
    backgroundColor: colors.dark.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
