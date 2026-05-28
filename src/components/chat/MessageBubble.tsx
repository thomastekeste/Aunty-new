/**
 * MessageBubble — Aunty or user chat bubble with grouping + copy.
 *
 * Supports iMessage-style grouping: avatar only on first message in
 * a consecutive sequence from the same sender.
 * Long-press to copy message text.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';

import { AuntyAvatar } from '../AuntyAvatar';
import { PressableScale } from '../PressableScale';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
} from '../../constants/theme';
import type { AuntyId } from '../../constants/aunties';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aunty';
  timestamp: string;
}

interface Props {
  item: Message;
  auntyId: AuntyId;
  auntyName: string;
  accentColor: string;
  bgColor: string;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export function MessageBubble({
  item,
  auntyId,
  auntyName,
  accentColor,
  bgColor,
  isFirstInGroup,
  isLastInGroup,
}: Props) {
  const [showCopied, setShowCopied] = useState(false);

  const handleLongPress = useCallback(async () => {
    await Clipboard.setStringAsync(item.text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1200);
  }, [item.text]);

  if (item.sender === 'user') {
    return (
      <Animated.View
        entering={FadeInDown.springify().damping(22).stiffness(220).mass(0.6)}
        style={[
          styles.userRow,
          !isLastInGroup && { marginBottom: 2 },
        ]}
      >
        <PressableScale
          onLongPress={handleLongPress}
          scaleTo={0.97}
          haptic="none"
          style={styles.userBubbleWrap}
        >
          <View style={[
            styles.userBubble,
            isFirstInGroup && styles.userBubbleFirst,
          ]}>
            <Text style={styles.userText}>{item.text}</Text>
            {isLastInGroup && (
              <Text style={styles.userTimestamp}>{item.timestamp}</Text>
            )}
          </View>
          {showCopied && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.copiedToast}>
              <Text style={styles.copiedText}>Copied</Text>
            </Animated.View>
          )}
        </PressableScale>
      </Animated.View>
    );
  }

  // Aunty message
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(22).stiffness(220).mass(0.6)}
      style={[
        styles.auntyRow,
        !isLastInGroup && { marginBottom: 2 },
      ]}
    >
      {isFirstInGroup ? (
        <AuntyAvatar auntyId={auntyId} size={36} showRing={false} />
      ) : (
        <View style={styles.avatarSpacer} />
      )}

      <PressableScale
        onLongPress={handleLongPress}
        scaleTo={0.97}
        haptic="none"
        style={styles.auntyBubbleWrap}
      >
        <View>
          {isFirstInGroup && (
            <View style={styles.nameRow}>
              <Text style={[styles.auntyName, { color: accentColor }]}>{auntyName}</Text>
              <Text style={styles.auntyTimestamp}>{item.timestamp}</Text>
            </View>
          )}
          <View style={[
            styles.auntyBubble,
            { backgroundColor: bgColor, borderLeftColor: accentColor },
            isFirstInGroup && styles.auntyBubbleFirst,
          ]}>
            <Text style={styles.auntyText}>{item.text}</Text>
          </View>
          {showCopied && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.copiedToastLeft}>
              <Text style={styles.copiedText}>Copied</Text>
            </Animated.View>
          )}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ─── User ─────────────────────
  userRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  userBubbleWrap: {
    maxWidth: '82%',
  },
  userBubble: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
  },
  userBubbleFirst: {
    borderTopRightRadius: radius.xs,
  },
  userText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.55,
    color: colors.canvas,
  },
  userTimestamp: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },

  // ─── Aunty ────────────────────
  auntyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    maxWidth: '88%',
    marginBottom: spacing.sm,
  },
  avatarSpacer: {
    width: 36,
  },
  auntyBubbleWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  auntyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
  auntyTimestamp: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  auntyBubble: {
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
  },
  auntyBubbleFirst: {
    borderTopLeftRadius: radius.xs,
  },
  auntyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.55,
    color: colors.ink,
  },

  // ─── Copied Toast ─────────────
  copiedToast: {
    position: 'absolute',
    top: -28,
    right: spacing.md,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  copiedToastLeft: {
    position: 'absolute',
    top: -28,
    left: spacing.md,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  copiedText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.canvas,
  },
});
