/**
 * CouncilVerdictScreen — Cinematic verdict reveal.
 *
 * Multi-beat sequence:
 *   Beat 0  (0ms)      Deep ceremony background fades up.
 *   Beat 1  (250ms)    Overline + bead row converge from top.
 *   Beat 2  (650ms)    Aunty portrait blooms with halo pulse + rim light.
 *   Beat 3  (1000ms)   Name cross-fades in; italic verb follows.
 *   Beat 4  (1500ms)   First finding lands (SpeechBubble takes over).
 *   Beat 5  (complete) Gold hairline unfurls, CTA rises from bottom.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { SpeechBubble } from '../../components/SpeechBubble';
import { CeremonialButton } from '../../components/CeremonialButton';
import { VerdictShareCard } from '../../components/VerdictShareCard';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { useShareVerdictImage } from '../../hooks/useShareVerdictImage';
import type { OnboardingStackParamList } from '../../types';
import { getVerdictFindingsFromProfile } from '../../utils/verdictFindings';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  salon,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CouncilVerdict'>;

export default function CouncilVerdictScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, setPhase } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const findings = getVerdictFindingsFromProfile(state.data.hairProfile);
  const [activeLine, setActiveLine] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const shareRef = useRef<View>(null);
  const { share, sharing } = useShareVerdictImage();

  // ── Cinematic beats ─────────────────────────────
  const haloPulse = useSharedValue(0);
  const rimLight = useSharedValue(0);
  const hairline = useSharedValue(0);

  useEffect(() => {
    // Beat 2 — halo pulse once, then settle
    haloPulse.value = withDelay(
      650,
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
        withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
    );
    // Beat 2 — rim light fades up and holds
    rimLight.value = withDelay(
      700,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
    // Soft breathing on the halo so it feels alive
    haloPulse.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(0.75, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.45, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    // Entry haptic — a soft thump as the ceremony opens
    const t1 = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    }, 300);
    // Let the speech bubble start after the aunty lands
    const t2 = setTimeout(() => setSpeechReady(true), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleLineLanded = useCallback((i: number) => {
    setActiveLine(i);
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    // Gold hairline unfurls from center
    hairline.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    setShowButton(true);
  }, []);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(haloPulse.value, [0, 1], [0, 0.32]),
    transform: [{ scale: interpolate(haloPulse.value, [0, 1], [0.85, 1.08]) }],
  }));

  const rimStyle = useAnimatedStyle(() => ({
    opacity: rimLight.value * 0.55,
  }));

  const hairlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: hairline.value }],
    opacity: hairline.value,
  }));

  return (
    <View style={styles.container}>
      {/* Off-screen 9:16 asset for system share (view-shot). */}
      <View
        style={styles.shareOffscreen}
        pointerEvents="none"
        collapsable={false}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <VerdictShareCard
          ref={shareRef}
          auntyId={auntyId}
          auntyName={aunty.name}
          findings={findings}
        />
      </View>
      {/* Ambient aunty-tinted halo deep behind everything */}
      <Animated.View
        pointerEvents="none"
        style={[styles.ambientHalo, { backgroundColor: ac.accent }, haloStyle]}
      />

      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        {/* Beat 1 — overline + beads */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <Text style={styles.overline}>THE VERDICT</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(320).duration(500)}
          style={styles.beads}
        >
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
                ? ac.accent
                : status === 'done'
                ? colors.primary
                : colors.border;
            return (
              <View key={i} style={styles.beadWrap}>
                {status === 'active' ? (
                  <View style={[styles.beadHalo, { backgroundColor: ac.accent + '33' }]} />
                ) : null}
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                  }}
                />
              </View>
            );
          })}
        </Animated.View>

        {/* Beat 2 — avatar bloom with rim light */}
        <Animated.View entering={FadeInUp.delay(650).duration(720)} style={styles.avatarWrap}>
          <Animated.View
            pointerEvents="none"
            style={[styles.rimLight, { shadowColor: ac.accent }, rimStyle]}
          />
          <AuntyAvatar auntyId={auntyId} size={72} showRing glowing />
        </Animated.View>

        {/* Beat 3 — name + verb */}
        <Animated.Text
          entering={FadeIn.delay(1000).duration(520)}
          style={[styles.name, { color: ac.accent }]}
        >
          {aunty.name}
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(1180).duration(420)} style={styles.verb}>
          delivers the verdict
        </Animated.Text>
      </View>

      {/* Beat 4 — findings */}
      <View style={styles.center}>
        {speechReady ? (
          <SpeechBubble
            lines={findings}
            holdMs={2200}
            fadeMs={420}
            shimmer
            quoteMarkColor={ac.accent}
            textStyle={styles.line}
            onLineLanded={handleLineLanded}
            onComplete={handleComplete}
          />
        ) : null}
      </View>

      {/* Beat 5 — gold hairline + CTA */}
      {showButton && (
        <Animated.View
          entering={FadeInDown.duration(480)}
          style={[styles.btnWrap, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <Animated.View style={[styles.hairline, hairlineStyle]} />
          <CeremonialButton
            label="Share the verdict"
            onPress={() => share(shareRef)}
            variant="soft"
            size="md"
            loading={sharing}
            shimmer={false}
          />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  shareOffscreen: {
    position: 'absolute',
    left: -2000,
    top: 0,
    zIndex: -1,
  },

  ambientHalo: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    top: -120,
    alignSelf: 'center',
  },

  top: { alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl },

  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: 3.6,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },

  beads: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg, alignItems: 'center' },
  beadWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  beadHalo: { position: 'absolute', width: 18, height: 18, borderRadius: 9 },

  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  rimLight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 28,
    elevation: 12,
  },

  name: {
    fontFamily: fonts.serifBold,
    fontSize: fontSize.xxl,
    marginTop: spacing.md,
    letterSpacing: -0.3,
  },
  verb: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 2,
    letterSpacing: 0.3,
  },

  center: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.ink,
    lineHeight: fontSize.xxl * 1.3,
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  btnWrap: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  hairline: {
    width: 56,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.primary,
    opacity: 0.6,
  },
});
