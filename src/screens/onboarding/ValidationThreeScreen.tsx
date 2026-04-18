/**
 * ValidationThreeScreen — After struggles. The empathy peak.
 *
 * Two short, weighty lines that flip in place.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { SpeechBubble } from '../../components/SpeechBubble';
import { useOnboarding } from '../../context/OnboardingContext';
import type { AuntyId } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  gradients,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Validation3'>;

export default function ValidationThreeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => navigation.replace('BudgetQuestion'), 600);
  }, [navigation]);

  const handleLineLanded = useCallback((i: number) => {
    if (i === 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        <Animated.View entering={FadeInUp.delay(120).duration(700)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={64} showRing glowing />
        </Animated.View>

        <View style={styles.lines}>
          <SpeechBubble
            lines={["You've been carrying this alone.", 'That stops today.']}
            holdMs={1800}
            fadeMs={420}
            shimmer
            textStyle={[styles.line, { color: colors.dark.text }]}
            onComplete={handleComplete}
            onLineLanded={handleLineLanded}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, justifyContent: 'center' },
  avatarWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  glow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, opacity: 0.18 },
  lines: { width: '100%', minHeight: 200, justifyContent: 'center' },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.3,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
});
