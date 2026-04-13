/**
 * CouncilVerdictScreen — 3 findings, then done.
 *
 * Each finding types word-by-word. Crossfades between them.
 * After the third: button appears. No consensus, no insight.
 * The findings ARE the value. The button IS the conclusion.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { WordReveal } from '../../components/WordReveal';
import { Button } from '../../components/Button';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import type { OnboardingStackParamList } from '../../types';
import { colors, auntyColors, fonts, fontSize, spacing, gradients, letterSpacing } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CouncilVerdict'>;

function getFindings(profile: any): string[] {
  const por = profile.porosity || 'normal';
  const goal = profile.primaryGoal || 'moisture';
  const ct = profile.curlType || '3c';

  const porLine: Record<string, string> = {
    high: 'High porosity. Moisture leaves fast. We seal it.',
    low: 'Low porosity. Products sit on top. We go light.',
    normal: 'Balanced porosity. Absorbs well. We keep it.',
  };

  const goalLine: Record<string, string> = {
    moisture: 'Deep condition weekly. Humectants in, sealants on top.',
    growth: 'Growth is retention. Protect ends, feed scalp.',
    definition: 'Your curls want to clump. Right product, right method.',
    'damage-repair': 'Repair first. Protein rebuilds, moisture restores.',
    'scalp-health': 'Scalp is foundation. Clarify, massage, nourish.',
    'simplify-routine': 'Cut the clutter. Only what works stays.',
    transition: 'Two textures, one plan. Protect new growth.',
  };

  return [
    porLine[por] || porLine.normal,
    goalLine[goal] || goalLine.moisture,
    `No silicones. No sulfates. Vetted for ${ct} hair.`,
  ];
}

export default function CouncilVerdictScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, setPhase } = useOnboarding();
  const { hairProfile } = state.data;

  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const findings = getFindings(hairProfile);

  // -1=pause, 0-2=findings, 3=done (show button)
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setStep(0); setVisible(true); }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleDone = () => {
    if (step < findings.length - 1) {
      // Same rhythm as SendOff: 900ms hold, then advance
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setVisible(false);
        setTimeout(() => { setStep((s) => s + 1); setVisible(true); }, 200); // quick crossfade
      }, 500);
    } else {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowButton(true);
      }, 400);
    }
  };

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      {/* Top: dots + avatar */}
      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.dots}>
          {findings.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              i < step ? styles.dotDone
                : i === step ? [styles.dotCurrent, { backgroundColor: ac.accent }]
                : styles.dotPending,
            ]} />
          ))}
        </View>
        <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
        <Text style={[styles.name, { color: ac.accent }]}>{aunty.name}</Text>
      </View>

      {/* Finding — centered, crossfading */}
      {step >= 0 && step < findings.length && visible && (
        <Animated.View
          key={`f-${step}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.center}
        >
          <WordReveal
            text={findings[step]}
            stagger={55}
            onComplete={handleDone}
            style={styles.findingText}
          />
        </Animated.View>
      )}

      {/* Button — after last finding */}
      {showButton && (
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={[styles.btnWrap, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button
            label="See Your Products"
            onPress={() => { setPhase(3); navigation.navigate('ProductReveal'); }}
            variant="primary"
            size="lg"
          />
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { alignItems: 'center', gap: spacing.xs },
  dots: { flexDirection: 'row', gap: 5, marginBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotPending: { backgroundColor: 'rgba(254,248,236,0.1)' },
  dotDone: { backgroundColor: 'rgba(212,160,74,0.4)' },
  dotCurrent: { width: 18, borderRadius: 4 },
  name: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.md, marginTop: spacing.xs },

  center: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  findingText: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.3,
    textAlign: 'center',
    letterSpacing: letterSpacing.tight,
  },

  btnWrap: { paddingHorizontal: spacing.xl },
});
