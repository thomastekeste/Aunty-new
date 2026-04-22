/**
 * PrimaryGoalScreen — Carmen hosts goal selection.
 *
 * "What would change everything?"
 * Seven goal options, multi-select up to 2:
 *   - First pick = primaryGoal (the big one)
 *   - Second pick = stored in secondaryGoals
 *   - Tapping a selected card deselects it
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { EditorialCard } from '../../components/EditorialCard';
import { useOnboarding } from '../../context/OnboardingContext';
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

const MAX_SELECTIONS = 2;

export default function PrimaryGoalScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';

  // Hydrate from existing state: primary first, then secondaries (in order).
  const initialPicks: PrimaryGoal[] = [
    state.data.hairProfile.primaryGoal,
    ...(state.data.hairProfile.secondaryGoals || []),
  ].filter((g): g is PrimaryGoal => !!g).slice(0, MAX_SELECTIONS);

  const [picks, setPicks] = useState<PrimaryGoal[]>(initialPicks);

  const togglePick = (goal: PrimaryGoal) => {
    setPicks((curr) => {
      if (curr.includes(goal)) {
        return curr.filter((g) => g !== goal);
      }
      if (curr.length >= MAX_SELECTIONS) {
        // Replace the second pick, keep the first (primary) anchored.
        return [curr[0], goal];
      }
      return [...curr, goal];
    });
  };

  const handleContinue = () => {
    if (picks.length === 0) return;
    const [primary, ...rest] = picks;
    updateHairProfile({
      primaryGoal: primary,
      secondaryGoals: rest,
    });
    navigation.navigate('Validation2');
  };

  const ctaLabel =
    picks.length === 0
      ? 'Pick up to 2'
      : picks.length === 1
        ? "That's my dream"
        : 'These are my dreams';

  return (
    <SalonFrame
      auntyId={auntyId}
      question="What would change everything?"
      speakerVerb="is curious"
      step={4}
      totalSteps={7}
      ctaLabel={ctaLabel}
      ctaDisabled={picks.length === 0}
      onCtaPress={handleContinue}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.options}
        accessibilityRole="radiogroup"
        accessibilityLabel={`Primary hair goal options — choose up to ${MAX_SELECTIONS}`}
      >
        {GOAL_OPTIONS.map((goal, index) => {
          const selected = picks.includes(goal.value);
          return (
            <EditorialCard
              key={goal.value}
              label={goal.label}
              description={goal.description}
              icon={goal.icon}
              selected={selected}
              onPress={() => togglePick(goal.value)}
              auntyId={auntyId}
              index={index}
            />
          );
        })}
      </Animated.View>
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.xs,
  },
});
