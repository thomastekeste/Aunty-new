import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { AUNTIES, AUNTY_IDS } from '@/constants/aunties';
import { colors, spacing, fontSize, fontWeight, fonts, radius, auntyColors, shadows } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import AuntyAvatar from '@/components/AuntyAvatar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W - spacing.xl * 2, 340);
const CARD_PEEK = (SCREEN_W - CARD_W) / 2;

const AUNTY_ORDER = ['1', '2', '3', '4', '5', '6', '7'] as const;

export default function SplashScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { updateUser } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const dotScale = useRef(AUNTY_ORDER.map(() => new Animated.Value(1))).current;
  const dotOpacity = useRef(AUNTY_ORDER.map(() => new Animated.Value(0.3))).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSkipOnboarding = () => {
    const demoUserId = `demo-${Date.now()}`;
    updateUser({
      id: demoUserId,
      name: 'Test User',
      email: `test-${demoUserId}@test.local`,
      onboarding_complete: true,
      onboarding_step_completed: 22,
    } as any);
  };

  const animateDots = useCallback((idx: number) => {
    AUNTY_ORDER.forEach((_, i) => {
      Animated.spring(dotScale[i], {
        toValue: i === idx ? 2.2 : 1,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }).start();
      Animated.timing(dotOpacity[i], {
        toValue: i === idx ? 1 : 0.3,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const scrollTo = useCallback((idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * CARD_W, animated: true });
    animateDots(idx);
    setActiveIdx(idx);
  }, [animateDots]);

  // Initial dot state
  useEffect(() => {
    animateDots(0);
  }, []);

  // Glow pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, { toValue: 1.12, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Auto-advance every 3s
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % AUNTY_ORDER.length;
        scrollRef.current?.scrollTo({ x: next * CARD_W, animated: true });
        animateDots(next);
        return next;
      });
    }, 3000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [animateDots]);

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / CARD_W);
    if (idx !== activeIdx && idx >= 0 && idx < AUNTY_ORDER.length) {
      if (autoRef.current) clearInterval(autoRef.current);
      animateDots(idx);
      setActiveIdx(idx);
    }
  };

  const activeAuntyColor = auntyColors[AUNTY_ORDER[activeIdx]].accent;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Large atmospheric glow — much more visible */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            backgroundColor: activeAuntyColor,
            transform: [{ scale: glowScale }],
          },
        ]}
      />
      {/* Secondary glow — bottom */}
      <View style={[styles.glowOrbBottom, { backgroundColor: activeAuntyColor }]} />

      {/* Wordmark */}
      <View style={styles.header}>
        <View style={styles.councilPill}>
          <Text style={styles.councilPillText}>The Curl Council</Text>
        </View>
        <Text style={styles.wordmark}>Aunty</Text>
        <Text style={styles.tagline}>Seven aunties. One mission. Your hair.</Text>
      </View>

      {/* Carousel */}
      <View style={styles.carouselOuter}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          snapToInterval={CARD_W}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: CARD_PEEK }}
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
          scrollEventThrottle={16}
        >
          {AUNTY_ORDER.map((id, i) => {
            const aunty = AUNTIES[id];
            const ac = auntyColors[id];
            const isActive = i === activeIdx;
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.92}
                onPress={() => scrollTo(i)}
                style={[
                  styles.card,
                  { width: CARD_W - spacing.sm, marginHorizontal: spacing.xs },
                  isActive && styles.cardActive,
                ]}
              >
                {/* Top color band — bold stripe in aunty color */}
                <View style={[styles.cardTopBand, { backgroundColor: ac.accent }]}>
                  <Text style={styles.bandCount}>{i + 1} / 7</Text>
                  <View style={[styles.regionChip, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                    <Text style={styles.regionChipText}>{aunty.region}</Text>
                  </View>
                </View>

                {/* Card body */}
                <View style={styles.cardBody}>
                  {/* Avatar with vivid ring */}
                  <View style={[styles.avatarRing, { borderColor: ac.accent, shadowColor: ac.accent }]}>
                    <AuntyAvatar auntyId={id} size={80} />
                  </View>

                  {/* Identity */}
                  <Text style={styles.auntyName}>{aunty.name}</Text>
                  <View style={[styles.titlePill, { backgroundColor: `${ac.accent}22`, borderColor: `${ac.accent}50` }]}>
                    <Text style={[styles.auntyTitle, { color: ac.accent }]}>{aunty.title}</Text>
                  </View>

                  {/* Divider */}
                  <View style={[styles.divider, { backgroundColor: `${ac.accent}30` }]} />

                  {/* Quote */}
                  <Text style={[styles.quoteMark, { color: ac.accent }]}>"</Text>
                  <Text style={styles.quoteText} numberOfLines={3}>{aunty.quote}</Text>

                  {/* Specialty */}
                  <View style={[styles.specialtyBadge, { backgroundColor: ac.accent }]}>
                    <Text style={styles.specialtyText}>{aunty.specialty}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Dot indicators — elongated pill style */}
      <View style={styles.dots}>
        {AUNTY_ORDER.map((id, i) => (
          <TouchableOpacity key={id} onPress={() => scrollTo(i)} activeOpacity={0.7}>
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: auntyColors[id].accent,
                  opacity: dotOpacity[i],
                  transform: [{ scaleX: dotScale[i] }],
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.ctaBlock}>
        <TouchableOpacity
          style={[styles.primaryCta, { backgroundColor: activeAuntyColor, shadowColor: activeAuntyColor }]}
          onPress={() => navigation.navigate('Name')}
          activeOpacity={0.82}
        >
          <Text style={styles.primaryCtaText}>Begin your consultation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleSkipOnboarding}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>Skip for testing</Text>
        </TouchableOpacity>
        <Text style={styles.ctaCaption}>Personalized care. Cultural wisdom.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    overflow: 'hidden',
  },

  // Atmospheric glows — much more visible
  glowOrb: {
    position: 'absolute',
    top: '-5%',
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.13,
  },
  glowOrbBottom: {
    position: 'absolute',
    bottom: '-8%',
    right: '-15%',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.07,
  },

  // Header
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  councilPill: {
    backgroundColor: 'rgba(61,47,31,0.08)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(61,47,31,0.15)',
    marginBottom: spacing.xs,
  },
  councilPillText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(61,47,31,0.55)',
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 3.5,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 76,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -4,
    lineHeight: 72,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(61,47,31,0.38)',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Carousel
  carouselOuter: {
    width: SCREEN_W,
    flex: 1,
    justifyContent: 'center',
    maxHeight: 400,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardActive: {
    borderColor: colors.border,
  },

  // Bold color band at top — the hero moment of each card
  cardTopBand: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bandCount: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: 'rgba(0,0,0,0.55)',
    letterSpacing: 0.5,
  },
  regionChip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  regionChipText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(0,0,0,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Card body
  cardBody: {
    padding: spacing.md,
    alignItems: 'center',
  },
  avatarRing: {
    borderWidth: 3,
    borderRadius: 46,
    padding: 3,
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  auntyName: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: spacing.xs,
  },
  titlePill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  auntyTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  divider: {
    width: '80%',
    height: 1,
    marginBottom: spacing.sm,
  },
  quoteMark: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 28,
    fontWeight: fontWeight.black,
    opacity: 0.5,
    alignSelf: 'flex-start',
  },
  quoteText: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    color: colors.ink,
    lineHeight: 20,
    marginTop: -spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  specialtyBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    alignSelf: 'center',
  },
  specialtyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Dots — pill style
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // CTA
  ctaBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  primaryCta: {
    width: '100%',
    borderRadius: radius.full,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  primaryCtaText: {
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  skipBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(61,47,31,0.5)',
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ctaCaption: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(61,47,31,0.35)',
    letterSpacing: 0.5,
  },
});
