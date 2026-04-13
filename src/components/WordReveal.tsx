/**
 * WordReveal — Ultra-smooth spring-physics word reveal.
 *
 * Each word springs into place with real mass + damping.
 * withSpring feels alive. withTiming feels mechanical.
 */

import React, { useEffect, memo } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { colors, fonts, fontSize as fs } from '../constants/theme';

interface Props {
  text: string;
  stagger?: number;
  onComplete?: () => void;
  style?: any;
}

// Spring config: quick settle, no bounce, very natural
const SPRING = {
  damping: 18,
  stiffness: 130,
  mass: 0.4,
  overshootClamping: false,
};

const FadeWord = memo(function FadeWord({
  word,
  delay,
  isLast,
  onComplete,
}: {
  word: string;
  delay: number;
  isLast: boolean;
  onComplete?: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, SPRING));
    translateY.value = withDelay(
      delay,
      withSpring(0, SPRING, (finished) => {
        'worklet';
        if (finished && isLast && onComplete) {
          runOnJS(onComplete)();
        }
      }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.Text style={style}>{word} </Animated.Text>;
});

export const WordReveal = memo(function WordReveal({
  text,
  stagger = 65,
  onComplete,
  style,
}: Props) {
  const words = text.split(' ');

  return (
    <Text
      style={[
        {
          fontFamily: fonts.body,
          fontSize: fs.base,
          color: colors.dark.text,
          lineHeight: fs.base * 1.6,
        },
        style,
      ]}
    >
      {words.map((word, i) => (
        <FadeWord
          key={`${word}-${i}`}
          word={word}
          delay={i * stagger}
          isLast={i === words.length - 1}
          onComplete={onComplete}
        />
      ))}
    </Text>
  );
});
