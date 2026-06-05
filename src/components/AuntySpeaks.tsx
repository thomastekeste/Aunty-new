/**
 * AuntySpeaks — phrase-by-phrase "spoken line" for the aunty's voice.
 *
 * Lines land in natural breath-chunks (not char-by-char typing, not a hard
 * line swap). Each phrase fades up, then a soft gold sweep passes once across
 * the full line. Optional accent pops on personalized tokens (name, curl type).
 *
 * Drop-in replacement for AuntyDialogue on intro, interludes, and verdict.
 * Exposes `skip()` via ref so tap-to-advance can fast-forward mid-speech.
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { fontSize, gradients } from '../constants/theme';

export interface AuntySpeaksHandle {
  skip: () => void;
  isSpeaking: () => boolean;
}

interface Props {
  lines: string[];
  phraseMs?: number;
  phraseGapMs?: number;
  holdMs?: number;
  startDelayMs?: number;
  breathSweep?: boolean;
  sweepMs?: number;
  quoteMarkColor?: string;
  accentColor?: string;
  highlightWords?: string[];
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onPhraseLanded?: (lineIndex: number, phraseIndex: number) => void;
  onLineLanded?: (lineIndex: number) => void;
  onComplete?: () => void;
}

export function splitIntoPhrases(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [''];

  const chunks: string[] = [];
  let buffer = '';

  const flush = () => {
    const t = buffer.trim();
    if (t) chunks.push(t);
    buffer = '';
  };

  for (const token of trimmed.split(/(\s+)/)) {
    if (!token) continue;
    buffer += token;
    const wordCount = buffer.trim().split(/\s+/).filter(Boolean).length;
    const endsBreak = /[—–,;:!?.]$/.test(buffer.trim());
    if (endsBreak || wordCount >= 4) flush();
  }
  flush();

  if (chunks.length <= 1 && trimmed.includes(' ')) {
    const words = trimmed.split(/\s+/);
    const byFour: string[] = [];
    for (let i = 0; i < words.length; i += 4) {
      byFour.push(words.slice(i, i + 4).join(' '));
    }
    return byFour;
  }

  return chunks.length ? chunks : [trimmed];
}

function normalizeToken(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/gi, '');
}

function isHighlightToken(token: string, highlights: string[]): boolean {
  const norm = normalizeToken(token);
  if (!norm) return false;
  return highlights.some((h) => {
    const hn = normalizeToken(h);
    return hn.length > 0 && (norm === hn || norm.includes(hn));
  });
}

function HighlightWord({
  word,
  color,
  style,
  active,
}: {
  word: string;
  color: string;
  style: StyleProp<TextStyle>;
  active: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) return;
    scale.value = withSequence(
      withTiming(1.1, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 220, easing: Easing.inOut(Easing.quad) }),
    );
  }, [active, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[style, { color }, animStyle]}>{word}</Animated.Text>
  );
}

function SpokenPhrase({
  text,
  revealed,
  phraseMs,
  highlightWords,
  accentColor,
  textStyle,
  isLast,
}: {
  text: string;
  revealed: boolean;
  phraseMs: number;
  highlightWords: string[];
  accentColor?: string;
  textStyle: StyleProp<TextStyle>;
  isLast: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (!revealed) {
      opacity.value = 0;
      translateY.value = 8;
      return;
    }
    opacity.value = withTiming(1, { duration: phraseMs, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: phraseMs, easing: Easing.out(Easing.cubic) });
  }, [revealed, phraseMs, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const suffix = isLast ? '' : ' ';
  const flatStyle = StyleSheet.flatten(textStyle) ?? {};

  if (!accentColor || !highlightWords.length) {
    return (
      <Animated.Text style={[textStyle, animStyle]}>
        {text}
        {suffix}
      </Animated.Text>
    );
  }

  const parts = text.split(/(\s+)/);
  return (
    <Animated.Text style={[textStyle, animStyle]}>
      {parts.map((part, i) => {
        if (!part.trim()) return <Text key={i}>{part}</Text>;
        if (isHighlightToken(part, highlightWords)) {
          return (
            <HighlightWord
              key={i}
              word={part}
              color={accentColor}
              style={flatStyle}
              active={revealed}
            />
          );
        }
        return (
          <Text key={i} style={textStyle}>
            {part}
          </Text>
        );
      })}
      {suffix}
    </Animated.Text>
  );
}

export const AuntySpeaks = forwardRef<AuntySpeaksHandle, Props>(function AuntySpeaks(
  {
    lines,
    phraseMs = 130,
    phraseGapMs = 80,
    holdMs = 1000,
    startDelayMs = 0,
    breathSweep = true,
    sweepMs = 720,
    quoteMarkColor,
    accentColor,
    highlightWords = [],
    textStyle,
    containerStyle,
    onPhraseLanded,
    onLineLanded,
    onComplete,
  },
  ref,
) {
  const [lineIndex, setLineIndex] = useState(0);
  const [visiblePhrases, setVisiblePhrases] = useState(0);
  const [lineReady, setLineReady] = useState(false);
  const [done, setDone] = useState(false);

  const linesKey = lines.join('\u0001');
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const speakingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onPhraseLandedRef = useRef(onPhraseLanded);
  const onLineLandedRef = useRef(onLineLanded);
  const onCompleteRef = useRef(onComplete);
  onPhraseLandedRef.current = onPhraseLanded;
  onLineLandedRef.current = onLineLanded;
  onCompleteRef.current = onComplete;

  const currentLine = lines[lineIndex] ?? '';
  const phrases = useMemo(() => splitIntoPhrases(currentLine), [currentLine]);

  const shimmerX = useSharedValue(-1);
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value * 220 - 110 }],
    opacity: shimmerX.value < 0 ? 0 : 0.5,
  }));

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const setSpeaking = useCallback((v: boolean) => {
    speakingRef.current = v;
  }, []);

  const finishAll = useCallback(() => {
    setSpeaking(false);
    setLineReady(false);
    setDone(true);
    onCompleteRef.current?.();
  }, [setSpeaking]);

  const advanceLine = useCallback(() => {
    const arr = linesRef.current;
    if (lineIndex >= arr.length - 1) {
      finishAll();
      return;
    }
    setLineIndex((i) => i + 1);
    setVisiblePhrases(0);
    setLineReady(false);
    shimmerX.value = -1;
  }, [lineIndex, finishAll, shimmerX]);

  const runBreathAndHold = useCallback(() => {
    onLineLandedRef.current?.(lineIndex);
    setLineReady(true);
    setSpeaking(false);

    if (breathSweep) {
      shimmerX.value = -1;
      shimmerX.value = withDelay(
        40,
        withTiming(1, { duration: sweepMs, easing: Easing.inOut(Easing.quad) }),
      );
    }

    clearTimer();
    const tail = breathSweep ? Math.round(sweepMs * 0.35) : 0;
    timerRef.current = setTimeout(() => {
      if (!done) advanceLine();
    }, holdMs + tail);
  }, [lineIndex, breathSweep, sweepMs, holdMs, advanceLine, clearTimer, shimmerX, done]);

  // Reset on new dialogue content.
  useEffect(() => {
    setDone(false);
    setLineIndex(0);
    setVisiblePhrases(0);
    setLineReady(false);
    shimmerX.value = -1;
    setSpeaking(false);
  }, [linesKey, shimmerX, setSpeaking]);

  // Phrase reveal choreography.
  useEffect(() => {
    if (done) return;

    const arr = linesRef.current;
    if (lineIndex >= arr.length) return;

    const phraseList = splitIntoPhrases(arr[lineIndex] ?? '');

    if (visiblePhrases >= phraseList.length) {
      clearTimer();
      timerRef.current = setTimeout(() => runBreathAndHold(), phraseGapMs);
      return clearTimer;
    }

    const isFirstOfLine = visiblePhrases === 0;
    const delay =
      isFirstOfLine && lineIndex === 0
        ? startDelayMs + phraseMs * 0.15
        : isFirstOfLine
          ? phraseMs * 0.15
          : phraseGapMs + phraseMs;

    clearTimer();
    timerRef.current = setTimeout(() => {
      if (done) return;
      setSpeaking(true);
      onPhraseLandedRef.current?.(lineIndex, visiblePhrases);
      setVisiblePhrases((v) => v + 1);
    }, delay);

    return clearTimer;
  }, [
    lineIndex,
    visiblePhrases,
    linesKey,
    done,
    phraseMs,
    phraseGapMs,
    startDelayMs,
    runBreathAndHold,
    clearTimer,
    setSpeaking,
  ]);

  const skip = useCallback(() => {
    if (done) return;
    clearTimer();

    const arr = linesRef.current;
    const phraseList = splitIntoPhrases(arr[lineIndex] ?? '');

    if (visiblePhrases < phraseList.length) {
      setVisiblePhrases(phraseList.length);
      setLineReady(true);
      setSpeaking(false);
      onLineLandedRef.current?.(lineIndex);
      timerRef.current = setTimeout(() => {
        if (lineIndex >= arr.length - 1) finishAll();
        else advanceLine();
      }, 220);
      return;
    }

    if (lineIndex >= arr.length - 1) finishAll();
    else advanceLine();
  }, [done, visiblePhrases, lineIndex, clearTimer, finishAll, advanceLine, setSpeaking]);

  useImperativeHandle(ref, () => ({
    skip,
    isSpeaking: () => speakingRef.current,
  }));

  useEffect(() => () => clearTimer(), [clearTimer]);

  const displayLine = done ? (lines[lines.length - 1] ?? '') : currentLine;

  const lineText = (
    <Text style={textStyle} accessibilityLabel={displayLine}>
      {phrases.map((phrase, i) => (
        <SpokenPhrase
          key={`${lineIndex}-${i}-${linesKey}`}
          text={phrase}
          revealed={done || i < visiblePhrases}
          phraseMs={phraseMs}
          highlightWords={highlightWords}
          accentColor={accentColor}
          textStyle={textStyle}
          isLast={i === phrases.length - 1}
        />
      ))}
    </Text>
  );

  return (
    <View style={containerStyle}>
      {quoteMarkColor ? (
        <Text accessible={false} style={[styles.quoteMark, { color: quoteMarkColor }]}>
          {'\u201C'}
        </Text>
      ) : null}
      {breathSweep && lineReady && !done ? (
        <MaskedView
          maskElement={
            <View>
              <Text style={[textStyle, { backgroundColor: 'transparent' }]}>{displayLine}</Text>
            </View>
          }
        >
          <View>
            {lineText}
            <Animated.View style={[StyleSheet.absoluteFillObject, sweepStyle]} pointerEvents="none">
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
        lineText
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  quoteMark: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: fontSize.display,
    lineHeight: fontSize.display - 8,
    textAlign: 'center',
    opacity: 0.45,
    marginBottom: 4,
    letterSpacing: -2,
  },
});
