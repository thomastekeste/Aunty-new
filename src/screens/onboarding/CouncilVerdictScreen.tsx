/**
 * CouncilVerdictScreen — Three findings, one CTA.
 *
 * Each finding is a SpeechBubble line that flips in place.
 * Bead progress at top mirrors the salon shell rhythm.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { SpeechBubble } from '../../components/SpeechBubble';
import { CeremonialButton } from '../../components/CeremonialButton';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import type { OnboardingStackParamList } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  gradients,
  salon,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CouncilVerdict'>;

function getFindings(profile: any): string[] {
  const por = profile.porosity || 'normal';
  const goal = profile.primaryGoal || 'moisture';
  const ct = profile.curlType || '3c';

  const porLine: Record<string, string> = {
    high: 'High porosity. Moisture leaves fast — we seal it.',
    low: 'Low porosity. Products sit on top — we go light.',
    normal: 'Balanced porosity. Absorbs well — we keep it.',
  };

  const goalLine: Record<string, string> = {
    moisture: 'Deep condition weekly. Humectants in, sealants on top.',
    growth: 'Growth is retention. Protect ends, feed scalp.',
    definition: 'Your curls want to clump. Right product, right method.',
    'damage-repair': 'Repair first. Protein rebuilds, moisture restores.',
    'scalp-health': 'Scalp is the foundation. Clarify, massage, nourish.',
    'simplify-routine': 'Cut the clutter. Only what works stays.',
    transition: 'Two textures, one plan. Protect the new growth.',
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
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const findings = getFindings(state.data.hairProfile);
  const [activeLine, setActiveLine] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const handleLineLanded = useCallback((i: number) => {
    setActiveLine(i);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowButton(true);
  }, []);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.beads}>
          {findings.map((_, i) => {
            const status = i < activeLine ? 'done' : i === activeLine ? 'active' : 'upcoming';
            const size =
              status === 'active'
                ? salon.bead.activeSize
                : status === 'done'
                ? salon.bead.completedSize
                : salon.bead.upcomingSize;
            const color =
              status === 'active'
                ? salon.bead.active
                : status === 'done'
                ? salon.bead.completed
                : salon.bead.upcoming;
            return (
              <View key={i} style={styles.beadWrap}>
                {status === 'active' ? (
                  <View style={[styles.beadHalo, { backgroundColor: salon.bead.activeHalo }]} />
                ) : null}
                <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
              </View>
            );
          })}
        </View>

        <Animated.View entering={FadeInUp.delay(120).duration(700)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={64} showRing glowing />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(420).duration(400)} style={[styles.name, { color: ac.accent }]}>
          {aunty.name}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(520).duration(400)} style={styles.verb}>
          delivers the verdict
        </Animated.Text>
      </View>

      <View style={styles.center}>
        <SpeechBubble
          lines={findings}
          holdMs={2200}
          fadeMs={400}
          shimmer
          textStyle={styles.line}
          onLineLanded={handleLineLanded}
          onComplete={handleComplete}
        />
      </View>

      {showButton && (
        <Animated.View
          entering={FadeInDown.duration(420)}
          style={[styles.btnWrap, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <CeremonialButton
            label="See your products"
            onPress={() => {
              setPhase(3);
              navigation.navigate('ProductReveal');
            }}
            size="lg"
          />
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl },
  beads: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg, alignItems: 'center' },
  beadWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  beadHalo: { position: 'absolute', width: 18, height: 18, borderRadius: 9 },
  avatarWrap: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  glow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, opacity: 0.18 },
  name: {
    fontFamily: fonts.serifBold,
    fontSize: fontSize.xl,
    marginTop: spacing.sm,
    letterSpacing: -0.3,
  },
  verb: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.3,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  btnWrap: { paddingHorizontal: spacing.xl },
});
