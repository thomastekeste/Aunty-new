/**
 * NameEntryScreen — Denise asks your name.
 *
 * "What should we call you, sugar?"
 * Dark consultation shell with a gold-underlined text input.
 * The cultural elder opens with warmth.
 */

import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ConsultationShell } from '../../components/ConsultationShell';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import type { OnboardingStackParamList } from '../../types';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  letterSpacing,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'NameEntry'>;

export default function NameEntryScreen() {
  const navigation = useNavigation<Nav>();
  const { state, setName } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const [localName, setLocalName] = useState(state.data.name);
  const inputRef = useRef<TextInput>(null);

  const isValid = localName.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) return;
    setName(localName.trim());
    navigation.navigate('CurlType');
  };

  return (
    <ConsultationShell
      auntyId={auntyId}
      question={aunty.greeting}
      step={1}
      totalSteps={8}
      ctaLabel="That's me"
      ctaDisabled={!isValid}
      onCtaPress={handleContinue}
      keyboardAware
    >
      <View style={styles.inputArea}>
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.hint}>Your first name is fine, baby.</Text>
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
            onSubmitEditing={handleContinue}
            style={styles.input}
            selectionColor={colors.primary}
            accessibilityLabel="Enter your name"
            accessibilityHint="Type your first name so the aunties know what to call you"
          />
          <View style={styles.underline}>
            <View
              style={[
                styles.underlineFill,
                isValid && styles.underlineActive,
              ]}
            />
          </View>
        </Animated.View>

        {localName.trim().length > 0 && (
          <Animated.Text
            entering={FadeInDown.delay(100).duration(300)}
            style={styles.preview}
          >
            Welcome, {localName.trim()}. Aunty's got you.
          </Animated.Text>
        )}
      </View>
    </ConsultationShell>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xs,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    marginBottom: spacing.lg,
    letterSpacing: letterSpacing.wide,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: colors.dark.text,
    paddingVertical: spacing.md,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xxxl * 1.2,
  },
  underline: {
    height: 2,
    backgroundColor: colors.dark.border,
    borderRadius: 1,
  },
  underlineFill: {
    height: '100%',
    width: '0%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  underlineActive: {
    width: '100%',
  },
  preview: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.lg,
    color: colors.primary,
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
});
