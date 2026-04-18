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
import { AUNTIES } from '../../constants/aunties';
import type { OnboardingStackParamList, WashFrequency, HeatUse } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
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

  const questions = [
    'Tell me \u2014 how often do you wash your hair?',
    `And heat tools? Be honest with Aunty ${aunty.name}, I will not judge.`,
  ];

  const canContinue = subStep === 0 ? !!wash : !!heat;

  const handleContinue = () => {
    if (subStep === 0 && wash) {
      updateHairProfile({ washFrequency: wash });
      setSubStep(1);
    } else if (subStep === 1 && heat) {
      updateHairProfile({ heatUse: heat });
      navigation.navigate('Struggles');
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
      speakerVerb={subStep === 0 ? 'is asking' : 'wants the truth'}
      step={5}
      totalSteps={7}
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
            />
          ))}
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.border,
  },
  subLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginLeft: spacing.xs,
  },
  options: {
    gap: spacing.xs,
  },
});
