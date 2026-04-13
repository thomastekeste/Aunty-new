/**
 * LearnScreen — The Council Teaches.
 *
 * Home view: featured article hero, 4 category cards (2×2), quick Q&A.
 * Category view: full content list for selected category.
 * Progressive disclosure — curated home, drill into sections.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  METHOD_ARTICLES,
  PRODUCT_ARTICLES,
  APPROVED_CREATORS,
  COUNCIL_QA,
  type ContentCategory,
  type Article,
  type Creator,
  type QA,
} from '../../constants/education';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  gradients,
  letterSpacing,
} from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = spacing.sm;
const CARD_W = (SCREEN_WIDTH - spacing.lg * 2 - GRID_GAP) / 2;
const CREATOR_CARD_W = 220;

// ─── SVG Icons ──────────────────────────────────────────────────

function BookIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 4C2 4 5 2 12 2C19 2 22 4 22 4V20C22 20 19 18 12 18C5 18 2 20 2 20V4Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2V18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function FlaskIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 3H15M10 3V10L4 19C3.5 19.8 4.1 21 5 21H19C19.9 21 20.5 19.8 20 19L14 10V3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UsersIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth={2} />
      <Path d="M23 21V19C23 17.1362 21.7252 15.5701 20 15.126" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 3.12602C17.7252 3.57006 19 5.13616 19 7C19 8.86384 17.7252 10.4299 16 10.874" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HelpIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth={2} />
      <Path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V14" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 18H12.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11M5 11H19C19.5523 11 20 11.4477 20 12V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V12C4 11.4477 4.44772 11 5 11Z" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronLeft({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const label = platform === 'youtube' ? 'YT' : platform === 'instagram' ? 'IG' : 'TT';
  const bg = platform === 'youtube' ? '#FF0000' : platform === 'instagram' ? '#E1306C' : '#000000';
  return (
    <View style={[styles.platformBadge, { backgroundColor: bg }]}>
      <Text style={styles.platformText}>{label}</Text>
    </View>
  );
}

// ─── Category Grid Card ─────────────────────────────────────────

const CATEGORY_CONFIG: Record<ContentCategory, {
  label: string;
  description: string;
  icon: (color: string) => React.ReactNode;
  count: number;
}> = {
  method: {
    label: 'The Method',
    description: 'Hair science foundations',
    icon: (c) => <BookIcon color={c} />,
    count: METHOD_ARTICLES.length,
  },
  products: {
    label: 'Product School',
    description: 'Ingredient intelligence',
    icon: (c) => <FlaskIcon color={c} />,
    count: PRODUCT_ARTICLES.length,
  },
  people: {
    label: 'Approved People',
    description: 'Creators we trust',
    icon: (c) => <UsersIcon color={c} />,
    count: APPROVED_CREATORS.length,
  },
  qa: {
    label: 'Ask the Council',
    description: 'Common questions answered',
    icon: (c) => <HelpIcon color={c} />,
    count: COUNCIL_QA.length,
  },
};

function CategoryCard({
  category,
  accentColor,
  index,
  onPress,
}: {
  category: ContentCategory;
  accentColor: string;
  index: number;
  onPress: () => void;
}) {
  const config = CATEGORY_CONFIG[category];
  return (
    <Animated.View entering={FadeInUp.delay(100 + index * 50).duration(350)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={styles.categoryCard}
        accessibilityRole="button"
        accessibilityLabel={`${config.label}: ${config.count} items`}
      >
        <View style={[styles.categoryIconWrap, { backgroundColor: accentColor + '15' }]}>
          {config.icon(accentColor)}
        </View>
        <Text style={styles.categoryLabel}>{config.label}</Text>
        <Text style={styles.categoryDesc}>{config.description}</Text>
        <View style={styles.categoryFooter}>
          <Text style={[styles.categoryCount, { color: accentColor }]}>{config.count} articles</Text>
          <Text style={[styles.categoryArrow, { color: accentColor }]}>{'\u2192'}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Featured Hero Card ─────────────────────────────────────────

function FeaturedCard({ article, auntyId }: { article: Article; auntyId: AuntyId }) {
  const ac = auntyColors[article.auntyId];
  const aunty = AUNTIES[article.auntyId];

  return (
    <Animated.View entering={FadeIn.delay(100).duration(500)}>
      <LinearGradient
        colors={[ac.accent + '18', ac.accent + '08']}
        style={styles.featuredCard}
      >
        <View style={styles.featuredBadge}>
          <View style={[styles.featuredDot, { backgroundColor: ac.accent }]} />
          <Text style={[styles.featuredBadgeText, { color: ac.accent }]}>
            FEATURED
          </Text>
        </View>
        <Text style={styles.featuredTitle}>{article.title}</Text>
        <Text style={styles.featuredTeaser}>{article.teaser}</Text>
        <View style={styles.featuredMeta}>
          <AuntyAvatar auntyId={article.auntyId} size={28} showRing />
          <View>
            <Text style={[styles.featuredAunty, { color: ac.accent }]}>{aunty.name}</Text>
            <Text style={styles.featuredTime}>{article.readTime} read</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Article Card (compact for lists) ───────────────────────────

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const ac = auntyColors[article.auntyId];
  const aunty = AUNTIES[article.auntyId];

  return (
    <Animated.View entering={FadeInDown.delay(50 + index * 40).duration(350)}>
      <View style={[styles.articleCard, { borderLeftColor: ac.accent }]}>
        <View style={styles.articleTop}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          {article.isPremium && <LockIcon />}
        </View>
        <Text style={styles.articleTeaser} numberOfLines={2}>{article.teaser}</Text>
        <View style={styles.articleMeta}>
          <AuntyAvatar auntyId={article.auntyId} size={22} />
          <Text style={[styles.articleAunty, { color: ac.accent }]}>{aunty.name}</Text>
          <View style={styles.dot} />
          <Text style={styles.articleTime}>{article.readTime}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Creator Card ───────────────────────────────────────────────

function CreatorCard({ creator, index }: { creator: Creator; index: number }) {
  const ac = auntyColors[creator.endorsedBy];
  const aunty = AUNTIES[creator.endorsedBy];

  return (
    <Animated.View entering={FadeInDown.delay(50 + index * 40).duration(350)}>
      <View style={[styles.creatorCard, { borderTopColor: ac.accent }]}>
        <View style={styles.creatorHeader}>
          <PlatformBadge platform={creator.platform} />
          <Text style={styles.creatorCurlTypes}>{creator.curlTypes}</Text>
        </View>
        <Text style={styles.creatorName}>{creator.name}</Text>
        <Text style={styles.creatorHandle}>{creator.handle}</Text>
        <Text style={styles.creatorFocus} numberOfLines={2}>{creator.focus}</Text>
        <View style={styles.creatorEndorsed}>
          <AuntyAvatar auntyId={creator.endorsedBy} size={20} />
          <Text style={[styles.creatorEndorsedText, { color: ac.accent }]}>{aunty.name} approved</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── QA Card ────────────────────────────────────────────────────

function QACard({ qa, index }: { qa: QA; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ac = auntyColors[qa.auntyId];
  const aunty = AUNTIES[qa.auntyId];

  return (
    <Animated.View entering={FadeInDown.delay(50 + index * 40).duration(350)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
        style={styles.qaCard}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.qaHeader}>
          <AuntyAvatar auntyId={qa.auntyId} size={24} />
          <Text style={styles.qaQuestion}>{qa.question}</Text>
          <Text style={styles.qaChevron}>{expanded ? '\u2212' : '\u002B'}</Text>
        </View>
        {expanded && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.qaBody}>
            <Text style={styles.qaAnswer}>{qa.answer}</Text>
            <Text style={[styles.qaAunty, { color: ac.accent }]}>
              {'\u2014 '} Aunty {aunty.name}
            </Text>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Section Header with optional back ──────────────────────────

function SectionHeader({
  overline,
  title,
  count,
  onBack,
}: {
  overline: string;
  title: string;
  count?: number;
  onBack?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      {onBack && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to all categories"
        >
          <ChevronLeft color={colors.ink} />
          <Text style={styles.backText}>All</Text>
        </Pressable>
      )}
      <Text style={styles.sectionOverline}>{overline}</Text>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && (
          <View style={styles.sectionCountBadge}>
            <Text style={styles.sectionCountText}>{count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Quick Q&A Preview (home view) ──────────────────────────────

function QuickQAPreview({ onSeeAll }: { onSeeAll: () => void }) {
  const preview = COUNCIL_QA.slice(0, 3);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View>
            <Text style={styles.sectionOverline}>QUICK ANSWERS</Text>
            <Text style={styles.sectionTitle}>Ask the Council</Text>
          </View>
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>See all {COUNCIL_QA.length} {'\u2192'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.qaList}>
        {preview.map((qa, i) => (
          <QACard key={qa.id} qa={qa} index={i} />
        ))}
      </View>
    </View>
  );
}

// ─── Empty Category Fallback ────────────────────────────────────

function EmptyCategory({ auntyId, label }: { auntyId: AuntyId; label: string }) {
  const aunty = AUNTIES[auntyId];
  return (
    <View style={styles.emptyCategory}>
      <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
      <Text style={styles.emptyCategoryTitle}>Coming soon</Text>
      <Text style={styles.emptyCategoryText}>
        {aunty.name} is writing {label} for you. Check back soon.
      </Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [activeCategory, setActiveCategory] = useState<ContentCategory | null>(null);

  // Pick featured article from user's aunty, or first one
  const allArticles = [...METHOD_ARTICLES, ...PRODUCT_ARTICLES];
  const featured = allArticles.length > 0
    ? allArticles.find((a) => a.auntyId === auntyId) || allArticles[0]
    : null;

  const goBack = () => setActiveCategory(null);

  // ─── Category Detail View ───────────────────────────────────
  if (activeCategory) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {activeCategory === 'method' && (
            <>
              <SectionHeader overline="FOUNDATIONS" title="The Method" count={METHOD_ARTICLES.length} onBack={goBack} />
              {METHOD_ARTICLES.length > 0 ? (
                <View style={styles.articleList}>
                  {METHOD_ARTICLES.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
                </View>
              ) : (
                <EmptyCategory auntyId={auntyId} label="method articles" />
              )}
            </>
          )}

          {activeCategory === 'products' && (
            <>
              <SectionHeader overline="INGREDIENT SCHOOL" title="Product Knowledge" count={PRODUCT_ARTICLES.length} onBack={goBack} />
              {PRODUCT_ARTICLES.length > 0 ? (
                <View style={styles.articleList}>
                  {PRODUCT_ARTICLES.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
                </View>
              ) : (
                <EmptyCategory auntyId={auntyId} label="product articles" />
              )}
            </>
          )}

          {activeCategory === 'people' && (
            <>
              <SectionHeader overline="AUNTY APPROVED" title="People We Trust" count={APPROVED_CREATORS.length} onBack={goBack} />
              {APPROVED_CREATORS.length > 0 ? (
                <View style={styles.creatorGrid}>
                  {APPROVED_CREATORS.map((c, i) => <CreatorCard key={c.id} creator={c} index={i} />)}
                </View>
              ) : (
                <EmptyCategory auntyId={auntyId} label="creator recommendations" />
              )}
            </>
          )}

          {activeCategory === 'qa' && (
            <>
              <SectionHeader overline="ASK THE COUNCIL" title="Common Questions" count={COUNCIL_QA.length} onBack={goBack} />
              {COUNCIL_QA.length > 0 ? (
                <View style={styles.qaList}>
                  {COUNCIL_QA.map((q, i) => <QACard key={q.id} qa={q} index={i} />)}
                </View>
              ) : (
                <EmptyCategory auntyId={auntyId} label="answers" />
              )}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // ─── Home View ──────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerOverline}>LEARN</Text>
              <Text style={styles.headerTitle}>The Council{'\n'}Teaches</Text>
            </View>
            <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
          </View>
          <Text style={styles.headerSub}>Everything {aunty.name} wants you to know.</Text>
        </Animated.View>

        {/* Featured Article */}
        {featured && (
          <View style={styles.featuredWrap}>
            <FeaturedCard article={featured} auntyId={auntyId} />
          </View>
        )}

        {/* Category Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionOverline}>BROWSE</Text>
            <Text style={styles.sectionTitle}>Topics</Text>
          </View>
          <View style={styles.categoryGrid}>
            {(['method', 'products', 'people', 'qa'] as ContentCategory[]).map((cat, i) => (
              <CategoryCard
                key={cat}
                category={cat}
                accentColor={ac.accent}
                index={i}
                onPress={() => setActiveCategory(cat)}
              />
            ))}
          </View>
        </View>

        {/* Quick Q&A */}
        <QuickQAPreview onSeeAll={() => setActiveCategory('qa')} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingTop: spacing.sm },

  // Header
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerOverline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.primary, letterSpacing: letterSpacing.widest, marginBottom: spacing.xs },
  headerTitle: { fontFamily: fonts.display, fontSize: fontSize.xxxl, color: colors.ink, letterSpacing: letterSpacing.tight, lineHeight: fontSize.xxxl * 1.1 },
  headerSub: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, marginTop: spacing.sm },

  // Featured
  featuredWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.xl },
  featuredCard: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  featuredDot: { width: 6, height: 6, borderRadius: 3 },
  featuredBadgeText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, letterSpacing: letterSpacing.widest },
  featuredTitle: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.ink, letterSpacing: letterSpacing.tight, lineHeight: fontSize.xxl * 1.15 },
  featuredTeaser: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.inkLight, lineHeight: fontSize.base * 1.5 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  featuredAunty: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm },
  featuredTime: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },

  // Category Grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, paddingHorizontal: spacing.lg },
  categoryCard: {
    width: CARD_W,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  categoryIconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.base, color: colors.ink, marginTop: spacing.xs },
  categoryDesc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, lineHeight: fontSize.sm * 1.4 },
  categoryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  categoryCount: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  categoryArrow: { fontFamily: fonts.bodyBold, fontSize: fontSize.lg },

  // Section
  section: { marginBottom: spacing.xl },
  sectionHeader: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionOverline: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.muted, letterSpacing: letterSpacing.widest, marginBottom: spacing.xs },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.ink, letterSpacing: letterSpacing.tight },
  sectionCountBadge: { backgroundColor: colors.canvasDeep, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, marginLeft: spacing.sm },
  sectionCountText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, color: colors.muted },
  seeAll: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.sm, color: colors.primary },

  // Back button
  backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md, minHeight: 44 },
  backText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.ink },

  // Article cards
  articleList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  articleCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderLeftWidth: 3, padding: spacing.md, gap: spacing.sm, ...shadows.sm },
  articleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  articleTitle: { fontFamily: fonts.display, fontSize: fontSize.lg, color: colors.ink, letterSpacing: letterSpacing.tight, flex: 1 },
  articleTeaser: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.5 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  articleAunty: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.muted },
  articleTime: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },

  // Creator cards — grid in detail, horizontal in home
  creatorGrid: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  creatorCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderTopWidth: 3, padding: spacing.md, gap: spacing.xs, ...shadows.sm },
  creatorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  platformBadge: { borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  platformText: { fontFamily: fonts.bodySemiBold, fontSize: 9, color: '#FFFFFF', letterSpacing: letterSpacing.wide },
  creatorCurlTypes: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },
  creatorName: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.base, color: colors.ink, marginTop: spacing.xs },
  creatorHandle: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },
  creatorFocus: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.4, marginTop: spacing.xs },
  creatorEndorsed: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  creatorEndorsedText: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs },

  // Q&A cards
  qaList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  qaCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadows.sm },
  qaHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qaQuestion: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.base, color: colors.ink, flex: 1, lineHeight: fontSize.base * 1.4 },
  qaChevron: { fontFamily: fonts.bodyBold, fontSize: fontSize.xl, color: colors.muted, lineHeight: fontSize.xl },
  qaBody: { marginTop: spacing.md, paddingLeft: spacing.xl + spacing.sm },
  qaAnswer: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.inkLight, lineHeight: fontSize.sm * 1.6 },
  qaAunty: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.xs, fontStyle: 'italic', marginTop: spacing.md },

  // Empty category
  emptyCategory: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyCategoryTitle: { fontFamily: fonts.bodySemiBold, fontSize: fontSize.lg, color: colors.ink },
  emptyCategoryText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, textAlign: 'center', lineHeight: fontSize.md * 1.5 },
});
