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
import { SalonFrame } from '../../components/SalonFrame';
import { EditorialCard } from '../../components/EditorialCard';
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
    <SalonFrame
      auntyId={auntyId}
      question="Let's test your porosity — does your hair float, hover, or sink?"
      speakerVerb="wants to test"
      step={3}
      totalSteps={7}
      ctaLabel="Continue"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      {/* Test instruction */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.instruction}
        accessibilityRole="text"
        accessibilityLabel="If you don't know your porosity, try the water glass test. Drop a clean strand of hair into a glass of room-temperature water. Wait 2 to 4 minutes, then see whether it floats at the top, hovers in the middle, or sinks to the bottom."
      >
        <Text style={styles.instructionIcon}>{'\uD83E\uDDEA'}</Text>
        <View style={styles.instructionTextWrap}>
          <Text style={styles.instructionTitle}>Don't know yours? Try the water test</Text>
          <Text style={styles.instructionBody}>
            Drop a clean strand (a piece from your brush works) into a glass of
            room-temperature water. Wait 2-4 minutes — does it float at the top,
            hover in the middle, or sink to the bottom?
          </Text>
        </View>
      </Animated.View>

      <View style={styles.options}>
        {OPTIONS.map((option, index) => (
          <EditorialCard
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

      {selectedOption && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.detailCard, { borderLeftColor: ac.accent }]}
        >
          <Text style={styles.detailText}>{selectedOption.detail}</Text>
          <Text style={[styles.marciaNote, { color: ac.accent }]}>
            {'\u2014 '} Aunty {aunty.name} says so.
          </Text>
        </Animated.View>
      )}
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  instructionIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  instructionTextWrap: {
    flex: 1,
  },
  instructionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.text,
    marginBottom: 2,
  },
  instructionBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    lineHeight: fontSize.xs * 1.5,
  },
  options: {
    gap: spacing.xs,
  },
  detailCard: {
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  detailText: {
    fontFamily: fonts.serifMedium,
    fontSize: fontSize.sm,
    color: colors.dark.text,
    lineHeight: fontSize.sm * 1.4,
    letterSpacing: -0.1,
  },
  marciaNote: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.xs,
    color: auntyColors.marcia?.accent,
    marginTop: spacing.xs,
  },
});
