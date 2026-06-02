/**
 * HandwrittenBlessing — "The Coronation" send-off (crown is the hero).
 *
 * Four beats, no figures — the crown carries the whole moment:
 *
 *   1. A gold crown sits cracked in two in a cool, dim light.
 *      "Your crown was never broken."
 *   2. "It just needed someone who speaks its language."
 *   3. Your aunty rises in. The light warms to her jewel tone, the crown's two
 *      halves glide back together in a flash of gold + sparks, a center gem
 *      snaps in, light rays bloom behind it and a gleam sweeps the metal as it
 *      lifts.
 *   4. "Now go make your aunty proud." — and the whole council floods in.
 *
 * Tap anywhere to skip to the end. (Export name kept for import compatibility.)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  Extrapolation,
  cancelAnimation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AuntyAvatar } from './AuntyAvatar';
import { AUNTIES, COUNCIL_ORDER, type AuntyId } from '../constants/aunties';
import { colors, fonts, spacing, auntyColors } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

// Hero crown dimensions (the 90x58 artwork, scaled up).
const CROWN_W = 150;
const CROWN_H = 97;

// ─── Radiance ray-burst (precomputed paths in a 280x280 box) ────────
const RAY_PATHS = (() => {
  const cx = 140;
  const cy = 140;
  const tip = 134;
  const base = 8;
  const hw = 7;
  return Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const p = a + Math.PI / 2;
    const tx = cx + Math.cos(a) * tip;
    const ty = cy + Math.sin(a) * tip;
    const b1x = cx + Math.cos(a) * base + Math.cos(p) * hw;
    const b1y = cy + Math.sin(a) * base + Math.sin(p) * hw;
    const b2x = cx + Math.cos(a) * base - Math.cos(p) * hw;
    const b2y = cy + Math.sin(a) * base - Math.sin(p) * hw;
    return `M${b1x.toFixed(1)} ${b1y.toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${b2x.toFixed(1)} ${b2y.toFixed(1)} Z`;
  });
})();

function RayBurst({ accent }: { accent: string }) {
  return (
    <Svg width={280} height={280} viewBox="0 0 280 280">
      <G>
        {RAY_PATHS.map((d, i) => (
          <Path key={i} d={d} fill={i % 2 === 0 ? '#F5DFA0' : accent} opacity={i % 2 === 0 ? 0.5 : 0.32} />
        ))}
      </G>
    </Svg>
  );
}

// ─── Curls inside the crown, poking up (crown surrounds the head) ───
// Drawn in the crown's coordinate space (viewBox extended above to y=-20 so
// curls can rise past the spikes). A scalloped silhouette gives the mass a
// curly edge; layered spiral strokes read as defined coils. Rendered behind
// the band so the crown wraps the head and the hair pokes out the top.

// ── Curl-pattern strands (the hair-type spectrum: straight 1 → coily 4c) ──
// Each strand is a vertical path with a characteristic waveform. Packed close
// together, they put every curl texture inside the crown — all curls included.
const STRAND_TOP = -16;
const STRAND_BOTTOM = 42;

function waveStrand(cx: number, amp: number, wl: number) {
  let d = '';
  for (let y = STRAND_TOP; y <= STRAND_BOTTOM; y += 1.4) {
    const x = cx + amp * Math.sin((y - STRAND_TOP) * ((2 * Math.PI) / wl));
    d += `${d ? ' L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

function zigzagStrand(cx: number, amp: number, wl: number) {
  let d = '';
  let i = 0;
  for (let y = STRAND_TOP; y <= STRAND_BOTTOM; y += wl / 2) {
    const x = cx + (i % 2 ? amp : -amp);
    d += `${d ? ' L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    i++;
  }
  return d;
}

// 2D "slinky": x traces a circle while y advances; a tall y-oscillation makes
// the path cross itself into real loops/coils.
function coilStrand(cx: number, rx: number, pitch: number) {
  let d = '';
  const ry = pitch * 0.92;
  const totalT = ((STRAND_BOTTOM - STRAND_TOP) / pitch) * 2 * Math.PI;
  for (let t = 0; t <= totalT; t += 0.28) {
    const x = cx + rx * Math.cos(t);
    const y = STRAND_TOP + (pitch / (2 * Math.PI)) * t + ry * Math.sin(t);
    d += `${d ? ' L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

const STRANDS = (() => {
  const cfgs: Array<
    | { type: 'wave'; amp: number; wl: number }
    | { type: 'zig'; amp: number; wl: number }
    | { type: 'coil'; rx: number; pitch: number }
  > = [
    { type: 'wave', amp: 0, wl: 10 }, // 1 — straight
    { type: 'wave', amp: 1.3, wl: 24 }, // 2a
    { type: 'wave', amp: 2.0, wl: 17 }, // 2b
    { type: 'wave', amp: 2.8, wl: 13 }, // 2c
    { type: 'coil', rx: 2.2, pitch: 7 }, // 3a
    { type: 'coil', rx: 2.6, pitch: 5.6 }, // 3b
    { type: 'coil', rx: 2.8, pitch: 4.7 }, // 3c
    { type: 'coil', rx: 2.8, pitch: 3.9 }, // 4a
    { type: 'zig', amp: 2.0, wl: 3.6 }, // 4b
    { type: 'zig', amp: 2.2, wl: 2.7 }, // 4c
  ];
  const n = cfgs.length;
  const x0 = 16;
  const x1 = 74;
  return cfgs.map((c, i) => {
    const cx = x0 + ((x1 - x0) * i) / (n - 1);
    if (c.type === 'wave') return waveStrand(cx, c.amp, c.wl);
    if (c.type === 'zig') return zigzagStrand(cx, c.amp, c.wl);
    return coilStrand(cx, c.rx, c.pitch);
  });
})();

function CrownHair() {
  return (
    <Svg width={CROWN_W} height={(CROWN_W * 78) / 90} viewBox="0 -20 90 78">
      <G>
        {STRANDS.map((d, i) => (
          <Path
            key={i}
            d={d}
            fill="none"
            stroke={i % 2 ? '#241509' : '#160C06'}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </G>
    </Svg>
  );
}

// ─── The crown — two halves that break apart, then fuse ─────────────
function CrownHalf({ side }: { side: 'left' | 'right' }) {
  const d =
    side === 'left'
      ? 'M6 50 L6 39 L15 12 L29 33 L45 7 L45 50 Z'
      : 'M84 50 L84 39 L75 12 L61 33 L45 7 L45 50 Z';
  const gradId = `crownGrad-${side}`;
  return (
    <Svg width={CROWN_W} height={CROWN_H} viewBox="0 0 90 58">
      <Defs>
        <SvgLinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#F8E6B4" />
          <Stop offset="52%" stopColor="#D4A04A" />
          <Stop offset="100%" stopColor="#9C6C18" />
        </SvgLinearGradient>
      </Defs>
      <Path d={d} fill={`url(#${gradId})`} stroke="#7A5210" strokeWidth={0.6} strokeLinejoin="round" />
      {side === 'left' ? (
        <>
          <Circle cx="15" cy="11" r="2.4" fill="#C2456E" />
          <Circle cx="20" cy="45" r="1.8" fill="#7B3F6B" />
          <Circle cx="33" cy="45" r="1.8" fill="#2A7B7B" />
        </>
      ) : (
        <>
          <Circle cx="75" cy="11" r="2.4" fill="#1A7A4A" />
          <Circle cx="70" cy="45" r="1.8" fill="#7B3F6B" />
          <Circle cx="57" cy="45" r="1.8" fill="#2A7B7B" />
        </>
      )}
    </Svg>
  );
}

function Crown({ mend, gleam, accent }: { mend: SharedValue<number>; gleam: SharedValue<number>; accent: string }) {
  const leftStyle = useAnimatedStyle(() => {
    const m = mend.value;
    return {
      opacity: interpolate(m, [0, 1], [0.4, 1]),
      transform: [
        { translateX: interpolate(m, [0, 1], [-25, 0]) },
        { translateY: interpolate(m, [0, 1], [10, 0]) },
        { rotate: `${interpolate(m, [0, 1], [-17, 0])}deg` },
      ],
    };
  });
  const rightStyle = useAnimatedStyle(() => {
    const m = mend.value;
    return {
      opacity: interpolate(m, [0, 1], [0.4, 1]),
      transform: [
        { translateX: interpolate(m, [0, 1], [25, 0]) },
        { translateY: interpolate(m, [0, 1], [10, 0]) },
        { rotate: `${interpolate(m, [0, 1], [17, 0])}deg` },
      ],
    };
  });
  const gemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(mend.value, [0, 0.7, 1], [0, 0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(mend.value, [0.7, 1], [0.3, 1], Extrapolation.CLAMP) }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(mend.value, [0.4, 0.75, 1], [0, 0.9, 0], Extrapolation.CLAMP),
  }));
  const gleamStyle = useAnimatedStyle(() => ({
    opacity: interpolate(gleam.value, [0, 0.12, 0.85, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(gleam.value, [0, 1], [-CROWN_W * 0.7, CROWN_W * 1.3]) }, { rotate: '18deg' }],
  }));

  return (
    <View style={styles.crown}>
      <Animated.View pointerEvents="none" style={[styles.crownFlash, flashStyle]}>
        <Svg width={130} height={130}>
          <Defs>
            <RadialGradient id="flash" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFF6D8" stopOpacity={1} />
              <Stop offset="100%" stopColor="#FFF6D8" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={65} cy={65} r={65} fill="url(#flash)" />
        </Svg>
      </Animated.View>

      {/* curls sit under the crown band */}
      <View pointerEvents="none" style={styles.crownHair}>
        <CrownHair />
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, leftStyle]}>
        <CrownHalf side="left" />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, rightStyle]}>
        <CrownHalf side="right" />
      </Animated.View>

      {/* center jewel snaps in when halves meet */}
      <Animated.View pointerEvents="none" style={[styles.centerGem, gemStyle]}>
        <Svg width={18} height={18}>
          <Circle cx={9} cy={9} r={7.5} fill={accent} stroke="#FFF6D8" strokeWidth={1.4} />
        </Svg>
      </Animated.View>

      {/* gleam sweep across the metal */}
      <View pointerEvents="none" style={styles.gleamClip}>
        <Animated.View style={[styles.gleamBar, gleamStyle]}>
          <LinearGradient
            colors={['rgba(255,247,214,0)', 'rgba(255,247,214,0.9)', 'rgba(255,247,214,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

interface Props {
  name: string;
  chosenAuntyId: AuntyId;
  onComplete: () => void;
}

export function HandwrittenBlessing({ name, chosenAuntyId, onComplete }: Props) {
  const ac = auntyColors[chosenAuntyId];
  const others = COUNCIL_ORDER.filter((id) => id !== chosenAuntyId);

  const [skip, setSkip] = useState(false);
  const [phase, setPhase] = useState(0); // 0 broken → 1 needs someone → 2 aunty/mend → 3 council
  const finishedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mend = useSharedValue(0);
  const warm = useSharedValue(0);
  const sparkle = useSharedValue(0);
  const lift = useSharedValue(0);
  const gleam = useSharedValue(0);
  const rays = useSharedValue(0);
  const float = useSharedValue(0);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onComplete();
  }, [onComplete]);

  const arrive = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    warm.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.quad) });
    mend.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.back(1.5)) });
    lift.value = withDelay(250, withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
    const sid = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => {});
      sparkle.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0, { duration: 640 }));
      gleam.value = withTiming(1, { duration: 720, easing: Easing.inOut(Easing.quad) });
    }, 760);
    timers.current.push(sid);
  }, [warm, mend, lift, sparkle, gleam]);

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    rays.value = withRepeat(withTiming(1, { duration: 16000, easing: Easing.linear }), -1, false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});

    const schedule = (fn: () => void, at: number) => {
      const id = setTimeout(fn, at);
      timers.current.push(id);
    };
    schedule(() => setPhase(1), 2300);
    schedule(() => {
      setPhase(2);
      arrive();
    }, 3700);
    schedule(() => {
      setPhase(3);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 5500);
    schedule(finish, 7400);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      cancelAnimation(float);
      cancelAnimation(rays);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = useCallback(() => {
    if (finishedRef.current) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSkip(true);
    setPhase(3);
    warm.value = withTiming(1, { duration: 250 });
    mend.value = withTiming(1, { duration: 280 });
    lift.value = withTiming(1, { duration: 250 });
    gleam.value = 0;
    finish();
  }, [finish, warm, mend, lift, gleam]);

  const veilStyle = useAnimatedStyle(() => ({ opacity: interpolate(warm.value, [0, 1], [0.5, 0]) }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: warm.value }));
  const rayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(mend.value, [0, 0.6, 1], [0, 0, 0.85], Extrapolation.CLAMP),
    transform: [
      { rotate: `${interpolate(rays.value, [0, 1], [0, 360])}deg` },
      { scale: interpolate(mend.value, [0, 1], [0.7, 1]) },
    ],
  }));
  const crownHeroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(lift.value, [0, 1], [0, -14]) + interpolate(float.value, [0, 1], [0, -5]) },
      { scale: 1 + lift.value * 0.06 },
    ],
  }));
  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
    transform: [{ scale: interpolate(sparkle.value, [0, 1], [0.6, 1.3]) }],
  }));

  const enter = <T,>(anim: T): T | undefined => (skip ? undefined : anim);

  return (
    <Pressable style={styles.fill} onPress={handleSkip} accessibilityRole="button" accessibilityLabel="Continue">
      {/* cool veil that lifts as the aunty arrives */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.veil, veilStyle]} />

      {/* her jewel halo blooms on arrival */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, haloStyle]}>
        <Svg width={W} height={H}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="34%" r="58%">
              <Stop offset="0%" stopColor={ac.accent} stopOpacity={0.36} />
              <Stop offset="48%" stopColor={ac.accent} stopOpacity={0.1} />
              <Stop offset="100%" stopColor={ac.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={W} height={H} fill="url(#halo)" />
        </Svg>
      </Animated.View>

      <View style={styles.content}>
        {/* ── the crown stage ── */}
        <View style={styles.stage}>
          <Animated.View pointerEvents="none" style={[styles.rayWrap, rayStyle]}>
            <RayBurst accent={ac.accent} />
          </Animated.View>

          <Animated.View style={crownHeroStyle}>
            <Crown mend={mend} gleam={gleam} accent={ac.accent} />
            <Animated.View pointerEvents="none" style={[styles.sparkles, sparkleStyle]}>
              {SPARKS.map((s, i) => (
                <View key={i} style={[styles.spark, { left: s.x, top: s.y, width: s.r, height: s.r, borderRadius: s.r / 2 }]} />
              ))}
            </Animated.View>
          </Animated.View>
        </View>

        {/* ── the aunty arrives ── */}
        <View style={styles.auntySlot}>
          {phase >= 2 && (
            <Animated.View entering={enter(FadeInUp.duration(560).springify().damping(15))}>
              <AuntyAvatar auntyId={chosenAuntyId} size={84} showRing glowing />
            </Animated.View>
          )}
        </View>

        {/* ── the lines ── */}
        <View style={styles.lines}>
          <Animated.Text entering={enter(FadeInDown.delay(400).duration(520))} style={styles.line}>
            Your crown was never broken.
          </Animated.Text>

          {phase >= 1 && (
            <Animated.Text entering={enter(FadeInDown.duration(520))} style={styles.lineMuted}>
              It just needed someone who speaks its language.
            </Animated.Text>
          )}

          {phase >= 3 && (
            <Animated.Text entering={enter(FadeInDown.duration(560))} style={[styles.hero, { color: ac.text }]}>
              Now go make your aunty proud.
            </Animated.Text>
          )}
        </View>

        {/* ── the rest of the council floods in ── */}
        {phase >= 3 && (
          <Animated.View entering={enter(FadeIn.delay(220).duration(500))} style={styles.councilWrap}>
            <View style={styles.councilRow}>
              {others.map((id, i) => (
                <Animated.View key={id} entering={enter(ZoomIn.delay(280 + i * 75).duration(380).springify().damping(13))}>
                  <AuntyAvatar auntyId={id} size={40} showRing />
                </Animated.View>
              ))}
            </View>
            <Animated.Text entering={enter(FadeIn.delay(820).duration(500))} style={styles.councilCaption}>
              your council has your back, {name}
            </Animated.Text>
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

const SPARKS = [
  { x: 8, y: 6, r: 6 },
  { x: 120, y: 2, r: 5 },
  { x: 64, y: -10, r: 7 },
  { x: -4, y: 46, r: 5 },
  { x: 132, y: 50, r: 6 },
  { x: 70, y: 70, r: 5 },
  { x: 30, y: 64, r: 4 },
];

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  veil: { backgroundColor: '#23283C' },
  content: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 460,
    paddingHorizontal: spacing.xl,
    marginTop: -H * 0.02,
  },
  stage: { width: 280, height: 200, alignItems: 'center', justifyContent: 'center' },
  rayWrap: { position: 'absolute', width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  crown: { width: CROWN_W, height: CROWN_H, alignItems: 'center', justifyContent: 'center' },
  crownFlash: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  crownHair: { position: 'absolute', top: -33, left: 0 },
  centerGem: { position: 'absolute', top: 4, left: CROWN_W / 2 - 9 },
  gleamClip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  gleamBar: { position: 'absolute', top: -CROWN_H * 0.4, bottom: -CROWN_H * 0.4, width: CROWN_W * 0.45 },
  sparkles: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  spark: { position: 'absolute', backgroundColor: '#FFF1C2' },
  auntySlot: { height: 96, alignItems: 'center', justifyContent: 'center', marginTop: -spacing.sm },
  lines: { alignItems: 'center', marginTop: spacing.md, minHeight: 120 },
  line: {
    fontFamily: fonts.heading,
    fontSize: 23,
    lineHeight: 31,
    letterSpacing: -0.3,
    color: colors.ink,
    textAlign: 'center',
  },
  lineMuted: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  hero: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  councilWrap: { alignItems: 'center', marginTop: spacing.lg },
  councilRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', justifyContent: 'center' },
  councilCaption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.md,
    letterSpacing: 0.2,
  },
});
