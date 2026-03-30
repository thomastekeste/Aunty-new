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
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PorosityTest'>;
type SubStep = 'intro' | 'test' | 'result';

const RESULTS: Record<string, { porosity: Porosity; title: string; explanation: string; revealMsg: string }> = {
  float: {
    porosity: 'low',
    title: 'Low Porosity',
    explanation: 'Your hair cuticles are tightly closed. Products sit on top rather than absorbing. You need heat or steam to open the cuticle.',
    revealMsg: "Low porosity, honey. Your cuticles are sealed tight — that's why products just sit there. Warm up your treatments.",
  },
  middle: {
    porosity: 'normal',
    title: 'Normal Porosity',
    explanation: 'Your cuticles are balanced — they absorb and retain moisture well. This is the sweet spot.',
    revealMsg: "Normal porosity — you're balanced, baby. Products absorb and stay. We work with what we've got.",
  },
  sink: {
    porosity: 'high',
    title: 'High Porosity',
    explanation: 'Your cuticles are open and absorb moisture quickly but lose it just as fast. You need heavy sealers.',
    revealMsg: "High porosity. Your cuticles are wide open — drinks fast, loses fast. You need protein and sealers, now.",
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
        {/* All 7 aunty avatars in a row */}
        <View style={styles.councilRow}>
          {['1','2','3','4','5','6','7'].map((id, i) => (
            <View key={id} style={[styles.councilAvatar, { marginLeft: i === 0 ? 0 : -8 }]}>
              <AuntyAvatar auntyId={id} size={36} />
            </View>
          ))}
          <Text style={styles.councilLabel}>The full council</Text>
        </View>

        {subStep === 'intro' && (
          <>
            <Text style={styles.heading}>Porosity Test</Text>
            <Text style={styles.body}>
              Pull one strand of clean hair and drop it in a glass of water. Porosity tells us how well your hair absorbs and retains moisture — the foundation of everything we'll build.
            </Text>
            <View style={styles.illustrationBox}>
              <Text style={styles.illustrationText}>Get a single strand of clean hair and a glass of room-temperature water.</Text>
            </View>
            <Button label="I have my strand." onPress={startTest} />
          </>
        )}

        {subStep === 'test' && (
          <>
            <Text style={styles.heading}>Drop it in the water.</Text>
            <Text style={styles.body}>Watch where the strand settles. Wait at least 2 minutes.</Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
              {timer === 0 && <Text style={styles.timerDone}>Time's up. What do you see?</Text>}
            </View>

            <Text style={styles.optionHeading}>Where is the strand?</Text>
            {(['float', 'middle', 'sink'] as const).map(opt => {
              const labels = {
                float: 'Floating on top',
                middle: 'Floating in the middle',
                sink: 'Sank to the bottom',
              };
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.option, selection === opt && styles.optionSelected]}
                  onPress={() => handleSelect(opt)}
                >
                  <Text style={[styles.optionText, selection === opt && styles.optionTextSelected]}>
                    {labels[opt]}
                  </Text>
                </TouchableOpacity>
              );
            })}

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
            <AuntyBubble auntyId="2" message={RESULTS[selection].revealMsg} />
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{RESULTS[selection].title}</Text>
              <Text style={styles.resultBody}>{RESULTS[selection].explanation}</Text>
            </View>
            <Button label="Got it. Keep going." onPress={handleContinue} style={{ marginTop: spacing.md }} />
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
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  progressWrap: { flex: 1 },
  content: { padding: spacing.md },
  councilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  councilAvatar: { borderWidth: 2, borderColor: colors.canvas, borderRadius: 20 },
  councilLabel: {
    marginLeft: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  illustrationBox: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  illustrationText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, fontWeight: fontWeight.medium, lineHeight: 24, textAlign: 'center' },
  timerBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  timerText: { fontFamily: fonts.display, fontSize: 48, fontWeight: fontWeight.black, color: colors.ink, letterSpacing: -2 },
  timerDone: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.success, marginTop: spacing.sm, fontWeight: fontWeight.semibold },
  optionHeading: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  option: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.canvas,
  },
  optionSelected: { borderColor: colors.amber, backgroundColor: colors.surface },
  optionText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  optionTextSelected: { fontWeight: fontWeight.bold, color: colors.ink },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  resultTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  resultBody: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },
});
