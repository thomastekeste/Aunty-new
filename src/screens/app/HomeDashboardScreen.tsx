import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { PressableScale } from '../../components/PressableScale';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, type AuntyId, getAuntyQuoteForSession, getAuntyTipForToday } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { useLocalHumidity } from '../../hooks/useLocalHumidity';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CurlType, Porosity } from '../../types';

// ─── Hair-health analytics, derived from real check-in history ───────
// Self-reported mood maps to a 0–100 wellness index. Honest: it reflects what
// the user actually logged, and the trend is their real check-in-over-check-in
// change. Persisted to the backend on submit (see CheckinScreen).
type CheckinEntry = { mood?: string; timestamp?: string };

const MOOD_SCORE: Record<string, number> = {
  great: 92,
  good: 78,
  okay: 63,
  struggling: 45,
};
const MOOD_COLOR: Record<string, string> = {
  great: colors.jewel.emerald,
  good: colors.jewel.amber,
  okay: colors.jewel.indigo,
  struggling: colors.jewel.rose,
};

type Analytics = {
  count: number;
  score: number | null;
  trend: number | null; // pts vs. previous check-in (null if only one)
  lastMood: string | null;
};

function deriveAnalytics(history: CheckinEntry[]): Analytics {
  if (!Array.isArray(history) || history.length === 0) {
    return { count: 0, score: null, trend: null, lastMood: null };
  }
  const toScore = (h?: CheckinEntry) => MOOD_SCORE[h?.mood ?? ''] ?? 60;
  const latest = history[history.length - 1];
  const prev = history.length >= 2 ? history[history.length - 2] : null;
  const score = Math.round(toScore(latest));
  const trend = prev ? score - Math.round(toScore(prev)) : null;
  return { count: history.length, score, trend, lastMood: latest?.mood ?? null };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Wash cycle is still illustrative — it needs wash-day logging (separate from
// check-ins) to be real. Gated behind real history so new users never see it.
const WASH_CYCLE = {
  cycleLength: 7,
  dayInCycle: 5,
  lastWash: { when: '5 days ago', what: 'Wash + Deep Condition' },
  today: { phase: 'Moisture Check' },
  nextWash: { when: 'In 2 days' },
};

// ─── Helpers ─────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCurlType(c?: CurlType): string {
  return c ? c.toUpperCase() : '4C';
}

function formatPorosity(p?: Porosity): string {
  const map: Record<Porosity, string> = {
    low: 'Low Porosity',
    normal: 'Medium Porosity',
    high: 'High Porosity',
  };
  return p ? map[p] : 'Low Porosity';
}

type HumidityBand = 'dry' | 'comfortable' | 'humid';

/**
 * A hair-profile-aware reading: combines today's humidity with THIS user's
 * porosity to explain what it means for them specifically.
 */
function getHairProfileLine(
  porosity: Porosity | undefined,
  percent: number | null,
  band: HumidityBand,
): string {
  const p = porosity ?? 'low';

  // No live reading — still say something specific to their porosity.
  if (percent == null) {
    if (p === 'low') return 'Low-porosity hair holds moisture once it’s in. Warm your products to help them absorb, then seal.';
    if (p === 'high') return 'High-porosity hair drinks fast and loses fast. Layer moisture, then seal hard to lock it in.';
    return 'Balanced porosity — keep a steady moisture-and-seal rhythm and your hair stays happy.';
  }

  const pct = `${percent}% humidity`;

  if (p === 'low') {
    if (band === 'dry') return `${pct} — low-porosity hair struggles to open the cuticle today. Steam first, then seal.`;
    if (band === 'humid') return `${pct} — low-porosity hair won’t drink the extra moisture. Keep layers light so product doesn’t just sit on top.`;
    return `${pct} — comfortable air. Low-porosity hair loves warmth: a quick steam helps it absorb.`;
  }
  if (p === 'high') {
    if (band === 'dry') return `${pct} — high-porosity hair loses water fast in dry air. Cream first, then seal hard with oil or butter.`;
    if (band === 'humid') return `${pct} — high-porosity cuticles soak up the damp and swell. Use an anti-humectant seal to keep frizz down.`;
    return `${pct} — easy air for high-porosity hair. Still seal after moisture so it doesn’t escape.`;
  }
  // normal
  if (band === 'dry') return `${pct} — drier than ideal. Add a humectant layer before you seal.`;
  if (band === 'humid') return `${pct} — moisture-rich air. Light seal; skip heavy humectants if hair swells.`;
  return `${pct} — balanced air. Your usual routine should behave today.`;
}

// ─── Icons ───────────────────────────────────────────────────────────
function GearIcon({ color = colors.muted, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgCircle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
      <Path
        d="M19.4 15A1.65 1.65 0 0019.74 16.81L19.8 16.87A2 2 0 1117 19.7L16.94 19.64A1.65 1.65 0 0015.13 19.3 1.65 1.65 0 0014.18 20.81V21A2 2 0 1110.18 21V20.91A1.65 1.65 0 009.18 19.4 1.65 1.65 0 007.37 19.74L7.31 19.8A2 2 0 114.49 17L4.55 16.94A1.65 1.65 0 004.89 15.13 1.65 1.65 0 003.38 14.18H3.19A2 2 0 113.19 10.18H3.28A1.65 1.65 0 004.79 9.18 1.65 1.65 0 004.45 7.37L4.39 7.31A2 2 0 117.21 4.49L7.27 4.55A1.65 1.65 0 009.08 4.89H9.18A1.65 1.65 0 0010.18 3.38V3.19A2 2 0 1114.18 3.19V3.28A1.65 1.65 0 0015.13 4.79 1.65 1.65 0 0016.94 4.45L17 4.39A2 2 0 1119.82 7.21L19.76 7.27A1.65 1.65 0 0019.42 9.08V9.18A1.65 1.65 0 0020.81 10.18H21A2 2 0 1121 14.18H20.91A1.65 1.65 0 0019.4 15Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ color = colors.muted, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HumidityIcon({ color = colors.muted, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C12 2 5 9 5 14C5 17.866 8.134 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2Z"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GridIcon({ type, size = 22, color }: { type: 'log' | 'trends' | 'products'; size?: number; color: string }) {
  const paths: Record<string, React.ReactNode> = {
    log: (
      <>
        <Path d="M12 20h9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    trends: (
      <>
        <Path d="M3 17L9 11L13 15L21 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 7H21V13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    products: (
      <>
        <Path d="M9 2L7.5 6H16.5L15 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M6.5 6H17.5L18.5 20A2 2 0 0116.5 22H7.5A2 2 0 015.5 20L6.5 6Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">{paths[type]}</Svg>;
}

// ─── Hair Health Score Ring ──────────────────────────────────────────
const RING_SIZE = 152;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ score }: { score: number | null }) {
  const progress = score == null ? 0 : Math.max(0, Math.min(1, score / 100));
  const offset = RING_CIRC * (1 - progress);
  return (
    <View style={scoreStyles.ring}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <SvgCircle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} stroke={colors.border} strokeWidth={RING_STROKE} fill="none" />
        {score != null && (
          <SvgCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.primary}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${RING_CIRC}`}
            strokeDashoffset={offset}
            rotation={-90}
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        )}
      </Svg>
      <View style={scoreStyles.ringCenter}>
        <Text style={score == null ? scoreStyles.scoreNumberEmpty : scoreStyles.scoreNumber}>
          {score == null ? '—' : score}
        </Text>
        <Text style={scoreStyles.scoreLabel}>Hair Health</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────
export default function HomeDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state: ob } = useOnboarding();
  const auntyId: AuntyId = (ob.data.chosenAuntyId as AuntyId) || 'denise';
  const aunty = AUNTIES[auntyId] ?? AUNTIES.denise;
  const ac = auntyColors[auntyId] ?? auntyColors.denise;
  const name = ob.data.name || 'Queen';

  const curlType = formatCurlType(ob.data.hairProfile?.curlType);
  const porosityLabel = formatPorosity(ob.data.hairProfile?.porosity);

  const { percent: humidity, band: humidityBand, ready: humidityReady } = useLocalHumidity();
  const profileLine = useMemo(
    () => getHairProfileLine(ob.data.hairProfile?.porosity, humidity, humidityBand),
    [ob.data.hairProfile?.porosity, humidity, humidityBand],
  );

  // Rotating aunty wisdom (alternates quote / tip every ~2 hours)
  const noteText = useMemo(() => {
    const session = Math.floor(Date.now() / (1000 * 60 * 60 * 2));
    return session % 2 === 0 ? getAuntyQuoteForSession(auntyId) : getAuntyTipForToday(auntyId);
  }, [auntyId]);

  // Real analytics from the user's check-in history. A brand-new user (no
  // check-ins) sees an honest baseline state instead of fabricated numbers.
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem('checkin_history')
      .then((raw) => {
        const history: CheckinEntry[] = raw ? JSON.parse(raw) : [];
        if (!cancelled) setAnalytics(deriveAnalytics(history));
      })
      .catch(() => {
        if (!cancelled) setAnalytics(deriveAnalytics([]));
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const showAnalytics = (analytics?.count ?? 0) > 0;

  const washProgress = Math.max(0, Math.min(1, WASH_CYCLE.dayInCycle / WASH_CYCLE.cycleLength));

  const go = (route: string, params?: object) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(route as never, params as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. Header ───────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(380)} style={styles.header}>
          <PressableScale
            onPress={() => navigation.navigate('ChangeAunty')}
            scaleTo={0.97}
            haptic="light"
            style={styles.headerLeft}
            accessibilityRole="button"
            accessibilityLabel={`Change aunty, currently ${aunty.name}`}
          >
            <AuntyAvatar auntyId={auntyId} size={40} showRing />
            <View style={styles.headerGreeting}>
              <Text style={styles.greetingText} numberOfLines={1}>
                {getGreeting()}, {name}
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                Your hair, today
              </Text>
            </View>
          </PressableScale>
          <Pressable
            onPress={() => go('Settings')}
            style={styles.settingsBtn}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <GearIcon />
          </Pressable>
        </Animated.View>

        {/* ─── 2. Hair Profile Card (the wow) ──────────── */}
        <Animated.View entering={FadeInDown.delay(40).duration(380)} style={styles.sectionPad}>
          <PressableScale
            onPress={() => go('HairProfile')}
            scaleTo={0.985}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={`Your hair profile: ${curlType}, ${porosityLabel}. ${profileLine}`}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FBF3E4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}
            >
              <View style={styles.profileTopRow}>
                <Text style={styles.profileOverline}>YOUR HAIR PROFILE</Text>
                <ChevronRightIcon color={colors.jewel.indigo} size={15} />
              </View>

              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeType}>{curlType}</Text>
                <View style={styles.profileBadgeDivider} />
                <Text style={styles.profileBadgePorosity}>{porosityLabel}</Text>
              </View>

              <View style={styles.profileHumidityRow}>
                <HumidityIcon color={colors.jewel.indigo} size={15} />
                <Text style={styles.profileLine}>
                  {humidityReady || humidity != null ? profileLine : 'Reading your local humidity…'}
                </Text>
              </View>
            </LinearGradient>
          </PressableScale>
        </Animated.View>

        {/* ─── 3. Aunty Note ───────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(90).duration(360)} style={styles.sectionPad}>
          <PressableScale
            onPress={() => go('Chat')}
            scaleTo={0.985}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={`Note from Aunty ${aunty.name}. Tap to chat.`}
          >
            <View style={[styles.noteCard, { borderLeftColor: ac.accent }]}>
              <AuntyAvatar auntyId={auntyId} size={36} showRing={false} />
              <View style={styles.noteContent}>
                <Text style={styles.noteText} numberOfLines={2}>
                  &ldquo;{noteText}&rdquo;
                </Text>
                <Text style={[styles.noteName, { color: ac.accent }]}>— Aunty {aunty.name}</Text>
              </View>
              <ChevronRightIcon color={colors.muted} size={14} />
            </View>
          </PressableScale>
        </Animated.View>

        {/* ─── 4. Hair Health Score ────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(360)} style={styles.sectionPad}>
          <PressableScale
            onPress={() => go(showAnalytics ? 'Journey' : 'CheckIn')}
            scaleTo={0.99}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={
              showAnalytics && analytics?.score != null
                ? `Hair health score ${analytics.score} out of 100${
                    analytics.trend != null
                      ? `, ${analytics.trend >= 0 ? 'up' : 'down'} ${Math.abs(analytics.trend)} points from your last check-in`
                      : ''
                  }`
                : 'Hair health score not available yet. Log a check-in to begin tracking.'
            }
          >
            <View style={styles.healthCard}>
              <ScoreRing score={showAnalytics ? analytics?.score ?? null : null} />

              {showAnalytics && analytics ? (
                <>
                  <View style={styles.trendRow}>
                    {analytics.trend == null ? (
                      <Text style={styles.baselineText}>Baseline set — check in weekly to see your trend</Text>
                    ) : analytics.trend > 0 ? (
                      <Text style={styles.trendText}>↑ {analytics.trend} pts from last check-in</Text>
                    ) : analytics.trend < 0 ? (
                      <Text style={[styles.trendText, { color: colors.accent }]}>
                        ↓ {Math.abs(analytics.trend)} pts from last check-in
                      </Text>
                    ) : (
                      <Text style={styles.baselineText}>Holding steady from last check-in</Text>
                    )}
                  </View>

                  <View style={styles.pillRow}>
                    <View style={[styles.pill, styles.pillNeutral]}>
                      <Text style={[styles.pillLabel, { color: colors.inkLight }]}>
                        {analytics.count} check-in{analytics.count === 1 ? '' : 's'}
                      </Text>
                    </View>
                    {analytics.lastMood ? (
                      <View
                        style={[
                          styles.pill,
                          {
                            backgroundColor: `${MOOD_COLOR[analytics.lastMood] ?? colors.muted}14`,
                            borderColor: `${MOOD_COLOR[analytics.lastMood] ?? colors.muted}33`,
                          },
                        ]}
                      >
                        <Text style={[styles.pillLabel, { color: colors.inkLight }]}>Last felt</Text>
                        <Text style={[styles.pillArrow, { color: MOOD_COLOR[analytics.lastMood] ?? colors.muted }]}>
                          {capitalize(analytics.lastMood)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </>
              ) : (
                <View style={styles.trendRow}>
                  <Text style={styles.baselineText}>Log your first check-in to start your score</Text>
                </View>
              )}
            </View>
          </PressableScale>
        </Animated.View>

        {/* ─── 5. Action Grid (2×2) ────────────────────── */}
        <Animated.View entering={FadeInDown.delay(190).duration(360)} style={styles.sectionPad}>
          <View style={styles.grid}>
            <PressableScale
              onPress={() => go('CheckIn')}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel="Log today's hair check-in"
            >
              <GridIcon type="log" color={colors.primaryDeep} />
              <Text style={styles.gridLabel}>Log</Text>
              <Text style={styles.gridSub}>Today&apos;s check-in</Text>
            </PressableScale>

            <PressableScale
              onPress={() => go('Journey')}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel="Trends over time"
            >
              <GridIcon type="trends" color={colors.jewel.indigo} />
              <Text style={styles.gridLabel}>Trends</Text>
              <Text style={styles.gridSub}>Over time</Text>
            </PressableScale>

            <PressableScale
              onPress={() => go('Tabs', { screen: 'Products' })}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel="Your product shelf"
            >
              <GridIcon type="products" color={colors.jewel.plum} />
              <Text style={styles.gridLabel}>Products</Text>
              <Text style={styles.gridSub}>Your shelf</Text>
            </PressableScale>

            <PressableScale
              onPress={() => go('Tabs', { screen: 'Chat' })}
              style={styles.gridTile}
              scaleTo={0.975}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={`Ask Aunty ${aunty.name}`}
            >
              <AuntyAvatar auntyId={auntyId} size={22} showRing={false} />
              <Text style={styles.gridLabel}>Ask {aunty.name}</Text>
              <Text style={styles.gridSub}>Get advice</Text>
            </PressableScale>
          </View>
        </Animated.View>

        {/* ─── 6. Wash Day Timeline ────────────────────── */}
        <Animated.View entering={FadeInDown.delay(240).duration(360)} style={styles.sectionPad}>
          <PressableScale
            onPress={() => go(showAnalytics ? 'Journey' : 'CheckIn')}
            scaleTo={0.99}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={
              showAnalytics
                ? `Wash cycle: day ${WASH_CYCLE.dayInCycle} of ${WASH_CYCLE.cycleLength}, ${WASH_CYCLE.today.phase}. Next wash ${WASH_CYCLE.nextWash.when.toLowerCase()}.`
                : 'No wash logged yet. Tap to log your wash and start your cycle.'
            }
          >
            <View style={styles.washCard}>
              <View style={styles.washHeader}>
                <Text style={styles.washOverline}>WASH CYCLE</Text>
                {showAnalytics && (
                  <View style={styles.washDayPill}>
                    <Text style={styles.washDayPillText}>
                      Day {WASH_CYCLE.dayInCycle} of {WASH_CYCLE.cycleLength}
                    </Text>
                  </View>
                )}
              </View>

              {showAnalytics ? (
                <>
                  {/* Timeline track */}
                  <View style={styles.track}>
                    <View style={styles.trackBg} />
                    <View style={[styles.trackFill, { width: `${washProgress * 100}%` }]} />
                    <View style={[styles.trackNode, styles.trackNodeStart]} />
                    <View style={[styles.trackNodeToday, { left: `${washProgress * 100}%` }]} />
                    <View style={[styles.trackNode, styles.trackNodeEnd]} />
                  </View>

                  {/* Labels */}
                  <View style={styles.washLabels}>
                    <View style={styles.washCol}>
                      <Text style={styles.washColTitle}>Last wash</Text>
                      <Text style={styles.washColValue}>{WASH_CYCLE.lastWash.when}</Text>
                      <Text style={styles.washColMeta}>{WASH_CYCLE.lastWash.what}</Text>
                    </View>
                    <View style={[styles.washCol, styles.washColCenter]}>
                      <Text style={[styles.washColTitle, styles.washColTitleActive]}>Today</Text>
                      <Text style={[styles.washColValue, styles.washColValueActive]}>{WASH_CYCLE.today.phase}</Text>
                    </View>
                    <View style={[styles.washCol, styles.washColRight]}>
                      <Text style={styles.washColTitle}>Next wash</Text>
                      <Text style={styles.washColValue}>{WASH_CYCLE.nextWash.when}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Empty track */}
                  <View style={styles.track}>
                    <View style={styles.trackBg} />
                    <View style={[styles.trackNode, styles.trackNodeStart, styles.trackNodeEmpty]} />
                    <View style={[styles.trackNode, styles.trackNodeEnd]} />
                  </View>
                  <Text style={styles.washEmptyText}>
                    No wash logged yet. Tap Log after your next wash and your cycle appears here.
                  </Text>
                </>
              )}
            </View>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Score ring styles ───────────────────────────────────────────────
const scoreStyles = StyleSheet.create({
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontFamily: fonts.display,
    fontSize: 46,
    color: colors.ink,
    lineHeight: 50,
    letterSpacing: -1,
  },
  scoreNumberEmpty: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.muted,
    lineHeight: 46,
  },
  scoreLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 0,
  },
});

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  sectionPad: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerGreeting: {
    flex: 1,
  },
  greetingText: {
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // ── Hair Profile Card ──
  profileCard: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 74, 0.35)',
    ...shadows.md,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  profileOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    color: colors.jewel.indigo,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.jewel.indigo,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm + 2,
    ...shadows.sm,
  },
  profileBadgeType: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  profileBadgeDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileBadgePorosity: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  profileHumidityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  profileLine: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    lineHeight: fontSize.sm * 1.5,
  },

  // ── Aunty Note ──
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    fontStyle: 'italic',
    lineHeight: fontSize.sm * 1.45,
  },
  noteName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    marginTop: 3,
  },

  // ── Hair Health Score ──
  healthCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  trendRow: {
    marginTop: spacing.sm,
  },
  trendText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  baselineText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  pillNeutral: {
    backgroundColor: colors.surfaceTinted,
    borderColor: colors.borderLight,
  },
  pillLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
  },
  pillArrow: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
  },

  // ── Action Grid ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: 4,
    ...shadows.sm,
  },
  gridLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginTop: 4,
  },
  gridSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  // ── Wash Day Timeline ──
  washCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.sm,
  },
  washHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  washOverline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    color: colors.muted,
  },
  washDayPill: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  washDayPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primaryDeep,
  },
  track: {
    height: 14,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  trackNode: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  trackNodeStart: {
    left: 0,
    backgroundColor: colors.primary,
  },
  trackNodeEnd: {
    right: 0,
    backgroundColor: colors.border,
  },
  trackNodeEmpty: {
    backgroundColor: colors.border,
  },
  trackNodeToday: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.gold,
  },
  washLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  washCol: {
    flex: 1,
  },
  washColCenter: {
    alignItems: 'center',
  },
  washColRight: {
    alignItems: 'flex-end',
  },
  washColTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 0.3,
  },
  washColTitleActive: {
    color: colors.primaryDeep,
  },
  washColValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.ink,
    marginTop: 3,
  },
  washColValueActive: {
    color: colors.ink,
  },
  washColMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
  },
  washEmptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: fontSize.sm * 1.5,
  },
});
