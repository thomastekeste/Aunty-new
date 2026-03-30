import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { routineService } from '@/services/supabase';
import { getAunty } from '@/constants/aunties';
import { DailyRoutine } from '@/types';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import { ChevronUpIcon, ChevronDownIcon } from '@/components/Icons';

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

          return (
            <View key={key} style={styles.dayCard}>
              <TouchableOpacity
                style={styles.dayHeader}
                onPress={() => setExpanded(isExpanded ? null : key)}
              >
                <AuntyAvatar auntyId={day.hosted_by_aunty_id} size={40} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.dayName}>{day.day_name}</Text>
                  <Text style={styles.dayMeta}>{aunty.name} · ~{day.estimated_time_minutes} min</Text>
                </View>
                {isExpanded
                  ? <ChevronUpIcon color={colors.muted} size={18} strokeWidth={1.8} />
                  : <ChevronDownIcon color={colors.muted} size={18} strokeWidth={1.8} />
                }
              </TouchableOpacity>

              {isExpanded && (
                <>
                  <Text style={styles.dayPurpose}>{day.purpose}</Text>
                  {day.steps.map(step => (
                    <View key={step.step_number} style={styles.stepRow}>
                      <View style={styles.stepCircle}>
                        <Text style={styles.stepNum}>{step.step_number}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stepName}>{step.name}</Text>
                        <Text style={styles.stepDesc}>{step.description}</Text>
                        {step.duration_minutes && (
                          <Text style={styles.stepMeta}>{step.duration_minutes} min</Text>
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
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.ink, letterSpacing: -0.5, fontFamily: fonts.display },
  content: { padding: spacing.md },
  dayCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
  dayHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.canvas },
  dayName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink, fontFamily: fonts.body },
  dayMeta: { fontSize: fontSize.xs, color: colors.muted, marginTop: 2, fontFamily: fonts.body },
  chevron: { fontSize: 16, color: colors.muted },
  dayPurpose: { fontSize: fontSize.sm, color: colors.textSecondary, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, fontFamily: fonts.body },
  stepRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNum: { color: colors.canvas, fontSize: 11, fontWeight: fontWeight.bold, fontFamily: fonts.body },
  stepName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.ink, fontFamily: fonts.body },
  stepDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginTop: 2, fontFamily: fonts.body },
  stepMeta: { fontSize: fontSize.xs, color: colors.muted, marginTop: 4, fontFamily: fonts.body },
});
