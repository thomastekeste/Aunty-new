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
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';
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
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your journey</Text>
          <Text style={styles.title}>Progress</Text>
        </View>

        <View style={styles.gateState}>
          {/* Stacked aunty avatars */}
          <View style={styles.gateAvatarRow}>
            {['1','2','3','4','5'].map((id, i) => (
              <View key={id} style={[styles.gateAvatar, { marginLeft: i === 0 ? 0 : -14, borderColor: auntyColors[id].accent }]}>
                <AuntyAvatar auntyId={id} size={46} />
              </View>
            ))}
          </View>

          <Text style={styles.gateTitle}>The aunties are watching.</Text>
          <Text style={styles.gateSubtitle}>
            Weekly check-ins with photo comparisons, AI hair analysis, and personalized adjustments from the full council.
          </Text>

          <View style={styles.gateFeatures}>
            {[
              { icon: '📸', text: 'Photo progress comparisons' },
              { icon: '🤖', text: 'AI hair health analysis' },
              { icon: '✍️', text: 'Personalized routine adjustments' },
              { icon: '💬', text: 'Direct aunty feedback each week' },
            ].map((f, i) => (
              <View key={i} style={styles.gateFeatureRow}>
                <Text style={styles.gateFeatureIcon}>{f.icon}</Text>
                <Text style={styles.gateFeatureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <Button label="Unlock Premium" onPress={() => {}} style={{ width: '100%' }} />
          <Text style={styles.gatePricing}>$6.99 / month · $49.99 / year</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Your journey</Text>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>The aunties are watching your growth.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* New check-in CTA */}
        <TouchableOpacity
          style={styles.checkinPrompt}
          onPress={() => navigation.navigate('CheckinModal', { auntyId: '1', userInitiated: true })}
          activeOpacity={0.8}
        >
          <View style={styles.checkinPromptLeft}>
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>+</Text>
            </View>
            <View>
              <Text style={styles.checkinPromptTitle}>New check-in</Text>
              <Text style={styles.checkinPromptSub}>Share your progress with the council</Text>
            </View>
          </View>
          <View style={styles.councilMinis}>
            {['1','2','3'].map((id, i) => (
              <View key={id} style={[styles.miniAvatar, { marginLeft: i === 0 ? 0 : -8, borderColor: auntyColors[id].accent }]}>
                <AuntyAvatar auntyId={id} size={24} />
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {checkins.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconRow}>
              {['1','2','3'].map((id, i) => (
                <View key={id} style={[styles.emptyAvatar, { marginLeft: i === 0 ? 0 : -10, borderColor: auntyColors[id].accent, opacity: 0.4 + i * 0.15 }]}>
                  <AuntyAvatar auntyId={id} size={40} />
                </View>
              ))}
            </View>
            <Text style={styles.emptyTitle}>No check-ins yet</Text>
            <Text style={styles.emptySubtitle}>
              Your first aunty check-in will appear here after week 1. They're watching, trust.
            </Text>
          </View>
        ) : (
          checkins.map(checkin => {
            const aunty = getAunty(checkin.hosting_aunty_id);
            const ac = auntyColors[checkin.hosting_aunty_id];
            return (
              <View key={checkin.id} style={[styles.checkinCard, { borderTopColor: ac.accent }]}>
                <View style={styles.checkinHeader}>
                  <View style={[styles.avatarRing, { borderColor: `${ac.accent}60` }]}>
                    <AuntyAvatar auntyId={checkin.hosting_aunty_id} size={40} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={[styles.checkinAunty, { color: ac.text }]}>{aunty.name}</Text>
                    <Text style={styles.checkinMeta}>
                      Week {checkin.week_number} · {format(new Date(checkin.created_at), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  <View style={[styles.weekBadge, { backgroundColor: `${ac.accent}15`, borderColor: `${ac.accent}30` }]}>
                    <Text style={[styles.weekBadgeText, { color: ac.accent }]}>Wk {checkin.week_number}</Text>
                  </View>
                </View>

                {checkin.ai_analysis_json && (
                  <View style={styles.analysisBox}>
                    <Text style={styles.analysisText}>{checkin.ai_analysis_json.comparison_notes}</Text>
                    {(checkin.ai_analysis_json.suggested_adjustments ?? []).length > 0 && (
                      <>
                        <View style={styles.adjustmentDivider} />
                        <Text style={styles.analysisLabel}>Adjustments from {aunty.name}</Text>
                        {checkin.ai_analysis_json.suggested_adjustments?.map((a, i) => (
                          <View key={i} style={styles.adjustmentRow}>
                            <View style={[styles.adjustmentDot, { backgroundColor: ac.accent }]} />
                            <Text style={styles.adjustmentItem}>{a}</Text>
                          </View>
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
    fontSize: 36,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 4,
  },

  // Premium gate
  gateState: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  gateAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gateAvatar: {
    borderWidth: 2.5,
    borderRadius: 27,
    ...shadows.sm,
  },
  gateTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  gateSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  gateFeatures: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    width: '100%',
    gap: spacing.sm,
  },
  gateFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gateFeatureIcon: {
    fontSize: 18,
  },
  gateFeatureText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    fontWeight: fontWeight.medium,
  },
  gatePricing: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  content: { padding: spacing.md, gap: spacing.md },

  // Check-in prompt
  checkinPrompt: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  checkinPromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  plusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontFamily: fonts.body,
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: 'rgba(0,0,0,0.6)',
    lineHeight: 24,
  },
  checkinPromptTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  checkinPromptSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  councilMinis: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    borderWidth: 1.5,
    borderRadius: 15,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyAvatar: {
    borderWidth: 2,
    borderRadius: 24,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Check-in cards
  checkinCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 3,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarRing: {
    borderWidth: 2,
    borderRadius: 24,
    padding: 1,
  },
  checkinAunty: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  checkinMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  weekBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  weekBadgeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  analysisBox: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  analysisText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  adjustmentDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  analysisLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 6,
  },
  adjustmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  adjustmentItem: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
