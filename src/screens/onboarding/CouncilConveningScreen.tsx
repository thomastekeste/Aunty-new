import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import { generateCouncilResponses, generateRoutine } from '@/services/gemini';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, spacing, fontSize, fontWeight, fonts, auntyColors } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CouncilConvening'>;
const AUNTY_IDS = ['1', '2', '3', '4', '5', '6', '7'];

const STATUS_MESSAGES = [
  'The council is reviewing your hair...',
  'Each aunty is weighing in...',
  'Building your profile...',
  'Almost ready...',
];

export default function CouncilConveningScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, hairAnalysis, setCouncilResponse, setRoutine } = useOnboarding();
  const [statusIndex, setStatusIndex] = useState(0);
  const [activeAuntyIndex, setActiveAuntyIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Dot animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dotAnim = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );
    dotAnim.start();
    return () => dotAnim.stop();
  }, []);

  // Cycle status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex(i => (i + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Cycle active aunty highlight
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAuntyIndex(i => (i + 1) % AUNTY_IDS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Fire AI calls on mount
  useEffect(() => {
    const run = async () => {
      try {
        const analysis = hairAnalysis ?? { curl_type: '3b', texture_description: '', visible_concerns: [], condition_assessment: '' };
        const fullData = data as any;

        const [council, routine] = await Promise.all([
          generateCouncilResponses(fullData, analysis),
          generateRoutine(fullData, analysis),
        ]);

        setCouncilResponse(council);
        setRoutine(routine);
        navigation.replace('CouncilSpeaks');
      } catch (e: any) {
        setError(e.message ?? 'Connection issue. Try again.');
      }
    };
    run();
  }, []);

  if (error) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSub}>Check your connection and go back to retry.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Aunty row */}
      <View style={styles.councilRow}>
        {AUNTY_IDS.map((id, i) => (
          <View
            key={id}
            style={[
              styles.avatarWrap,
              { marginLeft: i === 0 ? 0 : -12 },
              i === activeAuntyIndex && styles.avatarActive,
            ]}
          >
            <AuntyAvatar auntyId={id} size={52} />
          </View>
        ))}
      </View>

      <Text style={styles.status}>{STATUS_MESSAGES[statusIndex]}</Text>

      {/* Typing dots */}
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
                opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.subtext}>Max 8 seconds. Don't leave.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  councilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 30,
  },
  avatarActive: {
    borderColor: colors.amber,
    transform: [{ scale: 1.1 }],
  },
  status: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.canvas,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 28,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.amber,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.muted,
    textAlign: 'center',
  },
});
