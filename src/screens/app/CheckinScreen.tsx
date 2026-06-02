/**
 * CheckInScreen — Weekly hair check-in modal.
 *
 * Dark background, aunty avatar, mood selection, optional photo + notes.
 * Saves to AsyncStorage with full history tracking.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { PhotoAnalysisCard } from '../../components/PhotoAnalysisCard';
import { analyzePhoto } from '../../services/api';
import type { PhotoAnalysis, ProductScope, BrandTier } from '../../types';
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
import { PRODUCTS } from '../../constants/products';
import { buildRoutine } from '../../utils/recommendation';

type Mood = 'great' | 'good' | 'okay' | 'struggling';

interface MoodOption {
  key: Mood;
  emoji: string;
  label: string;
  description: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'great', emoji: '✨', label: 'Great', description: 'Hair is thriving!', color: colors.jewel.emerald },
  { key: 'good', emoji: '🌱', label: 'Good', description: 'Feeling positive', color: colors.jewel.amber },
  { key: 'okay', emoji: '🌤', label: 'Okay', description: 'Doing alright', color: colors.jewel.indigo },
  { key: 'struggling', emoji: '🌧', label: 'Struggling', description: 'Need some help', color: colors.jewel.rose },
];

const FOLLOW_UP_PROMPTS: Record<Mood, string> = {
  great: 'What worked well this week?',
  good: 'Any wins worth noting?',
  okay: 'What would make next week better?',
  struggling: 'What are you dealing with?',
};

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

async function getCheckinStreak(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem('checkin_history');
    if (!raw) return 0;
    const history: { timestamp: string }[] = JSON.parse(raw);
    if (history.length === 0) return 0;

    let streak = 1;
    const sorted = history
      .map((c) => new Date(c.timestamp))
      .sort((a, b) => b.getTime() - a.getTime());

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const daysDiff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 8) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  } catch {
    return 0;
  }
}

// ─── Camera Icon SVG ────────────────────────────────────────────

function CameraIcon({ color }: { color: string }) {
  return (
    <Text style={{ fontSize: 24, color }}>📷</Text>
  );
}

// ─── Main Screen ────────────────────────────────────────────────

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [auntyResponse, setAuntyResponse] = useState('');
  const [onboardingDate, setOnboardingDate] = useState<string | undefined>();
  const [streak, setStreak] = useState(0);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [productsUsed, setProductsUsed] = useState<string[]>([]);

  // Products to offer for "used this week" — the recommended routine, else all.
  const profile = state.data.hairProfile;
  const checkinProducts = useMemo(() => {
    const routine = buildRoutine(
      (profile.productScope as ProductScope) || 'routine',
      (profile.brandTier as BrandTier) || 'mix',
      profile.productBudgetTotal,
      profile,
    ).map((item) => item.product);
    return routine.length > 0 ? routine : PRODUCTS;
  }, [profile]);

  const toggleProductUsed = useCallback((name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProductsUsed((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_completed_at')
      .then((d) => { if (d) setOnboardingDate(d); })
      .catch(() => {});

    getCheckinStreak().then(setStreak);
  }, []);

  const weekNumber = getWeekNumber(onboardingDate);

  useEffect(() => {
    AsyncStorage.getItem(`checkin_week_${weekNumber}`)
      .then((val) => { if (val) setAlreadyCheckedIn(true); })
      .catch(() => {});
  }, [weekNumber]);

  // Auto-analyze photo when one is picked
  useEffect(() => {
    if (!photoUri) {
      setPhotoAnalysis(null);
      setAnalysisError(null);
      return;
    }
    let cancelled = false;
    const analyze = async () => {
      setIsAnalyzing(true);
      setAnalysisError(null);
      try {
        const result = await analyzePhoto(photoUri);
        if (!cancelled) setPhotoAnalysis(result.analysis);
      } catch (err) {
        if (!cancelled) {
          setAnalysisError('Could not analyze photo. You can still submit your check-in.');
          console.warn('[CheckIn] Photo analysis failed:', err);
        }
      } finally {
        if (!cancelled) setIsAnalyzing(false);
      }
    };
    analyze();
    return () => { cancelled = true; };
  }, [photoUri]);

  const handleSelectMood = useCallback((mood: Mood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
  }, []);

  const handlePickPhoto = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to add a hair photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera access to take a hair photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedMood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const checkin = {
      mood: selectedMood,
      notes: notes.trim(),
      photoUri,
      healthScore: healthScore ?? undefined,
      productsUsed,
      timestamp: new Date().toISOString(),
      auntyId,
      weekNumber,
    };

    try {
      await AsyncStorage.setItem(`checkin_week_${weekNumber}`, JSON.stringify(checkin));

      const raw = await AsyncStorage.getItem('checkin_history');
      const history = raw ? JSON.parse(raw) : [];
      history.push(checkin);
      await AsyncStorage.setItem('checkin_history', JSON.stringify(history));
    } catch {
      // Best effort
    }

    setAuntyResponse(getAuntyResponse(aunty, selectedMood));
    setStreak((s) => s + 1);
    setSubmitted(true);
  }, [selectedMood, notes, photoUri, healthScore, productsUsed, weekNumber, auntyId, aunty]);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  // ─── Success State ──────────────────────────────────

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
        <ScrollView contentContainerStyle={styles.successContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.successAvatar}>
            <AuntyAvatar auntyId={auntyId} size={72} showRing glowing />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.successTitle}>
            Check-in Saved
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.successWeek}>
            Week {weekNumber}
          </Animated.Text>

          {streak > 1 && (
            <Animated.View entering={FadeInDown.delay(170).duration(400)} style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}-week streak</Text>
            </Animated.View>
          )}

          {photoUri && (
            <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.successPhotoWrap}>
              <Image source={{ uri: photoUri }} style={styles.successPhoto} />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.responseBubble, { borderLeftColor: ac.accent, backgroundColor: ac.bgDark }]}>
            <Text style={[styles.responseAuntyName, { color: ac.accent }]}>{aunty.name}</Text>
            <Text style={styles.aiDisclosure}>AI-powered response</Text>
            <Text style={styles.responseText}>{auntyResponse}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.doneWrap}>
            <Button label="Done" onPress={handleDone} variant="primary" size="lg" />
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ─── Input State ────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.topTitle}>Weekly Check-in</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Already checked in notice */}
        {alreadyCheckedIn && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.alreadyNotice}>
            <Text style={styles.alreadyText}>You already checked in this week — updating will replace it</Text>
          </Animated.View>
        )}

        {/* Aunty avatar + question */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.questionSection}>
          <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
          <Text style={styles.questionText}>How&apos;s your hair this week?</Text>
          <Text style={styles.questionSub}>Week {weekNumber} · {aunty.name} wants to know</Text>
        </Animated.View>

        {/* Mood options */}
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
                <Text style={styles.moodEmoji}>{opt.emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && { color: opt.color }]}>{opt.label}</Text>
                <Text style={[styles.moodDesc, isSelected && { color: colors.dark.text }]}>{opt.description}</Text>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* Hair health score */}
        <Animated.View entering={FadeInDown.delay(140).duration(300)} style={styles.healthSection}>
          <Text style={styles.sectionLabel}>How does your hair feel overall this week?</Text>
          <View style={styles.healthRow}>
            {Array.from({ length: 10 }).map((_, i) => {
              const value = i + 1;
              const isSelected = healthScore === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setHealthScore(value); }}
                  style={[styles.healthPill, isSelected && styles.healthPillActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Health score ${value} out of 10`}
                >
                  <Text style={[styles.healthPillText, isSelected && styles.healthPillTextActive]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Products used this week */}
        <Animated.View entering={FadeInDown.delay(170).duration(300)} style={styles.productsSection}>
          <Text style={styles.sectionLabel}>Which products did you use this week?</Text>
          <View style={styles.productsWrap}>
            {checkinProducts.map((p) => {
              const isSelected = productsUsed.includes(p.name);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => toggleProductUsed(p.name)}
                  style={[styles.productPill, isSelected && styles.productPillActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${p.brand} ${p.name}`}
                >
                  <Text style={[styles.productPillText, isSelected && styles.productPillTextActive]} numberOfLines={1}>
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Photo section */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.photoSection}>
          <Text style={styles.photoLabel}>Add a hair photo</Text>
          <Text style={styles.photoSub}>Track your progress week to week</Text>
          {photoUri ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <Pressable
                onPress={() => setPhotoUri(null)}
                style={styles.photoRemove}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
              >
                <Text style={styles.photoRemoveText}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <Pressable onPress={handleTakePhoto} style={styles.photoBtn}>
                <Text style={styles.photoBtnIcon}>📷</Text>
                <Text style={styles.photoBtnText}>Camera</Text>
              </Pressable>
              <Pressable onPress={handlePickPhoto} style={styles.photoBtn}>
                <Text style={styles.photoBtnIcon}>🖼</Text>
                <Text style={styles.photoBtnText}>Gallery</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* Photo analysis results */}
        {isAnalyzing && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.analyzingWrap}>
            <ActivityIndicator color={ac.accent} size="small" />
            <Text style={styles.analyzingText}>Aunty is examining your hair...</Text>
          </Animated.View>
        )}
        {analysisError && !isAnalyzing && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.analysisErrorWrap}>
            <Text style={styles.analysisErrorText}>{analysisError}</Text>
          </Animated.View>
        )}
        {photoAnalysis && !isAnalyzing && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <PhotoAnalysisCard analysis={photoAnalysis} auntyId={auntyId} compact />
          </Animated.View>
        )}

        {/* Notes with dynamic prompt */}
        <Animated.View entering={FadeInDown.delay(250).duration(300)} style={styles.notesSection}>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder={selectedMood ? FOLLOW_UP_PROMPTS[selectedMood] : 'Anything to share? (optional)'}
            placeholderTextColor={colors.dark.textMuted}
            multiline
            maxLength={300}
            accessibilityLabel="Additional notes about your hair this week"
          />
          <Text style={styles.charCount}>{notes.length}/300</Text>
        </Animated.View>
      </ScrollView>

      {/* Submit pinned to bottom */}
      <View style={styles.submitWrap}>
        <Button
          label={alreadyCheckedIn ? 'Update Check-in' : 'Submit Check-in'}
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
    marginBottom: spacing.md,
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

  alreadyNotice: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.jewel.amber + '20',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  alreadyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.jewel.amber,
    textAlign: 'center',
  },

  questionSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  moodEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    marginBottom: 2,
  },
  moodDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
  },

  // Health score
  healthSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  healthRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  healthPill: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  healthPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
  },
  healthPillTextActive: {
    color: '#fff',
  },

  // Products used
  productsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  productsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  productPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surfaceLight,
    maxWidth: '100%',
  },
  productPillActive: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  },
  productPillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
  },
  productPillTextActive: {
    color: colors.dark.text,
  },

  // Photo
  photoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  photoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.text,
    marginBottom: 2,
  },
  photoSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    marginBottom: spacing.sm,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingVertical: spacing.md,
  },
  photoBtnIcon: {
    fontSize: 18,
  },
  photoBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.dark.text,
  },
  photoPreviewWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    color: '#fff',
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },

  // Analysis states
  analyzingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  analyzingText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
  },
  analysisErrorWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.jewel.rose + '15',
    borderRadius: radius.md,
  },
  analysisErrorText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.jewel.rose,
  },

  // Notes
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
  charCount: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },

  submitWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  // Success state
  successContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    flexGrow: 1,
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
    marginBottom: spacing.md,
  },
  streakBadge: {
    backgroundColor: colors.jewel.amber + '25',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  streakText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.jewel.amber,
  },
  successPhotoWrap: {
    width: 100,
    height: 100,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  successPhoto: {
    width: '100%',
    height: '100%',
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
