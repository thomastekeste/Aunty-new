/**
 * SpeechBubble — Line-flip narrative text.
 *
 * Replaces word-by-word `WordReveal`. Each line cross-fades in place,
 * holds for a beat, then either advances to the next line or fires
 * `onComplete`. No stacking, no typer — feels editorial, not chat-bot.
 *
 * Optional gold shimmer sweeps once across the active line for the
 * "Polaroid developing" finish. Set `shimmer={false}` to disable.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../constants/theme';

interface Props {
  lines: string[];
  /** ms each line stays visible after its fade-in completes. Default 1400. */
  holdMs?: number;
  /** ms for cross-fade between lines. Default 320. */
  fadeMs?: number;
  /** Show the gold shimmer sweep across the active line. Default true. */
  shimmer?: boolean;
  /** Run shimmer only once on a single line that holds. Default false. */
  loopShimmer?: boolean;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onComplete?: () => void;
  /** Fired when each line lands (after fade-in). */
  onLineLanded?: (index: number) => void;
}

export function SpeechBubble({
  lines,
  holdMs = 1400,
  fadeMs = 320,
  shimmer = true,
  loopShimmer = false,
  textStyle,
  containerStyle,
  onComplete,
  onLineLanded,
}: Props) {
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(0);
  const translate = useSharedValue(8);
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    if (index >= lines.length) return;

    opacity.value = 0;
    translate.value = 8;
    shimmerX.value = -1;

    opacity.value = withTiming(1, { duration: fadeMs, easing: Easing.out(Easing.cubic) });
    translate.value = withTiming(0, { duration: fadeMs, easing: Easing.out(Easing.cubic) });

    if (shimmer) {
      shimmerX.value = withDelay(
        fadeMs + 150,
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          ...(loopShimmer ? [withTiming(-1, { duration: 0 })] : []),
        ),
      );
    }

    onLineLanded?.(index);

    const advanceAt = fadeMs + holdMs;
    const isLast = index === lines.length - 1;

    const t = setTimeout(() => {
      if (isLast) {
        opacity.value = withTiming(1, { duration: 0 });
        onComplete?.();
        return;
      }
      opacity.value = withTiming(0, { duration: fadeMs, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(setIndex)(index + 1);
      });
    }, advanceAt);

    return () => clearTimeout(t);
  }, [index, lines, fadeMs, holdMs, shimmer, loopShimmer]);

  const lineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const x = interpolate(shimmerX.value, [-1, 1], [-200, 200]);
    return {
      transform: [{ translateX: x }],
      opacity: interpolate(shimmerX.value, [-1, -0.5, 0, 0.5, 1], [0, 0.6, 1, 0.6, 0]),
    };
  });

  if (index >= lines.length) {
    return (
      <View style={containerStyle}>
        <Text style={textStyle}>{lines[lines.length - 1]}</Text>
      </View>
    );
  }

  const current = lines[index];

  return (
    <View style={containerStyle}>
      <Animated.View style={lineAnimatedStyle}>
        {shimmer ? (
          <MaskedView
            maskElement={
              <View>
                <Text style={[textStyle, { backgroundColor: 'transparent' }]}>{current}</Text>
              </View>
            }
          >
            <View>
              <Text style={textStyle}>{current}</Text>
              <Animated.View style={[StyleSheet.absoluteFillObject, shimmerAnimatedStyle]} pointerEvents="none">
                <LinearGradient
                  colors={[...gradients.goldShimmer]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </MaskedView>
        ) : (
          <Text style={textStyle}>{current}</Text>
        )}
      </Animated.View>
    </View>
  );
}
