/**
 * ChatInput — Polished input area with aunty-colored focus state.
 *
 * Pill-shaped input with focus border tinted to aunty color,
 * SVG send arrow, and character counter near max length.
 */

import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
} from '../../constants/theme';

const MAX_LENGTH = 500;
const COUNTER_THRESHOLD = 400;

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  auntyName: string;
  accentColor: string;
  gradient: [string, string];
  isTyping: boolean;
}

function SendArrow({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19V5M12 5L5 12M12 5L19 12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  auntyName,
  accentColor,
  gradient,
  isTyping,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0);

  const canSend = value.trim().length > 0 && !isTyping;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    borderOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0, { duration: 200 });
  }, []);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend();
  }, [canSend, onSend]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: isFocused ? accentColor + '50' : colors.borderLight,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Animated.View style={[styles.inputWrapper, borderStyle]}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={`Ask ${auntyName}...`}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={MAX_LENGTH}
            accessibilityLabel={`Type your message to ${auntyName}`}
          />
          {value.length > COUNTER_THRESHOLD && (
            <Text style={styles.counter}>
              {value.length}/{MAX_LENGTH}
            </Text>
          )}
        </Animated.View>

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <LinearGradient
            colors={canSend ? [...gradient] : [colors.border, colors.border]}
            style={styles.sendGradient}
          >
            <SendArrow color={canSend ? '#FFFFFF' : colors.muted} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.canvasDeep,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: spacing.md,
    maxHeight: 120,
    minHeight: 44,
  },
  counter: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    textAlign: 'right',
    paddingRight: spacing.md,
    paddingBottom: spacing.xs,
    marginTop: -spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
