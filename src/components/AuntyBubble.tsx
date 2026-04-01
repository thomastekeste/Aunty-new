import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import AuntyAvatar from './AuntyAvatar';
import { getAunty } from '@/constants/aunties';
import { AUNTY_BUBBLE_BG, AUNTY_COLORS } from '@/constants/aunties';
import { colors, spacing, fontSize, fontWeight, radius, fonts, shadows, auntyColors } from '@/constants/theme';

interface AuntyBubbleProps {
  auntyId: string;
  message: string;
  delay?: number;
  animated?: boolean;
  compact?: boolean;
}

export default function AuntyBubble({ auntyId, message, delay = 0, animated = true, compact = false }: AuntyBubbleProps) {
  const aunty = getAunty(auntyId);
  const ac = auntyColors[auntyId];
  const accentColor = ac?.accent ?? AUNTY_COLORS[auntyId] ?? colors.amber;
  const bubbleBg = ac?.bg ?? AUNTY_BUBBLE_BG[auntyId] ?? 'rgba(245,197,66,0.08)';

  const content = (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {/* Avatar with colored ring */}
      <View style={[styles.avatarWrap, { borderColor: `${accentColor}60` }]}>
        <AuntyAvatar auntyId={auntyId} size={compact ? 36 : 48} />
      </View>

      {/* Bubble */}
      <View style={[
        styles.bubble,
        compact && styles.bubbleCompact,
        {
          backgroundColor: bubbleBg,
          borderColor: `${accentColor}30`,
          shadowColor: accentColor,
        },
      ]}>
        {/* Accent top bar */}
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

        <View style={styles.inner}>
          {/* Name + title row */}
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: accentColor }]}>
              {aunty.name.toUpperCase()}
            </Text>
            <View style={[styles.titlePill, { backgroundColor: `${accentColor}18` }]}>
              <Text style={[styles.title, { color: accentColor }]}>{aunty.title}</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={[styles.message, compact && styles.messageCompact]}>
            {message}
          </Text>
        </View>
      </View>
    </View>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeInDown.duration(380).delay(delay).springify()}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  rowCompact: {
    marginBottom: spacing.sm,
  },
  avatarWrap: {
    borderWidth: 2,
    borderRadius: 999,
    padding: 2,
  },
  bubble: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleCompact: {
    borderRadius: radius.md,
  },
  accentBar: {
    height: 3,
    width: '100%',
    opacity: 0.8,
  },
  inner: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 1.5,
  },
  titlePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  message: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 24,
  },
  messageCompact: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
