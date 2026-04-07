/**
 * WordReveal — Word-by-word text reveal using a ref-based timer.
 *
 * Avoids per-word re-renders by using a ref for the timer
 * and only updating state when a new word is ready.
 * Renders the full text but only shows words up to the current count.
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Text } from 'react-native';
import { colors, fonts, fontSize as fs } from '../constants/theme';

interface Props {
  text: string;
  stagger?: number;
  onComplete?: () => void;
  style?: any;
}

export const WordReveal = memo(function WordReveal({ text, stagger = 70, onComplete, style }: Props) {
  const words = useRef(text.split(' ')).current;
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calledComplete = useRef(false);

  useEffect(() => {
    calledComplete.current = false;
    setCount(0);

    let i = 0;
    const tick = () => {
      i++;
      if (i <= words.length) {
        setCount(i);
        timerRef.current = setTimeout(tick, stagger);
      } else if (!calledComplete.current) {
        calledComplete.current = true;
        onComplete?.();
      }
    };

    timerRef.current = setTimeout(tick, stagger);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, stagger]);

  return (
    <Text style={[baseStyle, style]}>
      {words.slice(0, count).join(' ')}
    </Text>
  );
});

const baseStyle = {
  fontFamily: fonts.body,
  fontSize: fs.base,
  color: colors.dark.text,
  lineHeight: fs.base * 1.6,
};
