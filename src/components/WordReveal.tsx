/**
 * WordReveal — Clean word-by-word text reveal.
 *
 * One timer chain. One state update per word. No animation library.
 * The text simply grows word by word. Clean and reliable.
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

export const WordReveal = memo(function WordReveal({ text, stagger = 85, onComplete, style }: Props) {
  const [count, setCount] = useState(0);
  const wordsRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const mountedRef = useRef(true);

  // Keep onComplete ref fresh
  onCompleteRef.current = onComplete;

  // Parse words when text changes
  useEffect(() => {
    wordsRef.current = text.split(' ');
    setCount(0);
    mountedRef.current = true;

    let i = 0;
    const total = wordsRef.current.length;

    const tick = () => {
      i++;
      if (!mountedRef.current) return;

      if (i <= total) {
        setCount(i);
        timerRef.current = setTimeout(tick, stagger);
      } else {
        onCompleteRef.current?.();
      }
    };

    timerRef.current = setTimeout(tick, stagger);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, stagger]);

  const visible = wordsRef.current.slice(0, count).join(' ');

  return (
    <Text style={[baseStyle, style]}>
      {visible}
    </Text>
  );
});

const baseStyle = {
  fontFamily: fonts.body,
  fontSize: fs.base,
  color: colors.dark.text,
  lineHeight: fs.base * 1.6,
};
