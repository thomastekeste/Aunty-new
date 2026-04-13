/**
 * NameEntryScreen — Name + age + gender on one screen.
 *
 * Name input at top, then compact pill selectors for age range and gender.
 * All on one screen, no scrolling needed. Data for both personalization and analytics.
 */

import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ConsultationShell } from '../../components/ConsultationShell';
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
    <ConsultationShell
      auntyId={auntyId}
      question={aunty.greeting}
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

      {/* Age range — appears after name is entered */}
      {isValid && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.section}>
          <Text style={styles.label}>AGE RANGE</Text>
          <View style={styles.pills}>
            {AGE_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAge(age === opt ? null : opt); }}
                style={[styles.pill, age === opt && { borderColor: ac.accent, backgroundColor: ac.accent + '18' }]}
              >
                <Text style={[styles.pillText, age === opt && { color: colors.dark.text }]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Gender — appears after name */}
      {isValid && (
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.section}>
          <Text style={styles.label}>I IDENTIFY AS</Text>
          <View style={styles.pills}>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGender(gender === opt ? null : opt); }}
                style={[styles.pill, gender === opt && { borderColor: ac.accent, backgroundColor: ac.accent + '18' }]}
              >
                <Text style={[styles.pillText, gender === opt && { color: colors.dark.text }]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}
    </ConsultationShell>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  input: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: colors.dark.text,
    paddingVertical: spacing.sm,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xxxl * 1.2,
  },
  underline: { height: 2, backgroundColor: colors.dark.border, borderRadius: 1 },
  underlineFill: { height: '100%', width: '0%', backgroundColor: colors.primary, borderRadius: 1 },
  underlineActive: { width: '100%' },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.sm,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.border,
    minHeight: 42,
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.dark.textMuted,
  },
});
