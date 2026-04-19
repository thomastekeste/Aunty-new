import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { AuntyAvatar } from '../AuntyAvatar';
import { PressableScale } from '../PressableScale';
import type { CheckInMood } from '../../types';

interface MoodOption {
  key: CheckInMood;
  label: string;
  emoji: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'great', label: 'Great', emoji: 'Thriving', color: colors.jewel.emerald },
  { key: 'good', label: 'Good', emoji: 'Steady', color: colors.jewel.amber },
  { key: 'okay', label: 'Okay', emoji: 'Meh', color: colors.jewel.indigo },
  { key: 'struggling', label: 'Help', emoji: 'Rough', color: colors.jewel.rose },
];

function CheckIcon({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRightIcon({ color = colors.muted, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface Props {
  auntyId: AuntyId;
  weekNumber: number;
  accentColor: string;
  accentBg: string;
  accentText: string;
}

export function WeeklyCheckInCard({ auntyId, weekNumber, accentColor, accentBg, accentText }: Props) {
  const navigation = useNavigation<any>();
  const aunty = AUNTIES[auntyId] ?? AUNTIES.denise;
  const [savedMood, setSavedMood] = useState<CheckInMood | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`checkin_week_${weekNumber}`);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw);
          if (parsed?.mood) setSavedMood(parsed.mood as CheckInMood);
        }
      } catch (err) {
        if (__DEV__) console.warn('[CheckIn card] load failed', err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weekNumber]);

  const savedOption = useMemo(
    () => (savedMood ? MOOD_OPTIONS.find((m) => m.key === savedMood) : null),
    [savedMood],
  );

  const handlePickMood = (mood: CheckInMood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CheckIn', { mood });
  };

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CheckIn');
  };

  // ─── Already checked in this week ──────────────────────────────
  if (loaded && savedOption) {
    return (
      <PressableScale
        onPress={handleOpen}
        scaleTo={0.985}
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={`Check-in saved as ${savedOption.label}. Open to view.`}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.overline, { color: accentColor }]}>WEEK {weekNumber} CHECK-IN</Text>
            <Text style={styles.title}>You logged in this week</Text>
          </View>
          <View style={[styles.savedBadge, { backgroundColor: savedOption.color }]}>
            <CheckIcon size={14} />
          </View>
        </View>
        <View style={styles.savedRow}>
          <View style={[styles.savedDot, { backgroundColor: savedOption.color }]} />
          <Text style={styles.savedLabel}>
            <Text style={[styles.savedLabelStrong, { color: savedOption.color }]}>{savedOption.label}</Text>
            <Text style={styles.savedLabelMuted}>  ·  {savedOption.emoji}</Text>
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.openText, { color: accentText }]}>View →</Text>
        </View>
      </PressableScale>
    );
  }

  // ─── Not checked in yet — actionable mood picker ───────────────
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.overline, { color: accentColor }]}>WEEK {weekNumber} CHECK-IN</Text>
          <Text style={styles.title}>How's your hair this week?</Text>
        </View>
        <Pressable
          onPress={handleOpen}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Open full check-in"
          style={[styles.openLink, { backgroundColor: accentBg, borderColor: accentColor + '55' }]}
        >
          <Text style={[styles.openLinkText, { color: accentText }]}>Add note</Text>
          <ChevronRightIcon color={accentText} size={14} />
        </Pressable>
      </View>

      <View style={styles.askRow}>
        <AuntyAvatar auntyId={auntyId} size={36} showRing />
        <Text style={styles.askText}>
          <Text style={[styles.askName, { color: accentText }]}>Aunty {aunty.name}</Text>
          <Text style={styles.askMuted}> wants to know — pick the closest:</Text>
        </Text>
      </View>

      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map((m) => (
          <PressableScale
            key={m.key}
            onPress={() => handlePickMood(m.key)}
            scaleTo={0.94}
            haptic="none"
            accessibilityRole="button"
            accessibilityLabel={`Check in as ${m.label}, ${m.emoji}`}
            style={[styles.moodPill, { borderColor: m.color + '40', backgroundColor: m.color + '12' }]}
          >
            <View style={[styles.moodDot, { backgroundColor: m.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.moodLabel, { color: m.color }]}>{m.label}</Text>
              <Text style={styles.moodSub}>{m.emoji}</Text>
            </View>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: -0.3,
    lineHeight: fontSize.lg * 1.2,
  },
  openLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 30,
  },
  openLinkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
  askRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  askText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.4,
  },
  askName: {
    fontFamily: fonts.bodySemiBold,
  },
  askMuted: {
    color: colors.muted,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodPill: {
    width: '47.5%',
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moodLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    letterSpacing: -0.1,
  },
  moodSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  savedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  savedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  savedLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
  savedLabelStrong: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },
  savedLabelMuted: {
    color: colors.muted,
  },
  openText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
});
