/**
 * WordReveal — Word-by-word text reveal.
 *
 * Words appear one at a time. The latest word fades in slightly
 * while previous words are fully visible. Feels like someone
 * is speaking, not a teleprometer scrolling.
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { Text, Animated as RNAnimated } from 'react-native';
import { colors, fonts, fontSize as fs } from '../constants/theme';

interface Props {
  text: string;
  stagger?: number;
  onComplete?: () => void;
  style?: any;
}

export const WordReveal = memo(function WordReveal({ text, stagger = 85, onComplete, style }: Props) {
  const words = useRef(text.split(' ')).current;
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calledComplete = useRef(false);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    calledComplete.current = false;
    setCount(0);

    let i = 0;
    const tick = () => {
      i++;
      if (i <= words.length) {
        setCount(i);
        // Fade in the newest word
        fadeAnim.setValue(0);
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: stagger * 0.8,
          useNativeDriver: true,
        }).start();
        timerRef.current = setTimeout(tick, stagger);
      } else if (!calledComplete.current) {
        calledComplete.current = true;
        onComplete?.();
      }
    };

    timerRef.current = setTimeout(tick, stagger);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, stagger]);

  // Split into revealed words and the latest word
  const revealed = words.slice(0, Math.max(0, count - 1)).join(' ');
  const latest = count > 0 ? words[count - 1] : '';

  return (
    <Text style={[baseStyle, style]}>
      {revealed}{revealed ? ' ' : ''}
      <RNAnimated.Text style={{ opacity: fadeAnim }}>{latest}</RNAnimated.Text>
    </Text>
  );
});

const baseStyle = {
  fontFamily: fonts.body,
  fontSize: fs.base,
  color: colors.dark.text,
  lineHeight: fs.base * 1.6,
};
