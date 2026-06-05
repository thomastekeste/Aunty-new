/**
 * LocationScreen — your chosen aunty asks about location + water type.
 *
 * "Your water shapes your hair more than you know."
 * The user enters their city and we estimate their tap-water hardness from a
 * curated city table, then show the verdict + what it means for their hair.
 * They can override it manually (or set it themselves if we don't know the
 * city). Everything is optional — they can continue without answering.
 */

import React, { useState, useRef, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { PressableScale } from '../../components/PressableScale';
import { useOnboarding } from '../../context/OnboardingContext';
import { getStepCopy, progress } from '../../constants/auntyVoice';
import { lookupWaterHardness, HARDNESS_COPY, type WaterHardness } from '../../utils/waterHardness';
import type { OnboardingStackParamList } from '../../types';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Location'>;

const HARDNESS_COLOR: Record<WaterHardness, string> = {
  soft: colors.jewel.emerald,
  moderate: colors.jewel.amber,
  hard: colors.jewel.rose,
};

const MANUAL_OPTIONS: { value: WaterHardness; label: string }[] = [
  { value: 'soft', label: 'Soft' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
];

export default function LocationScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setCity, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';

  const [city, setLocalCity] = useState(state.data.city || '');
  const [override, setOverride] = useState<WaterHardness | undefined>(
    state.data.hairProfile.waterHardness,
  );
  const inputRef = useRef<TextInput>(null);

  const detected = useMemo(() => lookupWaterHardness(city), [city]);
  // What we'll actually show / save: a manual choice wins, else the estimate.
  const effective: WaterHardness | undefined = override ?? detected?.hardness;

  const copy = getStepCopy('location', auntyId, state.data.name);

  const handleContinue = () => {
    const trimmed = city.trim();
    if (trimmed) setCity(trimmed);
    updateHairProfile({ waterHardness: effective });
    navigation.navigate('CurlType');
  };

  return (
    <SalonFrame
      auntyId={auntyId}
      question={copy.question}
      speakerVerb={copy.verb}
      {...progress('location')}
      ctaLabel="Continue"
      ctaDisabled={!effective}
      onCtaPress={handleContinue}
      keyboardAware
    >
      {/* City */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.section}>
        <Text style={styles.label}>WHAT CITY ARE YOU IN?</Text>
        <TextInput
          ref={inputRef}
          value={city}
          onChangeText={(t) => { setLocalCity(t); setOverride(undefined); }}
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

      {/* Water verdict */}
      {effective ? (
        <Animated.View
          key={effective}
          entering={FadeIn.duration(350)}
          style={[styles.verdict, { borderLeftColor: HARDNESS_COLOR[effective], backgroundColor: HARDNESS_COLOR[effective] + '12' }]}
        >
          <Text style={styles.verdictOverline}>YOUR WATER</Text>
          <Text style={[styles.verdictLabel, { color: HARDNESS_COLOR[effective] }]}>
            {HARDNESS_COPY[effective].label}
          </Text>
          <Text style={styles.verdictBlurb}>{HARDNESS_COPY[effective].blurb}</Text>
          <Text style={styles.verdictSource}>
            {override
              ? 'You set this.'
              : `Estimated from ${detected?.matched}. Tap below if that's not right.`}
          </Text>
        </Animated.View>
      ) : (
        city.trim().length > 1 && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.unknownNote}>
            <Text style={styles.unknownText}>
              We don&apos;t have water data for that one yet — set it below if you know it.
            </Text>
          </Animated.View>
        )
      )}

      {/* Manual override */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
        <Text style={styles.label}>{effective ? 'NOT RIGHT? SET IT YOURSELF' : "WHAT'S YOUR WATER LIKE?"}</Text>
        <View style={styles.pills}>
          {MANUAL_OPTIONS.map((opt) => {
            const selected = effective === opt.value;
            return (
              <PressableScale
                key={opt.value}
                onPress={() => setOverride(selected && override ? undefined : opt.value)}
                style={[
                  styles.pill,
                  selected && { borderColor: HARDNESS_COLOR[opt.value], backgroundColor: HARDNESS_COLOR[opt.value] + '14', borderWidth: 1.5 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Water type ${opt.label}`}
              >
                <Text style={[styles.pillText, selected && { color: colors.ink, fontFamily: fonts.bodySemiBold }]}>
                  {opt.label}
                </Text>
              </PressableScale>
            );
          })}
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

  // Verdict card
  verdict: {
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  verdictOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  verdictLabel: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    letterSpacing: letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  verdictBlurb: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.55,
  },
  verdictSource: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },

  unknownNote: {
    marginBottom: spacing.lg,
  },
  unknownText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: fontSize.sm * 1.5,
  },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
});
