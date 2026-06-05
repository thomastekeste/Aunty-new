/**
 * ValidationThreeScreen — "The Release"
 *
 * After struggles selection, before budget question.
 * Editorial beat: your struggles are set as quiet lines of type on cream.
 * They hold so you see them, then float upward and dissolve as the aunty
 * takes them on. No chips, no chrome — the words and the motion carry it.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { AuntySpeaks, type AuntySpeaksHandle } from '../../components/AuntySpeaks';
import { TapToContinue } from '../../components/TapToContinue';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  getStruggleRead,
  STRUGGLE_LABELS,
} from '../../constants/validationCopy';
import type { AuntyId } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  dialogueText,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Validation3'>;
type Phase = 'entering' | 'holding' | 'releasing' | 'speaking' | 'done';

// ─── Struggle line ────────────────────────────────────────────────

interface LineProps {
  label: string;
  enterDelay: number;
  releaseDelay: number;
  releasing: boolean;
  onReleased: () => void;
}

function StruggleLine({ label, enterDelay, releaseDelay, releasing, onReleased }: LineProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const released = useRef(false);

  useEffect(() => {
    if (releasing && !released.current) {
      released.current = true;
      translateY.value = withDelay(
        releaseDelay,
        withTiming(-60, { duration: 900, easing: Easing.out(Easing.cubic) }),
      );
      opacity.value = withDelay(
        releaseDelay,
        withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) }, () => {
          runOnJS(onReleased)();
        }),
      );
    }
  }, [releasing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View entering={FadeIn.delay(enterDelay).duration(520)} style={animatedStyle}>
      <Text style={styles.struggleLine}>{label}</Text>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function ValidationThreeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];

  const struggles = state.data.hairProfile.failedAttempts || [];
  const labels = struggles.map((id) => STRUGGLE_LABELS[id] || id);

  const speechLines = getStruggleRead(auntyId, struggles.length, state.data.name);

  const [phase, setPhase] = useState<Phase>('entering');
  const [canTap, setCanTap] = useState(false);
  const speaksRef = useRef<AuntySpeaksHandle>(null);
  const navigatingRef = useRef(false);

  const highlightWords = [state.data.name].filter(Boolean) as string[];
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const releasedCountRef = useRef(0);

  // ── Single accent hairline ──
  const lineWidth = useSharedValue(0);
  const lineAnimStyle = useAnimatedStyle(() => ({ width: lineWidth.value }));

  // ── Phase: Entering → Holding ──
  useEffect(() => {
    if (phase === 'entering') {
      const enterDuration = 600 + labels.length * 220 + 600;
      const timer = setTimeout(() => setPhase('holding'), enterDuration);
      return () => clearTimeout(timer);
    }
  }, [phase, labels.length]);

  // ── Phase: Holding → Releasing ──
  useEffect(() => {
    if (phase === 'holding') {
      const timer = setTimeout(() => {
        // If no struggles were selected, skip the release animation entirely
        if (labels.length === 0) {
          lineWidth.value = withTiming(40, { duration: 600, easing: Easing.out(Easing.cubic) });
          setTimeout(() => setPhase('speaking'), 600);
          return;
        }
        setPhase('releasing');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, labels.length, lineWidth]);

  // ── Line released callback ──
  const handleLineReleased = useCallback(() => {
    releasedCountRef.current += 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (releasedCountRef.current >= labels.length) {
      setTimeout(() => {
        lineWidth.value = withTiming(40, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 200);
      setTimeout(() => setPhase('speaking'), 500);
    }
  }, [labels.length]);

  const handlePhraseLanded = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSpeechComplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('done');
    setTimeout(() => setCanTap(true), 500);

    autoAdvanceRef.current = setTimeout(() => {
      if (!navigatingRef.current) {
        navigatingRef.current = true;
        navigation.replace('BudgetQuestion');
      }
    }, 10000);
  }, [navigation]);

  const handleTap = useCallback(() => {
    if (navigatingRef.current) return;
    if (!canTap) {
      if (speaksRef.current?.isSpeaking()) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        speaksRef.current.skip();
      }
      return;
    }
    navigatingRef.current = true;
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => navigation.replace('BudgetQuestion'), 180);
  }, [canTap, navigation]);

  const showLines = phase === 'entering' || phase === 'holding' || phase === 'releasing';

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.pressable, { paddingTop: insets.top + spacing.xxl }]}
        onPress={handleTap}
      >
        {/* Avatar */}
        <Animated.View entering={FadeInUp.delay(120).duration(600)} style={styles.avatarWrap}>
          <AuntyAvatar auntyId={auntyId} size={64} showRing glowing />
        </Animated.View>

        {/* Struggles — quiet floating type */}
        {showLines && (
          <View style={styles.struggleBlock}>
            {labels.map((label, index) => (
              <StruggleLine
                key={label}
                label={label}
                enterDelay={600 + index * 220}
                releaseDelay={index * 160}
                releasing={phase === 'releasing'}
                onReleased={handleLineReleased}
              />
            ))}
          </View>
        )}

        {/* Single accent hairline (after the release) */}
        {(phase === 'speaking' || phase === 'done') && (
          <View style={styles.lineCenter}>
            <Animated.View style={[styles.decorLine, { backgroundColor: ac.accent }, lineAnimStyle]} />
          </View>
        )}

        {/* Speech */}
        <View style={styles.lines}>
          {phase === 'speaking' && (
            <AuntySpeaks
              ref={speaksRef}
              lines={speechLines}
              holdMs={1400}
              quoteMarkColor={ac.accent}
              accentColor={ac.accent}
              highlightWords={highlightWords}
              textStyle={dialogueText}
              onPhraseLanded={handlePhraseLanded}
              onComplete={handleSpeechComplete}
            />
          )}
        </View>

        <TapToContinue visible={canTap} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  pressable: {
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
  struggleBlock: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 100,
  },
  struggleLine: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.ink,
    letterSpacing: -0.3,
    lineHeight: fontSize.xl * 1.3,
    textAlign: 'center',
  },
  lineCenter: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  decorLine: {
    height: 1,
  },
  lines: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  line: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    lineHeight: 22 * 1.45,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});
