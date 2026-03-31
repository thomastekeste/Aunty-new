import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import { AUNTIES } from '@/constants/aunties';
import AuntyBubble from '@/components/AuntyBubble';
import AuntyAvatar from '@/components/AuntyAvatar';
import AuntyAssessmentCard from '@/components/AuntyAssessmentCard';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors, shadows } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CouncilSpeaks'>;
const AUNTY_IDS = ['1', '2', '3', '4', '5', '6', '7'];

function getMarciaFindings(data: ReturnType<typeof useOnboarding>['data']): string[] {
  const findings: string[] = [];
  if (data.wash_frequency) {
    const labels: Record<string, string> = {
      weekly: 'Washes weekly',
      bi_weekly: 'Washes every 2 weeks',
      monthly: 'Washes monthly',
      less_frequent: 'Washes infrequently',
    };
    findings.push(labels[data.wash_frequency] ?? data.wash_frequency);
  }
  if (data.heat_use && data.heat_use !== 'never') {
    const labels: Record<string, string> = {
      rarely: 'Minimal heat use',
      sometimes: 'Occasional heat styling',
      often: 'Frequent heat use',
    };
    findings.push(labels[data.heat_use] ?? data.heat_use);
  } else if (data.heat_use === 'never') {
    findings.push('Heat-free');
  }
  if (data.relaxer_history) {
    const labels: Record<string, string> = {
      never_relaxed: 'Always natural',
      currently_relaxed: 'Currently relaxed',
      transitioning: 'Transitioning to natural',
      big_chopped: 'Recently big chopped',
    };
    findings.push(labels[data.relaxer_history] ?? data.relaxer_history);
  }
  if (data.scalp_concerns && data.scalp_concerns.length > 0 && !data.scalp_concerns.includes('No concerns')) {
    findings.push(`Scalp: ${data.scalp_concerns.slice(0, 2).join(', ')}`);
  }
  return findings;
}

function getNgoziFindings(data: ReturnType<typeof useOnboarding>['data']): string[] {
  const findings: string[] = [];
  if (data.primary_goal) {
    const labels: Record<string, string> = {
      length: 'Goal: Length & growth',
      moisture: 'Goal: Deep moisture',
      definition: 'Goal: Curl definition',
      volume: 'Goal: Volume',
      health: 'Goal: Overall health',
    };
    findings.push(labels[data.primary_goal] ?? data.primary_goal);
  }
  if (data.failed_attempts && data.failed_attempts.length > 0) {
    findings.push(`Struggling with: ${data.failed_attempts.slice(0, 2).join(', ')}`);
  }
  if (data.protective_styling) {
    const labels: Record<string, string> = {
      yes_regularly: 'Regular protective styling',
      sometimes: 'Occasional protective styling',
      never: 'No protective styling',
    };
    findings.push(labels[data.protective_styling] ?? data.protective_styling);
  }
  return findings;
}

function getFatouFindings(data: ReturnType<typeof useOnboarding>['data']): string[] {
  const findings: string[] = [];
  if (data.time_available) {
    const labels: Record<string, string> = {
      under_1h: 'Under 1 hour on wash day',
      '1_2h': '1–2 hours available',
      '3plus_h': '3+ hours for full routine',
    };
    findings.push(labels[data.time_available] ?? data.time_available);
  }
  if (data.porosity) findings.push(`${data.porosity} porosity`);
  if (data.elasticity && data.elasticity !== 'normal') findings.push(`${data.elasticity} elasticity`);
  return findings;
}

function getMarciaMessage(data: ReturnType<typeof useOnboarding>['data']): string {
  const heatNote = data.heat_use === 'often'
    ? "The heat use is something we need to address — but di roots can heal."
    : data.heat_use === 'never'
    ? "Heat-free is di best gift you give your roots."
    : "Keep the heat minimal.";
  const scalpNote = data.scalp_concerns?.includes('No concerns')
    ? "Your scalp is clean — that's a strong foundation."
    : data.scalp_concerns && data.scalp_concerns.length > 0
    ? `The scalp concerns are real but fixable.`
    : "Your scalp health looks manageable.";
  return `${heatNote} ${scalpNote} I've told the others what di roots need. They know.`;
}

function getNgoziMessage(data: ReturnType<typeof useOnboarding>['data']): string {
  const goalNote = data.primary_goal === 'moisture'
    ? "Moisture is your mission — perfect, that's exactly my specialty."
    : data.primary_goal === 'length'
    ? "Length starts with moisture, baby — can't grow what's breaking."
    : `Your goal is ${data.primary_goal}. I have a plan.`;
  const failNote = data.failed_attempts && data.failed_attempts.includes('Dryness')
    ? " Dryness has been your enemy. I know exactly why — and how to fight it."
    : "";
  return `${goalNote}${failNote} Ngozi has the moisture plan ready.`;
}

function getFatouMessage(data: ReturnType<typeof useOnboarding>['data']): string {
  const timeNote = data.time_available === 'under_1h'
    ? "You have limited time — so I built you something that works fast without cutting corners."
    : data.time_available === '3plus_h'
    ? "You have time to do this properly. Ma chérie, the full routine will serve you well."
    : "A 1–2 hour window is honest and workable. I respect that.";
  return `${timeNote} The routine is built around your reality, not a fantasy.`;
}

export default function CouncilSpeaksScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { councilResponse, data } = useOnboarding();
  const [phase, setPhase] = useState<'assessments' | 'voices'>('assessments');
  const [visibleCount, setVisibleCount] = useState(0);
  const [showAssessments, setShowAssessments] = useState(false);

  // Show assessments first, then transition to aunty voices
  useEffect(() => {
    const t = setTimeout(() => setShowAssessments(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'voices') {
      const timers = AUNTY_IDS.map((_, i) =>
        setTimeout(() => setVisibleCount(i + 1), i * 600 + 300)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [phase]);

  const messages = AUNTY_IDS.map(id => councilResponse?.[id]).filter(Boolean) as any[];

  const marciaFindings = getMarciaFindings(data);
  const ngoziFindings = getNgoziFindings(data);
  const fatouFindings = getFatouFindings(data);

  if (phase === 'assessments') {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Before the verdict</Text>
          <Text style={styles.title}>Your phase reports</Text>
          <Text style={styles.subtitle}>Three aunties share what they found.</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {showAssessments && (
            <>
              <Animated.View entering={FadeInDown.duration(500).delay(0)}>
                <AuntyAssessmentCard
                  auntyId="2"
                  title="Marcia's Root Assessment"
                  message={getMarciaMessage(data)}
                  findings={marciaFindings}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(500).delay(300)}>
                <AuntyAssessmentCard
                  auntyId="1"
                  title="Ngozi's Moisture Plan"
                  message={getNgoziMessage(data)}
                  findings={ngoziFindings}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(500).delay(600)}>
                <AuntyAssessmentCard
                  auntyId="4"
                  title="Fatou's Reality Check"
                  message={getFatouMessage(data)}
                  findings={fatouFindings}
                />
              </Animated.View>
            </>
          )}
        </ScrollView>

        <Animated.View
          entering={FadeInDown.duration(400).delay(1100)}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <Button label="Hear from all seven aunties." onPress={() => setPhase('voices')} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>The verdict is in</Text>
        <Text style={styles.title}>The aunties are weighing in.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {messages.slice(0, visibleCount).map((msg) => (
          <AuntyBubble
            key={msg.aunty_id}
            auntyId={msg.aunty_id}
            message={msg.message}
            animated
            delay={0}
          />
        ))}

        {visibleCount >= 7 && councilResponse?.consensus && (
          <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.consensusCard}>
            <View style={styles.consensusGlow} />

            <View style={styles.consensusAvatarRow}>
              {AUNTY_IDS.map((id, i) => (
                <View
                  key={id}
                  style={[
                    styles.consensusAvatar,
                    { marginLeft: i === 0 ? 0 : -10, zIndex: AUNTY_IDS.length - i, borderColor: auntyColors[id].accent },
                  ]}
                >
                  <AuntyAvatar auntyId={id} size={32} />
                </View>
              ))}
            </View>

            <Text style={styles.consensusLabel}>The Collective</Text>
            <View style={styles.consensusRule} />
            <Text style={styles.consensusText}>{String(councilResponse.consensus)}</Text>
            <Text style={styles.signoff}>— All seven aunties</Text>
          </Animated.View>
        )}
      </ScrollView>

      {visibleCount >= 7 && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(800)}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <Button label="See your routine." onPress={() => navigation.navigate('Routine')} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 4,
  },
  content: { padding: spacing.md, gap: spacing.md },

  // Consensus card
  consensusCard: {
    backgroundColor: colors.inkDeep,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    ...shadows.lg,
  },
  consensusGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  consensusAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  consensusAvatar: {
    borderWidth: 2,
    borderRadius: 18,
  },
  consensusLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  consensusRule: {
    width: 32,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  consensusText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.canvas,
    lineHeight: 28,
  },
  signoff: {
    fontFamily: fonts.body,
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: 'rgba(254,249,243,0.4)',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
});
