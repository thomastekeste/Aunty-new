/**
 * LearnScreen — Library.
 *
 * Concise. Search + filter + scannable cards.
 * No masthead ceremony, no cover story, no ornament rules.
 * Just: find what you need, read it.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Linking,
  TextInput,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { PaywallModal } from '../../components/PaywallModal';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  METHOD_ARTICLES,
  PRODUCT_ARTICLES,
  APPROVED_CREATORS,
  COUNCIL_QA,
  LIBRARY_DISPATCHES,
  type Article,
  type Creator,
  type QA,
  type Dispatch,
} from '../../constants/education';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
} from '../../constants/theme';

// ─── Icons ──────────────────────────────────────────────────────

function Icon({ d, size = 16, color = colors.muted, strokeWidth = 2 }: { d: string; size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const LOCK_D = 'M17 11V7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7V11M5 11H19C19.55 11 20 11.45 20 12V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V12C4 11.45 4.45 11 5 11Z';
const SEARCH_D = 'M11 19A8 8 0 1011 3a8 8 0 000 16zM21 21l-4.35-4.35';
const EXTERNAL_D = 'M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11M15 3H21M21 3V9M21 3L10 14';
const CLOSE_D = 'M6 6L18 18M18 6L6 18';

// ─── Filters ────────────────────────────────────────────────────

type Filter = 'all' | 'method' | 'ingredients' | 'creators' | 'qa' | 'reading';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'method', label: 'Method' },
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'creators', label: 'Creators' },
  { key: 'qa', label: 'Q&A' },
  { key: 'reading', label: 'Reading' },
];

// ─── Shared helpers ─────────────────────────────────────────────

function getCreatorUrl(c: Creator): string {
  const h = c.handle.replace('@', '');
  return c.platform === 'instagram'
    ? `https://instagram.com/${h}`
    : c.platform === 'tiktok'
    ? `https://tiktok.com/@${h}`
    : `https://youtube.com/@${h}`;
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

// ─── Section header ─────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

// ─── Article card ───────────────────────────────────────────────

function ArticleCard({
  article,
  onPress,
  index,
}: {
  article: Article;
  onPress: (a: Article) => void;
  index: number;
}) {
  const ac = auntyColors[article.auntyId];
  const aunty = AUNTIES[article.auntyId];

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30).duration(250)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(article);
        }}
        style={({ pressed }) => [styles.articleCard, pressed && { opacity: 0.65 }]}
        accessibilityRole="button"
        accessibilityLabel={`Read: ${article.title}`}
      >
        <View style={[styles.articleBar, { backgroundColor: ac.accent }]} />
        <View style={styles.articleBody}>
          <View style={styles.articleTopRow}>
            <Text style={[styles.articleCategory, { color: ac.accent }]}>
              {article.category === 'method' ? 'METHOD' : 'INGREDIENTS'}
            </Text>
            {article.isPremium && (
              <View style={styles.articleLock}>
                <Icon d={LOCK_D} size={10} color={colors.muted} />
                <Text style={styles.articleLockText}>Members</Text>
              </View>
            )}
          </View>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.articleTeaser} numberOfLines={2}>
            {article.teaser}
          </Text>
          <View style={styles.articleMeta}>
            <Text style={[styles.articleAunty, { color: ac.accent }]}>
              Aunty {aunty.name}
            </Text>
            <Text style={styles.articleDot}>·</Text>
            <Text style={styles.articleTime}>{article.readTime}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Creator row ────────────────────────────────────────────────

function CreatorRow({ creator, index }: { creator: Creator; index: number }) {
  const ac = auntyColors[creator.endorsedBy];
  const aunty = AUNTIES[creator.endorsedBy];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(getCreatorUrl(creator)).catch(() => {});
  }, [creator]);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30).duration(250)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.creatorRow, pressed && { opacity: 0.65 }]}
        accessibilityRole="link"
        accessibilityLabel={`Visit ${creator.name} on ${creator.platform}`}
      >
        <View style={styles.creatorMain}>
          <Text style={styles.creatorName}>{creator.name}</Text>
          <Text style={styles.creatorHandle}>
            {creator.handle} · {PLATFORM_LABEL[creator.platform] ?? creator.platform}
          </Text>
          <Text style={styles.creatorFocus} numberOfLines={1}>
            {creator.focus}
          </Text>
          <Text style={[styles.creatorEndorsed, { color: ac.accent }]}>
            Aunty {aunty.name}&rsquo;s pick · {creator.curlTypes}
          </Text>
        </View>
        <Icon d={EXTERNAL_D} size={14} color={colors.muted} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Q&A accordion ──────────────────────────────────────────────

function QARow({ qa, index }: { qa: QA; index: number }) {
  const [open, setOpen] = useState(false);
  const ac = auntyColors[qa.auntyId];
  const aunty = AUNTIES[qa.auntyId];

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30).duration(250)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen((v) => !v);
        }}
        style={({ pressed }) => [styles.qaRow, pressed && { opacity: 0.75 }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={styles.qaHeader}>
          <Text style={styles.qaQuestion}>{qa.question}</Text>
          <Text style={[styles.qaToggle, { color: open ? ac.accent : colors.muted }]}>
            {open ? '−' : '+'}
          </Text>
        </View>
        {open && (
          <Animated.View entering={FadeIn.duration(180)}>
            <Text style={styles.qaAnswer}>{qa.answer}</Text>
            <Text style={[styles.qaAttrib, { color: ac.accent }]}>
              — Aunty {aunty.name}
            </Text>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Dispatch (external reading) ────────────────────────────────

function DispatchRow({ dispatch, index }: { dispatch: Dispatch; index: number }) {
  const ac = auntyColors[dispatch.endorsedBy];
  const aunty = AUNTIES[dispatch.endorsedBy];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(dispatch.url).catch(() => {});
  }, [dispatch.url]);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30).duration(250)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.dispatchRow, pressed && { opacity: 0.65 }]}
        accessibilityRole="link"
        accessibilityLabel={`Open ${dispatch.title} on ${dispatch.source}`}
      >
        <View style={styles.dispatchMain}>
          <Text style={[styles.dispatchSource, { color: ac.accent }]}>
            {dispatch.source.toUpperCase()} · {dispatch.topic.toUpperCase()}
          </Text>
          <Text style={styles.dispatchTitle} numberOfLines={2}>
            {dispatch.title}
          </Text>
          <Text style={styles.dispatchNote} numberOfLines={2}>
            {dispatch.note}
          </Text>
          <Text style={styles.dispatchMeta}>
            Aunty {aunty.name} · {dispatch.readTime}
          </Text>
        </View>
        <Icon d={EXTERNAL_D} size={14} color={colors.muted} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const { isActive: isSubscribed } = useSubscription();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const ac = auntyColors[auntyId];

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const q = query.trim().toLowerCase();

  // Filter content by query
  const methodList = useMemo(
    () =>
      q
        ? METHOD_ARTICLES.filter(
            (a) =>
              a.title.toLowerCase().includes(q) || a.teaser.toLowerCase().includes(q),
          )
        : METHOD_ARTICLES,
    [q],
  );
  const ingredientsList = useMemo(
    () =>
      q
        ? PRODUCT_ARTICLES.filter(
            (a) =>
              a.title.toLowerCase().includes(q) || a.teaser.toLowerCase().includes(q),
          )
        : PRODUCT_ARTICLES,
    [q],
  );
  const creatorsList = useMemo(
    () =>
      q
        ? APPROVED_CREATORS.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.focus.toLowerCase().includes(q) ||
              c.handle.toLowerCase().includes(q),
          )
        : APPROVED_CREATORS,
    [q],
  );
  const qaList = useMemo(
    () =>
      q
        ? COUNCIL_QA.filter(
            (x) =>
              x.question.toLowerCase().includes(q) || x.answer.toLowerCase().includes(q),
          )
        : COUNCIL_QA,
    [q],
  );
  const dispatchList = useMemo(
    () =>
      q
        ? LIBRARY_DISPATCHES.filter(
            (d) =>
              d.title.toLowerCase().includes(q) ||
              d.source.toLowerCase().includes(q) ||
              d.topic.toLowerCase().includes(q),
          )
        : LIBRARY_DISPATCHES,
    [q],
  );

  const showMethod = filter === 'all' || filter === 'method';
  const showIngredients = filter === 'all' || filter === 'ingredients';
  const showCreators = filter === 'all' || filter === 'creators';
  const showQA = filter === 'all' || filter === 'qa';
  const showReading = filter === 'all' || filter === 'reading';

  const hasAny =
    (showMethod && methodList.length) ||
    (showIngredients && ingredientsList.length) ||
    (showCreators && creatorsList.length) ||
    (showQA && qaList.length) ||
    (showReading && dispatchList.length);

  const handleArticlePress = useCallback(
    (a: Article) => {
      if (a.isPremium && !isSubscribed) setShowPaywall(true);
      else setSelectedArticle(a);
    },
    [isSubscribed],
  );

  // Article detail modal
  const articleModal = selectedArticle
    ? (() => {
        const a = selectedArticle;
        const ac2 = auntyColors[a.auntyId];
        const aAunty = AUNTIES[a.auntyId];
        return (
          <Modal
            visible
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setSelectedArticle(null)}
          >
            <View style={[styles.modalContainer, { paddingTop: insets.top + spacing.sm }]}>
              <View style={styles.modalNav}>
                <Pressable
                  onPress={() => setSelectedArticle(null)}
                  style={styles.modalDoneBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={styles.modalDoneText}>Done</Text>
                </Pressable>
              </View>
              <ScrollView
                contentContainerStyle={[
                  styles.modalContent,
                  { paddingBottom: insets.bottom + 60 },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.modalCategory, { color: ac2.accent }]}>
                  {a.category === 'method' ? 'METHOD' : 'INGREDIENTS'} · {a.readTime}
                </Text>
                <Text style={styles.modalTitle}>{a.title}</Text>
                <Text style={styles.modalTeaser}>{a.teaser}</Text>
                <View style={styles.modalMeta}>
                  <AuntyAvatar auntyId={a.auntyId} size={32} showRing />
                  <View>
                    <Text style={[styles.modalAuntyName, { color: ac2.accent }]}>
                      Aunty {aAunty.name}
                    </Text>
                    <Text style={styles.modalAuntyTitle}>{aAunty.title}</Text>
                  </View>
                </View>
                <Text style={styles.modalBody}>{a.body}</Text>
              </ScrollView>
            </View>
          </Modal>
        );
      })()
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Learn</Text>
          <AuntyAvatar auntyId={auntyId} size={32} showRing glowing />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Icon d={SEARCH_D} size={15} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search articles, creators, questions…"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search library"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Icon d={CLOSE_D} size={14} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          keyboardShouldPersistTaps="handled"
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilter(key);
                }}
                style={[
                  styles.filterPill,
                  active && { backgroundColor: ac.accent, borderColor: ac.accent },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Feed */}
      <ScrollView
        contentContainerStyle={[styles.feed, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!hasAny && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {q ? `No results for "${query}"` : 'Nothing here yet.'}
            </Text>
          </View>
        )}

        {showMethod && methodList.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="The Method" count={methodList.length} />
            {methodList.map((a, i) => (
              <ArticleCard
                key={a.id}
                article={a}
                index={i}
                onPress={handleArticlePress}
              />
            ))}
          </View>
        )}

        {showIngredients && ingredientsList.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Ingredients" count={ingredientsList.length} />
            {ingredientsList.map((a, i) => (
              <ArticleCard
                key={a.id}
                article={a}
                index={i}
                onPress={handleArticlePress}
              />
            ))}
          </View>
        )}

        {showCreators && creatorsList.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Creators" count={creatorsList.length} />
            {creatorsList.map((c, i) => (
              <CreatorRow key={c.id} creator={c} index={i} />
            ))}
          </View>
        )}

        {showQA && qaList.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Q&A" count={qaList.length} />
            {qaList.map((x, i) => (
              <QARow key={x.id} qa={x} index={i} />
            ))}
          </View>
        )}

        {showReading && dispatchList.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Further Reading" count={dispatchList.length} />
            {dispatchList.map((d, i) => (
              <DispatchRow key={d.id} dispatch={d} index={i} />
            ))}
          </View>
        )}

        {/* Premium nudge (unobtrusive, only when relevant) */}
        {!isSubscribed && (filter === 'all' || filter === 'method' || filter === 'ingredients') && (
          <Pressable
            onPress={() => setShowPaywall(true)}
            style={[styles.nudge, { borderColor: ac.accent + '40' }]}
            accessibilityRole="button"
            accessibilityLabel="Unlock members-only articles"
          >
            <Text style={styles.nudgeText}>
              <Text style={{ color: ac.accent, fontFamily: fonts.bodySemiBold }}>
                Members
              </Text>
              {' '}unlock deeper methods and ingredient deep-dives.
            </Text>
            <Text style={[styles.nudgeCta, { color: ac.accent }]}>Unlock →</Text>
          </Pressable>
        )}
      </ScrollView>

      {articleModal}
      {showPaywall && (
        <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.ink,
    letterSpacing: -0.5,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 10,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    padding: 0,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bodySemiBold,
  },

  // Feed
  feed: { paddingTop: spacing.md },
  section: { marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 2,
  },
  sectionCount: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  empty: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: fontSize.sm,
    color: colors.muted,
  },

  // Article card
  articleCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  articleBar: { width: 3, alignSelf: 'stretch' },
  articleBody: { flex: 1, padding: spacing.md },
  articleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  articleCategory: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  articleLock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  articleLockText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.3,
  },
  articleTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.md + 1,
    color: colors.ink,
    letterSpacing: -0.2,
    lineHeight: (fontSize.md + 1) * 1.25,
    marginBottom: 4,
  },
  articleTeaser: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.45,
    marginBottom: spacing.xs + 2,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleAunty: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },
  articleDot: { fontSize: fontSize.sm, color: colors.muted },
  articleTime: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  // Creator
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  creatorMain: { flex: 1 },
  creatorName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  creatorHandle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  creatorFocus: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    marginTop: 4,
  },
  creatorEndorsed: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 4,
  },

  // Q&A
  qaRow: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
  },
  qaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  qaQuestion: {
    flex: 1,
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.sm + 1,
    color: colors.ink,
    lineHeight: (fontSize.sm + 1) * 1.4,
    letterSpacing: -0.1,
  },
  qaToggle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg,
    width: 16,
    textAlign: 'center',
  },
  qaAnswer: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.55,
    marginTop: spacing.sm,
  },
  qaAttrib: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  // Dispatch
  dispatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dispatchMain: { flex: 1 },
  dispatchSource: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  dispatchTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    letterSpacing: -0.2,
    lineHeight: fontSize.md * 1.25,
    marginBottom: 4,
  },
  dispatchNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.45,
    marginBottom: 4,
  },
  dispatchMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  // Nudge
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  nudgeText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.4,
  },
  nudgeCta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: colors.canvas },
  modalNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  modalDoneBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  modalDoneText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  modalContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalCategory: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  modalTeaser: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.inkLight,
    marginBottom: spacing.md,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalAuntyName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.sm,
  },
  modalAuntyTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  modalBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.65,
    color: colors.ink,
  },
});
