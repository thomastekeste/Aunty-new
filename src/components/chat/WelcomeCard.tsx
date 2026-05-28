/**
 * WelcomeCard — Premium intro card for new/empty conversations.
 *
 * Shows the aunty's avatar, name, title, greeting (with shimmer),
 * and sign-off. Replaces the plain greeting message bubble.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuntyAvatar } from '../AuntyAvatar';
import { SpeechBubble } from '../SpeechBubble';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  typography,
  letterSpacing,
} from '../../constants/theme';
import type { Aunty, AuntyId } from '../../constants/aunties';

interface Props {
  auntyId: AuntyId;
  aunty: Aunty;
  accentColor: string;
  gradient: [string, string];
}

export function WelcomeCard({ auntyId, aunty, accentColor, gradient }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(100)}
      style={styles.container}
    >
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Accent top bar */}
        <View style={[styles.topBar, { backgroundColor: accentColor }]} />

        <View style={styles.content}>
          <AuntyAvatar auntyId={auntyId} size={72} showRing glowing />

          <Text style={styles.name}>{aunty.name}</Text>
          <Text style={[styles.title, { color: accentColor }]}>{aunty.title}</Text>

          <View style={styles.greetingContainer}>
            <SpeechBubble
              lines={[aunty.greeting]}
              shimmer
              loopShimmer={false}
              quoteMarkColor={accentColor}
              textStyle={styles.greetingText}
              containerStyle={styles.speechContainer}
            />
          </View>

          <Text style={[styles.signOff, { color: accentColor }]}>
            {aunty.signOff}
          </Text>

          <Text style={styles.disclosure}>AI-powered character</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(45, 27, 14, 0.06)',
  },
  topBar: {
    height: 3,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginTop: spacing.md,
  },
  title: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  greetingContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  speechContainer: {
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.5,
    color: colors.ink,
    textAlign: 'center',
  },
  signOff: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
  },
  disclosure: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs - 1,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
