import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { colors, fonts, spacing, fontSize, fontWeight, radius } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Location'>;

// Rough water hardness by keyword — expand with a real API if needed
function guessWaterHardness(city: string): 'soft' | 'medium' | 'hard' {
  const hard = ['los angeles', 'las vegas', 'phoenix', 'san antonio', 'denver', 'dallas'];
  const soft = ['seattle', 'portland', 'boston', 'new york', 'miami', 'london', 'manchester'];
  const lower = city.toLowerCase();
  if (hard.some(c => lower.includes(c))) return 'hard';
  if (soft.some(c => lower.includes(c))) return 'soft';
  return 'medium';
}

export default function LocationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, setData } = useOnboarding();
  const [city, setCity] = useState(data.city ?? '');

  const handleContinue = () => {
    const hardness = guessWaterHardness(city);
    setData({ city, water_hardness: hardness });
    navigation.navigate('PorosityTest');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <ProgressBar current={1} total={14} />
      </View>

      <View style={styles.content}>
        <AuntyBubble
          auntyId="7"
          message="Where are you coming to us from? Your water situation matters more than you think."
        />

        <Text style={styles.question}>What city are you in?</Text>

        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="City, Country"
          placeholderTextColor={colors.muted}
          autoFocus
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={city.trim().length > 0 ? handleContinue : undefined}
        />

        {city.trim().length > 0 && (
          <View style={styles.hardnessPill}>
            <Text style={styles.hardnessText}>
              Water: {guessWaterHardness(city).charAt(0).toUpperCase() + guessWaterHardness(city).slice(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={city.trim().length === 0}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  topBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  content: { flex: 1, padding: spacing.md },
  question: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    fontFamily: fonts.body,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.ink,
    backgroundColor: colors.offWhite,
  },
  hardnessPill: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: 999,
  },
  hardnessText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
  },
});
