/**
 * CheckInScreen -- Weekly hair check-in modal.
 *
 * Dark background, aunty avatar, mood selection, optional notes.
 * Saves to AsyncStorage and shows aunty response on success.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { AppStackParamList, CheckInMood } from '../../types';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { Button } from '../../components/Button';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';

type Mood = CheckInMood;

interface MoodOption {
  key: Mood;
  label: string;
  description: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'great', label: 'Great', description: 'Hair is thriving!', color: colors.jewel.emerald },
  { key: 'good', label: 'Good', description: 'Feeling positive', color: colors.jewel.amber },
  { key: 'okay', label: 'Okay', description: 'Doing alright', color: colors.jewel.indigo },
  { key: 'struggling', label: 'Struggling', description: 'Need some help', color: colors.jewel.rose },
];

function getAuntyResponse(aunty: typeof AUNTIES[AuntyId], mood: Mood): string {
  switch (mood) {
    case 'great':
      return aunty.win;
    case 'good':
      return `That is what I like to hear. Keep doing what you are doing. ${aunty.ingredient} will keep you on track.`;
    case 'okay':
      return `We all have those weeks. ${aunty.quote} Stay the course.`;
    case 'struggling':
      return aunty.fail;
  }
}

function getWeekNumber(onboardingDate?: string): number {
  const now = new Date();
  const start = onboardingDate ? new Date(onboardingDate) : now;
  const diff = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AppStackParamList, 'CheckIn'>>();
  const initialMood = route.params?.mood ?? null;
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [selectedMood, setSelectedMood] = useState<Mood | null>(initialMood);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [auntyResponse, setAuntyResponse] = useState('');
  const [onboardingDate, setOnboardingDate] = useState<string | undefined>();

  useEffect(() => {
    AsyncStorage.getItem('onboarding_completed_at').then((d) => {
      if (d) setOnboardingDate(d);
    }).catch(() => {});
  }, []);

  const weekNumber = getWeekNumber(onboardingDate);

  const handleSelectMood = useCallback((mood: Mood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedMood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const checkin = {
      mood: selectedMood,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
      auntyId,
    };

    try {
      await AsyncStorage.setItem(`checkin_week_${weekNumber}`, JSON.stringify(checkin));
    } catch {
      // Best effort save
    }

    setAuntyResponse(getAuntyResponse(aunty, selectedMood));
    setSubmitted(true);
  }, [selectedMood, notes, weekNumber, auntyId, aunty]);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.successContent}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.successAvatar}>
            <AuntyAvatar auntyId={auntyId} size={72} showRing glowing />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.successTitle}>
            Check-in Saved
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.successWeek}>
            Week {weekNumber}
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.responseBubble, { borderLeftColor: ac.accent, backgroundColor: ac.bgDark }]}>
            <Text style={[styles.responseAuntyName, { color: ac.accent }]}>{aunty.name}</Text>
            <Text style={styles.aiDisclosure}>AI-powered response</Text>
            <Text style={styles.responseText}>{auntyResponse}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.doneWrap}>
            <Button label="Done" onPress={handleDone} variant="primary" size="lg" />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.closeText}>X</Text>
        </Pressable>
        <Text style={styles.topTitle}>Weekly Check-in</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Aunty avatar + question */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.questionSection}>
        <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
        <Text style={styles.questionText}>How's your hair this week?</Text>
        <Text style={styles.questionSub}>{aunty.name} wants to know</Text>
      </Animated.View>

      {/* Mood options as tappable cards */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.moodGrid}>
        {MOOD_OPTIONS.map((opt) => {
          const isSelected = selectedMood === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => handleSelectMood(opt.key)}
              style={[
                styles.moodCard,
                isSelected && { borderColor: opt.color, backgroundColor: opt.color + '20' },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${opt.label} - ${opt.description}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.moodLabel, isSelected && { color: opt.color }]}>{opt.label}</Text>
              <Text style={[styles.moodDesc, isSelected && { color: colors.dark.text }]}>{opt.description}</Text>
            </Pressable>
          );
        })}
      </Animated.View>

      {/* Optional notes */}
      <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.notesSection}>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything else to share? (optional)"
          placeholderTextColor={colors.dark.textMuted}
          multiline
          maxLength={300}
          accessibilityLabel="Additional notes about your hair this week"
        />
      </Animated.View>

      {/* Submit */}
      <View style={styles.submitWrap}>
        <Button
          label="Submit Check-in"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          disabled={!selectedMood}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.dark.text,
  },
  topTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.dark.text,
    letterSpacing: letterSpacing.wide,
  },
  questionSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  questionText: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.dark.text,
    letterSpacing: letterSpacing.tight,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  questionSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    marginTop: spacing.xs,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  moodCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surfaceLight,
    padding: spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  moodLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.dark.textMuted,
    marginBottom: spacing.xs,
  },
  moodDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
  },
  notesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  notesInput: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.dark.text,
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: 'auto',
  },

  // Success state
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successAvatar: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    letterSpacing: letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  successWeek: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.xl,
  },
  responseBubble: {
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  responseAuntyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    marginBottom: spacing.xs,
  },
  aiDisclosure: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  responseText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.dark.text,
    lineHeight: fontSize.base * 1.5,
  },
  doneWrap: {
    width: '100%',
  },
});
