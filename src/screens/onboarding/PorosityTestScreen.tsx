import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackIcon } from '@/components/Icons';
import { OnboardingStackParamList, Porosity } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyAvatar from '@/components/AuntyAvatar';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { AUNTIES } from '@/constants/aunties';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PorosityTest'>;
type SubStep = 'intro' | 'test' | 'result';

const RESULTS: Record<string, { porosity: Porosity; title: string; explanation: string; revealMsg: string; icon: string; color: string }> = {
  float: {
    porosity: 'low',
    title: 'Low Porosity',
    explanation: 'Your hair cuticles are tightly closed. Products sit on top rather than absorbing. You need heat or steam to open the cuticle.',
    revealMsg: "Low porosity, honey. Your cuticles are sealed tight — that's why products just sit there. Warm up your treatments.",
    icon: '💧',
    color: '#00B4D8',
  },
  middle: {
    porosity: 'normal',
    title: 'Normal Porosity',
    explanation: 'Your cuticles are balanced — they absorb and retain moisture well. This is the sweet spot.',
    revealMsg: "Normal porosity — you're balanced, baby. Products absorb and stay. We work with what we've got.",
    icon: '↔️',
    color: '#F5C542',
  },
  sink: {
    porosity: 'high',
    title: 'High Porosity',
    explanation: 'Your cuticles are open and absorb moisture quickly but lose it just as fast. You need heavy sealers.',
    revealMsg: "High porosity. Your cuticles are wide open — drinks fast, loses fast. You need protein and sealers, now.",
    icon: '💦',
    color: '#FB5607',
  },
};

export default function PorosityTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setData } = useOnboarding();
  const [subStep, setSubStep] = useState<SubStep>('intro');
  const [selection, setSelection] = useState<'float' | 'middle' | 'sink' | null>(null);
  const [timer, setTimer] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [timerActive, timer]);

  const startTest = () => {
    setSubStep('test');
    setTimerActive(true);
  };

  const handleSelect = (opt: 'float' | 'middle' | 'sink') => {
    setSelection(opt);
    setTimerActive(false);
    clearInterval(timerRef.current!);
  };

  const handleReveal = () => {
    if (!selection) return;
    setSubStep('result');
  };

  const handleContinue = () => {
    if (!selection) return;
    const result = RESULTS[selection];
    setData({ porosity: result.porosity });
    navigation.navigate('ElasticityTest');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={colors.ink} size={22} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar current={2} total={14} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {subStep === 'intro' && (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.stepBadge}>Step 1 of 3</Text>
              <Text style={styles.heading}>Porosity Test</Text>
              <Text style={styles.tagline}>Understanding how your hair drinks</Text>
            </View>

            <View style={styles.fullCard}>
              <View style={styles.cardIconSection}>
                <Text style={styles.largeIcon}>💧</Text>
                <View style={styles.geometricPattern1} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardQuestion}>How well does your hair absorb moisture?</Text>
                <Text style={styles.cardDescription}>
                  Pull one strand of clean hair and drop it in a glass of water. Porosity tells us how well your hair absorbs and retains moisture — the foundation of everything we'll build.
                </Text>
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionTitle}>What you'll need:</Text>
                  <Text style={styles.instructionText}>• One clean strand of hair</Text>
                  <Text style={styles.instructionText}>• A glass of room-temperature water</Text>
                  <Text style={styles.instructionText}>• 2 minutes of patience</Text>
                </View>
              </View>
            </View>

            <Button label="I'm ready to test" onPress={startTest} />
          </>
        )}

        {subStep === 'test' && (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.stepBadge}>Step 1 of 3</Text>
              <Text style={styles.heading}>Drop it in</Text>
              <Text style={styles.tagline}>Watch where your strand settles</Text>
            </View>

            <View style={[styles.fullCard, styles.timerCard]}>
              <View style={styles.timerContent}>
                <Text style={styles.timerLabel}>Time remaining</Text>
                <Text style={styles.timerDisplay}>{formatTime(timer)}</Text>
                {timer === 0 && <Text style={styles.timerDone}>⏱️ Time's up!</Text>}
              </View>
              <View style={styles.geometricPattern2} />
            </View>

            <View style={styles.fullCard}>
              <Text style={styles.cardQuestion}>Where is the strand?</Text>
              <Text style={styles.cardDescription}>Select what you observe:</Text>
              <View style={styles.optionsContainer}>
                {(['float', 'middle', 'sink'] as const).map(opt => {
                  const labels = {
                    float: { text: 'Floating on top', icon: '⬆️' },
                    middle: { text: 'Floating in the middle', icon: '↔️' },
                    sink: { text: 'Sank to the bottom', icon: '⬇️' },
                  };
                  const isSelected = selection === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.answerCard,
                        isSelected && styles.answerCardSelected,
                        { borderColor: isSelected ? RESULTS[opt].color : colors.borderLight },
                        isSelected && { backgroundColor: `${RESULTS[opt].color}12` },
                      ]}
                      onPress={() => handleSelect(opt)}
                    >
                      <Text style={styles.answerIcon}>{labels[opt].icon}</Text>
                      <Text style={[styles.answerText, isSelected && { color: RESULTS[opt].color, fontWeight: fontWeight.black }]}>
                        {labels[opt].text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {selection && (
              <Button
                label="Reveal my result"
                onPress={handleReveal}
                style={{ marginTop: spacing.md }}
              />
            )}
          </>
        )}

        {subStep === 'result' && selection && (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.stepBadge}>Your Result</Text>
              <Text style={styles.heading}>{RESULTS[selection].title}</Text>
            </View>

            <View style={[styles.fullCard, { borderLeftWidth: 6, borderLeftColor: RESULTS[selection].color }]}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultIcon, { color: RESULTS[selection].color }]}>{RESULTS[selection].icon}</Text>
                <View>
                  <Text style={styles.resultLabel}>Porosity Profile</Text>
                  <Text style={[styles.resultTitle, { color: RESULTS[selection].color }]}>{RESULTS[selection].title}</Text>
                </View>
              </View>

              <Text style={styles.resultDescription}>{RESULTS[selection].explanation}</Text>

              <AuntyBubble auntyId="2" message={RESULTS[selection].revealMsg} />
            </View>

            <Button label="Got it. Keep going." onPress={handleContinue} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  progressWrap: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.lg },

  // Header
  headerSection: {
    marginBottom: spacing.sm,
  },
  stepBadge: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },

  // Full-box cards
  fullCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  cardIconSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  largeIcon: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  geometricPattern1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    opacity: 0.05,
    backgroundColor: colors.primary,
    borderRadius: 50,
  },
  cardContent: {
    gap: spacing.md,
  },
  cardQuestion: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  instructionBox: {
    backgroundColor: 'rgba(245,197,66,0.05)',
    borderLeft: 4,
    borderLeftColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  instructionTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Timer card
  timerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 180,
  },
  timerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  timerLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  timerDisplay: {
    fontFamily: fonts.display,
    fontSize: 56,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -2,
  },
  timerDone: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  geometricPattern2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    opacity: 0.04,
    bottom: -40,
    left: -40,
  },

  // Options
  optionsContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.canvas,
    gap: spacing.md,
  },
  answerCardSelected: {
    borderWidth: 2.5,
    backgroundColor: 'transparent',
  },
  answerIcon: {
    fontSize: 28,
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },

  // Result
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  resultIcon: {
    fontSize: 40,
  },
  resultLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  resultDescription: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
});
