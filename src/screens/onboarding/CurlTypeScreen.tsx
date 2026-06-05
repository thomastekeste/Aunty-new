/**
 * CurlTypeScreen — Ngozi hosts curl pattern selection.
 *
 * "Let Aunty see your pattern."
 * Grid of curl types from 2a through 4c with descriptions.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SalonFrame } from '../../components/SalonFrame';
import { PressableScale } from '../../components/PressableScale';
import { CurlPatternIcon } from '../../components/CurlPatternIcon';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import { getStepCopy, progress } from '../../constants/auntyVoice';
import type { OnboardingStackParamList, CurlType } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
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
  const sway = useSharedValue(0);
  const selectedLift = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    const baseDuration = 1300 + (index % 3) * 130;
    sway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: baseDuration, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: baseDuration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(sway);
    };
  }, [index, sway]);

  useEffect(() => {
    selectedLift.value = withSpring(selected ? 1 : 0, {
      damping: 16,
      stiffness: 220,
      mass: 0.55,
    });
  }, [selected, selectedLift]);

  const iconMotion = useAnimatedStyle(() => ({
    transform: [
      { translateY: sway.value * 1.1 - selectedLift.value * 2.4 },
      { rotate: `${sway.value * (selected ? 2.8 : 1.5)}deg` },
      { scale: 1 + selectedLift.value * 0.08 },
    ],
    opacity: 0.7 + selectedLift.value * 0.3,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(400)}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.97}
        style={[
          styles.card,
          selected && {
            borderColor: ac.accent,
            backgroundColor: `${ac.accent}0A`,
          },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${option.label}: ${option.description}`}
      >
        <Animated.View style={[styles.iconWrap, iconMotion]}>
          <CurlPatternIcon
            type={option.type}
            size={48}
            color={selected ? ac.accent : colors.muted}
          />
        </Animated.View>
        <Text style={[styles.cardLabel, selected && { color: ac.accent }]}>
          {option.label}
        </Text>
        <View
          style={[
            styles.cardUnderline,
            selected && { backgroundColor: ac.accent, opacity: 0.7 },
          ]}
        />
        <Text style={styles.cardDesc} numberOfLines={1}>{option.description}</Text>
      </PressableScale>
    </Animated.View>
  );
}

export default function CurlTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const copy = getStepCopy('curlType', auntyId, state.data.name);
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
    <SalonFrame
      auntyId={auntyId}
      question={copy.question}
      speakerVerb={copy.verb}
      {...progress('curlType')}
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
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.pullQuoteWrap}
        >
          <View
            style={[
              styles.pullQuoteRule,
              { backgroundColor: auntyColors[auntyId].accent },
            ]}
          />
          <Text style={styles.pullQuoteText}>
            {selected.startsWith('2')
              ? 'Beautiful. Let’s work with that.'
              : selected.startsWith('3')
              ? 'Love those curls. We know exactly what they need.'
              : 'Crown texture. Let’s take care of it.'}
          </Text>
        </Animated.View>
      )}
    </SalonFrame>
  );
}

const styles = StyleSheet.create({
  category: {
    marginBottom: spacing.md,
  },
  categoryLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 4,
  },
  cardLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  cardUnderline: {
    width: 18,
    height: 1.5,
    backgroundColor: colors.border,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 1,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: '100%',
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 14,
  },
  pullQuoteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    paddingLeft: 2,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  pullQuoteRule: {
    width: 2,
    alignSelf: 'stretch',
    marginTop: 4,
    marginBottom: 4,
    opacity: 0.8,
    borderRadius: 1,
  },
  pullQuoteText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    letterSpacing: -0.15,
    color: colors.inkLight,
  },
});
