import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BackIcon,
  FloatUpIcon,
  FloatMiddleIcon,
  SinkDownIcon,
} from '@/components/Icons';
import { OnboardingStackParamList, Porosity, Elasticity, Density } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PorosityTest'>;
type SubStep = 'intro' | 'test' | 'result';
type TestId = 'porosity' | 'elasticity' | 'density';

interface TestResult {
  value: string;
  title: string;
  explanation: string;
  revealMsg: string;
  icon: React.ReactNode;
  color: string;
}

// ── Test data ──────────────────────────────────────────────────────────

const POROSITY_RESULTS: Record<string, TestResult> = {
  float: {
    value: 'low',
    title: 'Low Porosity',
    explanation: 'Your hair cuticles are tightly closed. Products sit on top rather than absorbing. Heat or steam is needed to open the cuticle before treatments.',
    revealMsg: "Low porosity, honey. Your cuticles are sealed tight — that's why products just sit there. Warm up your treatments before applying.",
    icon: <FloatUpIcon color="#00B4D8" size={40} strokeWidth={2} />,
    color: '#00B4D8',
  },
  middle: {
    value: 'normal',
    title: 'Normal Porosity',
    explanation: 'Your cuticles are balanced — they absorb and retain moisture well. This is the sweet spot most products are designed for.',
    revealMsg: "Normal porosity — you're balanced, baby. Products absorb and stay. We work with what we've got.",
    icon: <FloatMiddleIcon color="#F5C542" size={40} strokeWidth={2} />,
    color: '#F5C542',
  },
  sink: {
    value: 'high',
    title: 'High Porosity',
    explanation: 'Your cuticles are open and absorb moisture quickly but lose it just as fast. Heavy sealers and protein treatments are your best friends.',
    revealMsg: "High porosity. Your cuticles are wide open — drinks fast, loses fast. We need protein and sealers to lock that moisture in.",
    icon: <SinkDownIcon color="#FB5607" size={40} strokeWidth={2} />,
    color: '#FB5607',
  },
};

const ELASTICITY_RESULTS: Record<string, TestResult> = {
  snapped: {
    value: 'low',
    title: 'Low Elasticity',
    explanation: 'Your hair snapped when stretched — it needs protein to strengthen and rebuild. Regular protein treatments will restore resilience.',
    revealMsg: "Low elasticity — your hair snapped. You need protein, mija. Regular treatments will rebuild that strength.",
    icon: <SinkDownIcon color="#FF006E" size={40} strokeWidth={2} />,
    color: '#FF006E',
  },
  bounced: {
    value: 'normal',
    title: 'Normal Elasticity',
    explanation: 'Your hair stretched and returned. This is healthy elasticity — balanced protein and moisture working together.',
    revealMsg: "Normal elasticity — your hair stretched and bounced back. You've got good strength. Keep that protein-moisture balance.",
    icon: <FloatMiddleIcon color="#06FFA5" size={40} strokeWidth={2} />,
    color: '#06FFA5',
  },
};

const DENSITY_RESULTS: Record<string, TestResult> = {
  thin: {
    value: 'thin',
    title: 'Thin Density',
    explanation: "You have lower hair volume. Lightweight products are your best friend — heavy creams will flatten and weigh you down.",
    revealMsg: "Thin density — you'll want lightweight products. Heavy creams will flatten you out. We'll keep it airy.",
    icon: <FloatUpIcon color="#00B4D8" size={40} strokeWidth={2} />,
    color: '#00B4D8',
  },
  medium: {
    value: 'medium',
    title: 'Medium Density',
    explanation: "You have balanced hair volume. You can handle most product types and weights — we'll dial in exactly what works.",
    revealMsg: "Medium density — you're flexible. You can work with most products. We'll find your perfect match.",
    icon: <FloatMiddleIcon color="#F5C542" size={40} strokeWidth={2} />,
    color: '#F5C542',
  },
  thick: {
    value: 'thick',
    title: 'Thick Density',
    explanation: 'You have high hair volume. You can handle heavier products and more intensive treatments — your hair can take it.',
    revealMsg: "Thick density — you can handle the rich stuff. Heavy creams, butters, oils — your hair is ready.",
    icon: <SinkDownIcon color="#FB5607" size={40} strokeWidth={2} />,
    color: '#FB5607',
  },
};

// ── Per-test configuration ─────────────────────────────────────────────

const TEST_CONFIG: Record<TestId, {
  label: string;
  tagline: string;
  question: string;
  description: string;
  supplies: string[];
  testHeading: string;
  testTagline: string;
  auntyId: string;
  progressStep: number;
}> = {
  porosity: {
    label: 'Porosity',
    tagline: 'How your hair drinks',
    question: 'How well does your hair absorb moisture?',
    description: "Drop a clean strand in a glass of room-temperature water and watch where it settles. Porosity is the foundation — it determines what products your hair actually needs.",
    supplies: ['One clean strand of hair', 'A glass of room-temperature water', '2 minutes of patience'],
    testHeading: 'Drop it in',
    testTagline: 'Watch where your strand settles',
    auntyId: '2',
    progressStep: 2,
  },
  elasticity: {
    label: 'Elasticity',
    tagline: 'Your hair\'s strength',
    question: 'How strong is your hair?',
    description: "Take a wet strand and gently stretch it. How it responds tells us about your protein needs — the hidden factor most hair routines miss.",
    supplies: ['One wet strand of hair', 'Gentle hands (no breaking on purpose!)', 'Honest observation'],
    testHeading: 'Stretch it out',
    testTagline: 'What happened when you pulled?',
    auntyId: '4',
    progressStep: 3,
  },
  density: {
    label: 'Density',
    tagline: 'Your hair\'s volume',
    question: 'How much hair do you have?',
    description: "Pull your hair into a low ponytail and compare it to a pencil. Density tells us how much product your hair can absorb without being weighed down.",
    supplies: ['A pencil or pen', 'A mirror', 'Your hair in a low ponytail'],
    testHeading: 'Volume check',
    testTagline: 'Compare your ponytail to a pencil',
    auntyId: '3',
    progressStep: 4,
  },
};

const TEST_ORDER: TestId[] = ['porosity', 'elasticity', 'density'];

// ── Component ──────────────────────────────────────────────────────────

export default function HairTestSuite({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setData } = useOnboarding();

  const [currentTest, setCurrentTest] = useState<TestId>('porosity');
  const [subStep, setSubStep] = useState<SubStep>('intro');
  const [selections, setSelections] = useState<Record<TestId, string | null>>({
    porosity: null,
    elasticity: null,
    density: null,
  });
  const [timer, setTimer] = useState(120);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const config = TEST_CONFIG[currentTest];
  const currentResults =
    currentTest === 'porosity' ? POROSITY_RESULTS :
    currentTest === 'elasticity' ? ELASTICITY_RESULTS :
    DENSITY_RESULTS;
  const selection = selections[currentTest];
  const testResult = selection ? currentResults[selection] : null;

  // Fade transition when test or step changes
  const fadeTransition = useCallback(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim]);

  useEffect(() => {
    fadeTransition();
  }, [subStep, currentTest, fadeTransition]);

  // Timer for porosity countdown
  useEffect(() => {
    if (subStep === 'test' && currentTest === 'porosity' && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [subStep, currentTest, timer]);

  const handleStartTest = () => {
    if (currentTest === 'porosity') setTimer(120);
    setSubStep('test');
  };

  const handleSelect = (option: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelections(prev => ({ ...prev, [currentTest]: option }));
  };

  const handleReveal = () => setSubStep('result');

  const handleNext = () => {
    const nextIndex = TEST_ORDER.indexOf(currentTest) + 1;
    if (nextIndex < TEST_ORDER.length) {
      setCurrentTest(TEST_ORDER[nextIndex]);
      setSubStep('intro');
    } else {
      // All tests done — save all results
      setData({
        porosity: POROSITY_RESULTS[selections.porosity!]?.value as Porosity,
        elasticity: ELASTICITY_RESULTS[selections.elasticity!]?.value as Elasticity,
        density: DENSITY_RESULTS[selections.density!]?.value as Density,
      });
      navigation.navigate('PhotoUpload');
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const canSwitchTo = (test: TestId) => {
    const idx = TEST_ORDER.indexOf(test);
    if (idx === 0) return true;
    return !!selections[TEST_ORDER[idx - 1]];
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={colors.ink} size={22} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar current={config.progressStep} total={14} />
        </View>
      </View>

      {/* Test tabs */}
      <View style={styles.tabs}>
        {TEST_ORDER.map((test, i) => {
          const isActive = currentTest === test;
          const isDone = !!selections[test];
          const isLocked = !canSwitchTo(test);
          return (
            <TouchableOpacity
              key={test}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => {
                if (!isLocked) {
                  setCurrentTest(test);
                  setSubStep(isDone ? 'result' : 'intro');
                }
              }}
              disabled={isLocked}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive, isLocked && styles.tabTextLocked]}>
                {`${i + 1}. ${TEST_CONFIG[test].label}`}
              </Text>
              {isDone && <View style={[styles.tabDot, { backgroundColor: currentResults[selections[test]!]?.color ?? colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: spacing.lg }}>

          {/* ── INTRO ── */}
          {subStep === 'intro' && (
            <>
              <View style={styles.header}>
                <Text style={styles.stepBadge}>Test {TEST_ORDER.indexOf(currentTest) + 1} of 3</Text>
                <Text style={styles.heading}>{config.label} Test</Text>
                <Text style={styles.tagline}>{config.tagline}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardQuestion}>{config.question}</Text>
                <Text style={styles.cardDescription}>{config.description}</Text>
                <View style={styles.suppliesBox}>
                  <Text style={styles.suppliesTitle}>What you'll need</Text>
                  {config.supplies.map((s, i) => (
                    <View key={i} style={styles.supplyRow}>
                      <View style={styles.supplyDot} />
                      <Text style={styles.supplyText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Button label={`I'm ready — let's test ${config.label.toLowerCase()}`} onPress={handleStartTest} />
            </>
          )}

          {/* ── TEST: POROSITY ── */}
          {subStep === 'test' && currentTest === 'porosity' && (
            <>
              <View style={styles.header}>
                <Text style={styles.stepBadge}>Porosity</Text>
                <Text style={styles.heading}>{config.testHeading}</Text>
                <Text style={styles.tagline}>{config.testTagline}</Text>
              </View>

              <View style={[styles.card, styles.timerCard]}>
                <Text style={styles.timerLabel}>Time remaining</Text>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                <Text style={styles.timerHint}>Select an option any time — don't wait for the timer</Text>
              </View>

              <View style={styles.options}>
                {[
                  { key: 'float', label: 'It floated', sub: 'Stayed near the top', icon: <FloatUpIcon color="#00B4D8" size={40} strokeWidth={2} /> },
                  { key: 'middle', label: 'In the middle', sub: 'Suspended midway', icon: <FloatMiddleIcon color="#F5C542" size={40} strokeWidth={2} /> },
                  { key: 'sink', label: 'It sank', sub: 'Dropped to the bottom', icon: <SinkDownIcon color="#FB5607" size={40} strokeWidth={2} /> },
                ].map(opt => {
                  const isSelected = selection === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => handleSelect(opt.key)}
                      activeOpacity={0.75}
                    >
                      {opt.icon}
                      <View style={styles.optionText}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{opt.label}</Text>
                        <Text style={styles.optionSub}>{opt.sub}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selection && <Button label="See my result" onPress={handleReveal} />}
            </>
          )}

          {/* ── TEST: ELASTICITY ── */}
          {subStep === 'test' && currentTest === 'elasticity' && (
            <>
              <View style={styles.header}>
                <Text style={styles.stepBadge}>Elasticity</Text>
                <Text style={styles.heading}>{config.testHeading}</Text>
                <Text style={styles.tagline}>{config.testTagline}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardQuestion}>Stretch a wet strand between two fingers</Text>
                <Text style={styles.cardDescription}>Gently pull it to about twice its length. Don't force it to snap — just observe how it responds.</Text>
              </View>

              <View style={styles.options}>
                {[
                  { key: 'snapped', label: 'It snapped', sub: 'Broke without much stretch', icon: <SinkDownIcon color="#FF006E" size={40} strokeWidth={2} /> },
                  { key: 'bounced', label: 'Stretched & bounced back', sub: 'Returned to original length', icon: <FloatMiddleIcon color="#06FFA5" size={40} strokeWidth={2} /> },
                ].map(opt => {
                  const isSelected = selection === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => handleSelect(opt.key)}
                      activeOpacity={0.75}
                    >
                      {opt.icon}
                      <View style={styles.optionText}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{opt.label}</Text>
                        <Text style={styles.optionSub}>{opt.sub}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selection && <Button label="See my result" onPress={handleReveal} />}
            </>
          )}

          {/* ── TEST: DENSITY ── */}
          {subStep === 'test' && currentTest === 'density' && (
            <>
              <View style={styles.header}>
                <Text style={styles.stepBadge}>Density</Text>
                <Text style={styles.heading}>{config.testHeading}</Text>
                <Text style={styles.tagline}>{config.testTagline}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardQuestion}>Pull your hair into a low ponytail</Text>
                <Text style={styles.cardDescription}>Hold a pencil next to the base of your ponytail. How does the thickness compare?</Text>
              </View>

              <View style={styles.options}>
                {[
                  { key: 'thin', label: 'Thinner than a pencil', sub: 'Finer, less volume', icon: <FloatUpIcon color="#00B4D8" size={40} strokeWidth={2} /> },
                  { key: 'medium', label: 'About pencil thickness', sub: 'Balanced volume', icon: <FloatMiddleIcon color="#F5C542" size={40} strokeWidth={2} /> },
                  { key: 'thick', label: 'Thicker than a pencil', sub: 'Full, dense volume', icon: <SinkDownIcon color="#FB5607" size={40} strokeWidth={2} /> },
                ].map(opt => {
                  const isSelected = selection === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => handleSelect(opt.key)}
                      activeOpacity={0.75}
                    >
                      {opt.icon}
                      <View style={styles.optionText}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{opt.label}</Text>
                        <Text style={styles.optionSub}>{opt.sub}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selection && <Button label="See my result" onPress={handleReveal} />}
            </>
          )}

          {/* ── RESULT ── */}
          {subStep === 'result' && testResult && (
            <>
              <View style={styles.header}>
                <Text style={styles.resultEyebrow}>Your {config.label} Result</Text>
                <Text style={[styles.resultTitle, { color: testResult.color }]}>{testResult.title}</Text>
              </View>

              <View style={[styles.card, styles.resultCard, { borderLeftColor: testResult.color }]}>
                <View style={styles.resultIconWrap}>{testResult.icon}</View>
                <Text style={styles.resultExplanation}>{testResult.explanation}</Text>
              </View>

              <AuntyBubble auntyId={config.auntyId} message={testResult.revealMsg} />

              <Button
                label={currentTest === 'density' ? 'Upload your hair photos' : `Next: ${TEST_CONFIG[TEST_ORDER[TEST_ORDER.indexOf(currentTest) + 1]].label} Test`}
                onPress={handleNext}
              />
            </>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  progressWrap: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.mutedLight,
    fontFamily: fonts.body,
  },
  tabTextActive: { color: colors.ink },
  tabTextLocked: { opacity: 0.35 },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: { gap: spacing.xs },
  stepBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: fonts.body,
  },
  heading: {
    fontSize: fontSize['2xl'] ?? 28,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    fontFamily: fonts.display,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.mutedBase,
    fontFamily: fonts.body,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardQuestion: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    fontFamily: fonts.body,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.mutedBase,
    lineHeight: 21,
    fontFamily: fonts.body,
  },
  suppliesBox: {
    backgroundColor: `${colors.primary}12`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  suppliesTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.xs,
  },
  supplyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  supplyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  supplyText: {
    fontSize: fontSize.xs,
    color: colors.mutedBase,
    fontFamily: fonts.body,
  },
  timerCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  timerLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.mutedBase,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: fonts.body,
  },
  timerText: {
    fontSize: 52,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    fontFamily: fonts.display,
    lineHeight: 60,
  },
  timerHint: {
    fontSize: fontSize.xs,
    color: colors.mutedLight,
    textAlign: 'center',
    fontFamily: fonts.body,
    marginTop: spacing.xs,
  },
  options: { gap: spacing.md },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0C`,
  },
  optionText: { flex: 1, gap: 2 },
  optionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.ink,
    fontFamily: fonts.body,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  optionSub: {
    fontSize: fontSize.xs,
    color: colors.mutedBase,
    fontFamily: fonts.body,
  },
  resultEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.mutedBase,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: fonts.body,
  },
  resultTitle: {
    fontSize: fontSize['2xl'] ?? 28,
    fontWeight: fontWeight.bold,
    fontFamily: fonts.display,
  },
  resultCard: {
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  resultIconWrap: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  resultExplanation: {
    fontSize: fontSize.sm,
    color: colors.mutedBase,
    lineHeight: 21,
    flex: 1,
    fontFamily: fonts.body,
  },
});
