/**
 * LocationScreen — Salma hosts location + water type.
 *
 * "Your water shapes your hair more than you know."
 * City (free text) + water hardness (single select). Both optional — the
 * user can continue without answering. Captured for hair-profile context.
 */

import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { EditorialCard } from '../../components/EditorialCard';
import { useOnboarding } from '../../context/OnboardingContext';
import type { OnboardingStackParamList } from '../../types';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  letterSpacing,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Location'>;

type WaterValue = 'soft' | 'moderate' | 'hard' | 'unknown';

interface WaterOption {
  value: WaterValue;
  label: string;
  description: string;
}

const WATER_OPTIONS: WaterOption[] = [
  { value: 'soft', label: 'Soft', description: 'Lathers easily, feels slick.' },
  { value: 'moderate', label: 'Moderate', description: 'Somewhere in between.' },
  { value: 'hard', label: 'Hard', description: 'Soap struggles, leaves residue.' },
  { value: 'unknown', label: "I don't know", description: "That's okay — we can figure it out." },
];

// This screen is hosted by Salma regardless of the user's chosen aunty.
const HOST_AUNTY = 'salma' as const;

export default function LocationScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setCity, updateHairProfile } = useOnboarding();

  const [city, setLocalCity] = useState(state.data.city || '');
  const [water, setWater] = useState<WaterValue | undefined>(() => {
    const w = state.data.hairProfile.waterHardness;
    return w ?? undefined;
  });
  const inputRef = useRef<TextInput>(null);

  const handleContinue = () => {
    const trimmed = city.trim();
    if (trimmed) setCity(trimmed);
    updateHairProfile({ waterHardness: water === 'unknown' ? undefined : water });
    navigation.navigate('CurlType');
  };

  return (
    <SalonFrame
      auntyId={HOST_AUNTY}
      question="Your water shapes your hair more than you know."
      speakerVerb="wants to know"
      step={1}
      totalSteps={7}
      ctaLabel="Continue"
      onCtaPress={handleContinue}
      keyboardAware
    >
      {/* City */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.section}>
        <Text style={styles.label}>WHAT CITY ARE YOU IN?</Text>
        <TextInput
          ref={inputRef}
          value={city}
          onChangeText={setLocalCity}
          placeholder="e.g. Atlanta, London, Lagos"
          placeholderTextColor={colors.muted + '60'}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => inputRef.current?.blur()}
          style={styles.input}
          selectionColor={colors.primary}
          accessibilityLabel="Enter your city"
        />
        <View style={styles.underline}>
          <View style={[styles.underlineFill, city.trim().length > 0 && styles.underlineActive]} />
        </View>
      </Animated.View>

      {/* Water type */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.section}
        accessibilityRole="radiogroup"
        accessibilityLabel="Water type options"
      >
        <Text style={styles.label}>WHAT&apos;S YOUR WATER LIKE?</Text>
        <View style={styles.options}>
          {WATER_OPTIONS.map((option, index) => (
            <EditorialCard
              key={option.value}
              label={option.label}
              description={option.description}
              icon=""
              selected={water === option.value}
              onPress={() => setWater(water === option.value ? undefined : option.value)}
              auntyId={HOST_AUNTY}
              index={index}
              compact
            />
          ))}
        </View>
      </Animated.View>
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.ink,
    paddingVertical: spacing.xs,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xl * 1.2,
  },
  underline: { height: 2, backgroundColor: colors.border, borderRadius: 1 },
  underlineFill: { height: '100%', width: '0%', backgroundColor: colors.primary, borderRadius: 1 },
  underlineActive: { width: '100%' },
  options: { gap: spacing.xs },
});
