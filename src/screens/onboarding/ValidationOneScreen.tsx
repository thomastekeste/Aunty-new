/**
 * ValidationOneScreen — After curl type selection.
 *
 * Acknowledges their texture. One WordReveal line based on curl type.
 * No buttons. No interaction. Just a moment.
 * Auto-advances to PorosityTest after the line completes.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { WordReveal } from '../../components/WordReveal';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  gradients,
  letterSpacing,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Validation1'>;

const { height: SCREEN_H } = Dimensions.get('window');

function getTextureMessage(curlType?: string): string {
  if (!curlType) return "Your hair. Let's figure out exactly what it needs.";
  const prefix = curlType.charAt(0);
  switch (prefix) {
    case '2':
      return "Wavy hair. Most products aren't built for you. That changes.";
    case '3':
      return 'Curly hair. Beautiful and complex. I know exactly what it needs.';
    case '4':
      return 'Coily hair. The most misunderstood texture. I got you.';
    default:
      return "Your hair. Let's figure out exactly what it needs.";
  }
}

export default function ValidationOneScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];
  const curlType = state.data.hairProfile.curlType;
  const message = getTextureMessage(curlType);

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      navigation.replace('PorosityTest');
    }, 800);
  }, [navigation]);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        {/* Aunty avatar with glow */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
        </Animated.View>

        {/* Single validation line */}
        <View style={styles.lines}>
          <WordReveal
            text={message}
            stagger={55}
            onComplete={handleComplete}
            style={styles.line}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.18,
  },
  lines: {
    width: '100%',
    minHeight: SCREEN_H * 0.15,
  },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.35,
    letterSpacing: letterSpacing.tight,
    textAlign: 'center',
  },
});
