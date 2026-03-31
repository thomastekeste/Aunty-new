import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { routineService } from '@/services/supabase';
import { getAunty } from '@/constants/aunties';
import { DailyRoutine } from '@/types';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';
import { ChevronUpIcon, ChevronDownIcon } from '@/components/Icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DAY_KEYS = ['wash_day', 'style_day', 'refresh_day', 'rest_day'] as const;

export default function RoutineDetailScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [expanded, setExpanded] = useState<string | null>('wash_day');

  useEffect(() => {
    if (user) {
      routineService.get(user.id).then(r => {
        if (r) setRoutine(r.routine_json);
      }).catch(console.error);
    }
  }, [user?.id]);

  if (!routine) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>Your routine is loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Weekly schedule</Text>
        <Text style={styles.title}>Your Routine</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {DAY_KEYS.map(key => {
          const day = routine[key];
          if (!day) return null;
          const aunty = getAunty(day.hosted_by_aunty_id);
          const isExpanded = expanded === key;
          const ac = auntyColors[day.hosted_by_aunty_id];

          return (
            <View key={key} style={[styles.dayCard, { borderTopColor: ac.accent }]}>
              <TouchableOpacity
                style={styles.dayHeader}
                onPress={() => {
                  LayoutAnimation.configureNext({
                    duration: 280,
                    create: { type: 'easeInEaseOut', property: 'opacity' },
                    update: { type: 'spring', springDamping: 0.7 },
                    delete: { type: 'easeInEaseOut', property: 'opacity' },
                  });
                  setExpanded(isExpanded ? null : key);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.avatarRing, { borderColor: `${ac.accent}60` }]}>
                  <AuntyAvatar auntyId={day.hosted_by_aunty_id} size={42} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.dayName}>{day.day_name}</Text>
                  <Text style={[styles.dayMeta, { color: ac.accent }]}>
                    {aunty.name} · {day.estimated_time_minutes} min
                  </Text>
                </View>
                <View style={[styles.chevronWrap, { borderColor: `${ac.accent}40` }]}>
                  {isExpanded
                    ? <ChevronUpIcon color={ac.accent} size={16} strokeWidth={2} />
                    : <ChevronDownIcon color={ac.accent} size={16} strokeWidth={2} />
                  }
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <>
                  <Text style={[styles.dayPurpose, { borderTopColor: `${ac.accent}20` }]}>
                    {day.purpose}
                  </Text>
                  {day.steps.map(step => (
                    <View key={step.step_number} style={styles.stepRow}>
                      <View style={[styles.stepCircle, { backgroundColor: ac.accent }]}>
                        <Text style={styles.stepNum}>{step.step_number}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stepName}>{step.name}</Text>
                        <Text style={styles.stepDesc}>{step.description}</Text>
                        {step.duration_minutes && (
                          <View style={styles.durationBadge}>
                            <Text style={[styles.durationText, { color: ac.accent }]}>
                              {step.duration_minutes} min
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  centered: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.muted, fontSize: fontSize.md, fontFamily: fonts.body },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  content: { padding: spacing.md, gap: spacing.sm },
  dayCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 3,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  avatarRing: {
    borderWidth: 2,
    borderRadius: 25,
    padding: 1,
  },
  dayName: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  dayMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPurpose: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.offWhite,
    borderTopWidth: 1,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNum: {
    color: colors.canvas,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    fontFamily: fonts.body,
  },
  stepName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  stepDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  durationBadge: {
    marginTop: 4,
  },
  durationText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
