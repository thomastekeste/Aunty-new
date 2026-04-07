/**
 * ValuePreviewScreen — Quick value preview before consultation begins.
 *
 * Shows what the user is working toward. Dark ceremony background.
 * Chosen aunty avatar at top. Three lines with staggered word reveal.
 * Auto-advances to NameEntry after all lines appear, or user taps CTA.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { WordReveal } from '../../components/WordReveal';
import { Button } from '../../components/Button';
import { AUNTIES } from '../../constants/aunties';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  gradients,
  letterSpacing,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ValuePreview'>;
const { height: SCREEN_H } = Dimensions.get('window');

const LINES = [
  'In 4 weeks, you\'ll see what routine and intention can do.',
  'No more guessing. No more wasting money.',
  'Let\'s build your plan.',
];

export default function ValuePreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useOnboarding();

  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  // 0=avatar entrance, 1=line1, 2=line2, 3=line3, 4=button visible
  const [phase, setPhase] = useState(0);

  const btnOpacity = useSharedValue(0);
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
  }));

  // Start line reveal after avatar entrance
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 800);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance after button appears
  useEffect(() => {
    if (phase === 4) {
      const t = setTimeout(() => {
        navigation.navigate('NameEntry');
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [phase, navigation]);

  const showButton = () => {
    btnOpacity.value = withTiming(1, { duration: 400 });
    setPhase(4);
  };

  return (
    <LinearGradient
      colors={[...gradients.ceremony]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        {/* Aunty avatar with glow */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.avatarWrap}>
          <View style={[styles.glow, { backgroundColor: ac.accent }]} />
          <AuntyAvatar auntyId={auntyId} size={80} showRing glowing />
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(600)} style={[styles.label, { color: ac.accent }]}>
          {aunty.name.toUpperCase()}
        </Animated.Text>

        {/* Three lines — word by word, staggered */}
        <View style={styles.monologue}>
          {phase >= 1 && (
            <WordReveal
              key="line1"
              text={LINES[0]}
              stagger={85}
              onComplete={() => setTimeout(() => setPhase(2), 900)}
              style={styles.line}
            />
          )}

          {phase >= 2 && (
            <Animated.View entering={FadeIn.duration(250)} style={{ marginTop: spacing.lg }}>
              <WordReveal
                key="line2"
                text={LINES[1]}
                stagger={85}
                onComplete={() => setTimeout(() => setPhase(3), 900)}
                style={[styles.line, { color: ac.accent }]}
              />
            </Animated.View>
          )}

          {phase >= 3 && (
            <Animated.View entering={FadeIn.duration(250)} style={{ marginTop: spacing.lg }}>
              <WordReveal
                key="line3"
                text={LINES[2]}
                stagger={90}
                onComplete={() => setTimeout(showButton, 700)}
                style={styles.line}
              />
            </Animated.View>
          )}
        </View>

        {/* Gold accent rule */}
        {phase >= 3 && (
          <Animated.View entering={FadeIn.delay(300)} style={[styles.rule, { backgroundColor: ac.accent }]} />
        )}

        <View style={{ flex: 1 }} />

        {/* CTA button */}
        <Animated.View style={[styles.btnWrap, btnStyle]}>
          <Button
            label="Let's Start"
            onPress={() => navigation.navigate('NameEntry')}
            variant="primary"
            size="lg"
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },

  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.18,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.xxl,
  },

  monologue: {
    width: '100%',
    minHeight: SCREEN_H * 0.28,
  },
  line: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.dark.text,
    lineHeight: fontSize.xxl * 1.35,
    letterSpacing: letterSpacing.tight,
  },

  rule: {
    width: 32,
    height: 2,
    opacity: 0.5,
    borderRadius: 1,
    marginTop: spacing.xl,
  },

  btnWrap: {
    width: '100%',
    marginBottom: spacing.md,
  },
});
