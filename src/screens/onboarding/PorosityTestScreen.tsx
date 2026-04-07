/**
 * PorosityTestScreen — Marcia hosts the porosity water test.
 *
 * "Time fi test di roots."
 * Interactive three-option test: float, sink slowly, sink fast.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ConsultationShell } from '../../components/ConsultationShell';
import { OptionCard } from '../../components/OptionCard';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import type { OnboardingStackParamList, Porosity } from '../../types';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  auntyColors,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PorosityTest'>;

interface PorosityOption {
  value: Porosity;
  label: string;
  description: string;
  icon: string;
  detail: string;
}

const OPTIONS: PorosityOption[] = [
  {
    value: 'low',
    label: 'It floats on top',
    description: 'Stays at the surface.',
    icon: '',
    detail: 'Low porosity — cuticles are sealed tight. Products sit on top. We use lightweight formulas.',
  },
  {
    value: 'normal',
    label: 'It sinks slowly',
    description: 'Hovers in the middle, then drifts down.',
    icon: '',
    detail: 'Normal porosity — balanced absorption. Your hair takes in what it needs.',
  },
  {
    value: 'high',
    label: 'It sinks right away',
    description: 'Drops to the bottom fast.',
    icon: '',
    detail: 'High porosity — cuticles are raised. Absorbs fast but loses moisture fast. We seal it.',
  },
];

export default function PorosityTestScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const [selected, setSelected] = useState<Porosity | undefined>(
    state.data.hairProfile.porosity
  );

  const handleContinue = () => {
    if (!selected) return;
    updateHairProfile({ porosity: selected });
    navigation.navigate('PrimaryGoal');
  };

  const selectedOption = OPTIONS.find((o) => o.value === selected);

  return (
    <ConsultationShell
      auntyId={auntyId}
      question="Time to test your hair. Drop a strand in a glass of water. What happened?"
      step={3}
      totalSteps={8}
      ctaLabel="Next"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      {/* Test instruction */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.instruction}
        accessibilityRole="text"
        accessibilityLabel="The Water Glass Test: Take a clean strand of hair. Drop it in a glass of room-temperature water. Wait 2 to 4 minutes and observe."
      >
        <Text style={styles.instructionIcon}>{'\uD83E\uDDEA'}</Text>
        <View style={styles.instructionTextWrap}>
          <Text style={styles.instructionTitle}>The Water Glass Test</Text>
          <Text style={styles.instructionBody}>
            Take a clean strand of hair (shed from your brush is fine). Drop it in a glass
            of room-temperature water. Wait 2-4 minutes and observe.
          </Text>
        </View>
      </Animated.View>

      {/* Options */}
      <View style={styles.options}>
        {OPTIONS.map((option, index) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            icon={option.icon}
            selected={selected === option.value}
            onPress={() => setSelected(option.value)}
            auntyId={auntyId}
            index={index}
          />
        ))}
      </View>

      {/* Detail card on selection */}
      {selectedOption && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.detailCard, { borderLeftColor: ac.accent }]}
        >
          <Text style={styles.detailText}>{selectedOption.detail}</Text>
          <Text style={[styles.marciaNote, { color: ac.accent }]}>
            {'\u2014 '} Aunty {aunty.name} say so.
          </Text>
        </Animated.View>
      )}
    </ConsultationShell>
  );
}

const styles = StyleSheet.create({
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  instructionIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  instructionTextWrap: {
    flex: 1,
  },
  instructionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.text,
    marginBottom: 4,
  },
  instructionBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    lineHeight: fontSize.sm * 1.5,
  },
  options: {
    gap: spacing.xs,
  },
  detailCard: {
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  detailText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.dark.text,
    lineHeight: fontSize.md * 1.5,
  },
  marciaNote: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: auntyColors.marcia?.accent,
    marginTop: spacing.sm,
  },
});
