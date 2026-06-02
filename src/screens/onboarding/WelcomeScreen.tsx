/**
 * WelcomeScreen — Pick your aunty, then she introduces herself.
 *
 * Phase 0: Hero hook (single editorial line, fades in)
 * Phase 1: Aunty picker carousel
 * Phase 2: Chosen aunty speaks — line-flip SpeechBubble (no typer)
 * Phase 3: Ceremonial CTA
 *
 * Warm canvas palette — matches the rest of the consultation flow.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { SpeechBubble } from '../../components/SpeechBubble';
import { CeremonialButton } from '../../components/CeremonialButton';
import { PressableScale } from '../../components/PressableScale';
import { AUNTIES, COUNCIL_ORDER } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  colors, auntyColors, fonts, fontSize, spacing, radius,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
const CARD_W = 116;
const CARD_GAP = 10;

const INTROS: Record<AuntyId, string[]> = {
  ngozi: [
    "I'm Ngozi.",
    'I know textured hair — the science, the culture, the struggle.',
    "Tell me about yours and I'll handle the rest.",
  ],
  marcia: [
    "I'm Marcia.",
    'I know textured hair — the roots, the patience, the journey.',
    "Show me where you're at and we'll build from there.",
  ],
  denise: [
    "I'm Denise.",
    "I know textured hair. I've been in this game longer than most.",
    "Tell me what's going on and I got you.",
  ],
  fatou: [
    "I'm Fatou.",
    'I know textured hair — the technique, the precision, the care.',
    "Walk me through yours and I'll design your plan.",
  ],
  carmen: [
    "I'm Carmen.",
    'I know textured hair — the curls, the volume, the joy.',
    "Tell me about yours and let's make them shine.",
  ],
  amara: [
    "I'm Senayt.",
    'I know textured hair — the strength it takes, the patience it needs.',
    "Show me yours and we'll build something solid.",
  ],
  salma: [
    "I'm Salma.",
    'I know textured hair — the balance, the remedies, the whole picture.',
    "Tell me about yours and I'll find your path.",
  ],
};

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { setChosenAunty } = useOnboarding();

  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [selectedId, setSelectedId] = useState<AuntyId | null>(null);

  // Hero → picker after a beat (no typer to wait on)
  useEffect(() => {
    if (phase === 0) {
      const t = setTimeout(() => setPhase(1), 700);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleSelect = (id: AuntyId) => {
    setSelectedId(id);
    setChosenAunty(id);
    setTimeout(() => setPhase(2), 150);
  };

  const handleSpeechComplete = useCallback(() => {
    setPhase(3);
  }, []);

  const ac = selectedId ? auntyColors[selectedId] : null;
  const lines = selectedId ? INTROS[selectedId] : [];

  return (
    <View style={styles.container}>
      {/* Aunty-color halo behind everything once chosen */}
      {ac ? (
        <Animated.View
          entering={FadeIn.duration(420)}
          pointerEvents="none"
          style={[styles.halo, { backgroundColor: ac.accent }]}
        />
      ) : null}

      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>
        {/* ─── PHASE 0+1: Hero + Picker ────────────────── */}
        {phase <= 1 && (
          <Animated.View
            style={styles.pickSection}
            exiting={FadeOut.duration(220)}
          >
            <Animated.View entering={FadeInDown.duration(620)} style={styles.heroWrap}>
              <Text style={styles.eyebrow}>THE AUNTY CURL COUNCIL</Text>
              <Text style={styles.hero}>
                Every curl{'\n'}needs an{' '}
                <Text style={styles.heroEm}>aunty.</Text>
              </Text>
            </Animated.View>

            {phase >= 1 && (
              <Animated.View entering={FadeIn.delay(80).duration(380)}>
                <Text style={styles.pickLabel}>Pick yours</Text>
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
                      <Animated.View key={id} entering={FadeIn.delay(i * 50).duration(240)}>
                        <PressableScale
                          onPress={() => handleSelect(id)}
                          haptic="medium"
                          scaleTo={0.95}
                          style={[
                            styles.card,
                            sel && {
                              borderColor: c.accent,
                              backgroundColor: c.accent + '0D',
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: sel }}
                          accessibilityLabel={a.name}
                        >
                          {/* aunty-tinted top bar */}
                          <View style={[styles.cardBar, { backgroundColor: c.accent }]} />
                          <View style={styles.cardInner}>
                            <AuntyAvatar auntyId={id} size={52} showRing={sel} glowing={sel} />
                            <Text style={[styles.cardName, sel && { color: c.accent }]}>
                              {a.name}
                            </Text>
                          </View>
                        </PressableScale>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
                <Text style={styles.hint}>swipe to see all 7</Text>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* ─── PHASE 2+3: Aunty introduces herself ──────── */}
        {phase >= 2 && ac && selectedId && (
          <Animated.View
            entering={FadeIn.duration(320)}
            style={[
              styles.introSection,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
          >
            {/* Centered tableau — avatar, name, speech all float in the middle */}
            <View style={styles.introCenter}>
              <Animated.View
                entering={FadeIn.delay(60).duration(320)}
                style={styles.avatarWrap}
              >
                <View style={[styles.avatarGlow, { backgroundColor: ac.accent }]} />
                <AuntyAvatar auntyId={selectedId} size={84} showRing glowing />
              </Animated.View>

              <Animated.Text
                entering={FadeIn.delay(140).duration(280)}
                style={[styles.auntyName, { color: ac.accent }]}
              >
                {AUNTIES[selectedId].name}
              </Animated.Text>
              <Animated.Text
                entering={FadeIn.delay(200).duration(260)}
                style={styles.auntyRegion}
              >
                {AUNTIES[selectedId].title}
              </Animated.Text>

              <View style={styles.bubbleWrap}>
                <SpeechBubble
                  lines={lines}
                  holdMs={1200}
                  fadeMs={240}
                  shimmer
                  quoteMarkColor={ac.accent}
                  textStyle={styles.bubbleText}
                  onComplete={handleSpeechComplete}
                />
              </View>
            </View>

            {/* Button pinned at the bottom — centered tableau keeps its middle position */}
            {phase >= 3 && (
              <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.btnWrap}>
                <CeremonialButton
                  label="Begin"
                  onPress={() => navigation.navigate('NameEntry')}
                  size="lg"
                />
              </Animated.View>
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1 },

  halo: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.06,
    top: -150,
    alignSelf: 'center',
  },

  // Pick phase
  pickSection: { flex: 1, justifyContent: 'center' },
  heroWrap: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  hero: {
    fontFamily: fonts.display,
    fontSize: fontSize.display,
    color: colors.ink,
    lineHeight: fontSize.display * 1.05,
    letterSpacing: -1.5,
  },
  heroEm: {
    fontFamily: fonts.serifItalicBold,
    color: colors.primary,
  },
  pickLabel: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.lg,
    color: colors.muted,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  scrollRow: { paddingHorizontal: spacing.lg, gap: CARD_GAP },
  card: {
    width: CARD_W,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardBar: {
    height: 3,
    width: '100%',
    opacity: 0.7,
  },
  cardInner: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 6,
  },
  cardName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    marginTop: 2,
  },
  cardRegion: {
    fontFamily: fonts.serifItalic,
    fontSize: 11,
    color: colors.muted,
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },

  // Intro phase — tableau centered vertically, CTA pinned to bottom
  introSection: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  introCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.12,
  },
  auntyName: {
    fontFamily: fonts.serifBold,
    fontSize: fontSize.xxl,
    letterSpacing: -0.5,
  },
  auntyRegion: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.md,
    color: colors.muted,
    marginTop: 2,
    marginBottom: spacing.xl,
  },
  bubbleWrap: {
    width: '100%',
    minHeight: 130,
    justifyContent: 'center',
  },
  bubbleText: {
    fontFamily: fonts.serifMedium,
    fontSize: fontSize.xl,
    color: colors.ink,
    lineHeight: fontSize.xl * 1.4,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  btnWrap: {
    width: '100%',
    marginTop: spacing.md,
  },
});
