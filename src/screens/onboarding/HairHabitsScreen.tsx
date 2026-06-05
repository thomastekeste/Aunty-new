/**
 * HairHabitsScreen — Fatou hosts multi-step habits questions.
 *
 * "Technique is not optional, cherie."
 * Two sub-steps: wash frequency and heat usage.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { EditorialCard } from '../../components/EditorialCard';
import { useOnboarding } from '../../context/OnboardingContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { AUNTIES } from '../../constants/aunties';
import { getStepCopy, progress } from '../../constants/auntyVoice';
import { assessWashHabit } from '../../utils/washFrequency';
import type { OnboardingStackParamList, WashFrequency, HeatUse } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'HairHabits'>;

interface WashOption {
  value: WashFrequency;
  label: string;
  icon: string;
}

interface HeatOption {
  value: HeatUse;
  label: string;
  description: string;
  icon: string;
}

const WASH_OPTIONS: WashOption[] = [
  { value: 'daily', label: 'Every day', icon: '' },
  { value: 'every-other', label: 'Every other day', icon: '' },
  { value: 'twice-weekly', label: 'Twice a week', icon: '' },
  { value: 'weekly', label: 'Once a week', icon: '' },
  { value: 'biweekly', label: 'Every 2 weeks', icon: '' },
  { value: 'monthly', label: 'Once a month or less', icon: '' },
];

const HEAT_OPTIONS: HeatOption[] = [
  { value: 'never', label: 'Never', description: 'No heat tools at all.', icon: '' },
  { value: 'rarely', label: 'Rarely', description: 'A few times a year.', icon: '' },
  { value: 'monthly', label: 'Monthly', description: 'About once a month.', icon: '' },
  { value: 'weekly', label: 'Weekly', description: 'At least once a week.', icon: '' },
  { value: 'daily', label: 'Daily', description: 'Most days.', icon: '' },
];

export default function HairHabitsScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const { isSubscribed } = useSubscription();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const [subStep, setSubStep] = useState(0);
  const [wash, setWash] = useState<WashFrequency | undefined>(
    state.data.hairProfile.washFrequency
  );
  const [heat, setHeat] = useState<HeatUse | undefined>(
    state.data.hairProfile.heatUse
  );

  const ac = auntyColors[auntyId];

  // React to the user's wash habit using their curl type + porosity (already
  // collected earlier in the quiz). The exact prescription is a paid feature:
  // free users see it blurred — the first taste of what Aunty Pro unlocks.
  const washVerdict = wash
    ? assessWashHabit(
        wash,
        state.data.hairProfile.curlType,
        state.data.hairProfile.porosity,
      )
    : null;

  const washCopy = getStepCopy('habitsWash', auntyId, state.data.name);
  const heatCopy = getStepCopy('habitsHeat', auntyId, state.data.name);
  const questions = [washCopy.question, heatCopy.question];

  const canContinue = subStep === 0 ? !!wash : !!heat;

  const handleContinue = () => {
    if (subStep === 0 && wash) {
      updateHairProfile({ washFrequency: wash });
      setSubStep(1);
    } else if (subStep === 1 && heat) {
      updateHairProfile({ heatUse: heat });
      navigation.navigate('CurrentProducts');
    }
  };

  const handleBack = () => {
    if (subStep === 1) {
      setSubStep(0);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SalonFrame
      auntyId={auntyId}
      question={questions[subStep]}
      speakerVerb={subStep === 0 ? washCopy.verb : heatCopy.verb}
      {...progress('habits')}
      ctaLabel={subStep === 0 ? 'Next' : 'Continue'}
      ctaDisabled={!canContinue}
      onCtaPress={handleContinue}
      onBack={handleBack}
    >
      {/* Sub-stepper */}
      <View
        style={styles.subStepper}
        accessibilityRole="text"
        accessibilityLabel={`Part ${subStep + 1} of 2: ${subStep === 0 ? 'Wash Frequency' : 'Heat Usage'}`}
      >
        {[0, 1].map((i) => (
          <View
            key={i}
            style={[
              styles.subDot,
              i === subStep && { backgroundColor: ac.accent },
              i < subStep && { backgroundColor: ac.accent + '60' },
            ]}
          />
        ))}
        <Text style={styles.subLabel}>
          {subStep === 0 ? 'Wash Frequency' : 'Heat Usage'}
        </Text>
      </View>

      {subStep === 0 ? (
        <Animated.View key="wash" entering={FadeInDown.duration(400)} style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Wash frequency options">
          {WASH_OPTIONS.map((option, index) => (
            <EditorialCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={wash === option.value}
              onPress={() => setWash(option.value)}
              auntyId={auntyId}
              index={index}
              compact
            />
          ))}

          {washVerdict && (
            <Animated.View
              key={`verdict-${wash}`}
              entering={FadeInDown.duration(350)}
              style={[styles.verdictCard, { borderColor: ac.accent }]}
              accessibilityRole="text"
            >
              <Text style={[styles.verdictReaction, { color: ac.text }]}>
                {washVerdict.reaction}
              </Text>
              <View style={styles.verdictRow}>
                <Text style={styles.verdictLead}>
                  Aunty {aunty.name}&rsquo;s prescription:{' '}
                </Text>
                <Text
                  style={isSubscribed ? styles.verdictNumber : styles.verdictNumberBlur}
                  accessibilityLabel={
                    isSubscribed
                      ? washVerdict.recommendation.display
                      : 'Locked. Unlock with Aunty Pro.'
                  }
                >
                  {washVerdict.recommendation.display}
                </Text>
                {!isSubscribed && <Text style={styles.verdictLock}> 🔒</Text>}
              </View>
              <Text style={styles.verdictUnlock}>
                {isSubscribed
                  ? 'We’ll track every wash day with you in your ritual.'
                  : 'Unlock your exact wash schedule with Aunty Pro — we’ll track every wash day with you.'}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      ) : (
        <Animated.View key="heat" entering={FadeInDown.duration(400)} style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Heat usage options">
          {HEAT_OPTIONS.map((option, index) => (
            <EditorialCard
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              selected={heat === option.value}
              onPress={() => setHeat(option.value)}
              auntyId={auntyId}
              index={index}
              compact
            />
          ))}
        </Animated.View>
      )}
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  subStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  subLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginLeft: spacing.xs,
  },
  options: {
    gap: spacing.xs,
  },
  verdictCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  verdictReaction: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  verdictRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  verdictLead: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  verdictNumber: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  // Paywalled prescription: transparent glyphs + heavy text-shadow render the
  // text as an unreadable smudge — the "blur" free users have to unlock.
  verdictNumberBlur: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: 'transparent',
    textShadowColor: 'rgba(45, 27, 14, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  verdictLock: {
    fontSize: fontSize.sm,
  },
  verdictUnlock: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    lineHeight: 17,
  },
});
