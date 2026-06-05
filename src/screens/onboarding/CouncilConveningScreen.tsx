/**
 * CouncilConveningScreen — The ceremony.
 *
 * Seven aunties orbit a central gold medallion. As each status message
 * appears, the corresponding aunty's portrait pulses gold and her name
 * surfaces. A slow ring of particles rotates behind everything.
 * Below: the scroll — each completed step draws a hairline rule that
 * lands a gold check on its right.
 *
 * API + fallback logic preserved from the previous implementation.
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { AUNTIES, COUNCIL_ORDER } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { analyzePhoto, API_URL } from '../../services/api';
import { supabase } from '../../services/supabase';
import type { OnboardingStackParamList, CouncilResponse, WeeklyRitual, PhotoAnalysis } from '../../types';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  gradients,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CouncilConvening'>;

const { width: SCREEN_W } = Dimensions.get('window');
const MIN_DISPLAY_TIME = 5400;

const ORBIT_RADIUS = Math.min(SCREEN_W * 0.36, 150);
const AVATAR_SIZE = 44;
const MEDALLION_SIZE = 96;

// ─── Status / scroll content ──────────────────────────────────
function getStatusForAunty(auntyId: AuntyId, name: string, profile: any): string {
  const ct = profile?.curlType || '3c';
  const por = profile?.porosity || 'normal';
  const goal = profile?.primaryGoal || 'moisture';

  switch (auntyId) {
    case 'ngozi':
      return `Ngozi is reading your ${ct}, ${name}…`;
    case 'marcia':
      return `Marcia is checking your ${por} porosity…`;
    case 'denise':
      return `Denise is mapping your wash day…`;
    case 'fatou':
      return 'Fatou is refining the technique…';
    case 'carmen':
      return `Carmen is choosing for ${goal}…`;
    case 'amara':
      return 'Senayt is laying the foundation…';
    case 'salma':
      return `Almost there, ${name} — Salma is finalizing your plan…`;
    default:
      return `${name}, the council is convening…`;
  }
}

// Scroll items are built dynamically based on whether photos were captured
function getScrollItems(hasPhotos: boolean): string[] {
  const items = ['Hair profile reviewed'];
  if (hasPhotos) items.push('Photo analyzed');
  items.push('Routine drafted', 'Products vetted', 'Plan signed by the council');
  return items;
}

// ─── Mock data ─────────────────────────────────────────────────
function generateMockCouncilResponse(name: string, profile: Record<string, any>): CouncilResponse {
  const curlLabel = profile.curlType?.startsWith('2')
    ? 'wavy'
    : profile.curlType?.startsWith('3')
    ? 'curly'
    : 'coily';

  return {
    auntyMessages: {
      ngozi: `${name}, your ${curlLabel} hair needs deep moisture. Let Aunty Ngozi handle this, no wahala.`,
      marcia: `Di roots look strong, ${name}. We just need to feed dem proper with castor oil.`,
      denise: `Baby, I've seen this before. We gon' get your routine right. Trust the process.`,
      fatou: `Your technique needs refinement, ch\u00e9rie. Precision is beauty.`,
      carmen: `Ay ${name}! Those curls have so much potential! We're going to make them pop!`,
      amara: 'Dear one, we will build strength into every strand. Patience and protein.',
      salma: 'Habibi, when we find balance between moisture and protein, everything flows.',
    },
    consensus: `${name}, I've reviewed everything. Your hair journey begins with a personalized plan crafted just for you, with love and expertise.`,
    hairProfileSummary: `${curlLabel} hair with ${profile.porosity || 'normal'} porosity`,
    keyFindings: [
      'Your moisture-protein balance needs attention',
      'Scalp health is the foundation for growth',
      'Consistency with gentle techniques will show results',
    ],
  };
}

function generateMockRoutine(): WeeklyRitual {
  return {
    id: 'mock-ritual-1',
    weekNumber: 1,
    theme: 'Foundation Week',
    isActive: true,
    days: [
      {
        dayOfWeek: 0, type: 'wash', label: 'Wash Day', hostAunty: 'ngozi',
        purpose: 'Deep cleanse and moisture reset.',
        estimatedTime: '45 min',
        steps: [
          { name: 'Pre-poo', description: 'Apply coconut oil to dry hair', duration: '5 min' },
          { name: 'Clarify', description: 'Sulfate-free shampoo, focus on scalp', duration: '5 min' },
          { name: 'Deep condition', description: 'Shea butter mask under heat cap', duration: '20 min' },
          { name: 'Rinse & seal', description: 'Cool rinse, LOC method', duration: '10 min' },
        ],
      },
      {
        dayOfWeek: 1, type: 'style', label: 'Style Day', hostAunty: 'carmen',
        purpose: 'Define and set your curls for the week.',
        estimatedTime: '30 min',
        steps: [
          { name: 'Apply styler', description: 'Gel or cream in sections', duration: '10 min' },
          { name: 'Define', description: 'Finger coil or brush styling', duration: '15 min' },
          { name: 'Dry', description: 'Diffuse or air dry', duration: '5 min' },
        ],
      },
      {
        dayOfWeek: 3, type: 'refresh', label: 'Refresh Day', hostAunty: 'fatou',
        purpose: 'Revive your style mid-week.',
        estimatedTime: '15 min',
        steps: [
          { name: 'Mist', description: 'Light water spray', duration: '2 min' },
          { name: 'Re-twist', description: 'Fix edges and frizzy sections', duration: '8 min' },
          { name: 'Seal', description: 'Light oil on ends', duration: '5 min' },
        ],
      },
      {
        dayOfWeek: 5, type: 'rest', label: 'Rest Day', hostAunty: 'salma',
        purpose: 'Let your hair breathe and recover.',
        estimatedTime: '5 min',
        steps: [
          { name: 'Scalp massage', description: 'Gentle circular motions with argan oil', duration: '3 min' },
          { name: 'Refresh edges', description: 'Light mist and smooth', duration: '2 min' },
        ],
      },
    ],
  };
}

// ─── Orbiting aunty portrait ───────────────────────────────────
function OrbitAvatar({
  auntyId,
  angle,
  active,
  index,
}: {
  auntyId: AuntyId;
  angle: number;
  active: boolean;
  index: number;
}) {
  const ac = auntyColors[auntyId];
  const pulse = useSharedValue(1);
  const haloOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withSequence(
        withSpring(1.18, { damping: 10, stiffness: 180 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
      haloOpacity.value = withSequence(
        withTiming(0.55, { duration: 220 }),
        withTiming(0, { duration: 1100 }),
      );
    }
  }, [active]);

  const x = Math.cos(angle) * ORBIT_RADIUS;
  const y = Math.sin(angle) * ORBIT_RADIUS;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x }, { translateY: y }, { scale: pulse.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ translateX: x }, { translateY: y }],
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.orbitHalo, { backgroundColor: ac.accent }, haloStyle]}
      />
      <Animated.View
        entering={FadeIn.delay(180 + index * 80).duration(420)}
        style={[styles.orbitItem, animatedStyle]}
      >
        <AuntyAvatar auntyId={auntyId} size={AVATAR_SIZE} showRing={active} glowing={active} />
      </Animated.View>
    </>
  );
}

// ─── Gold medallion (center) ───────────────────────────────────
function GoldMedallion() {
  const rot = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    rot.value = withRepeat(withTiming(1, { duration: 22000, easing: Easing.linear }), -1, false);
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rot.value, [0, 1], [0, 360])}deg` }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <View style={styles.medallion} pointerEvents="none">
      <Animated.View style={[styles.medallionRing, ringStyle]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <View
              key={i}
              style={[
                styles.medallionTick,
                {
                  transform: [
                    { translateX: Math.cos(a) * (MEDALLION_SIZE / 2 + 6) },
                    { translateY: Math.sin(a) * (MEDALLION_SIZE / 2 + 6) },
                  ],
                },
              ]}
            />
          );
        })}
      </Animated.View>
      <Animated.View style={[styles.medallionCore, coreStyle]}>
        <LinearGradient
          colors={[...gradients.councilGold]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.medallionFill}
        />
        <View style={styles.medallionInnerRing} />
        <Text style={styles.medallionGlyph}>{'\u2756'}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Slow rotating particle field ──────────────────────────────
function ParticleField() {
  const rot = useSharedValue(0);

  useEffect(() => {
    rot.value = withRepeat(withTiming(1, { duration: 60000, easing: Easing.linear }), -1, false);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rot.value, [0, 1], [0, 360])}deg` }],
  }));

  const particles = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const angle = (i / 36) * Math.PI * 2 + (i % 3) * 0.4;
      const r = 60 + (i % 5) * 36;
      const size = 1.5 + (i % 4) * 0.7;
      const opacity = 0.12 + ((i % 7) * 0.03);
      return {
        key: i,
        left: Math.cos(angle) * r,
        top: Math.sin(angle) * r,
        size,
        opacity,
      };
    });
  }, []);

  return (
    <Animated.View style={[styles.particleField, style]} pointerEvents="none">
      {particles.map((p) => (
        <View
          key={p.key}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: colors.primary,
            opacity: p.opacity,
          }}
        />
      ))}
    </Animated.View>
  );
}

// ─── Scroll item with hairline draw + gold check ───────────────
function ScrollItem({ label, done, index }: { label: string; done: boolean; index: number }) {
  const lineWidth = useSharedValue(done ? 1 : 0);
  const checkScale = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    if (done) {
      lineWidth.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      checkScale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 220 }));
    }
  }, [done]);

  const lineStyle = useAnimatedStyle(() => ({
    width: `${interpolate(lineWidth.value, [0, 1], [0, 100])}%`,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(280)} style={styles.scrollRow}>
      <Text style={[styles.scrollLabel, done && styles.scrollLabelDone]}>{label}</Text>
      <View style={styles.scrollLineWrap}>
        <Animated.View style={[styles.scrollLine, lineStyle]} />
      </View>
      <Animated.View style={[styles.scrollCheck, checkStyle]}>
        <Text style={styles.scrollCheckGlyph}>{'\u2713'}</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Screen ────────────────────────────────────────────────────
export default function CouncilConveningScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state, setCouncilResponse, setRoutine, setPhotoAnalysis } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const { hairProfile, name, photos } = state.data;
  const hasPhotos = !!(photos?.front || photos?.back || photos?.closeup);
  const scrollItems = useMemo(() => getScrollItems(hasPhotos), [hasPhotos]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollDone, setScrollDone] = useState(0);
  const [completed, setCompleted] = useState(false);

  const apiDone = useRef(false);
  const minTimePassed = useRef(false);

  const orderedAunties = COUNCIL_ORDER;
  const angles = useMemo(() => {
    const n = orderedAunties.length;
    return orderedAunties.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2);
  }, [orderedAunties]);

  const tryNavigate = () => {
    if (apiDone.current && minTimePassed.current && !completed) {
      setCompleted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => navigation.replace('CouncilVerdict'), 700);
    }
  };

  const fetchCouncilData = async () => {
    try {
      // Analyze the photo FIRST (capped) so the council can actually use what
      // it sees. Falls back gracefully if there's no photo or it times out —
      // the council still runs on the self-reported profile.
      let photoAnalysis: PhotoAnalysis | null = null;
      const photoUri = photos?.front || photos?.back || photos?.closeup;
      if (photoUri) {
        try {
          const res = await Promise.race([
            analyzePhoto(photoUri),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('photo-analysis-timeout')), 15000),
            ),
          ]);
          photoAnalysis = (res as { analysis: PhotoAnalysis }).analysis ?? null;
          if (photoAnalysis) setPhotoAnalysis(photoAnalysis);
        } catch (err) {
          console.warn('[CouncilConvening] Photo analysis skipped:', err);
        }
      }

      // Get auth token for API calls
      const { data: { session } } = await supabase!.auth.getSession();
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      };

      // Single merged call: council verdict + week-1 routine in one round trip.
      // Capped so a slow backend can't stall onboarding — on timeout we fall
      // through to the instant starter plan below and the screen always moves.
      const fullRes = await Promise.race([
        fetch(`${API_URL}/api/council/generate-full`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ name, hairProfile, photoAnalysis }),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('council-timeout')), 28000),
        ),
      ]);
      if (!fullRes.ok) throw new Error(`Council API error: ${fullRes.status}`);
      const { councilResponse: councilData, routine: routineData } =
        (await fullRes.json()) as { councilResponse: CouncilResponse; routine: WeeklyRitual };
      setCouncilResponse(councilData);
      setRoutine(routineData);

      apiDone.current = true;
      tryNavigate();
    } catch (error) {
      // Graceful fallback — onboarding must never dead-end if the backend is
      // unreachable (no network, server down, cold start). The user gets a
      // sensible starter plan and can continue; richer AI content loads later
      // in-app once the API is reachable.
      console.warn('[CouncilConvening] API failed, using fallback plan:', error);
      setCouncilResponse(generateMockCouncilResponse(name || 'Love', hairProfile));
      setRoutine(generateMockRoutine());
      apiDone.current = true;
      tryNavigate();
    }
  };

  useEffect(() => {
    const auntyTimer = setInterval(() => {
      setActiveIdx((i) => {
        const next = (i + 1) % orderedAunties.length;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return next;
      });
    }, 1100);

    const scrollTimers = scrollItems.map((_, i) =>
      setTimeout(() => setScrollDone(i + 1), 900 + i * 1200),
    );

    const minTimer = setTimeout(() => {
      minTimePassed.current = true;
      tryNavigate();
    }, MIN_DISPLAY_TIME);

    fetchCouncilData();

    return () => {
      clearInterval(auntyTimer);
      clearTimeout(minTimer);
      scrollTimers.forEach(clearTimeout);
    };
  }, []);

  const activeAunty = orderedAunties[activeIdx];
  const statusLine = getStatusForAunty(activeAunty, name || 'Love', hairProfile);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      accessibilityLabel={`The council is convening. ${aunty.name} is finalizing your plan.`}
    >
      {/* Top label */}
      <Animated.Text entering={FadeIn.duration(500)} style={styles.eyebrow}>
        THE COUNCIL CONVENES
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(200).duration(500)}
        style={[styles.title, { color: ac.accent }]}
      >
        Your hair is being heard
      </Animated.Text>

      {/* Orbit */}
      <View style={styles.orbitWrap}>
        <ParticleField />
        <GoldMedallion />
        {orderedAunties.map((id, i) => (
          <OrbitAvatar key={id} auntyId={id} angle={angles[i]} active={i === activeIdx} index={i} />
        ))}
      </View>

      {/* Status line */}
      <View style={styles.statusWrap}>
        <Animated.Text
          key={`status-${activeIdx}`}
          entering={FadeIn.duration(420)}
          exiting={FadeOut.duration(220)}
          style={styles.statusText}
        >
          {statusLine}
        </Animated.Text>
      </View>

      {/* Scroll */}
      <View style={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}>
        {scrollItems.map((item, i) => (
          <ScrollItem key={item} label={item} done={i < scrollDone} index={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 3,
    marginTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    letterSpacing: -0.4,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Orbit container
  orbitWrap: {
    width: ORBIT_RADIUS * 2 + AVATAR_SIZE * 2,
    height: ORBIT_RADIUS * 2 + AVATAR_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },

  // Particles
  particleField: {
    position: 'absolute',
    width: ORBIT_RADIUS * 2 + AVATAR_SIZE * 2,
    height: ORBIT_RADIUS * 2 + AVATAR_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Medallion
  medallion: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: MEDALLION_SIZE + 24,
    height: MEDALLION_SIZE + 24,
  },
  medallionRing: {
    position: 'absolute',
    width: MEDALLION_SIZE + 24,
    height: MEDALLION_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionTick: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4A04A',
    opacity: 0.55,
  },
  medallionCore: {
    width: MEDALLION_SIZE,
    height: MEDALLION_SIZE,
    borderRadius: MEDALLION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#D4A04A',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  medallionFill: {
    ...StyleSheet.absoluteFillObject,
  },
  medallionInnerRing: {
    position: 'absolute',
    width: MEDALLION_SIZE - 14,
    height: MEDALLION_SIZE - 14,
    borderRadius: (MEDALLION_SIZE - 14) / 2,
    borderWidth: 1,
    borderColor: 'rgba(58, 34, 8, 0.45)',
  },
  medallionGlyph: {
    fontSize: 28,
    color: '#3A2208',
  },

  // Orbit avatars
  orbitItem: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitHalo: {
    position: 'absolute',
    width: AVATAR_SIZE + 28,
    height: AVATAR_SIZE + 28,
    borderRadius: (AVATAR_SIZE + 28) / 2,
  },

  // Status
  statusWrap: {
    minHeight: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  statusText: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.md,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
  },

  // Scroll
  scroll: {
    width: '100%',
    marginTop: spacing.lg,
    flex: 1,
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scrollLabel: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
    color: colors.muted,
    minWidth: 180,
  },
  scrollLabelDone: {
    color: colors.ink,
    fontFamily: fonts.serifSemiBold,
  },
  scrollLineWrap: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  scrollLine: {
    height: 1,
    backgroundColor: '#D4A04A',
  },
  scrollCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D4A04A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollCheckGlyph: {
    color: '#3A2208',
    fontSize: 12,
    fontFamily: fonts.bodyBold,
  },

});
