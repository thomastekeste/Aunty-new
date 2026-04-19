/**
 * PaywallFeatureCarousel — horizontal swipeable preview of every app tab.
 *
 * Each slide is a stylized "device frame" that previews a real app surface
 * (Home, Ritual, Products, Chat, Learn). Used inside PaywallModal to sell
 * the depth of the product before pricing.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
} from '../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Icons (mirrored from TabBar) ─────────────────────────────────
function HomeIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15C15 14.4477 14.5523 14 14 14H10C9.44772 14 9 14.4477 9 15V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RitualIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7Z"
        stroke={color}
        strokeWidth={2}
      />
      <Path d="M4 10H20" stroke={color} strokeWidth={2} />
      <Path d="M8 3V7" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16 3V7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ProductsIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M3 6H21" stroke={color} strokeWidth={2} />
      <Path
        d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChatIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12C21 16.4183 16.9706 20 12 20C10.8053 20 9.66162 19.8004 8.6085 19.4341L3 21L4.48953 16.3754C3.55037 15.0911 3 13.5956 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LearnIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 4C2 4 5 2 12 2C19 2 22 4 22 4V20C22 20 19 18 12 18C5 18 2 20 2 20V4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 2V18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CheckMarkIcon({ color = '#FFFFFF', size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarIcon({ color = '#D4A04A', size = 11 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Slide UI mockups ─────────────────────────────────────────────

function HomeSlideMock() {
  return (
    <View style={mockStyles.surface}>
      <View style={mockStyles.row}>
        <View style={mockStyles.avatarTiny}>
          <Text style={mockStyles.avatarTinyText}>D</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={mockStyles.tinyOverline}>WEEK 2</Text>
          <Text style={mockStyles.tinyTitle}>Good morning, Maya</Text>
        </View>
      </View>

      <LinearGradient
        colors={['#D4A04A', '#B8862E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={mockStyles.heroMini}
      >
        <Text style={mockStyles.heroMiniOverline}>TODAY'S RITUAL</Text>
        <Text style={mockStyles.heroMiniTitle}>Wash Day</Text>
        <Text style={mockStyles.heroMiniMeta}>45 min · Deep cleanse + reset</Text>
      </LinearGradient>

      <View style={mockStyles.weekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
          const isToday = i === 2;
          const isPast = i < 2;
          return (
            <View
              key={i}
              style={[
                mockStyles.weekDot,
                isPast && { backgroundColor: '#1A7A4A20', borderColor: '#1A7A4A40' },
                isToday && { backgroundColor: '#D4A04A14', borderColor: '#D4A04A', borderWidth: 1.5 },
              ]}
            >
              <Text style={[mockStyles.weekDotLetter, isToday && { color: '#B8862E' }]}>{d}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RitualSlideMock() {
  return (
    <View style={mockStyles.surface}>
      <View style={mockStyles.stepHeader}>
        <Text style={mockStyles.stepHeaderLabel}>STEP 2 OF 5</Text>
        <View style={mockStyles.stepProgress}>
          <View style={mockStyles.stepProgressFill} />
        </View>
      </View>

      {[
        { num: '1', title: 'Pre-poo oil massage', meta: '5 min', done: true },
        { num: '2', title: 'Cleanse with shampoo', meta: '8 min', active: true },
        { num: '3', title: 'Deep condition mask', meta: '20 min' },
      ].map((s, i) => (
        <View
          key={i}
          style={[
            mockStyles.stepRow,
            s.active && { borderColor: '#D4A04A', backgroundColor: '#D4A04A0F' },
          ]}
        >
          <View
            style={[
              mockStyles.stepDot,
              s.done && { backgroundColor: '#1A7A4A' },
              s.active && { backgroundColor: '#D4A04A' },
            ]}
          >
            {s.done ? (
              <CheckMarkIcon color="#FFFFFF" size={11} />
            ) : (
              <Text style={[mockStyles.stepDotText, s.active && { color: '#FFFFFF' }]}>{s.num}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[mockStyles.stepTitle, s.done && { textDecorationLine: 'line-through', color: colors.muted }]}>
              {s.title}
            </Text>
            <Text style={mockStyles.stepMeta}>{s.meta}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ProductsSlideMock() {
  const cards = [
    { brand: 'CAMILLE ROSE', name: 'Algae Renew', price: '$22', tag: 'Aunty Ngozi', tagColor: '#D4A04A' },
    { brand: 'AUNT JACKIE\u2019S', name: 'Curl La La', price: '$11', tag: 'Budget', tagColor: '#1A7A4A' },
  ];
  return (
    <View style={mockStyles.surface}>
      <View style={mockStyles.tabsMini}>
        {['Shampoo', 'Mask', 'Leave-in'].map((t, i) => (
          <View key={t} style={[mockStyles.tabPillMini, i === 0 && mockStyles.tabPillMiniActive]}>
            <Text style={[mockStyles.tabPillMiniText, i === 0 && mockStyles.tabPillMiniTextActive]}>{t}</Text>
          </View>
        ))}
      </View>
      {cards.map((p, i) => (
        <View key={i} style={mockStyles.productCard}>
          <View style={mockStyles.productTop}>
            <View style={{ flex: 1 }}>
              <Text style={mockStyles.productBrand}>{p.brand}</Text>
              <Text style={mockStyles.productName}>{p.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={mockStyles.productPrice}>{p.price}</Text>
              <View style={mockStyles.ratingRow}>
                <StarIcon size={10} />
                <Text style={mockStyles.ratingText}>4.8</Text>
              </View>
            </View>
          </View>
          <View style={[mockStyles.productTag, { backgroundColor: p.tagColor + '18' }]}>
            <View style={[mockStyles.productTagDot, { backgroundColor: p.tagColor }]} />
            <Text style={[mockStyles.productTagText, { color: p.tagColor }]}>{p.tag} pick</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ChatSlideMock() {
  return (
    <View style={mockStyles.surface}>
      <View style={mockStyles.chatHeader}>
        <View style={[mockStyles.avatarTiny, { backgroundColor: '#D4A04A' }]}>
          <Text style={mockStyles.avatarTinyText}>N</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={mockStyles.tinyTitle}>Aunty Ngozi</Text>
          <Text style={mockStyles.chatStatus}>Online · usually replies fast</Text>
        </View>
      </View>

      <View style={mockStyles.bubbleRowRight}>
        <View style={mockStyles.bubbleUser}>
          <Text style={mockStyles.bubbleUserText}>My ends feel really dry today.</Text>
        </View>
      </View>

      <View style={mockStyles.bubbleRowLeft}>
        <View style={[mockStyles.avatarMini, { backgroundColor: '#D4A04A' }]}>
          <Text style={mockStyles.avatarMiniText}>N</Text>
        </View>
        <View style={mockStyles.bubbleAunty}>
          <Text style={mockStyles.bubbleAuntyText}>
            Skip the gel today, baby. Seal with shea butter on damp ends — that's your fix.
          </Text>
        </View>
      </View>

      <View style={mockStyles.typingRow}>
        <View style={mockStyles.typingDot} />
        <View style={mockStyles.typingDot} />
        <View style={mockStyles.typingDot} />
      </View>
    </View>
  );
}

function LearnSlideMock() {
  const items = [
    { tag: 'POROSITY', title: 'Why high porosity drinks oil', read: '4 min', tagColor: '#3D5A99' },
    { tag: 'PROTEIN', title: 'When your hair needs protein', read: '6 min', tagColor: '#B85C2A' },
    { tag: 'PROTECT', title: 'Satin vs silk: what actually works', read: '3 min', tagColor: '#1A7A4A' },
  ];
  return (
    <View style={mockStyles.surface}>
      <View style={mockStyles.learnHeader}>
        <Text style={mockStyles.learnHeaderTitle}>Decoded for textured hair</Text>
        <Text style={mockStyles.learnHeaderSub}>Curated reads · No fluff</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={mockStyles.learnRow}>
          <View style={[mockStyles.learnTag, { backgroundColor: item.tagColor }]}>
            <Text style={mockStyles.learnTagText}>{item.tag}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={mockStyles.learnTitle}>{item.title}</Text>
            <Text style={mockStyles.learnMeta}>{item.read} read</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Slide Definition ─────────────────────────────────────────────

interface Slide {
  key: string;
  tabLabel: string;
  headline: string;
  sub: string;
  Icon: React.ComponentType<{ color?: string; size?: number }>;
  accent: readonly [string, string];
  Mock: React.ComponentType;
}

const SLIDES: Slide[] = [
  {
    key: 'home',
    tabLabel: 'HOME',
    headline: 'Your salon, every morning.',
    sub: 'Today\u2019s ritual. This week\u2019s rhythm. One screen.',
    Icon: HomeIcon,
    accent: ['#D4A04A', '#B8862E'],
    Mock: HomeSlideMock,
  },
  {
    key: 'ritual',
    tabLabel: 'RITUAL',
    headline: 'Wash to rest, step by step.',
    sub: 'Guided routines built around your texture and time.',
    Icon: RitualIcon,
    accent: ['#1A7A4A', '#0A5C30'],
    Mock: RitualSlideMock,
  },
  {
    key: 'products',
    tabLabel: 'PRODUCTS',
    headline: 'Picks built for your hair.',
    sub: 'Real products, vetted by your aunty \u2014 not a search bar.',
    Icon: ProductsIcon,
    accent: ['#C2456E', '#9E3058'],
    Mock: ProductsSlideMock,
  },
  {
    key: 'chat',
    tabLabel: 'CHAT',
    headline: 'Your aunty in your pocket.',
    sub: 'Ask anything. She remembers your hair, your goals, your week.',
    Icon: ChatIcon,
    accent: ['#3D5A99', '#2A4070'],
    Mock: ChatSlideMock,
  },
  {
    key: 'learn',
    tabLabel: 'LEARN',
    headline: 'Decoded for textured hair.',
    sub: 'Porosity, protein, protective styles \u2014 in plain English.',
    Icon: LearnIcon,
    accent: ['#7B3F6B', '#5C2A4E'],
    Mock: LearnSlideMock,
  },
];

interface Props {
  cardWidth: number;
}

export function PaywallFeatureCarousel({ cardWidth }: Props) {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const slideWidth = cardWidth;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / slideWidth);
      if (next !== page) setPage(next);
    },
    [page, slideWidth],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>WHAT YOU'LL GET</Text>
        <Text style={styles.pageOf}>
          {page + 1} of {SLIDES.length}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        bounces={false}
        snapToInterval={slideWidth}
        snapToAlignment="start"
      >
        {SLIDES.map((s) => {
          const Mock = s.Mock;
          const Icon = s.Icon;
          return (
            <View key={s.key} style={[styles.slide, { width: slideWidth }]}>
              <LinearGradient
                colors={[...s.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.frame}
              >
                <View style={styles.frameTop}>
                  <View style={styles.frameTabPill}>
                    <Icon color="#FFFFFF" size={14} />
                    <Text style={styles.frameTabText}>{s.tabLabel}</Text>
                  </View>
                  <View style={styles.frameDots}>
                    <View style={styles.frameDot} />
                    <View style={styles.frameDot} />
                    <View style={styles.frameDot} />
                  </View>
                </View>

                <Text style={styles.frameHeadline}>{s.headline}</Text>
                <Text style={styles.frameSub}>{s.sub}</Text>

                <View style={styles.mockShell}>
                  <Mock />
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[
              styles.dot,
              i === page ? { width: 18, backgroundColor: colors.primary } : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
  },
  pageOf: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    letterSpacing: letterSpacing.wide,
  },
  slide: {
    paddingHorizontal: spacing.lg,
  },
  frame: {
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  frameTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  frameTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  frameTabText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.widest,
  },
  frameDots: {
    flexDirection: 'row',
    gap: 4,
  },
  frameDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  frameHeadline: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: fontSize.xl * 1.15,
    marginTop: spacing.xs,
  },
  frameSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: fontSize.sm * 1.45,
    marginBottom: spacing.sm,
  },
  mockShell: {
    backgroundColor: '#FEF8EC',
    borderRadius: radius.lg,
    padding: spacing.sm + 2,
    minHeight: 200,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});

const mockStyles = StyleSheet.create({
  surface: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarTiny: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3D5A99',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTinyText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  avatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3D5A99',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  tinyOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
  },
  tinyTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.sm,
    color: colors.ink,
    letterSpacing: -0.2,
    marginTop: 1,
  },

  // Home slide
  heroMini: {
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    gap: 2,
  },
  heroMiniOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: letterSpacing.widest,
  },
  heroMiniTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroMiniMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  weekDot: {
    width: 28,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FFFCF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotLetter: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
  },

  // Ritual slide
  stepHeader: {
    gap: 4,
    marginBottom: 2,
  },
  stepHeaderLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
  },
  stepProgress: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  stepProgressFill: {
    width: '40%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#D4A04A',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 1,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.muted,
  },
  stepTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  stepMeta: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },

  // Products slide
  tabsMini: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  tabPillMini: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  tabPillMiniActive: {
    backgroundColor: '#2D1B0E',
    borderColor: '#2D1B0E',
  },
  tabPillMiniText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.muted,
  },
  tabPillMiniTextActive: {
    color: '#FFFFFF',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: spacing.sm + 2,
    gap: spacing.xs,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productBrand: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: letterSpacing.wide,
  },
  productName: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    color: colors.ink,
    letterSpacing: -0.2,
    marginTop: 1,
  },
  productPrice: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  ratingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: colors.primaryDeep,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  productTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  productTagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: letterSpacing.wider,
  },

  // Chat slide
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: spacing.xs,
  },
  chatStatus: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#1A7A4A',
    marginTop: 1,
  },
  bubbleRowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bubbleUser: {
    maxWidth: '80%',
    backgroundColor: '#2D1B0E',
    borderRadius: 14,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 2,
  },
  bubbleUserText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FFFFFF',
    lineHeight: 15,
  },
  bubbleRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  bubbleAunty: {
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,160,74,0.35)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 2,
  },
  bubbleAuntyText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    lineHeight: 15,
  },
  typingRow: {
    flexDirection: 'row',
    gap: 4,
    paddingLeft: 28,
    marginTop: 2,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D4A04A',
  },

  // Learn slide
  learnHeader: {
    gap: 2,
    marginBottom: 2,
  },
  learnHeaderTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  learnHeaderSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.muted,
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
  },
  learnTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  learnTagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.wider,
  },
  learnTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.ink,
  },
  learnMeta: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },
});
