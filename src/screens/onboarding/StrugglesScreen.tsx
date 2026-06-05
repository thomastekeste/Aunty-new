/**
 * StrugglesScreen — Senayt hosts the struggle selection.
 *
 * "Tell me where it hurts."
 * Multi-select for common hair struggles.
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
import { getStepCopy } from '../../constants/auntyVoice';
import type { OnboardingStackParamList } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Struggles'>;

interface Struggle {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const STRUGGLES: Struggle[] = [
  { id: 'dryness', label: 'Dryness', description: 'Rough, thirsty, straw-like.', icon: '' },
  { id: 'breakage', label: 'Breakage', description: 'Snaps easily, short pieces.', icon: '' },
  { id: 'frizz', label: 'Frizz', description: 'Undefined, poofy texture.', icon: '' },
  { id: 'no-growth', label: 'No growth', description: 'Same length month after month.', icon: '' },
  { id: 'scalp-issues', label: 'Scalp issues', description: 'Itchy, flaky, irritated.', icon: '' },
  { id: 'product-buildup', label: 'Buildup', description: 'Heavy, waxy, coated.', icon: '' },
  { id: 'time', label: 'Takes too long', description: 'Need it faster.', icon: '' },
  { id: 'confusion', label: 'Don’t know what to do', description: 'Overwhelmed by advice.', icon: '' },
];

export default function StrugglesScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const copy = getStepCopy('struggles', auntyId, state.data.name);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(state.data.hairProfile.failedAttempts ?? [])
  );

  const toggleStruggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (selected.size === 0) return;
    updateHairProfile({ failedAttempts: Array.from(selected) });
    navigation.navigate('Validation3');
  };

  return (
    <SalonFrame
      auntyId={auntyId}
      question={copy.question}
      speakerVerb={copy.verb}
      step={6}
      totalSteps={7}
      ctaLabel={selected.size > 0 ? `Continue · ${selected.size}` : 'Pick at least one'}
      ctaDisabled={selected.size === 0}
      onCtaPress={handleContinue}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(300)}>
        <Text style={styles.multiHint}>Select all that apply</Text>
      </Animated.View>

      <View style={styles.options} accessibilityRole="list" accessibilityLabel="Hair struggles, select all that apply">
        {STRUGGLES.map((struggle, index) => (
          <EditorialCard
            key={struggle.id}
            label={struggle.label}
            description={struggle.description}
            icon={struggle.icon}
            selected={selected.has(struggle.id)}
            onPress={() => toggleStruggle(struggle.id)}
            auntyId={auntyId}
            index={index}
            compact
          />
        ))}
      </View>

      {selected.size >= 3 && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.empathy}>
          <Text style={styles.empathyText}>
            That&apos;s a lot to carry alone. This is exactly why we&apos;re here — every single one, we address it.
          </Text>
        </Animated.View>
      )}
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  multiHint: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.xs,
  },
  empathy: {
    backgroundColor: colors.surfaceTinted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  empathyText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
    lineHeight: fontSize.sm * 1.5,
    textAlign: 'center',
  },
});
