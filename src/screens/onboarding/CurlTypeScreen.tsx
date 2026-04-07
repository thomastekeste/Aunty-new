/**
 * CurlTypeScreen — Ngozi hosts curl pattern selection.
 *
 * "Let Aunty see your pattern."
 * Grid of curl types from 2a through 4c with descriptions.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ConsultationShell } from '../../components/ConsultationShell';
import { CurlPatternIcon } from '../../components/CurlPatternIcon';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import type { OnboardingStackParamList, CurlType } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  animation,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CurlType'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP * 2) / 3;

interface CurlOption {
  type: CurlType;
  label: string;
  description: string;
}

const CURL_OPTIONS: CurlOption[] = [
  { type: '2a', label: '2A', description: 'Gentle S-wave' },
  { type: '2b', label: '2B', description: 'Defined wave' },
  { type: '2c', label: '2C', description: 'Deep wave' },
  { type: '3a', label: '3A', description: 'Loose spiral' },
  { type: '3b', label: '3B', description: 'Bouncy ringlet' },
  { type: '3c', label: '3C', description: 'Tight corkscrew' },
  { type: '4a', label: '4A', description: 'Springy S-coil' },
  { type: '4b', label: '4B', description: 'Z-pattern coil' },
  { type: '4c', label: '4C', description: 'Tight shrinkage' },
];

const CATEGORIES = [
  { label: 'Wavy', range: [0, 3] },
  { label: 'Curly', range: [3, 6] },
  { label: 'Coily', range: [6, 9] },
];

function CurlCard({
  option,
  selected,
  onPress,
  index,
  accentColors,
}: {
  option: CurlOption;
  selected: boolean;
  onPress: () => void;
  index: number;
  accentColors: { accent: string; bg: string; bgDark: string; text: string; gradient: [string, string] };
}) {
  const ac = accentColors;
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    opacity.value = withTiming(0.6, { duration: 80 });
  };

  const handlePressOut = () => {
    opacity.value = withTiming(1, { duration: 120 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(400)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${option.label}: ${option.description}`}
      >
        <View
          style={[
            styles.card,
            selected && {
              borderColor: ac.accent,
              backgroundColor: ac.accent + '20',
            },
          ]}
        >
          <CurlPatternIcon
            type={option.type}
            size={36}
            color={selected ? ac.accent : 'rgba(254, 248, 236, 0.4)'}
          />
          <Text style={[styles.cardLabel, selected && { color: colors.dark.text }]}>
            {option.label}
          </Text>
          <Text style={styles.cardDesc}>{option.description}</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function CurlTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const [selected, setSelected] = useState<CurlType | undefined>(
    state.data.hairProfile.curlType
  );

  const handleSelect = (type: CurlType) => {
    setSelected(type);
  };

  const handleContinue = () => {
    if (!selected) return;
    updateHairProfile({ curlType: selected });
    navigation.navigate('Validation1');
  };

  return (
    <ConsultationShell
      auntyId={auntyId}
      question="Let Aunty see your pattern. Which one looks like you?"
      step={2}
      totalSteps={7}
      ctaLabel="That's my curl"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      {CATEGORIES.map((cat) => (
        <View key={cat.label} style={styles.category} accessibilityRole="radiogroup" accessibilityLabel={`${cat.label} curl types`}>
          <Text style={styles.categoryLabel}>{cat.label}</Text>
          <View style={styles.row}>
            {CURL_OPTIONS.slice(cat.range[0], cat.range[1]).map((option, i) => (
              <CurlCard
                key={option.type}
                option={option}
                selected={selected === option.type}
                onPress={() => handleSelect(option.type)}
                index={cat.range[0] + i}
                accentColors={auntyColors[auntyId]}
              />
            ))}
          </View>
        </View>
      ))}

      {selected && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.selectedHint}>
          <Text style={styles.selectedHintText}>
            {selected.startsWith('2')
              ? 'Beautiful. Let\u2019s work with that.'
              : selected.startsWith('3')
              ? 'Love those curls. We know exactly what they need.'
              : 'Crown texture. Let\u2019s take care of it.'}
          </Text>
        </Animated.View>
      )}
    </ConsultationShell>
  );
}

const styles = StyleSheet.create({
  category: {
    marginBottom: spacing.lg,
  },
  categoryLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  cardLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(254, 248, 236, 0.4)',
    textAlign: 'center',
  },
  selectedHint: {
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  selectedHintText: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.md,
    color: colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
});
