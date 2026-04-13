/**
 * StrugglesScreen — Amara hosts the struggle selection.
 *
 * "Tell me where it hurts."
 * Multi-select for common hair struggles.
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
import type { OnboardingStackParamList } from '../../types';
import {
  colors,
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
  { id: 'confusion', label: 'Don\u2019t know what to do', description: 'Overwhelmed by advice.', icon: '' },
];

export default function StrugglesScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
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
    <ConsultationShell
      auntyId={auntyId}
      question="Tell me where it hurts. Select everything that resonates."
      step={6}
      totalSteps={7}
      ctaLabel={`Continue${selected.size > 0 ? ` (${selected.size} selected)` : ''}`}
      ctaDisabled={selected.size === 0}
      onCtaPress={handleContinue}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(300)}>
        <Text style={styles.multiHint}>Select all that apply</Text>
      </Animated.View>

      <View style={styles.options} accessibilityRole="list" accessibilityLabel="Hair struggles, select all that apply">
        {STRUGGLES.map((struggle, index) => (
          <OptionCard
            key={struggle.id}
            label={struggle.label}
            description={struggle.description}
            icon={struggle.icon}
            selected={selected.has(struggle.id)}
            onPress={() => toggleStruggle(struggle.id)}
            auntyId={auntyId}
            index={index}
          />
        ))}
      </View>

      {selected.size >= 3 && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.empathy}>
          <Text style={styles.empathyText}>
            That's a lot to carry alone. This is exactly why we're here. Every single one of these — we address it.
          </Text>
        </Animated.View>
      )}
    </ConsultationShell>
  );
}

const styles = StyleSheet.create({
  multiHint: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  options: {
    gap: spacing.xs,
  },
  empathy: {
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  empathyText: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.md,
    color: colors.primary,
    fontStyle: 'italic',
    lineHeight: fontSize.md * 1.5,
    textAlign: 'center',
  },
});
