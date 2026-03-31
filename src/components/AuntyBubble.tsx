import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AuntyAvatar from './AuntyAvatar';
import { getAunty } from '@/constants/aunties';
import { AUNTY_ACCENT, AUNTY_BUBBLE_BG, AUNTY_COLORS } from '@/constants/aunties';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

interface AuntyBubbleProps {
  auntyId: string;
  message: string;
  delay?: number;
  animated?: boolean;
}

export default function AuntyBubble({ auntyId, message, delay = 0, animated = true }: AuntyBubbleProps) {
  const aunty = getAunty(auntyId);
  const accentColor = AUNTY_COLORS[auntyId] ?? colors.amber;   // deep jewel for border/name
  const bubbleBg = AUNTY_BUBBLE_BG[auntyId] ?? 'rgba(139,79,28,0.06)';

  const content = (
    <View style={styles.row}>
      <AuntyAvatar auntyId={auntyId} size={48} />
      <View style={[styles.bubble, { borderLeftColor: accentColor, backgroundColor: bubbleBg }]}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: accentColor }]}>{aunty.name.toUpperCase()}</Text>
          <Text style={styles.title}>{aunty.title}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
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
  },
  bubble: {
    flex: 1,
    marginLeft: spacing.sm,
    borderRadius: radius.md,
    borderTopLeftRadius: 4,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
  message: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 24,
  },
});
