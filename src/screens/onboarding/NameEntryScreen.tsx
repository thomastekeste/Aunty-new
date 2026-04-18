/**
 * NameEntryScreen — Name + age + gender on one screen.
 *
 * Name input at top, then compact pill selectors for age range and gender.
 * All on one screen, no scrolling needed. Data for both personalization and analytics.
 */

import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { PressableScale } from '../../components/PressableScale';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import type { OnboardingStackParamList } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'NameEntry'>;

const AGE_OPTIONS = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export default function NameEntryScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setName, setDemographics } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const [localName, setLocalName] = useState(state.data.name);
  const [age, setAge] = useState<string | null>(state.data.ageRange || null);
  const [gender, setGender] = useState<string | null>(state.data.gender || null);
  const inputRef = useRef<TextInput>(null);

  const isValid = localName.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) return;
    setName(localName.trim());
    if (age || gender) setDemographics({ ageRange: age || undefined, gender: gender || undefined });
    navigation.navigate('CurlType');
  };

  return (
    <SalonFrame
      auntyId={auntyId}
      question={aunty.greeting}
      speakerVerb="wants to know"
      step={1}
      totalSteps={7}
      ctaLabel="That's me"
      ctaDisabled={!isValid}
      onCtaPress={handleContinue}
      keyboardAware
    >
      {/* Name input */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
        <TextInput
          ref={inputRef}
          value={localName}
          onChangeText={setLocalName}
          placeholder="Your name"
          placeholderTextColor="rgba(254, 248, 236, 0.25)"
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => inputRef.current?.blur()}
          style={styles.input}
          selectionColor={colors.primary}
          accessibilityLabel="Enter your name"
        />
        <View style={styles.underline}>
          <View style={[styles.underlineFill, isValid && styles.underlineActive]} />
        </View>
      </Animated.View>

      {isValid && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.section}>
          <Text style={styles.label}>AGE RANGE</Text>
          <View style={styles.pills}>
            {AGE_OPTIONS.map((opt) => {
              const selected = age === opt;
              return (
                <PressableScale
                  key={opt}
                  onPress={() => setAge(selected ? null : opt)}
                  style={[
                    styles.pill,
                    selected && { borderColor: ac.accent, backgroundColor: ac.accent + '1F', borderWidth: 1.5 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Age range ${opt}`}
                >
                  <Text style={[styles.pillText, selected && { color: colors.dark.text, fontFamily: fonts.bodySemiBold }]}>
                    {opt}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </Animated.View>
      )}

      {isValid && (
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.section}>
          <Text style={styles.label}>I IDENTIFY AS</Text>
          <View style={styles.pills}>
            {GENDER_OPTIONS.map((opt) => {
              const selected = gender === opt;
              return (
                <PressableScale
                  key={opt}
                  onPress={() => setGender(selected ? null : opt)}
                  style={[
                    styles.pill,
                    selected && { borderColor: ac.accent, backgroundColor: ac.accent + '1F', borderWidth: 1.5 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Identify as ${opt}`}
                >
                  <Text style={[styles.pillText, selected && { color: colors.dark.text, fontFamily: fonts.bodySemiBold }]}>
                    {opt}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </Animated.View>
      )}
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.md },
  input: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    paddingVertical: spacing.xs,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xxl * 1.2,
  },
  underline: { height: 2, backgroundColor: colors.dark.border, borderRadius: 1 },
  underlineFill: { height: '100%', width: '0%', backgroundColor: colors.primary, borderRadius: 1 },
  underlineActive: { width: '100%' },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surfaceLight,
    minHeight: 40,
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: fonts.serifMedium,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    letterSpacing: -0.1,
  },
});
