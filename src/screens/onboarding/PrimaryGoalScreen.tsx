/**
 * PrimaryGoalScreen — Carmen hosts goal selection.
 *
 * "What does your dream hair look like?"
 * Seven goal options as rich cards, single select.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { EditorialCard } from '../../components/EditorialCard';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import type { OnboardingStackParamList, PrimaryGoal } from '../../types';
import { spacing } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PrimaryGoal'>;

interface GoalOption {
  value: PrimaryGoal;
  label: string;
  description: string;
  icon: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  { value: 'moisture', label: 'Moisture', description: 'Dry, crunchy hair.', icon: '' },
  { value: 'growth', label: 'Growth', description: 'Retain length.', icon: '' },
  { value: 'definition', label: 'Curl definition', description: 'Bouncy, defined curls.', icon: '' },
  { value: 'damage-repair', label: 'Damage repair', description: 'Heat or chemical damage.', icon: '' },
  { value: 'scalp-health', label: 'Scalp health', description: 'Itchy, flaky scalp.', icon: '' },
  { value: 'simplify-routine', label: 'Simplify routine', description: 'Too many products.', icon: '' },
  { value: 'transition', label: 'Transitioning', description: 'Going natural.', icon: '' },
];

export default function PrimaryGoalScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const [selected, setSelected] = useState<PrimaryGoal | undefined>(
    state.data.hairProfile.primaryGoal
  );

  const handleContinue = () => {
    if (!selected) return;
    updateHairProfile({ primaryGoal: selected });
    navigation.navigate('Validation2');
  };

  return (
    <SalonFrame
      auntyId={auntyId}
      question="What would change everything?"
      speakerVerb="is curious"
      step={4}
      totalSteps={7}
      ctaLabel="That's my dream"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.options}
        accessibilityRole="radiogroup"
        accessibilityLabel="Primary hair goal options"
      >
        {GOAL_OPTIONS.map((goal, index) => (
          <EditorialCard
            key={goal.value}
            label={goal.label}
            description={goal.description}
            icon={goal.icon}
            selected={selected === goal.value}
            onPress={() => setSelected(goal.value)}
            auntyId={auntyId}
            index={index}
          />
        ))}
      </Animated.View>
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.xs,
  },
});
