import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { routineService } from '@/services/supabase';
import { getAunty } from '@/constants/aunties';
import { DailyRoutine } from '@/types';
import AuntyPortrait from '@/components/AuntyPortrait';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';

const DAY_KEYS = ['wash_day', 'style_day', 'refresh_day', 'rest_day'] as const;

// Aunty mid-routine encouragement — said while the user is doing steps
const MID_ROUTINE_ENCOURAGEMENT: Record<string, string[]> = {
  '1': [
    "Take your time with this one, baby. No rush.",
    "Section by section — your hair deserves this attention.",
    "Feel how your curls respond. That's the relationship.",
    "Almost there, sweetheart. Your hair can feel the care.",
  ],
  '2': [
    "Breathe. The roots need your calm too.",
    "Work from the roots up. That's where it all starts.",
    "You're doing beautifully, pickney. Keep going.",
    "Feel how your scalp responds. That's growth happening.",
  ],
  '3': [
    "Don't rush this step, chile. This is the important one.",
    "I built this routine for you specifically. Trust it.",
    "You're showing your hair love right now. That matters.",
    "Half done. And look — your hair is already responding.",
  ],
  '4': [
    "La technique, it matters here. Be precise.",
    "This is the step where most people rush. Don't.",
    "Good. Now the next one — with the same care.",
    "Ma chérie, your patience will show in the results.",
  ],
  '5': [
    "Mija, feel how your curls are loving this!",
    "Look at you, taking care of your hair. I love to see it.",
    "Almost there, corazón. Don't stop now.",
    "Your rizos are responding — I can feel it from here!",
  ],
  '6': [
    "Strong and steady, konjo. Strength is built slowly.",
    "Your roots feel this. Give them the attention they deserve.",
    "Halfway through. You're doing something beautiful.",
    "This is how strong hair is made — moment by moment.",
  ],
  '7': [
    "Habibti, nature rewards patience.",
    "This remedy has been trusted for generations. Trust it.",
    "Feel the warmth. Your hair is soaking in this love.",
    "Almost there. The plants are working for you.",
  ],
};

// Post-routine celebration per aunty
const POST_ROUTINE_CELEBRATION: Record<string, string> = {
  '1': "Ahn ahn! Look at what you just did for yourself. I am SO proud of you, baby.",
  '2': "Yes pickney. Your roots thank you. Your future self thanks you. Now rest.",
  '3': "THAT'S what I'm talking about. You showed up and did the work. Period.",
  '4': "Magnifique, ma chérie. The technique was perfect. Your results will show.",
  '5': "¡Ay mija! You did THAT! Your curls are going to be GLOWING. I just know it.",
  '6': "Konjo. Strong, consistent, dedicated. That's who you are. Your hair knows.",
  '7': "Mashallah, habibti. You trusted the process. Nature never lies.",
};

// Feedback options after routine
const FEEDBACK_OPTIONS = [
  { id: 'loved', label: 'Loved it', color: colors.marcia },
  { id: 'good', label: 'Felt good', color: colors.ngozi },
  { id: 'okay', label: 'Was okay', color: colors.salma },
  { id: 'hard', label: 'Was tough', color: colors.fatou },
];

export default function RoutineDetailScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [activeDay, setActiveDay] = useState<string>('wash_day');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [routineStarted, setRoutineStarted] = useState(false);
  const [routineComplete, setRoutineComplete] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [showMidEncouragement, setShowMidEncouragement] = useState(false);
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      routineService.get(user.id).then(r => {
        if (r) setRoutine(r.routine_json);
      }).catch(console.error);
    }
  }, [user?.id]);

  // Reset when day changes
  useEffect(() => {
    setCompletedSteps(new Set());
    setRoutineStarted(false);
    setRoutineComplete(false);
    setSelectedFeedback(null);
    setShowMidEncouragement(false);
  }, [activeDay]);

  if (!routine) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Preparing your routine...</Text>
      </View>
    );
  }

  const currentDay = routine[activeDay as keyof DailyRoutine] as any;
  if (!currentDay) return null;

  const auntyId = currentDay.hosted_by_aunty_id;
  const aunty = getAunty(auntyId);
  const ac = auntyColors[auntyId];
  const totalSteps = currentDay.steps?.length ?? 0;
  const completedCount = completedSteps.size;
  const allDone = completedCount === totalSteps && totalSteps > 0;
  const halfwayReached = completedCount === Math.ceil(totalSteps / 2) && !showMidEncouragement;

  // Trigger halfway encouragement
  useEffect(() => {
    if (halfwayReached && routineStarted) {
      setShowMidEncouragement(true);
    }
  }, [completedSteps.size]);

  // When all steps done
  useEffect(() => {
    if (allDone && routineStarted && !routineComplete) {
      setRoutineComplete(true);
      Animated.spring(celebrationAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [allDone]);

  const toggleStep = (stepNum: number) => {
    if (!routineStarted) setRoutineStarted(true);
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  };

  const midIndex = Math.ceil(totalSteps / 2);
  const encouragementText = MID_ROUTINE_ENCOURAGEMENT[auntyId]?.[
    Math.floor(Math.random() * (MID_ROUTINE_ENCOURAGEMENT[auntyId]?.length ?? 1))
  ] ?? "You're doing beautifully. Keep going.";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Day selector ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayTabs}
        contentContainerStyle={styles.dayTabsContent}
      >
        {DAY_KEYS.map(key => {
          const day = routine[key] as any;
          if (!day) return null;
          const dayAuntyId = day.hosted_by_aunty_id;
          const dayAc = auntyColors[dayAuntyId];
          const isActive = activeDay === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.dayTab, isActive && { borderBottomColor: dayAc.accent, borderBottomWidth: 3 }]}
              onPress={() => setActiveDay(key)}
              activeOpacity={0.7}
            >
              <AuntyAvatar auntyId={dayAuntyId} size={24} />
              <Text style={[styles.dayTabText, isActive && { color: dayAc.accent, fontWeight: fontWeight.black }]}>
                {day.day_name?.replace(' Day', '') ?? key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Aunty intro for this day ── */}
        <View style={[styles.dayIntro, { backgroundColor: ac.bgDark }]}>
          <View style={styles.dayIntroPortraitWrap}>
            <AuntyPortrait auntyId={auntyId} size={80} />
          </View>
          <View style={styles.dayIntroRight}>
            <Text style={[styles.dayName, { color: ac.text }]}>
              {currentDay.day_name ?? 'Your Routine'}
            </Text>
            <Text style={[styles.dayAuntyLine, { color: ac.text }]}>
              With {aunty.name} · {currentDay.estimated_time_minutes} min
            </Text>
            <Text style={styles.dayPurpose}>{currentDay.purpose}</Text>
          </View>
        </View>

        {/* ── Progress bar ── */}
        {routineStarted && (
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(completedCount / totalSteps) * 100}%`,
                    backgroundColor: ac.accent,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: ac.text }]}>
              {completedCount} of {totalSteps} steps
            </Text>
          </View>
        )}

        {/* ── Opening aunty message ── */}
        {!routineStarted && (
          <View style={[styles.openingCard, { borderLeftColor: ac.accent }]}>
            <Text style={[styles.openingAuntyName, { color: ac.text }]}>{aunty.name} says:</Text>
            <Text style={styles.openingMessage}>
              {getOpeningMessage(auntyId, currentDay.day_name ?? '')}
            </Text>
          </View>
        )}

        {/* ── Steps ── */}
        {(currentDay.steps ?? []).map((step: any, idx: number) => {
          const isDone = completedSteps.has(step.step_number);
          const isNext = !isDone && completedCount === idx;
          const showMid = showMidEncouragement && idx === midIndex;

          return (
            <React.Fragment key={step.step_number}>
              {/* Mid-routine encouragement bubble */}
              {showMid && (
                <View style={[styles.midCard, { backgroundColor: ac.bgDark, borderColor: `${ac.accent}30` }]}>
                  <View style={styles.midAvatarWrap}>
                    <AuntyAvatar auntyId={auntyId} size={32} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.midAuntyName, { color: ac.text }]}>{aunty.name}</Text>
                    <Text style={styles.midText}>{encouragementText}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.stepCard,
                  isDone && { opacity: 0.6, backgroundColor: colors.offWhite },
                  isNext && { borderColor: ac.accent, borderWidth: 2 },
                ]}
                onPress={() => toggleStep(step.step_number)}
                activeOpacity={0.8}
              >
                {/* Step number / check */}
                <View
                  style={[
                    styles.stepCircle,
                    { backgroundColor: isDone ? ac.accent : isNext ? ac.accent : colors.borderLight },
                  ]}
                >
                  {isDone ? (
                    <Text style={styles.stepCheckmark}>✓</Text>
                  ) : (
                    <Text style={[styles.stepNum, { color: isNext ? '#fff' : colors.muted }]}>
                      {step.step_number}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepName, isDone && { textDecorationLine: 'line-through', color: colors.muted }]}>
                    {step.name}
                  </Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                  {step.duration_minutes && (
                    <Text style={[styles.stepDuration, { color: ac.accent }]}>
                      {step.duration_minutes} min
                    </Text>
                  )}
                </View>

                {/* Tap cue for next step */}
                {isNext && !isDone && (
                  <View style={[styles.tapHint, { backgroundColor: ac.accent }]}>
                    <Text style={styles.tapHintText}>Tap done</Text>
                  </View>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}

        {/* ── Post-routine celebration ── */}
        {routineComplete && (
          <Animated.View
            style={[
              styles.celebrationCard,
              { borderTopColor: ac.accent },
              {
                opacity: celebrationAnim,
                transform: [{ scale: celebrationAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
              },
            ]}
          >
            <View style={styles.celebrationPortrait}>
              <AuntyPortrait auntyId={auntyId} size={72} />
            </View>
            <Text style={[styles.celebrationAuntyName, { color: ac.text }]}>{aunty.name}</Text>
            <Text style={styles.celebrationText}>
              {POST_ROUTINE_CELEBRATION[auntyId] ?? "You did it. I'm proud of you."}
            </Text>

            {/* Feedback */}
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>How did today's routine feel?</Text>
              <View style={styles.feedbackRow}>
                {FEEDBACK_OPTIONS.map(opt => {
                  const isSelected = selectedFeedback === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.feedbackChip,
                        isSelected && { backgroundColor: opt.color, borderColor: opt.color },
                      ]}
                      onPress={() => setSelectedFeedback(opt.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.feedbackChipText, isSelected && { color: '#fff' }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {selectedFeedback && (
                <Text style={[styles.feedbackThanks, { color: ac.text }]}>
                  {getFeedbackResponse(auntyId, selectedFeedback)}
                </Text>
              )}
            </View>

            {/* Aunty's closing thought */}
            <View style={[styles.closingNote, { backgroundColor: ac.bg }]}>
              <Text style={[styles.closingNoteText, { color: ac.text }]}>
                {getClosingThought(auntyId)}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getOpeningMessage(auntyId: string, dayName: string): string {
  const messages: Record<string, string> = {
    '1': `Ready to give your hair what it needs? This is ${dayName} — I built every step for your specific hair. Let's go, baby.`,
    '2': `${dayName} is about your roots today. I need you to be present. Pay attention to how your scalp feels at each step.`,
    '3': `Chile, this ${dayName} routine? I put thought into every single step. Don't skip anything. Trust the process.`,
    '4': `${dayName}, ma chérie. Every step has a purpose. Every product has a reason. Follow the method, and your hair will reward you.`,
    '5': `Mija, this ${dayName} is going to feel SO good! Your curls are ready. Let's do this together, okay?`,
    '6': `${dayName} is about strength today, konjo. Slow, intentional, powerful. Let's build from the inside out.`,
    '7': `${dayName}, habibti. Nature's remedies take time. Be patient with each step. Your hair will remember this care.`,
  };
  return messages[auntyId] ?? `Your ${dayName} is ready. Let's take it one step at a time.`;
}

function getFeedbackResponse(auntyId: string, feedback: string): string {
  const responses: Record<string, Record<string, string>> = {
    loved: {
      '1': "That's what I need to hear! We're keeping this routine.",
      '2': "Yes pickney. When it feels good, it's working. We build on this.",
      '3': "That's what I like to hear. Don't change a thing.",
      '4': "Parfait. When you love the routine, you stick to it. That's everything.",
      '5': "¡Sí mija! That feeling? That's your hair happy!",
      '6': "Strong routines feel good. Your hair knows.",
      '7': "Mashallah. The remedies are speaking to you.",
    },
    good: {
      '1': "Good is progress, baby. Next week we'll make it even better.",
      '2': "Good is growth. Keep going.",
      '3': "Good means it's working. Consistent good beats occasional great.",
      '4': "Good. Now we refine. That's how technique improves.",
      '5': "Good is beautiful! We'll tweak a little next week.",
      '6': "Good is the foundation. We build from here.",
      '7': "Good. The remedies are settling in.",
    },
    okay: {
      '1': "Okay tells me something needs adjusting. Talk to me — what felt off?",
      '2': "Okay is honest. Tell me what didn't sit right.",
      '3': "Okay means we need to look at something. What felt off, chile?",
      '4': "Okay is useful feedback. We investigate.",
      '5': "Okay is still showing up, mija. But let's see what we can change.",
      '6': "Okay. Let's understand why. Tell me more.",
      '7': "Okay. The remedies may need adjusting. Let's talk.",
    },
    hard: {
      '1': "Too hard? Then we simplify. I'll never give you a routine you can't keep.",
      '2': "Hard means we reassess. Your routine should feel sustainable, not impossible.",
      '3': "Too tough? We fix that. Your routine should work for your life.",
      '4': "If it's too difficult, we modify the technique. Hair care shouldn't feel like battle.",
      '5': "Ay, that's too much! Let's cut it down. Your curls don't need you to suffer.",
      '6': "Hard routines don't last. We simplify — strength is sustainable, not painful.",
      '7': "If it's hard, we adapt. Nature doesn't ask us to suffer.",
    },
  };
  return (
    responses[feedback]?.[auntyId] ??
    "Thank you for telling me. I'll use this to make next week better."
  );
}

function getClosingThought(auntyId: string): string {
  const thoughts: Record<string, string> = {
    '1': "You just invested in yourself. That's not nothing. That's everything.",
    '2': "Roots need time, patience, and consistency. You gave all three today.",
    '3': "You showed up for your hair. And your hair will show up for you.",
    '4': "La technique s'améliore avec la pratique. You're getting better.",
    '5': "Your curls are a gift, mija. And today you treated them like one.",
    '6': "Strong hair. Strong spirit. They're the same thing, konjo.",
    '7': "Nature gave us these remedies for a reason. Today you honored that.",
  };
  return thoughts[auntyId] ?? "You're investing in yourself. That matters more than you know.";
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.muted, fontSize: fontSize.md, fontFamily: fonts.body },

  // Day tabs
  dayTabs: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
    flexGrow: 0,
  },
  dayTabsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  dayTabText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  content: { padding: spacing.md, gap: spacing.md },

  // Day intro
  dayIntro: {
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  dayIntroPortraitWrap: {
    borderRadius: 44,
    overflow: 'hidden',
  },
  dayIntroRight: { flex: 1 },
  dayName: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  dayAuntyLine: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  dayPurpose: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Progress
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    minWidth: 70,
    textAlign: 'right',
  },

  // Opening card
  openingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    padding: spacing.md,
    ...shadows.sm,
  },
  openingAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  openingMessage: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 22,
  },

  // Steps
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    ...shadows.sm,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  stepNum: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
  stepCheckmark: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: '#fff',
  },
  stepName: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepDuration: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginTop: 4,
  },
  tapHint: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  tapHintText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Mid encouragement
  midCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  midAvatarWrap: { flexShrink: 0 },
  midAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  midText: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 22,
  },

  // Celebration
  celebrationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderTopWidth: 4,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.md,
  },
  celebrationPortrait: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  celebrationAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  celebrationText: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 28,
    textAlign: 'center',
  },

  // Feedback
  feedbackSection: { width: '100%', gap: spacing.sm },
  feedbackLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  feedbackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  feedbackChip: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.offWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  feedbackChipText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  feedbackThanks: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Closing note
  closingNote: {
    width: '100%',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  closingNoteText: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
});
