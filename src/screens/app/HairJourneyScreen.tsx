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
import { checkinService } from '@/services/supabase';
import { getAunty } from '@/constants/aunties';
import { Checkin } from '@/types';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';
import { format, formatDistanceToNow } from 'date-fns';

// Timeline event types
type TimelineEvent =
  | { type: 'checkin'; data: Checkin; date: Date }
  | { type: 'milestone'; label: string; note: string; date: Date; auntyId: string }
  | { type: 'start'; date: Date };

// Milestone messages the aunties drop at key journey points
const MILESTONE_NOTES: Array<{ weekThreshold: number; auntyId: string; label: string; note: string }> = [
  {
    weekThreshold: 1,
    auntyId: '3',
    label: 'You started your journey',
    note: "Chile, you walked in here and said 'I want better for my hair.' That took courage. I remember this day.",
  },
  {
    weekThreshold: 4,
    auntyId: '2',
    label: 'One month in',
    note: "Four weeks of showing up for your hair. Di roots feel the difference, even if you can't see it yet. Trust the process.",
  },
  {
    weekThreshold: 8,
    auntyId: '1',
    label: 'Two months strong',
    note: "Eight weeks, baby. Do you remember where you started? Look at where you are now. I'm proud of you.",
  },
  {
    weekThreshold: 16,
    auntyId: '6',
    label: 'Four months of consistency',
    note: "Four months, konjo. That's not a trend — that's a habit. Your hair knows it. Your roots know it.",
  },
  {
    weekThreshold: 26,
    auntyId: '7',
    label: 'Half a year of care',
    note: "Six months, habibti. Half a year of choosing your hair. Mashallah — you have built something real.",
  },
  {
    weekThreshold: 52,
    auntyId: '5',
    label: 'One full year!',
    note: "¡Un año, mija! One whole year of loving your curls. I cannot express how proud this makes me. Look at YOU.",
  },
];

export default function HairJourneyScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      checkinService.list(user.id)
        .then(setCheckins)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'friend';

  // Build timeline events
  const timelineEvents: TimelineEvent[] = [];

  // Add start event
  if (user?.created_at) {
    timelineEvents.push({
      type: 'start',
      date: new Date(user.created_at),
    });
  }

  // Add milestones based on time since start
  if (user?.created_at) {
    const startDate = new Date(user.created_at);
    const weeksSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    MILESTONE_NOTES.forEach(m => {
      if (weeksSinceStart >= m.weekThreshold) {
        const milestoneDate = new Date(startDate.getTime() + m.weekThreshold * 7 * 24 * 60 * 60 * 1000);
        timelineEvents.push({
          type: 'milestone',
          label: m.label,
          note: m.note,
          date: milestoneDate,
          auntyId: m.auntyId,
        });
      }
    });
  }

  // Add check-ins
  checkins.forEach(c => {
    timelineEvents.push({
      type: 'checkin',
      data: c,
      date: new Date(c.created_at),
    });
  });

  // Sort by date (newest first)
  timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerEyebrow}>{firstName}'s story</Text>
          <Text style={styles.headerTitle}>Hair Journey</Text>
          <Text style={styles.headerSub}>
            {checkins.length > 0
              ? `${checkins.length} check-in${checkins.length > 1 ? 's' : ''} · The aunties remember everything`
              : 'Your story is just beginning'}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>Loading your journey...</Text>
          </View>
        ) : timelineEvents.length === 0 ? (
          <EmptyJourney firstName={firstName} navigation={navigation} />
        ) : (
          <>
            {/* Timeline summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                {getSummaryText(user?.created_at, checkins.length, firstName)}
              </Text>
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              {timelineEvents.map((event, idx) => (
                <TimelineItem
                  key={`${event.type}-${event.date.getTime()}-${idx}`}
                  event={event}
                  isLast={idx === timelineEvents.length - 1}
                  navigation={navigation}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Timeline Item ─────────────────────────────────────────────────────────────
function TimelineItem({
  event,
  isLast,
  navigation,
}: {
  event: TimelineEvent;
  isLast: boolean;
  navigation: any;
}) {
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enterAnim, {
      toValue: 1,
      friction: 9,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }, []);

  if (event.type === 'start') {
    return (
      <Animated.View
        style={[
          styles.timelineRow,
          { opacity: enterAnim, transform: [{ translateX: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] },
        ]}
      >
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineDot, styles.timelineDotStart]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        <View style={[styles.startCard]}>
          <Text style={styles.startLabel}>Your journey began</Text>
          <Text style={styles.startDate}>{format(event.date, 'MMMM d, yyyy')}</Text>
          <Text style={styles.startNote}>
            The council was assembled. Your personalized routine was built. Everything since has been yours.
          </Text>
        </View>
      </Animated.View>
    );
  }

  if (event.type === 'milestone') {
    const ac = auntyColors[event.auntyId];
    return (
      <Animated.View
        style={[
          styles.timelineRow,
          { opacity: enterAnim, transform: [{ translateX: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] },
        ]}
      >
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineDot, { backgroundColor: ac.accent }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        <View style={[styles.milestoneCard, { borderLeftColor: ac.accent }]}>
          <View style={styles.milestoneHeader}>
            <AuntyAvatar auntyId={event.auntyId} size={28} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.milestoneLabelText, { color: ac.text }]}>{event.label}</Text>
              <Text style={styles.milestoneDate}>{format(event.date, 'MMM d, yyyy')}</Text>
            </View>
          </View>
          <Text style={styles.milestoneNote}>"{event.note}"</Text>
        </View>
      </Animated.View>
    );
  }

  if (event.type === 'checkin') {
    const checkin = event.data;
    const aunty = getAunty(checkin.hosting_aunty_id);
    const ac = auntyColors[checkin.hosting_aunty_id];
    const hasAnalysis = checkin.ai_analysis_json;
    const progressDetected = hasAnalysis?.progress_detected;

    return (
      <Animated.View
        style={[
          styles.timelineRow,
          { opacity: enterAnim, transform: [{ translateX: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] },
        ]}
      >
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineDot, { backgroundColor: ac.accent, opacity: 0.7 }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        <View style={styles.checkinCard}>
          {/* Card header */}
          <View style={styles.checkinCardHeader}>
            <AuntyAvatar auntyId={checkin.hosting_aunty_id} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.checkinAuntyName, { color: ac.text }]}>{aunty.name}</Text>
              <Text style={styles.checkinDate}>
                {formatDistanceToNow(event.date, { addSuffix: true })} · Week {checkin.week_number}
              </Text>
            </View>
            {progressDetected !== undefined && (
              <View style={[styles.progressBadge, { backgroundColor: progressDetected ? `${colors.success}20` : `${colors.borderLight}` }]}>
                <Text style={[styles.progressBadgeText, { color: progressDetected ? colors.success : colors.muted }]}>
                  {progressDetected ? 'Progress!' : 'Keep going'}
                </Text>
              </View>
            )}
          </View>

          {/* User's note */}
          {checkin.progress_notes && (
            <View style={styles.checkinNoteWrap}>
              <Text style={styles.checkinNoteLabel}>You said:</Text>
              <Text style={styles.checkinNote} numberOfLines={3}>{checkin.progress_notes}</Text>
            </View>
          )}

          {/* Aunty's response */}
          {hasAnalysis?.comparison_notes && (
            <View style={[styles.checkinAuntyResponse, { borderLeftColor: ac.accent }]}>
              <Text style={styles.checkinAuntyResponseText} numberOfLines={3}>
                "{hasAnalysis.comparison_notes}"
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  return null;
}

// ── Empty Journey ─────────────────────────────────────────────────────────────
function EmptyJourney({ firstName, navigation }: { firstName: string; navigation: any }) {
  return (
    <View style={styles.emptyWrap}>
      {/* Aunty avatars stacked */}
      <View style={styles.emptyAuntiesRow}>
        {['1', '2', '3', '4', '5'].map((id, i) => (
          <View
            key={id}
            style={[styles.emptyAuntyAvatar, { marginLeft: i === 0 ? 0 : -12, borderColor: auntyColors[id].accent }]}
          >
            <AuntyAvatar auntyId={id} size={44} />
          </View>
        ))}
      </View>

      <Text style={styles.emptyTitle}>Your journey starts here</Text>
      <Text style={styles.emptyBody}>
        {firstName}, the aunties are ready to walk this road with you. Your first check-in becomes the first chapter of your story. Every session, every photo, every win — it all lives here.
      </Text>

      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('CheckinModal', { auntyId: '1', userInitiated: true })}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyBtnText}>Start your first check-in</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getSummaryText(createdAt: string | undefined, checkinCount: number, firstName: string): string {
  if (!createdAt) return `${firstName}'s hair journey is underway.`;
  const weeks = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7));
  if (weeks < 1) return `${firstName}, you just started. This is where your story begins.`;
  if (weeks === 1) return `One week in. The aunties have been watching.`;
  if (checkinCount === 0) return `${weeks} weeks of your routine. Your first check-in will mark the beginning of this timeline.`;
  return `${weeks} weeks · ${checkinCount} check-in${checkinCount > 1 ? 's' : ''} · The aunties remember every moment.`;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
  backBtn: { marginBottom: spacing.sm },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.muted,
  },
  headerText: {},
  headerEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 4,
  },

  content: { padding: spacing.md, gap: spacing.md },

  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  loadingText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted },

  // Summary card
  summaryCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryText: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Timeline
  timeline: { gap: 0 },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    paddingTop: 4,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  timelineDotStart: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.borderLight,
    marginTop: spacing.xs,
    marginBottom: 0,
    minHeight: spacing.md,
  },

  // Start card
  startCard: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  startLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: 'rgba(254,248,236,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  startDate: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -0.3,
  },
  startNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(254,248,236,0.6)',
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  // Milestone card
  milestoneCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  milestoneLabelText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
  milestoneDate: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  milestoneNote: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 22,
  },

  // Check-in card
  checkinCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  checkinCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  checkinAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
  checkinDate: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  progressBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  progressBadgeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkinPhotoWrap: {
    backgroundColor: colors.offWhite,
  },
  checkinPhoto: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  checkinNoteWrap: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  checkinNoteLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.muted,
    marginBottom: 4,
  },
  checkinNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checkinAuntyResponse: {
    margin: spacing.md,
    marginTop: 0,
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
  },
  checkinAuntyResponseText: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 22,
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyAuntiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyAuntyAvatar: {
    borderWidth: 2,
    borderRadius: 25,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 26,
  },
  emptyBtn: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  emptyBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.canvas,
  },
});
