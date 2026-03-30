import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { checkinService } from '@/services/supabase';
import { useSubscription } from '@/context/SubscriptionContext';
import { Checkin } from '@/types';
import { getAunty } from '@/constants/aunties';
import AuntyAvatar from '@/components/AuntyAvatar';
import Button from '@/components/Button';
import { colors, fonts, spacing, fontSize, fontWeight, radius } from '@/constants/theme';
import { format } from 'date-fns';

export default function ProgressScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    if (user) {
      checkinService.list(user.id).then(setCheckins).catch(console.error);
    }
  }, [user?.id]);

  if (!isActive) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.gateTitle}>Progress check-ins are a paid feature.</Text>
        <Text style={styles.gateSubtitle}>$1.99/month. One aunty will check in every week.</Text>
        <Button label="Unlock check-ins" onPress={() => {}} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Your journey with the aunties.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.checkinPrompt}
          onPress={() => navigation.navigate('CheckinModal', { auntyId: '1', userInitiated: true })}
        >
          <Text style={styles.checkinPromptText}>+ New check-in</Text>
        </TouchableOpacity>

        {checkins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No check-ins yet.</Text>
            <Text style={styles.emptySubtitle}>Your first aunty check-in will happen after week 1.</Text>
          </View>
        ) : (
          checkins.map(checkin => {
            const aunty = getAunty(checkin.hosting_aunty_id);
            return (
              <View key={checkin.id} style={styles.checkinCard}>
                <View style={styles.checkinHeader}>
                  <AuntyAvatar auntyId={checkin.hosting_aunty_id} size={36} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.checkinAunty}>{aunty.name}</Text>
                    <Text style={styles.checkinMeta}>
                      Week {checkin.week_number} · {format(new Date(checkin.created_at), 'MMM d')}
                    </Text>
                  </View>
                </View>

                {checkin.ai_analysis_json && (
                  <View style={styles.analysisBox}>
                    <Text style={styles.analysisText}>{checkin.ai_analysis_json.comparison_notes}</Text>
                    {(checkin.ai_analysis_json.suggested_adjustments ?? []).length > 0 && (
                      <>
                        <Text style={styles.analysisLabel}>Adjustments:</Text>
                        {checkin.ai_analysis_json.suggested_adjustments?.map((a, i) => (
                          <Text key={i} style={styles.adjustmentItem}>• {a}</Text>
                        ))}
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  centered: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  gateTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.ink, textAlign: 'center', marginBottom: spacing.sm, fontFamily: fonts.display },
  gateSubtitle: { fontSize: fontSize.md, color: colors.muted, textAlign: 'center', fontFamily: fonts.body },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.ink, letterSpacing: -0.5, fontFamily: fonts.display },
  subtitle: { fontSize: fontSize.md, color: colors.muted, marginTop: 2, fontFamily: fonts.body },
  content: { padding: spacing.md },
  checkinPrompt: {
    borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.md,
    borderStyle: 'dashed', padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
  },
  checkinPromptText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink, fontFamily: fonts.body },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink, fontFamily: fonts.body },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.muted, textAlign: 'center', marginTop: spacing.sm, fontFamily: fonts.body },
  checkinCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  checkinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  checkinAunty: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink, fontFamily: fonts.body },
  checkinMeta: { fontSize: fontSize.xs, color: colors.muted, fontFamily: fonts.body },
  analysisBox: { backgroundColor: colors.surface, borderRadius: radius.sm, padding: spacing.sm },
  analysisText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20, fontFamily: fonts.body },
  analysisLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', marginTop: spacing.sm, marginBottom: 2, fontFamily: fonts.body },
  adjustmentItem: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, fontFamily: fonts.body },
});
