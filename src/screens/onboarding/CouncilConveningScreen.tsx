/**
 * CouncilConveningScreen — The dramatic loading/deliberation screen.
 *
 * Dark background with overlapping aunty avatars and cycling status messages.
 * Animated gold dots convey council activity.
 * Makes real API calls while showing the ceremony animation.
 * Falls back to mock data if API is not available.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { AUNTIES, COUNCIL_ORDER } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import type { OnboardingStackParamList, CouncilResponse, WeeklyRitual } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
  gradients,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CouncilConvening'>;

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_DISPLAY_TIME = 4000; // Minimum 4s ceremony feel

// Status messages — specific to what's being built
function getStatusMessages(auntyName: string, profile: any): string[] {
  const ct = profile?.curlType || '3c';
  const por = profile?.porosity || 'normal';
  const goal = profile?.primaryGoal || 'moisture';

  return [
    `Analyzing your ${ct} curl pattern\u2026`,
    `Checking ${por} porosity needs\u2026`,
    `Building your wash day routine\u2026`,
    `Selecting products for ${goal}\u2026`,
    `Mapping your weekly ritual\u2026`,
    `${auntyName} is finalizing your plan\u2026`,
  ];
}

// Progress checklist items
const CHECKLIST_ITEMS = [
  'Hair profile analyzed',
  'Routine mapped',
  'Products matched',
  'Plan ready',
];

// ─── Mock data for offline / no-backend mode ────────────────────
function generateMockCouncilResponse(name: string, profile: Record<string, any>): CouncilResponse {
  const curlLabel = profile.curlType?.startsWith('2') ? 'wavy'
    : profile.curlType?.startsWith('3') ? 'curly' : 'coily';

  return {
    auntyMessages: {
      ngozi: `${name}, your ${curlLabel} hair needs deep moisture. Let Aunty Ngozi handle this, no wahala.`,
      marcia: `Di roots look strong, ${name}. We just need to feed dem proper with castor oil.`,
      denise: `Baby, I've seen this before. We gon' get your routine right. Trust the process.`,
      fatou: `Your technique needs refinement, ch\u00e9rie. Precision is beauty.`,
      carmen: `Ay ${name}! Those curls have so much potential! We're going to make them pop!`,
      amara: `Dear one, we will build strength into every strand. Patience and protein.`,
      salma: `Habibi, when we find balance between moisture and protein, everything flows.`,
    },
    consensus: `${name}, I've reviewed everything. Your hair journey begins with a personalized plan crafted just for you, with love and expertise.`,
    hairProfileSummary: `${curlLabel} hair with ${profile.porosity || 'normal'} porosity`,
    keyFindings: [
      'Your moisture-protein balance needs attention',
      'Scalp health is the foundation for growth',
      'Consistency with gentle techniques will show results',
    ],
  };
}

function generateMockRoutine(): WeeklyRitual {
  return {
    id: 'mock-ritual-1',
    weekNumber: 1,
    theme: 'Foundation Week',
    isActive: true,
    days: [
      {
        dayOfWeek: 0, type: 'wash', label: 'Wash Day', hostAunty: 'ngozi',
        purpose: 'Deep cleanse and moisture reset.',
        estimatedTime: '45 min',
        steps: [
          { name: 'Pre-poo', description: 'Apply coconut oil to dry hair', duration: '5 min' },
          { name: 'Clarify', description: 'Sulfate-free shampoo, focus on scalp', duration: '5 min' },
          { name: 'Deep condition', description: 'Shea butter mask under heat cap', duration: '20 min' },
          { name: 'Rinse & seal', description: 'Cool rinse, LOC method', duration: '10 min' },
        ],
      },
      {
        dayOfWeek: 1, type: 'style', label: 'Style Day', hostAunty: 'carmen',
        purpose: 'Define and set your curls for the week.',
        estimatedTime: '30 min',
        steps: [
          { name: 'Apply styler', description: 'Gel or cream in sections', duration: '10 min' },
          { name: 'Define', description: 'Finger coil or brush styling', duration: '15 min' },
          { name: 'Dry', description: 'Diffuse or air dry', duration: '5 min' },
        ],
      },
      {
        dayOfWeek: 3, type: 'refresh', label: 'Refresh Day', hostAunty: 'fatou',
        purpose: 'Revive your style mid-week.',
        estimatedTime: '15 min',
        steps: [
          { name: 'Mist', description: 'Light water spray', duration: '2 min' },
          { name: 'Re-twist', description: 'Fix edges and frizzy sections', duration: '8 min' },
          { name: 'Seal', description: 'Light oil on ends', duration: '5 min' },
        ],
      },
      {
        dayOfWeek: 5, type: 'rest', label: 'Rest Day', hostAunty: 'salma',
        purpose: 'Let your hair breathe and recover.',
        estimatedTime: '5 min',
        steps: [
          { name: 'Scalp massage', description: 'Gentle circular motions with argan oil', duration: '3 min' },
          { name: 'Refresh edges', description: 'Light mist and smooth', duration: '2 min' },
        ],
      },
    ],
  };
}

function AnimatedDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export default function CouncilConveningScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state, setCouncilResponse, setRoutine } = useOnboarding();
  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const { hairProfile } = state.data;
  const STATUS_MESSAGES = getStatusMessages(aunty.name, hairProfile);
  const [messageIndex, setMessageIndex] = useState(0);
  const [checklistCount, setChecklistCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const apiDone = useRef(false);
  const minTimePassed = useRef(false);

  const tryNavigate = () => {
    if (apiDone.current && minTimePassed.current) {
      navigation.replace('CouncilVerdict');
    }
  };

  const fetchCouncilData = async () => {
    const { name, hairProfile } = state.data;
    const startTime = Date.now();

    try {
      // Step 1: Generate council response
      const councilRes = await fetch(`${API_URL}/api/council/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hairProfile }),
      });

      if (!councilRes.ok) throw new Error(`Council API error: ${councilRes.status}`);
      const councilData: CouncilResponse = await councilRes.json();
      setCouncilResponse(councilData);

      // Step 2: Generate routine
      const routineRes = await fetch(`${API_URL}/api/routine/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hairProfile }),
      });

      if (!routineRes.ok) throw new Error(`Routine API error: ${routineRes.status}`);
      const routineData: WeeklyRitual = await routineRes.json();
      setRoutine(routineData);

      apiDone.current = true;
      tryNavigate();
    } catch (error) {
      console.warn('[CouncilConvening] API call failed, using mock data:', error);

      // Fallback: use mock data
      const mockCouncil = generateMockCouncilResponse(name || 'Love', hairProfile);
      const mockRoutine = generateMockRoutine();
      setCouncilResponse(mockCouncil);
      setRoutine(mockRoutine);

      apiDone.current = true;
      tryNavigate();
    }
  };

  const handleRetry = () => {
    setHasError(false);
    apiDone.current = false;
    minTimePassed.current = false;
    fetchCouncilData();

    // Reset min display timer
    setTimeout(() => {
      minTimePassed.current = true;
      tryNavigate();
    }, MIN_DISPLAY_TIME);
  };

  useEffect(() => {
    // Cycle status messages — slower, more deliberate
    timerRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 2800);

    // Checklist items appear on a schedule
    const checkTimers = CHECKLIST_ITEMS.map((_, i) =>
      setTimeout(() => setChecklistCount(i + 1), 1000 + i * 900)
    );

    // Minimum display time for the ceremony feel
    const minTimer = setTimeout(() => {
      minTimePassed.current = true;
      tryNavigate();
    }, MIN_DISPLAY_TIME);

    // Start API call
    fetchCouncilData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(minTimer);
      checkTimers.forEach(clearTimeout);
    };
  }, [navigation]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      accessibilityLabel={`${aunty.name} is reviewing your hair profile. Please wait.`}
    >
      {/* Single chosen aunty avatar with pulsing glow */}
      <Animated.View
        entering={FadeIn.delay(200).duration(600)}
        style={styles.avatarSingle}
      >
        <View style={[styles.avatarGlow, { backgroundColor: ac.accent }]} />
        <AuntyAvatar auntyId={auntyId} size={100} showRing glowing />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={FadeIn.delay(600).duration(500)}
        style={[styles.title, { color: ac.accent }]}
      >
        {aunty.name} Is Reviewing
      </Animated.Text>

      {/* Animated gold dots */}
      <Animated.View
        entering={FadeIn.delay(900).duration(300)}
        style={styles.dotsRow}
      >
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </Animated.View>

      {/* Cycling status message — crossfade via key */}
      <Animated.Text
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
        style={styles.statusText}
        key={`msg-${messageIndex}`}
      >
        {STATUS_MESSAGES[messageIndex]}
      </Animated.Text>

      {/* Progress checklist */}
      <View style={styles.checklist}>
        {CHECKLIST_ITEMS.map((item, i) =>
          i < checklistCount ? (
            <Animated.View
              key={item}
              entering={FadeIn.duration(300)}
              style={styles.checkItem}
            >
              <Text style={[styles.checkMark, { color: ac.accent }]}>{'\u2713'}</Text>
              <Text style={styles.checkText}>{item}</Text>
            </Animated.View>
          ) : null
        )}
      </View>

      {/* Error / Retry state */}
      {hasError && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.retryContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Pressable
            onPress={handleRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Bottom text */}
      <Animated.Text
        entering={FadeIn.delay(1100).duration(500)}
        style={styles.bottomText}
      >
        {aunty.name}. Your hair. Her expertise.
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(1300).duration(500)}
        style={styles.aiNote}
      >
        Personalized with AI
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  avatarSingle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  avatarGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.primary,
    letterSpacing: letterSpacing.tight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    textAlign: 'center',
    minHeight: 48,
    lineHeight: fontSize.md * 1.5,
  },
  checklist: {
    marginTop: spacing.lg,
    alignItems: 'flex-start',
    alignSelf: 'center',
    minHeight: 80,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkMark: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },
  checkText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
  },
  retryContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  bottomText: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.lg,
    color: colors.dark.text,
    textAlign: 'center',
    position: 'absolute',
    bottom: 80,
    fontStyle: 'italic',
    letterSpacing: letterSpacing.wide,
  },
  aiNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    textAlign: 'center',
    position: 'absolute',
    bottom: 52,
    alignSelf: 'center',
    letterSpacing: letterSpacing.wide,
  },
});
