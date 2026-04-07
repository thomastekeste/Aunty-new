import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, fontSize } from '../constants/theme';

interface Props {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: any;
}

export function TypewriterText({ text, speed = 25, onComplete, style }: Props) {
  const [count, setCount] = useState(0);
  const done = count >= text.length;
  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    cursorOpacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
  }, []);

  useEffect(() => {
    if (done) {
      onComplete?.();
      return;
    }
    const id = setInterval(() => setCount((c) => c + 1), speed);
    return () => clearInterval(id);
  }, [done, speed]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: done ? 0 : cursorOpacity.value,
  }));

  return (
    <Text style={[{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.dark.text, lineHeight: fontSize.base * 1.6 }, style]}>
      {text.slice(0, count)}
      <Animated.Text style={[{ color: colors.primary, fontFamily: fonts.bodyBold }, cursorStyle]}>|</Animated.Text>
    </Text>
  );
}
