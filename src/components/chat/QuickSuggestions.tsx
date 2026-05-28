/**
 * QuickSuggestions — Contextual suggestion chips that auto-send on tap.
 *
 * Shows aunty-specific suggestions early in the conversation,
 * then shorter follow-up prompts after 3+ messages.
 * Staggered fade-in animation for each chip.
 */

import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressableScale } from '../PressableScale';
import { fonts, fontSize, spacing, radius } from '../../constants/theme';
import type { AuntyId } from '../../constants/aunties';

const QUICK_SUGGESTIONS: Record<string, string[]> = {
  ngozi: ['My hair feels dry', 'Shea butter tips?', 'Hot oil treatment?', 'Deep conditioner rec?'],
  marcia: ['Scalp massage tips?', 'How to use JBCO?', 'Growth takes so long', 'Protective style ideas?'],
  denise: ['LOC method help', 'Twist-out tips?', 'Bonnet or scarf?', 'My edges are thinning'],
  fatou: ['Detangling hurts', 'How to section?', 'Thread stretching?', 'Product application tips?'],
  carmen: ['Wash-and-go tips?', 'Finger coiling help', 'Gel vs cream?', "My curls won't clump"],
  amara: ['Need a protein treatment?', 'Hair feels mushy', 'Henna questions', 'Breakage help'],
  salma: ['Argan oil benefits?', 'Scalp is stressed', 'Rose water uses?', 'Hair and wellness'],
};

const FOLLOW_UP_SUGGESTIONS = [
  'Tell me more',
  'What products?',
  'My routine',
  'Wash day help',
  'Any tips?',
];

interface Props {
  auntyId: AuntyId;
  messageCount: number;
  isTyping: boolean;
  lastSenderIsAunty: boolean;
  onSend: (text: string) => void;
  accentColor: string;
  bgColor: string;
  textColor: string;
}

export function QuickSuggestions({
  auntyId,
  messageCount,
  isTyping,
  lastSenderIsAunty,
  onSend,
  accentColor,
  bgColor,
  textColor,
}: Props) {
  // Don't show if typing, too many messages, or last msg was from user
  if (isTyping || messageCount > 8 || !lastSenderIsAunty) return null;

  const suggestions = messageCount <= 3
    ? (QUICK_SUGGESTIONS[auntyId] || QUICK_SUGGESTIONS.denise)
    : FOLLOW_UP_SUGGESTIONS.slice(0, 3);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {suggestions.map((text, i) => (
        <Animated.View
          key={text}
          entering={FadeInDown.delay(i * 60).duration(200)}
        >
          <PressableScale
            onPress={() => onSend(text)}
            scaleTo={0.95}
            haptic="light"
            style={[
              styles.chip,
              { borderColor: accentColor + '40', backgroundColor: bgColor },
            ]}
          >
            <Text style={[styles.chipText, { color: textColor }]}>{text}</Text>
          </PressableScale>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
  },
});
