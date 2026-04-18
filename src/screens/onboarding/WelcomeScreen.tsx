/**
 * WelcomeScreen — Pick your aunty, then she talks to you.
 *
 * Phase 0: Hook line types slowly
 * Phase 1: Aunty scroll appears
 * Phase 2: Chosen aunty introduces herself — slow, deliberate, personal
 * Phase 3: Button appears
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { WordReveal } from '../../components/WordReveal';
import { Button } from '../../components/Button';
import { PressableScale } from '../../components/PressableScale';
import { AUNTIES, COUNCIL_ORDER } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  colors, auntyColors, fonts, fontSize, spacing, radius, gradients, letterSpacing,
} from '../../constants/theme';
import { onboardingMotion } from '../../constants/onboardingMotion';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
const CARD_W = 110;
const CARD_GAP = 8;

// Aunty intros — each one sounds DIFFERENT
const INTROS: Record<AuntyId, string[]> = {
  ngozi: [
    "I'm Ngozi.",
    "I know textured hair. The science, the culture, the struggle.",
    "Tell me about yours and I'll handle the rest.",
  ],
  marcia: [
    "I'm Marcia.",
    "I know textured hair. The roots, the patience, the journey.",
    "Show me where you're at and we'll build from there.",
  ],
  denise: [
    "I'm Denise.",
    "I know textured hair. Been in this game longer than most.",
    "Tell me what's going on and I got you.",
  ],
  fatou: [
    "I'm Fatou.",
    "I know textured hair. The technique, the precision, the care.",
    "Walk me through yours and I'll design your plan.",
  ],
  carmen: [
    "I'm Carmen.",
    "I know textured hair. The curls, the volume, the joy.",
    "Tell me about yours and let's make them shine.",
  ],
  amara: [
    "I'm Amara.",
    "I know textured hair. The strength it takes, the patience it needs.",
    "Show me yours and we'll build something solid.",
  ],
  salma: [
    "I'm Salma.",
    "I know textured hair. The balance, the remedies, the whole picture.",
    "Tell me about yours and I'll find your path.",
  ],
};

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { setChosenAunty } = useOnboarding();

  const [phase, setPhase] = useState(0); // 0=hook, 1=scroll, 2=intro, 3=button
  const [hookDone, setHookDone] = useState(false);
  const [selectedId, setSelectedId] = useState<AuntyId | null>(null);
  const [introLine, setIntroLine] = useState(0);
  const [allDone, setAllDone] = useState(false);

  // Hook done → pause → show scroll
  useEffect(() => {
    if (hookDone && phase === 0) {
      setTimeout(() => setPhase(1), onboardingMotion.shortPauseMs);
    }
  }, [hookDone]);

  const handleSelect = (id: AuntyId) => {
    setSelectedId(id);
    setChosenAunty(id);
    setTimeout(() => { setPhase(2); setIntroLine(0); }, onboardingMotion.shortPauseMs);
  };

  const handleLineDone = () => {
    const lines = selectedId ? INTROS[selectedId] : [];
    if (introLine < lines.length - 1) {
      setTimeout(() => setIntroLine((l) => l + 1), onboardingMotion.linePauseMs);
    } else {
      setTimeout(() => { setAllDone(true); setPhase(3); }, onboardingMotion.shortPauseMs);
    }
  };

  const ac = selectedId ? auntyColors[selectedId] : null;
  const lines = selectedId ? INTROS[selectedId] : [];

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>

        {/* ─── PHASE 0+1: Hook + Pick ─────────────────── */}
        {phase <= 1 && (
          <View style={styles.pickSection}>
            <Animated.View layout={Layout.springify().damping(20).stiffness(120)} style={styles.hookWrap}>
              <WordReveal
                text="Every curl needs an aunty."
                stagger={onboardingMotion.wordStaggerMs}
                onComplete={() => setHookDone(true)}
                style={styles.hookText}
              />
            </Animated.View>

            {phase >= 1 && (
              <Animated.View entering={FadeIn.duration(400)}>
                <Text style={styles.pickLabel}>Pick yours.</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollRow}
                  snapToInterval={CARD_W + CARD_GAP}
                  decelerationRate="fast"
                >
                  {COUNCIL_ORDER.map((id, i) => {
                    const a = AUNTIES[id];
                    const c = auntyColors[id];
                    const sel = selectedId === id;
                    return (
                      <Animated.View key={id} entering={FadeIn.delay(i * 60).duration(250)}>
                        <PressableScale
                          onPress={() => handleSelect(id)}
                          haptic="medium"
                          scaleTo={0.96}
                          style={[
                            styles.card,
                            sel && {
                              borderColor: c.accent,
                              borderWidth: 1.5,
                              backgroundColor: c.accent + '1F',
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: sel }}
                          accessibilityLabel={`${a.name}, ${a.region}`}
                          accessibilityHint={`Tap to choose ${a.name} as your aunty`}
                        >
                          <AuntyAvatar auntyId={id} size={48} showRing={sel} glowing={sel} />
                          <Text style={[styles.cardName, sel && { color: c.accent }]}>{a.name}</Text>
                          <Text style={styles.cardRegion}>{a.region}</Text>
                        </PressableScale>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        )}

        {/* ─── PHASE 2+3: Aunty speaks ────────────────── */}
        {phase >= 2 && ac && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.introSection}>
            {/* Avatar with glow */}
            <View style={styles.avatarWrap}>
              <View style={[styles.glow, { backgroundColor: ac.accent }]} />
              <AuntyAvatar auntyId={selectedId!} size={72} showRing glowing />
            </View>

            {/* Lines stack up */}
            <View style={styles.lines}>
              {lines.map((line, i) => {
                if (i > introLine) return null;
                const isActive = i === introLine && !allDone;
                const isFirst = i === 0;
                return (
                  <View key={i} style={styles.lineWrap}>
                    {isActive ? (
                      <WordReveal
                        text={line}
                        stagger={onboardingMotion.wordStaggerMs}
                        onComplete={handleLineDone}
                        style={[
                          styles.lineText,
                          isFirst && styles.lineFirst,
                          isFirst && { color: ac.accent },
                        ]}
                      />
                    ) : (
                      <Text style={[
                        styles.lineDone,
                        isFirst && styles.lineFirst,
                        isFirst && { color: ac.accent },
                      ]}>
                        {line}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Button */}
            {phase >= 3 && (
              <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.btnWrap}>
                <Button
                  label="Let's Go"
                  onPress={() => navigation.navigate('ValuePreview')}
                  variant="primary"
                  size="lg"
                />
              </Animated.View>
            )}
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },

  // Pick phase
  pickSection: { flex: 1, justifyContent: 'center' },
  hookWrap: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  hookText: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxxl * 1.15,
    letterSpacing: letterSpacing.tight,
  },
  pickLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  scrollRow: { paddingHorizontal: spacing.lg, gap: CARD_GAP },
  card: {
    width: CARD_W,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.dark.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    gap: spacing.xs,
  },
  cardName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.dark.text },
  cardRegion: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.dark.textMuted },

  // Intro phase
  introSection: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.xxl },
  glow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, opacity: 0.15 },
  lines: { gap: spacing.lg },
  lineWrap: {},
  lineText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    color: colors.dark.text,
    lineHeight: fontSize.xl * 1.4,
  },
  lineFirst: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * 1.2,
  },
  lineDone: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    color: 'rgba(254,248,236,0.4)',
    lineHeight: fontSize.xl * 1.4,
  },
  btnWrap: { marginTop: spacing.xxl },
});
