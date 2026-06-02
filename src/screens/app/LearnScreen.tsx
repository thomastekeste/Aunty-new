/**
 * LearnScreen — The Council Teaches. Editorial magazine experience.
 *
 * Tab-based navigation with expandable articles you can read in-place.
 * Library dispatches for external reading. Read tracking. Q&A accordion.
 * Creator cards with platform badges. Personalized content ordering.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
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
  shadows,
  gradients,
  letterSpacing,
} from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const READ_KEY = 'learn_read_articles';

type TabKey = 'all' | 'method' | 'products' | 'library' | 'qa' | 'creators';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'For You' },
  { key: 'method', label: 'Method' },
  { key: 'products', label: 'Products' },
  { key: 'library', label: 'Library' },
  { key: 'qa', label: 'Q&A' },
  { key: 'creators', label: 'Creators' },
];

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

function ExternalLinkIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 3H21V9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 14L21 3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckCircleIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 4L12 14.01L9 11.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDownIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronUpIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 15L12 9L6 15" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const label = platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : 'TikTok';
  const bg = platform === 'youtube' ? '#FF0000' : platform === 'instagram' ? '#E1306C' : '#010101';
  return (
    <View style={[styles.platformBadge, { backgroundColor: bg }]}>
      <Text style={styles.platformText}>{label}</Text>
    </View>
  );
}

// ─── Pressable with scale feedback ──────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePress({
  onPress,
  children,
  style,
  accessibilityLabel,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.975, { duration: 80 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      style={[animatedStyle, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Read tracking ──────────────────────────────────────────────

async function loadReadArticles(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(READ_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

async function markAsRead(id: string, current: Set<string>): Promise<Set<string>> {
  const next = new Set(current);
  next.add(id);
  try {
    await AsyncStorage.setItem(READ_KEY, JSON.stringify([...next]));
  } catch {}
  return next;
}

// ─── Tab Pills ──────────────────────────────────────────────────

function TabBar({
  active,
  onSelect,
  accentColor,
}: {
  active: TabKey;
  onSelect: (key: TabKey) => void;
  accentColor: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabBar}
      decelerationRate="fast"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.key);
            }}
            style={[
              styles.tabPill,
              isActive && { backgroundColor: accentColor },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Expandable Article Card ────────────────────────────────────

function ExpandableArticle({
  article,
  index,
  isExpanded,
  isRead,
  onToggle,
}: {
  article: Article;
  index: number;
  isExpanded: boolean;
  isRead: boolean;
  onToggle: () => void;
}) {
  const ac = auntyColors[article.auntyId];
  const aunty = AUNTIES[article.auntyId];

  return (
    <Animated.View entering={FadeInDown.delay(40 + index * 30).duration(300)}>
      <ScalePress
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        accessibilityLabel={`${article.title}, ${article.readTime} read${isRead ? ', already read' : ''}`}
      >
        <View style={[styles.articleCard, { borderLeftColor: ac.accent }]}>
          {/* Header */}
          <View style={styles.articleHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.articleMeta}>
                <AuntyAvatar auntyId={article.auntyId} size={22} />
                <Text style={[styles.articleAunty, { color: ac.accent }]}>{aunty.name}</Text>
                <View style={styles.dot} />
                <Text style={styles.articleTime}>{article.readTime}</Text>
                {isRead && (
                  <View style={styles.readBadge}>
                    <CheckCircleIcon color={colors.success} size={12} />
                    <Text style={styles.readBadgeText}>Read</Text>
                  </View>
                )}
              </View>
              <Text style={styles.articleTitle}>{article.title}</Text>
            </View>
            <View style={[styles.articleChevron, { backgroundColor: ac.accent + '10' }]}>
              {isExpanded
                ? <ChevronUpIcon color={ac.accent} size={14} />
                : <ChevronDownIcon color={ac.accent} size={14} />
              }
            </View>
          </View>

          {/* Teaser (always visible) */}
          <Text style={styles.articleTeaser} numberOfLines={isExpanded ? undefined : 2}>
            {article.teaser}
          </Text>

          {/* Expanded body */}
          {isExpanded && (
            <Animated.View entering={FadeIn.duration(200)}>
              <View style={styles.articleDivider} />
              <Text style={styles.articleBody}>{article.body}</Text>
              <View style={styles.articleFooter}>
                <View style={[styles.articleFromTag, { backgroundColor: ac.accent + '12' }]}>
                  <AuntyAvatar auntyId={article.auntyId} size={18} />
                  <Text style={[styles.articleFromText, { color: ac.accent }]}>
                    From Aunty {aunty.name}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </ScalePress>
    </Animated.View>
  );
}

// ─── Featured Hero Article ──────────────────────────────────────

function HeroArticle({
  article,
  isRead,
  onRead,
}: {
  article: Article;
  isRead: boolean;
  onRead: () => void;
}) {
  const ac = auntyColors[article.auntyId];
  const aunty = AUNTIES[article.auntyId];

  return (
    <Animated.View entering={FadeIn.delay(50).duration(400)}>
      <ScalePress onPress={onRead} accessibilityLabel={`Today's lesson: ${article.title}`}>
        <LinearGradient
          colors={[ac.accent + '20', ac.accent + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={[styles.heroBadge, { borderColor: ac.accent + '30' }]}>
              <Text style={[styles.heroBadgeText, { color: ac.accent }]}>
                TODAY&apos;S LESSON
              </Text>
            </View>
            {isRead && (
              <View style={styles.heroReadBadge}>
                <CheckCircleIcon color={colors.success} size={14} />
              </View>
            )}
          </View>
          <Text style={styles.heroTitle}>{article.title}</Text>
          <Text style={styles.heroTeaser}>{article.teaser}</Text>
          <View style={styles.heroMeta}>
            <AuntyAvatar auntyId={article.auntyId} size={28} showRing />
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroAuntyName, { color: ac.accent }]}>
                Aunty {aunty.name}
              </Text>
              <Text style={styles.heroReadTime}>{article.readTime} read</Text>
            </View>
            <View style={[styles.heroReadBtn, { backgroundColor: ac.accent }]}>
              <Text style={styles.heroReadBtnText}>
                {isRead ? 'Read Again' : 'Read'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScalePress>
    </Animated.View>
  );
}

// ─── Dispatch Card (Library) ────────────────────────────────────

function DispatchCard({
  dispatch,
  index,
  onOpen,
}: {
  dispatch: Dispatch;
  index: number;
  onOpen: () => void;
}) {
  const ac = auntyColors[dispatch.endorsedBy];
  const aunty = AUNTIES[dispatch.endorsedBy];

  return (
    <Animated.View entering={FadeInDown.delay(40 + index * 30).duration(300)}>
      <ScalePress onPress={onOpen} accessibilityLabel={`${dispatch.title} from ${dispatch.source}`}>
        <View style={styles.dispatchCard}>
          <View style={styles.dispatchTop}>
            <View style={[styles.dispatchTopicTag, { backgroundColor: ac.accent + '12' }]}>
              <Text style={[styles.dispatchTopicText, { color: ac.accent }]}>
                {dispatch.topic}
              </Text>
            </View>
            <View style={styles.dispatchTimeRow}>
              <Text style={styles.dispatchTime}>{dispatch.readTime}</Text>
              <ExternalLinkIcon color={colors.muted} size={12} />
            </View>
          </View>
          <Text style={styles.dispatchTitle}>{dispatch.title}</Text>
          <Text style={styles.dispatchNote}>{dispatch.note}</Text>
          <View style={styles.dispatchBottom}>
            <View style={styles.dispatchSource}>
              <Text style={styles.dispatchSourceText}>{dispatch.source}</Text>
            </View>
            <View style={styles.dispatchEndorsed}>
              <AuntyAvatar auntyId={dispatch.endorsedBy} size={18} />
              <Text style={[styles.dispatchEndorsedText, { color: ac.accent }]}>
                {aunty.name}&apos;s pick
              </Text>
            </View>
          </View>
        </View>
      </ScalePress>
    </Animated.View>
  );
}

// ─── Q&A Accordion Card ────────────────────────────────────────

function QACard({ qa, index }: { qa: QA; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ac = auntyColors[qa.auntyId];
  const aunty = AUNTIES[qa.auntyId];

  return (
    <Animated.View entering={FadeInDown.delay(40 + index * 30).duration(300)}>
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
          <AuntyAvatar auntyId={qa.auntyId} size={26} />
          <Text style={styles.qaQuestion}>{qa.question}</Text>
          <View style={[styles.qaChevronWrap, { backgroundColor: expanded ? ac.accent + '12' : colors.borderLight }]}>
            {expanded
              ? <ChevronUpIcon color={ac.accent} size={12} />
              : <ChevronDownIcon color={colors.muted} size={12} />
            }
          </View>
        </View>
        {expanded && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.qaBody}>
            <View style={[styles.qaAnswerBar, { backgroundColor: ac.accent + '20' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.qaAnswer}>{qa.answer}</Text>
              <Text style={[styles.qaAunty, { color: ac.accent }]}>
                — Aunty {aunty.name}
              </Text>
            </View>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Creator Card ───────────────────────────────────────────────

function CreatorCard({ creator, index }: { creator: Creator; index: number }) {
  const ac = auntyColors[creator.endorsedBy];
  const aunty = AUNTIES[creator.endorsedBy];

  return (
    <Animated.View entering={FadeInDown.delay(40 + index * 30).duration(300)}>
      <View style={[styles.creatorCard, { borderLeftColor: ac.accent }]}>
        <View style={styles.creatorTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.creatorName}>{creator.name}</Text>
            <Text style={styles.creatorHandle}>{creator.handle}</Text>
          </View>
          <PlatformBadge platform={creator.platform} />
        </View>
        <Text style={styles.creatorFocus}>{creator.focus}</Text>
        <View style={styles.creatorBottom}>
          <View style={[styles.creatorCurlTag, { backgroundColor: ac.accent + '10' }]}>
            <Text style={[styles.creatorCurlText, { color: ac.accent }]}>{creator.curlTypes}</Text>
          </View>
          <View style={styles.creatorEndorsed}>
            <AuntyAvatar auntyId={creator.endorsedBy} size={18} />
            <Text style={[styles.creatorEndorsedText, { color: ac.accent }]}>
              {aunty.name} approved
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Section Label ──────────────────────────────────────────────

function SectionLabel({ overline, title, count }: { overline: string; title: string; count?: number }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionOverline}>{overline}</Text>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && (
          <View style={styles.sectionCountPill}>
            <Text style={styles.sectionCountText}>{count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────

function ReadingProgress({ read, total, accentColor }: { read: number; total: number; accentColor: string }) {
  const pct = total > 0 ? (read / total) * 100 : 0;
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: accentColor }]} />
      </View>
      <Text style={styles.progressText}>
        {read}/{total} read
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

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());

  const scrollRef = useRef<ScrollView>(null);

  // Load read tracking
  useEffect(() => {
    loadReadArticles().then(setReadArticles);
  }, []);

  // All articles combined, user's aunty articles first
  const allArticles = [...METHOD_ARTICLES, ...PRODUCT_ARTICLES];
  const sortedArticles = [
    ...allArticles.filter((a) => a.auntyId === auntyId),
    ...allArticles.filter((a) => a.auntyId !== auntyId),
  ];

  // Today's lesson — rotate by day of year, prefer user's aunty
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const auntyArticles = allArticles.filter((a) => a.auntyId === auntyId);
  const todaysLesson = auntyArticles.length > 0
    ? auntyArticles[dayOfYear % auntyArticles.length]
    : allArticles[dayOfYear % allArticles.length];

  const totalArticles = allArticles.length;

  const handleToggleArticle = useCallback(async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Mark as read when opened
      if (!readArticles.has(id)) {
        const next = await markAsRead(id, readArticles);
        setReadArticles(next);
      }
    }
  }, [expandedId, readArticles]);

  const handleHeroRead = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTab('all');
    setExpandedId(todaysLesson.id);
    if (!readArticles.has(todaysLesson.id)) {
      const next = await markAsRead(todaysLesson.id, readArticles);
      setReadArticles(next);
    }
  }, [todaysLesson, readArticles]);

  const handleOpenDispatch = useCallback((url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() => {});
  }, []);

  const readArticleCount = [...readArticles].filter(id => allArticles.some(a => a.id === id)).length;

  // ─── Render ─────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ───────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(350)} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerOverline}>THE COUNCIL TEACHES</Text>
              <Text style={styles.headerTitle}>Learn</Text>
            </View>
            <AuntyAvatar auntyId={auntyId} size={44} showRing />
          </View>
          <ReadingProgress
            read={readArticleCount}
            total={totalArticles}
            accentColor={ac.accent}
          />
        </Animated.View>

        {/* ─── Tab Bar ──────────────────────────────────── */}
        <Animated.View entering={FadeIn.delay(50).duration(300)}>
          <TabBar active={activeTab} onSelect={setActiveTab} accentColor={ac.accent} />
        </Animated.View>

        {/* ─── Tab Content ──────────────────────────────── */}

        {activeTab === 'all' && (
          <>
            {/* Hero article */}
            <View style={styles.sectionWrap}>
              <HeroArticle
                article={todaysLesson}
                isRead={readArticles.has(todaysLesson.id)}
                onRead={handleHeroRead}
              />
            </View>

            {/* Quick stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{METHOD_ARTICLES.length}</Text>
                <Text style={styles.quickStatLabel}>Method</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{PRODUCT_ARTICLES.length}</Text>
                <Text style={styles.quickStatLabel}>Products</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{LIBRARY_DISPATCHES.length}</Text>
                <Text style={styles.quickStatLabel}>Library</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{COUNCIL_QA.length}</Text>
                <Text style={styles.quickStatLabel}>Q&A</Text>
              </View>
            </View>

            {/* Your aunty's picks */}
            <View style={styles.sectionWrap}>
              <SectionLabel
                overline={`FROM AUNTY ${aunty.name.toUpperCase()}`}
                title="Picked for You"
                count={auntyArticles.length}
              />
              <View style={styles.articleList}>
                {auntyArticles.slice(0, 3).map((article, i) => (
                  <ExpandableArticle
                    key={article.id}
                    article={article}
                    index={i}
                    isExpanded={expandedId === article.id}
                    isRead={readArticles.has(article.id)}
                    onToggle={() => handleToggleArticle(article.id)}
                  />
                ))}
              </View>
            </View>

            {/* Top 3 Q&A */}
            <View style={styles.sectionWrap}>
              <SectionLabel
                overline="QUICK ANSWERS"
                title="Ask the Council"
              />
              <View style={styles.qaList}>
                {COUNCIL_QA.slice(0, 3).map((qa, i) => (
                  <QACard key={qa.id} qa={qa} index={i} />
                ))}
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab('qa');
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAllText, { color: ac.accent }]}>
                  See all {COUNCIL_QA.length} questions
                </Text>
              </Pressable>
            </View>

            {/* Library peek */}
            <View style={styles.sectionWrap}>
              <SectionLabel
                overline="FROM THE SHELF"
                title="Library"
                count={LIBRARY_DISPATCHES.length}
              />
              {LIBRARY_DISPATCHES.slice(0, 2).map((d, i) => (
                <DispatchCard
                  key={d.id}
                  dispatch={d}
                  index={i}
                  onOpen={() => handleOpenDispatch(d.url)}
                />
              ))}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab('library');
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
                style={styles.seeAllBtn}
              >
                <Text style={[styles.seeAllText, { color: ac.accent }]}>
                  Browse full library
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {activeTab === 'method' && (
          <View style={styles.sectionWrap}>
            <SectionLabel
              overline="FOUNDATIONS"
              title="The Method"
              count={METHOD_ARTICLES.length}
            />
            <View style={styles.articleList}>
              {METHOD_ARTICLES.map((article, i) => (
                <ExpandableArticle
                  key={article.id}
                  article={article}
                  index={i}
                  isExpanded={expandedId === article.id}
                  isRead={readArticles.has(article.id)}
                  onToggle={() => handleToggleArticle(article.id)}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'products' && (
          <View style={styles.sectionWrap}>
            <SectionLabel
              overline="INGREDIENT SCHOOL"
              title="Product Knowledge"
              count={PRODUCT_ARTICLES.length}
            />
            <View style={styles.articleList}>
              {PRODUCT_ARTICLES.map((article, i) => (
                <ExpandableArticle
                  key={article.id}
                  article={article}
                  index={i}
                  isExpanded={expandedId === article.id}
                  isRead={readArticles.has(article.id)}
                  onToggle={() => handleToggleArticle(article.id)}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'library' && (
          <View style={styles.sectionWrap}>
            <SectionLabel
              overline="CURATED READING"
              title="From the Shelf"
              count={LIBRARY_DISPATCHES.length}
            />
            <Text style={styles.librarySub}>
              External articles and guides the Council recommends. Tap to read.
            </Text>
            <View style={styles.dispatchList}>
              {LIBRARY_DISPATCHES.map((d, i) => (
                <DispatchCard
                  key={d.id}
                  dispatch={d}
                  index={i}
                  onOpen={() => handleOpenDispatch(d.url)}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'qa' && (
          <View style={styles.sectionWrap}>
            <SectionLabel
              overline="ASK THE COUNCIL"
              title="Common Questions"
              count={COUNCIL_QA.length}
            />
            <View style={styles.qaList}>
              {COUNCIL_QA.map((qa, i) => (
                <QACard key={qa.id} qa={qa} index={i} />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'creators' && (
          <View style={styles.sectionWrap}>
            <SectionLabel
              overline="AUNTY APPROVED"
              title="People We Trust"
              count={APPROVED_CREATORS.length}
            />
            <Text style={styles.librarySub}>
              Creators and educators the Council endorses for textured hair content.
            </Text>
            <View style={styles.creatorList}>
              {APPROVED_CREATORS.map((c, i) => (
                <CreatorCard key={c.id} creator={c} index={i} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
  },

  // Progress bar
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.muted,
    minWidth: 50,
    textAlign: 'right',
  },

  // Tab bar
  tabBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tabPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minHeight: 36,
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  tabLabelActive: {
    fontFamily: fonts.bodySemiBold,
    color: '#FFFFFF',
  },

  // Quick stats
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  quickStatValue: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
  },
  quickStatLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  quickStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderLight,
  },

  // Section
  sectionWrap: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
  },
  sectionCountPill: {
    backgroundColor: colors.canvasDeep,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  sectionCountText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  seeAllBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
  },
  seeAllText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },

  // Hero article
  heroCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  heroBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
  },
  heroReadBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xxl * 1.15,
  },
  heroTeaser: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.inkLight,
    lineHeight: fontSize.base * 1.5,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heroAuntyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },
  heroReadTime: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  heroReadBtn: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroReadBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
  },

  // Article cards
  articleList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  articleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.md,
    ...shadows.sm,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  articleAunty: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.muted,
  },
  articleTime: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: spacing.xs,
  },
  readBadgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.success,
  },
  articleTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.lg * 1.25,
  },
  articleChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  articleTeaser: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.5,
    marginTop: spacing.xs,
  },
  articleDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  articleBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
    lineHeight: fontSize.base * 1.65,
  },
  articleFooter: {
    marginTop: spacing.md,
  },
  articleFromTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  articleFromText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },

  // Dispatch (Library) cards
  dispatchList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  dispatchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  dispatchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dispatchTopicTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  dispatchTopicText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
  dispatchTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dispatchTime: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  dispatchTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.lg * 1.25,
    marginBottom: spacing.xs,
  },
  dispatchNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.5,
    fontStyle: 'italic',
  },
  dispatchBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  dispatchSource: {
    backgroundColor: colors.canvasDeep,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dispatchSourceText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  dispatchEndorsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dispatchEndorsedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },

  // Library sub text
  librarySub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: fontSize.sm * 1.5,
  },

  // Q&A
  qaList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  qaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  qaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qaQuestion: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
    flex: 1,
    lineHeight: fontSize.base * 1.35,
  },
  qaChevronWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaBody: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingLeft: spacing.sm,
    gap: spacing.sm,
  },
  qaAnswerBar: {
    width: 3,
    borderRadius: 1.5,
    alignSelf: 'stretch',
  },
  qaAnswer: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.65,
  },
  qaAunty: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },

  // Creator cards
  creatorList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  creatorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.md,
    ...shadows.sm,
  },
  creatorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  creatorName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
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
    lineHeight: fontSize.sm * 1.4,
    marginTop: spacing.xs,
  },
  creatorBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  creatorCurlTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  creatorCurlText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },
  creatorEndorsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  creatorEndorsedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
  },

  // Platform badge
  platformBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  platformText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.wide,
  },
});
