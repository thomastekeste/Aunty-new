/**
 * AuntyDialogue — character-by-character typewriter for the aunty's voice.
 *
 * Replaces the SpeechBubble line cross-fade everywhere the aunty *speaks*
 * (intro, interludes, verdict). Each line types out one character at a time
 * with a soft blinking caret and natural micro-pauses on punctuation, holds,
 * then advances. Same callback surface as SpeechBubble (`lines`,
 * `onLineLanded`, `onComplete`) so it drops in cleanly.
 *
 * All callers should pass the shared `dialogueText` style so every spoken
 * line looks identical (same font + boldness) across screens.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { fontSize } from '../constants/theme';

interface Props {
  lines: string[];
  /** ms per character. Default 34 (~30 cps). */
  charMs?: number;
  /** ms a finished line holds before advancing. Default 1100. */
  holdMs?: number;
  /** ms before the first character starts. Default 0. */
  startDelayMs?: number;
  /** Editorial open-quote ornament above the text. Pass a color to show it. */
  quoteMarkColor?: string;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  /** Fired when each line finishes typing. */
  onLineLanded?: (index: number) => void;
  onComplete?: () => void;
}

// Extra pause (ms) after punctuation, for natural cadence.
function pauseAfter(ch: string): number {
  if (ch === '.' || ch === '!' || ch === '?') return 260;
  if (ch === ',' || ch === '—' || ch === ';' || ch === ':') return 150;
  return 0;
}

export function AuntyDialogue({
  lines,
  charMs = 34,
  holdMs = 1100,
  startDelayMs = 0,
  quoteMarkColor,
  textStyle,
  containerStyle,
  onLineLanded,
  onComplete,
}: Props) {
  const [lineIndex, setLineIndex] = useState(0);
  const [shown, setShown] = useState('');

  // Key the typing off the CONTENT, not the array identity — parents often
  // recompute `lines` on every render (new reference, same text), and we must
  // not restart/repeat the typer just because the screen re-rendered.
  const linesKey = lines.join('\u0001');
  const linesRef = useRef(lines);
  linesRef.current = lines;

  // Once we've typed the whole thing, stay done until the content changes.
  const completedRef = useRef(false);

  // Latest callbacks without re-triggering the typing effect.
  const onLineLandedRef = useRef(onLineLanded);
  const onCompleteRef = useRef(onComplete);
  onLineLandedRef.current = onLineLanded;
  onCompleteRef.current = onComplete;

  // New dialogue content -> start over from the first line.
  useEffect(() => {
    completedRef.current = false;
    setLineIndex(0);
    setShown('');
  }, [linesKey]);

  // Blinking caret.
  const caret = useSharedValue(1);
  useEffect(() => {
    caret.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 480, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 480, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [caret]);
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  useEffect(() => {
    const arr = linesRef.current;
    if (completedRef.current) return;
    if (lineIndex >= arr.length) return;
    const full = arr[lineIndex] ?? '';
    let pos = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    setShown('');

    const typeNext = () => {
      if (cancelled) return;
      if (pos >= full.length) {
        onLineLandedRef.current?.(lineIndex);
        const isLast = lineIndex === arr.length - 1;
        if (isLast) {
          timer = setTimeout(() => {
            if (cancelled) return;
            completedRef.current = true;
            onCompleteRef.current?.();
          }, holdMs);
        } else {
          timer = setTimeout(() => {
            if (!cancelled) setLineIndex((i) => i + 1);
          }, holdMs);
        }
        return;
      }
      const ch = full.charAt(pos);
      pos += 1;
      setShown(full.slice(0, pos));
      timer = setTimeout(typeNext, charMs + pauseAfter(ch));
    };

    timer = setTimeout(typeNext, lineIndex === 0 ? startDelayMs : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Keyed on linesKey (content), not the `lines` array reference.
  }, [lineIndex, linesKey, charMs, holdMs, startDelayMs]);

  const isTyping = !completedRef.current && shown.length < (lines[lineIndex]?.length ?? 0);

  return (
    <View style={containerStyle}>
      {quoteMarkColor ? (
        <Text accessible={false} style={[styles.quoteMark, { color: quoteMarkColor }]}>
          {'\u201C'}
        </Text>
      ) : null}
      <Text style={textStyle} accessibilityLabel={lines[lineIndex]}>
        {shown}
        {isTyping ? (
          <Animated.Text style={[textStyle, caretStyle]}>{'|'}</Animated.Text>
        ) : null}
      </Text>
    </View>
  );
}

const styles = {
  quoteMark: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: fontSize.display,
    lineHeight: fontSize.display - 8,
    textAlign: 'center' as const,
    opacity: 0.45,
    marginBottom: 4,
    letterSpacing: -2,
  },
};
