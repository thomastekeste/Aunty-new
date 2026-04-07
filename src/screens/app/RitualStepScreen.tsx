/**
 * RitualStepScreen -- Guided step-by-step walkthrough for today's ritual.
 *
 * Dark background for ceremony focus.
 * Aunty guides you through each step with encouraging messages.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  gradients,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import type { RitualDayType } from '../../types';

// Ritual data (mirrored from RitualScreen)
const DAILY_RITUAL: Record<number, { type: RitualDayType; label: string }> = {
  0: { type: 'rest', label: 'Rest Day' },
  1: { type: 'wash', label: 'Wash Day' },
  2: { type: 'scalp', label: 'Scalp Day' },
  3: { type: 'protect', label: 'Protect Day' },
  4: { type: 'refresh', label: 'Refresh Day' },
  5: { type: 'style', label: 'Style Day' },
  6: { type: 'protein', label: 'Strength Day' },
};

const TYPE_COLORS: Record<RitualDayType, string> = {
  wash: colors.jewel.amber,
  style: colors.jewel.rose,
  refresh: colors.jewel.plum,
  rest: colors.jewel.teal,
  scalp: colors.jewel.emerald,
  protein: colors.jewel.sienna,
  protect: colors.jewel.indigo,
};

interface StepDetail {
  name: string;
  description: string;
  auntyMessage: string;
}

const TYPE_STEPS: Record<RitualDayType, StepDetail[]> = {
  wash: [
    { name: 'Pre-Poo with Oil', description: 'Apply a generous amount of oil to dry hair, focusing on ends. This protects your strands during the cleanse.', auntyMessage: 'Start slow, baby. The oil is your armor before the water hits.' },
    { name: 'Sulfate-Free Shampoo', description: 'Gently massage shampoo into your scalp. Let the suds run down the length -- no rough scrubbing.', auntyMessage: 'Focus on the scalp, not the ends. Your ends been through enough.' },
    { name: 'Deep Condition Under Cap', description: 'Apply deep conditioner section by section. Cover with a plastic cap and sit for 20-30 minutes.', auntyMessage: 'This is the magic step. Do not rush it. Let that moisture sink deep.' },
    { name: 'Rinse, Detangle, Seal', description: 'Rinse with cool water, detangle with a wide-tooth comb, then seal with your leave-in and oil.', auntyMessage: 'Gentle hands now. Every strand you save today is growth tomorrow.' },
  ],
  style: [
    { name: 'Take Down Style', description: 'Carefully remove any protective styling from the previous days. Be gentle with knots.', auntyMessage: 'Take your time here. No yanking -- we are not in a rush.' },
    { name: 'Fluff & Shape', description: 'Use your fingers or a pick to lift roots and shape your curl pattern.', auntyMessage: 'This is where the magic happens. Let those curls breathe and shine!' },
    { name: 'Define with Gel', description: 'Apply your styling gel or cream in sections, scrunching upward to encourage curl formation.', auntyMessage: 'Scrunch, do not pull. Let your curls find their own rhythm.' },
    { name: 'Diffuse or Air Dry', description: 'Use a diffuser on low heat, or let your hair air dry if you have the time.', auntyMessage: 'Patience is the secret ingredient. Your curls are worth the wait.' },
  ],
  refresh: [
    { name: 'Light Mist', description: 'Spray a water and conditioner mix lightly over your hair. Do not saturate.', auntyMessage: 'Just a light touch -- we are refreshing, not starting over.' },
    { name: 'Re-Twist Edges', description: 'Smooth and re-twist your edges and any frizzy sections.', auntyMessage: 'The edges frame the face. A little attention here goes a long way.' },
    { name: 'Seal Ends with Oil', description: 'Apply a small amount of oil to your ends to lock in the moisture from the mist.', auntyMessage: 'Those ends are the oldest part of your hair. They deserve the most love.' },
  ],
  rest: [
    { name: 'Gentle Scalp Massage', description: 'Use your fingertips to gently massage your scalp for 3-5 minutes. No products needed.', auntyMessage: 'Rest does not mean neglect. This massage keeps the blood flowing to your roots.' },
    { name: 'Refresh Edges If Needed', description: 'A tiny bit of water or edge control if needed. Otherwise, leave it be.', auntyMessage: 'Your hair is resting today. Honor that. Less is more.' },
  ],
  scalp: [
    { name: 'Apply Scalp Oil Blend', description: 'Part your hair in sections and apply your scalp oil directly to the scalp.', auntyMessage: 'Everything starts from the root. Feed it well and watch what grows.' },
    { name: 'Firm Circular Massage', description: 'Use your fingertips in firm circular motions across your entire scalp for 5-10 minutes.', auntyMessage: 'Feel that? That is the blood flowing, waking up those follicles.' },
  ],
  protein: [
    { name: 'Protein Treatment on Lengths', description: 'Apply protein treatment from mid-shaft to ends. Avoid the scalp unless directed.', auntyMessage: 'Strength comes from within, but sometimes your hair needs a little extra help.' },
    { name: 'Rinse & Light Condition', description: 'Rinse the protein treatment thoroughly, then follow with a light conditioner to maintain softness.', auntyMessage: 'Balance is everything. Protein without moisture is brittleness. We do both.' },
  ],
  protect: [
    { name: 'Moisturize Sections', description: 'Divide hair into sections and apply your leave-in conditioner and cream.', auntyMessage: 'Moisturized hair is happy hair. Do not skip any section.' },
    { name: 'Twist or Braid', description: 'Create your protective style -- twists, braids, or whichever suits you today.', auntyMessage: 'This style is your shield for the next few days. Make it secure but not too tight.' },
    { name: 'Edge Care & Silk Wrap', description: 'Lay your edges gently, then wrap with a silk scarf or bonnet.', auntyMessage: 'Protect what you have built. A silk wrap is your hair\'s best friend at night.' },
  ],
};

export default function RitualStepScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const dayOfWeek = new Date().getDay();
  const today = DAILY_RITUAL[dayOfWeek];
  const todayColor = TYPE_COLORS[today.type];
  const steps = TYPE_STEPS[today.type];
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleCompleteStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsComplete(true);
    }
  }, [currentStep, totalSteps]);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  const step = steps[currentStep];

  if (isComplete) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.completeContent}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.completeAvatarWrap}>
            <AuntyAvatar auntyId={auntyId} size={80} showRing glowing />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.completeTitle}>
            Ritual Complete!
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={[styles.completeLabel, { color: todayColor }]}>
            {today.label}
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[styles.completeBubble, { borderLeftColor: ac.accent, backgroundColor: ac.bgDark }]}>
            <Text style={styles.completeBubbleText}>
              {aunty.win}
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.doneWrap}>
            <Button label="Done" onPress={handleDone} variant="primary" size="lg" />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      {/* Top: Close + ritual label + step counter */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.closeText}>X</Text>
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={[styles.ritualType, { color: todayColor }]}>{today.label}</Text>
          <Text style={styles.stepCounter}>Step {currentStep + 1} of {totalSteps}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: `${((currentStep + 1) / totalSteps) * 100}%`, backgroundColor: todayColor },
          ]}
        />
      </View>

      {/* Center content */}
      <Animated.View key={currentStep} entering={FadeInDown.duration(300)} style={styles.centerContent}>
        <Text style={styles.stepName}>{step.name}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>

        {/* Aunty encouragement */}
        <View style={styles.auntySection}>
          <AuntyAvatar auntyId={auntyId} size={44} showRing />
          <View style={[styles.auntyBubble, { backgroundColor: ac.bgDark, borderLeftColor: ac.accent }]}>
            <Text style={[styles.auntyNameLabel, { color: ac.accent }]}>{aunty.name}</Text>
            <Text style={styles.auntyMessage}>{step.auntyMessage}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom: Complete Step button */}
      <View style={styles.bottomAction}>
        <Button
          label={currentStep < totalSteps - 1 ? 'Complete Step' : 'Finish Ritual'}
          onPress={handleCompleteStep}
          variant="primary"
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.dark.text,
  },
  topCenter: {
    alignItems: 'center',
  },
  ritualType: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
  stepCounter: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: colors.dark.surfaceLight,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    marginBottom: spacing.xl,
  },
  progressBarFill: {
    height: 3,
    borderRadius: 2,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  stepName: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    letterSpacing: letterSpacing.tight,
    marginBottom: spacing.md,
  },
  stepDescription: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.dark.textMuted,
    lineHeight: fontSize.base * 1.6,
    marginBottom: spacing.xl,
  },
  auntySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  auntyBubble: {
    flex: 1,
    borderRadius: radius.md,
    borderTopLeftRadius: radius.xs,
    borderLeftWidth: 3,
    padding: spacing.md,
  },
  auntyNameLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.xs,
  },
  auntyMessage: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.dark.text,
    lineHeight: fontSize.md * 1.5,
  },
  bottomAction: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  // Completion state
  completeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  completeAvatarWrap: {
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: colors.dark.text,
    letterSpacing: letterSpacing.tight,
    marginBottom: spacing.sm,
  },
  completeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.xl,
  },
  completeBubble: {
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  completeBubbleText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.dark.text,
    lineHeight: fontSize.base * 1.5,
  },
  doneWrap: {
    width: '100%',
  },
});
