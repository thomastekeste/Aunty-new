import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { routineService } from '@/services/supabase';
import { AUNTIES, getAunty } from '@/constants/aunties';
import { DailyRoutine } from '@/types';
import AuntyPortrait from '@/components/AuntyPortrait';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, auntyColors, spacing, fontSize, fontWeight, radius, fonts, shadows } from '@/constants/theme';

// Day-based primary aunty — each day of week maps to an aunty
const DAY_AUNTY: Record<number, string> = {
  0: '7', // Sunday — Salma
  1: '1', // Monday — Ngozi
  2: '2', // Tuesday — Marcia
  3: '3', // Wednesday — Denise
  4: '4', // Thursday — Fatou
  5: '5', // Friday — Carmen
  6: '6', // Saturday — Amara
};

// Warm, personal greetings per aunty — feels like she's speaking to the user directly
const PERSONAL_GREETINGS: Record<string, string[]> = {
  '1': [
    "I've been thinking about your curls.",
    "Moisture check — let's see how you're doing.",
    "I know you've been busy. I'm still here.",
  ],
  '2': [
    "Your roots have been on my mind.",
    "How are we feeling from the roots today?",
    "I haven't forgotten about you.",
  ],
  '3': [
    "Chile, I was just thinking about you.",
    "You showed up. That's everything.",
    "We're going to figure this out together.",
  ],
  '4': [
    "I've been waiting to check on your technique.",
    "Patience and presence. That's all we need today.",
    "Come, let's talk about where you are.",
  ],
  '5': [
    "Mija, I've missed you!",
    "Your curls are always on my mind, corazón.",
    "Ready to celebrate those curls today?",
  ],
  '6': [
    "Konjo, your hair has been in my thoughts.",
    "I see the strength you've been building.",
    "Come, let's nurture those roots together.",
  ],
  '7': [
    "Habibti, I've been thinking of you.",
    "Nature's wisdom is ready when you are.",
    "You deserve this time for yourself.",
  ],
};

const MOOD_OPTIONS = [
  { id: 'thriving', label: 'Thriving', color: colors.marcia },
  { id: 'good', label: 'Good', color: colors.ngozi },
  { id: 'okay', label: 'Just okay', color: colors.salma },
  { id: 'tired', label: 'Tired', color: colors.fatou },
  { id: 'frustrated', label: 'Frustrated', color: colors.carmen },
];

const DAY_KEYS = ['wash_day', 'style_day', 'refresh_day', 'rest_day'] as const;

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [routine, setRoutine] = useState<{ routine_json: DailyRoutine } | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [question, setQuestion] = useState('');

  const todayAuntyId = DAY_AUNTY[new Date().getDay()];
  const aunty = getAunty(todayAuntyId);
  const ac = auntyColors[todayAuntyId];
  const firstName = user?.name?.split(' ')[0] ?? 'friend';

  // Pick a greeting that changes by time of day (morning/afternoon/evening)
  const greetingIndex = Math.floor(new Date().getHours() / 8); // 0, 1, or 2
  const personalGreeting = PERSONAL_GREETINGS[todayAuntyId]?.[greetingIndex] ?? PERSONAL_GREETINGS[todayAuntyId]?.[0];

  const todayDayKey = DAY_KEYS[new Date().getDay() % 4];
  const todayRoutine = routine?.routine_json?.[todayDayKey];

  // Entrance animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const greetingAnim = useRef(new Animated.Value(0)).current;
  const moodAnim = useRef(new Animated.Value(0)).current;
  const routineAnim = useRef(new Animated.Value(0)).current;
  const askAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user?.id && !user.id.startsWith('demo-')) {
      routineService.get(user.id).then(setRoutine).catch(console.error);
    }
  }, [user?.id]);

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(heroAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(greetingAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(moodAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(routineAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(askAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  });

  const handleAskQuestion = () => {
    if (question.trim()) {
      navigation.navigate('AuntyConversation', { auntyId: todayAuntyId, initialQuestion: question.trim() });
      setQuestion('');
    } else {
      navigation.navigate('AuntyConversation', { auntyId: todayAuntyId });
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero: Aunty Portrait + Personal Greeting ── */}
        <Animated.View style={[styles.heroWrap, fadeSlide(heroAnim)]}>
          <View style={[styles.hero, { backgroundColor: ac.bgDark }]}>
            {/* Soft ambient glow behind portrait */}
            <View style={[styles.heroGlow, { backgroundColor: ac.accent }]} />

            <View style={styles.heroLeft}>
              <Text style={styles.timeGreeting}>{getTimeGreeting()}</Text>
              <Text style={[styles.heroName, { color: colors.ink }]}>{firstName}.</Text>
              <View style={[styles.heroRule, { backgroundColor: ac.accent }]} />
              <Text style={[styles.heroAuntyName, { color: ac.text }]}>
                {aunty.name} is with you today
              </Text>
            </View>

            <View style={styles.heroPortrait}>
              <View style={[styles.portraitRing, { borderColor: `${ac.accent}50` }]}>
                <AuntyPortrait auntyId={todayAuntyId} size={110} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Personal Greeting Card ── */}
        <Animated.View style={fadeSlide(greetingAnim)}>
          <View style={[styles.greetingCard, { borderLeftColor: ac.accent }]}>
            <Text style={[styles.greetingAuntyName, { color: ac.text }]}>
              {aunty.name.toUpperCase()} · {aunty.title}
            </Text>
            <Text style={styles.greetingText}>"{personalGreeting}"</Text>
            {aunty.greeting && (
              <Text style={[styles.greetingDialect, { color: ac.text }]}>
                {aunty.greeting}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* ── Mood Check ── */}
        <Animated.View style={fadeSlide(moodAnim)}>
          <View style={styles.moodSection}>
            <Text style={styles.moodLabel}>How are you feeling today?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map(mood => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <TouchableOpacity
                      key={mood.id}
                      style={[
                        styles.moodChip,
                        isSelected && { backgroundColor: mood.color, borderColor: mood.color },
                      ]}
                      onPress={() => setSelectedMood(isSelected ? null : mood.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.moodChipText, isSelected && styles.moodChipTextSelected]}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            {selectedMood && (
              <MoodResponse auntyId={todayAuntyId} mood={selectedMood} auntyName={aunty.name} acText={ac.text} />
            )}
          </View>
        </Animated.View>

        {/* ── Today's Routine — warm, not clinical ── */}
        <Animated.View style={fadeSlide(routineAnim)}>
          <View style={styles.routineSection}>
            <View style={styles.routineSectionTop}>
              <View>
                <Text style={styles.sectionEyebrow}>Ready when you are</Text>
                <Text style={styles.routineTitle}>Today's Routine</Text>
              </View>
              {todayRoutine && (
                <View style={[styles.timePill, { backgroundColor: `${ac.accent}15`, borderColor: `${ac.accent}30` }]}>
                  <Text style={[styles.timePillText, { color: ac.text }]}>
                    {todayRoutine.estimated_time_minutes} min
                  </Text>
                </View>
              )}
            </View>

            {todayRoutine ? (
              <>
                <Text style={styles.routineInvite}>
                  {aunty.name} has your {todayRoutine.day_name?.toLowerCase() ?? 'routine'} ready.
                  {todayRoutine.purpose ? ` Today we're focused on ${todayRoutine.purpose?.toLowerCase()}.` : ''}
                </Text>
                <TouchableOpacity
                  style={[styles.routineStartBtn, { backgroundColor: ac.accent }]}
                  onPress={() => navigation.navigate('RoutineTab')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.routineStartText}>Let's do this together</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.routineEmpty}>
                <Text style={styles.routineEmptyText}>
                  Complete your intake so {aunty.name} can build your routine.
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Ask an Aunty ── */}
        <Animated.View style={fadeSlide(askAnim)}>
          <View style={styles.askSection}>
            <View style={styles.askHeader}>
              <View style={styles.askAuntyRow}>
                <AuntyAvatar auntyId={todayAuntyId} size={36} />
                <View>
                  <Text style={styles.askLabel}>Ask {aunty.name} anything</Text>
                  <Text style={styles.askSub}>She's here to help</Text>
                </View>
              </View>
            </View>

            <View style={styles.askInputWrap}>
              <TextInput
                style={styles.askInput}
                placeholder={`What's on your mind about your hair?`}
                placeholderTextColor={colors.mutedLight}
                value={question}
                onChangeText={setQuestion}
                multiline
                numberOfLines={2}
                returnKeyType="send"
                onSubmitEditing={handleAskQuestion}
              />
              <TouchableOpacity
                style={[styles.askSendBtn, { backgroundColor: ac.accent }]}
                onPress={handleAskQuestion}
                activeOpacity={0.8}
              >
                <Text style={styles.askSendText}>Ask</Text>
              </TouchableOpacity>
            </View>

            {/* Quick questions */}
            <View style={styles.quickQRow}>
              {getQuickQuestions(aunty.specialty).map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.quickQChip, { borderColor: `${ac.accent}40` }]}
                  onPress={() => navigation.navigate('AuntyConversation', { auntyId: todayAuntyId, initialQuestion: q })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickQText, { color: ac.text }]} numberOfLines={2}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── Check In with the Council ── */}
        <TouchableOpacity
          style={styles.checkinCard}
          onPress={() => navigation.navigate('CheckinModal', { auntyId: todayAuntyId, userInitiated: true })}
          activeOpacity={0.85}
        >
          <View style={styles.checkinAvatarRow}>
            {['1', '2', '3', '4', '5'].map((id, i) => (
              <View
                key={id}
                style={[styles.checkinAvatar, { marginLeft: i === 0 ? 0 : -10, borderColor: auntyColors[id].accent }]}
              >
                <AuntyAvatar auntyId={id} size={34} />
              </View>
            ))}
          </View>
          <Text style={styles.checkinTitle}>Time for a hair check-in?</Text>
          <Text style={styles.checkinSub}>The aunties want to see where you are. Share a photo or just talk to them.</Text>
          <View style={styles.checkinArrowRow}>
            <Text style={[styles.checkinCTA, { color: ac.accent }]}>Start your check-in</Text>
            <Text style={[styles.checkinArrow, { color: ac.accent }]}> →</Text>
          </View>
        </TouchableOpacity>

        {/* ── Your Journey ── */}
        <TouchableOpacity
          style={styles.journeyCard}
          onPress={() => navigation.navigate('HairJourney')}
          activeOpacity={0.85}
        >
          <Text style={styles.journeyEyebrow}>Your story</Text>
          <Text style={styles.journeyTitle}>Hair Journey</Text>
          <Text style={styles.journeySub}>See how far you've come — the aunties remember everything.</Text>
          <Text style={[styles.journeyCTA, { color: ac.accent }]}>View your journey →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── Mood Response Component ──────────────────────────────────────────────────
function MoodResponse({
  auntyId,
  mood,
  auntyName,
  acText,
}: {
  auntyId: string;
  mood: string;
  auntyName: string;
  acText: string;
}) {
  const responses: Record<string, Record<string, string>> = {
    thriving: {
      '1': "Ahn ahn! That's the energy I like o. Let's build on it.",
      '2': "Yes! When you thrive, your hair thrives. This is the day.",
      '3': "That's what I'm talking about. Let's do something with this energy.",
      '4': "Parfait. When the spirit is high, the technique is sharp.",
      '5': "Mija YES! I feel it too! Your curls are going to be everything today.",
      '6': "Konjo, I knew it. Strong spirit, strong hair. Let's go.",
      '7': "Mashallah, habibti. This energy is a blessing. Let's use it well.",
    },
    good: {
      '1': "Good is enough, baby. Good is where we work. Let's go.",
      '2': "Good roots, good day. We build from here.",
      '3': "Good is good. Consistent and good? That's the dream.",
      '4': "Good is the foundation of great, ma chérie.",
      '5': "Good is beautiful, corazón. Let's make it even better.",
      '6': "Good. Steady. That's how strength is built.",
      '7': "Good is its own kind of grace. We work with what we have.",
    },
    okay: {
      '1': "Okay is honest. I respect that. Let's focus on what you can control — your hair.",
      '2': "It's okay to be okay. Your roots don't need you to be perfect.",
      '3': "Okay is real. I don't need you to pretend.",
      '4': "Okay days require patience. Let's be gentle today.",
      '5': "Okay is okay, mija. Your curls love you anyway.",
      '6': "Okay. I hear you. Let's take it slow and be kind to ourselves.",
      '7': "Okay is honest. There's wisdom in knowing where you are.",
    },
    tired: {
      '1': "Tired? Then we're doing the 10-minute routine today. No shame.",
      '2': "Rest is part of the process. Your roots understand tired.",
      '3': "Tired is real. You still showed up. That's what matters.",
      '4': "Fatigue is not failure, ma chérie. We adapt.",
      '5': "Ay corazón, tired is okay. Let's do what we can and rest.",
      '6': "Tired means you've been giving a lot. Let's restore today.",
      '7': "Habibti, rest is sacred. Even the simplest care counts today.",
    },
    frustrated: {
      '1': "I hear the frustration. Hair is complicated. Let's trace what's happening.",
      '2': "Frustrated? Then we go back to the roots — literally. Tell me everything.",
      '3': "Uh uh, don't let frustration win. We figure this out together, hear me?",
      '4': "Frustration means we haven't found the right technique yet. We will.",
      '5': "Ay mija, I know this feeling. But your curls aren't against you, I promise.",
      '6': "Frustrated is information, konjo. Tell me what's happening.",
      '7': "Sabr, habibti. Patience. Let's understand what the hair is telling us.",
    },
  };

  const response = responses[mood]?.[auntyId] ?? "I hear you. Let's take it one step at a time.";

  return (
    <View style={moodStyles.responseWrap}>
      <Text style={[moodStyles.responseText, { color: acText }]}>{response}</Text>
    </View>
  );
}

const moodStyles = StyleSheet.create({
  responseWrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  responseText: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getQuickQuestions(specialty: string): string[] {
  const base = [
    'Why is my hair so dry?',
    'How do I retain more length?',
    'What should I do on rest days?',
  ];
  if (specialty.toLowerCase().includes('moisture')) {
    return ['Why does my hair feel dry after washing?', 'How often should I deep condition?', 'What is the LOC method?'];
  }
  if (specialty.toLowerCase().includes('scalp')) {
    return ['How do I care for my scalp?', 'What causes scalp itch?', 'How often should I wash?'];
  }
  if (specialty.toLowerCase().includes('curl')) {
    return ['How do I define my curls?', 'Why is my curl pattern uneven?', 'Wash-and-go tips?'];
  }
  if (specialty.toLowerCase().includes('length') || specialty.toLowerCase().includes('retention')) {
    return ['Why am I not retaining length?', 'Best protective styles for growth?', 'How to reduce breakage?'];
  }
  return base;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { padding: spacing.md, gap: spacing.md },

  // Hero
  heroWrap: { borderRadius: radius.lg, overflow: 'hidden', ...shadows.md },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    minHeight: 160,
  },
  heroGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.18,
  },
  heroLeft: { flex: 1, paddingRight: spacing.sm },
  timeGreeting: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: spacing.xs,
  },
  heroName: {
    fontFamily: fonts.display,
    fontSize: 44,
    fontWeight: fontWeight.black,
    letterSpacing: -2,
    lineHeight: 46,
  },
  heroRule: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginVertical: spacing.sm,
  },
  heroAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroPortrait: { alignItems: 'flex-end' },
  portraitRing: {
    borderWidth: 2,
    borderRadius: 60,
    overflow: 'hidden',
  },

  // Greeting card
  greetingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    padding: spacing.md,
    ...shadows.sm,
  },
  greetingAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  greetingText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 26,
  },
  greetingDialect: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
    opacity: 0.7,
  },

  // Mood
  moodSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.sm,
  },
  moodLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  moodScroll: { marginHorizontal: -spacing.md },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  moodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.offWhite,
  },
  moodChipText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  moodChipTextSelected: {
    color: '#fff',
  },

  // Routine
  routineSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.sm,
  },
  routineSectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sectionEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  routineTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  timePill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
  },
  timePillText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
  },
  routineInvite: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  routineStartBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  routineStartText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: '#fff',
    letterSpacing: 0.2,
  },
  routineEmpty: { paddingVertical: spacing.sm },
  routineEmptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 22,
  },

  // Ask an Aunty
  askSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.sm,
  },
  askHeader: { marginBottom: spacing.sm },
  askAuntyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  askLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  askSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  askInputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  askInput: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    lineHeight: 22,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  askSendBtn: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    alignSelf: 'flex-end',
  },
  askSendText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: '#fff',
  },
  quickQRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  quickQChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.offWhite,
    maxWidth: '70%',
  },
  quickQText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: 18,
  },

  // Check-in
  checkinCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  checkinAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkinAvatar: {
    borderWidth: 2,
    borderRadius: 20,
  },
  checkinTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  checkinSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(254,248,236,0.55)',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  checkinArrowRow: { flexDirection: 'row', alignItems: 'center' },
  checkinCTA: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  checkinArrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },

  // Journey
  journeyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.sm,
  },
  journeyEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  journeyTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  journeySub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  journeyCTA: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
});
