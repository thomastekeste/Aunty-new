/**
 * CurrentProductsScreen — Carmen hosts "what are you using now?"
 *
 * "Show me what you've been working with."
 * Multi-select of product categories the user currently uses. Optional — the
 * user can continue without selecting. "Nothing / Starting fresh" is exclusive.
 */

import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { EditorialCard } from '../../components/EditorialCard';
import { useOnboarding } from '../../context/OnboardingContext';
import { getStepCopy } from '../../constants/auntyVoice';
import type { OnboardingStackParamList } from '../../types';
import { spacing } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CurrentProducts'>;

// This screen is hosted by Carmen regardless of the user's chosen aunty.
const HOST_AUNTY = 'carmen' as const;

const NOTHING = 'Nothing / Starting fresh';

const PRODUCT_OPTIONS: string[] = [
  'Shampoo / Co-wash',
  'Conditioner',
  'Deep conditioner',
  'Leave-in conditioner',
  'Curl cream / styler',
  'Gel',
  'Oil / Serum',
  'Protein treatment',
  'Scalp treatment',
  NOTHING,
];

export default function CurrentProductsScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();

  const [selected, setSelected] = useState<string[]>(
    state.data.hairProfile.currentProductCategories ?? [],
  );

  const copy = getStepCopy('products', HOST_AUNTY, state.data.name);

  const toggle = (option: string) => {
    setSelected((prev) => {
      if (option === NOTHING) {
        return prev.includes(NOTHING) ? [] : [NOTHING];
      }
      const withoutNothing = prev.filter((o) => o !== NOTHING);
      return withoutNothing.includes(option)
        ? withoutNothing.filter((o) => o !== option)
        : [...withoutNothing, option];
    });
  };

  const handleContinue = () => {
    updateHairProfile({ currentProductCategories: selected });
    navigation.navigate('Struggles');
  };

  return (
    <SalonFrame
      auntyId={HOST_AUNTY}
      question={copy.question}
      speakerVerb={copy.verb}
      step={5}
      totalSteps={7}
      ctaLabel="Continue"
      ctaDisabled={selected.length === 0}
      onCtaPress={handleContinue}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.options}
        accessibilityRole="list"
        accessibilityLabel="Products you currently use"
      >
        {PRODUCT_OPTIONS.map((option, index) => (
          <EditorialCard
            key={option}
            label={option}
            icon=""
            selected={selected.includes(option)}
            onPress={() => toggle(option)}
            auntyId={HOST_AUNTY}
            index={index}
            compact
          />
        ))}
      </Animated.View>
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  options: { gap: spacing.xs },
});
