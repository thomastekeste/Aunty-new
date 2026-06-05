/**
 * PorosityTestScreen — Marcia hosts the porosity water test.
 *
 * Interactive three-option test: float, sink slowly, sink fast.
 * Quiz-based fallback for users who haven't done the water test.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ConsultationShell } from '../../components/ConsultationShell';
import { OptionCard } from '../../components/OptionCard';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import { getStepCopy } from '../../constants/auntyVoice';
import type { OnboardingStackParamList, Porosity } from '../../types';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  auntyColors,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PorosityTest'>;

interface PorosityOption {
  value: Porosity;
  label: string;
  description: string;
  icon: string;
  detail: string;
}

interface QuizQuestion {
  question: string;
  answers: { label: string; value: Porosity }[];
}

const OPTIONS: PorosityOption[] = [
  {
    value: 'low',
    label: 'It floats on top',
    description: 'Stays at the surface.',
    icon: '',
    detail: 'Low porosity — cuticles are sealed tight. Products sit on top. We use lightweight formulas.',
  },
  {
    value: 'normal',
    label: 'It sinks slowly',
    description: 'Hovers in the middle, then drifts down.',
    icon: '',
    detail: 'Normal porosity — balanced absorption. Your hair takes in what it needs.',
  },
  {
    value: 'high',
    label: 'It sinks right away',
    description: 'Drops to the bottom fast.',
    icon: '',
    detail: 'High porosity — cuticles are raised. Absorbs fast but loses moisture fast. We seal it.',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'How long does your hair take to fully air dry?',
    answers: [
      { label: 'Takes forever (4+ hours)', value: 'low' },
      { label: 'A couple hours', value: 'normal' },
      { label: 'Dries really fast', value: 'high' },
    ],
  },
  {
    question: 'When you apply leave-in conditioner, what happens?',
    answers: [
      { label: 'It sits on top, feels greasy', value: 'low' },
      { label: 'Absorbs nicely over a few minutes', value: 'normal' },
      { label: 'Disappears instantly, hair still feels dry', value: 'high' },
    ],
  },
  {
    question: 'Does your hair get weighed down easily?',
    answers: [
      { label: 'Yes, everything feels heavy', value: 'low' },
      { label: 'Only heavy products bother it', value: 'normal' },
      { label: 'Never — it always wants more', value: 'high' },
    ],
  },
  {
    question: 'How does your hair react to humidity?',
    answers: [
      { label: 'Barely changes', value: 'low' },
      { label: 'Some frizz, manageable', value: 'normal' },
      { label: 'Frizzes up immediately', value: 'high' },
    ],
  },
  {
    question: 'Have you ever bleached or color-treated?',
    answers: [
      { label: 'Never', value: 'low' },
      { label: 'A little (semi-permanent, highlights)', value: 'normal' },
      { label: 'Yes, heavily (full bleach, multiple times)', value: 'high' },
    ],
  },
];

function calculatePorosity(answers: Porosity[]): Porosity {
  const counts = { low: 0, normal: 0, high: 0 };
  answers.forEach((a) => counts[a]++);
  if (counts.low >= 3) return 'low';
  if (counts.high >= 3) return 'high';
  return 'normal';
}

export default function PorosityTestScreen() {
  const navigation = useNavigation<Nav>();
  const { state, updateHairProfile } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const copy = getStepCopy('porosity', auntyId, state.data.name);

  const [selected, setSelected] = useState<Porosity | undefined>(
    state.data.hairProfile.porosity
  );
  const [mode, setMode] = useState<'water' | 'quiz'>('water');
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Porosity[]>([]);

  const handleContinue = () => {
    if (!selected) return;
    updateHairProfile({ porosity: selected });
    navigation.navigate('PrimaryGoal');
  };

  const handleSwitchToQuiz = () => {
    setMode('quiz');
    setQuizIndex(0);
    setQuizAnswers([]);
  };

  const handleSwitchToWater = () => {
    setMode('water');
    setQuizIndex(0);
    setQuizAnswers([]);
  };

  const handleQuizAnswer = useCallback(
    (answer: Porosity) => {
      const newAnswers = [...quizAnswers, answer];
      setQuizAnswers(newAnswers);

      setTimeout(() => {
        if (quizIndex < 4) {
          setQuizIndex(quizIndex + 1);
        } else {
          const result = calculatePorosity(newAnswers);
          setSelected(result);
        }
      }, 400);
    },
    [quizIndex, quizAnswers]
  );

  const selectedOption = OPTIONS.find((o) => o.value === selected);
  const quizComplete = quizAnswers.length === 5;

  return (
    <ConsultationShell
      auntyId={auntyId}
      question={copy.question}
      step={3}
      totalSteps={7}
      ctaLabel="Next"
      ctaDisabled={!selected}
      onCtaPress={handleContinue}
    >
      {mode === 'water' && (
        <>
          {/* Test instruction */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.instruction}
            accessibilityRole="text"
            accessibilityLabel="The Water Glass Test: Take a clean strand of hair. Drop it in a glass of room-temperature water. Wait 2 to 4 minutes and observe."
          >
            <View style={styles.instructionTextWrap}>
              <Text style={styles.instructionTitle}>The Water Glass Test</Text>
              <Text style={styles.instructionBody}>
                Take a clean strand of hair (shed from your brush is fine). Drop it in a glass
                of room-temperature water. Wait 2-4 minutes and observe.
              </Text>
            </View>
          </Animated.View>

          {/* Options */}
          <View style={styles.options}>
            {OPTIONS.map((option, index) => (
              <OptionCard
                key={option.value}
                label={option.label}
                description={option.description}
                icon={option.icon}
                selected={selected === option.value}
                onPress={() => setSelected(option.value)}
                auntyId={auntyId}
                index={index}
              />
            ))}
          </View>

          {/* Not sure? link */}
          <Pressable onPress={handleSwitchToQuiz} style={styles.switchLink}>
            <Text style={styles.switchLinkText}>
              Haven&apos;t done the test? Let me figure it out.
            </Text>
          </Pressable>
        </>
      )}

      {mode === 'quiz' && !quizComplete && (
        <>
          {/* Quiz progress */}
          <View style={styles.quizProgress}>
            <Text style={styles.progressText}>
              Question {quizIndex + 1} of 5
            </Text>
            <View style={styles.quizDots}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.quizDot,
                    i <= quizIndex && styles.quizDotActive,
                    i <= quizIndex && { backgroundColor: ac.accent },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Quiz question */}
          <Animated.View
            key={quizIndex}
            entering={FadeInDown.duration(300)}
          >
            <Text style={styles.quizQuestionText}>
              {QUIZ_QUESTIONS[quizIndex].question}
            </Text>

            <View style={styles.options}>
              {QUIZ_QUESTIONS[quizIndex].answers.map((answer, index) => (
                <OptionCard
                  key={answer.label}
                  label={answer.label}
                  description=""
                  icon=""
                  selected={false}
                  onPress={() => handleQuizAnswer(answer.value)}
                  auntyId={auntyId}
                  index={index}
                />
              ))}
            </View>
          </Animated.View>

          {/* Back to water test link */}
          <Pressable onPress={handleSwitchToWater} style={styles.switchLink}>
            <Text style={styles.switchLinkText}>
              {'←'} Try the water test instead
            </Text>
          </Pressable>
        </>
      )}

      {mode === 'quiz' && quizComplete && (
        <>
          <Pressable onPress={handleSwitchToWater} style={styles.switchLink}>
            <Text style={styles.switchLinkText}>
              {'←'} Try the water test instead
            </Text>
          </Pressable>
        </>
      )}

      {/* Detail card on selection */}
      {selectedOption && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.detailCard, { borderLeftColor: ac.accent }]}
        >
          <Text style={styles.detailText}>{selectedOption.detail}</Text>
          <Text style={[styles.marciaNote, { color: ac.accent }]}>
            {'— '} Aunty {aunty.name} say so.
          </Text>
        </Animated.View>
      )}
    </ConsultationShell>
  );
}

const styles = StyleSheet.create({
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceTinted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  instructionTextWrap: {
    flex: 1,
  },
  instructionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
    marginBottom: 4,
  },
  instructionBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: fontSize.sm * 1.6,
  },
  options: {
    gap: spacing.xs,
  },
  detailCard: {
    backgroundColor: colors.surfaceTinted,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  detailText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
    lineHeight: fontSize.base * 1.5,
  },
  marciaNote: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  switchLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  quizProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quizDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quizDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  quizDotActive: {},
  quizQuestionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: fontSize.base * 1.5,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});
