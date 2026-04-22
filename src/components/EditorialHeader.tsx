/**
 * EditorialHeader — The top-of-screen masthead for app & onboarding surfaces.
 *
 * Three stacked rows:
 *   1. Overline row  — tracked-caps eyebrow on the left, optional meta on the right.
 *   2. Title row     — serif-weighted display title + optional action slot.
 *   3. Gold hairline — subtle divider under the title.
 *
 * Kept minimal on purpose: this is a frame, not a layout engine. Screens that
 * need more (like the dashboard with a date strip) compose their own bespoke
 * masthead using the same typographic vocabulary.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  letterSpacing,
} from '../constants/theme';

interface Props {
  title: string;
  overline?: string;
  /** Small right-aligned meta text (e.g. "WEEK 3", "5 PICKS"). */
  meta?: string;
  /** Optional right-side action element (button, icon). */
  action?: React.ReactNode;
  /** Optional tagline below the title, italic and muted. */
  subtitle?: string;
  /** Render on dark surfaces (flips text tones). */
  dark?: boolean;
  /** Hide the bottom gold hairline. Default false. */
  hideRule?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function EditorialHeader({
  title,
  overline,
  meta,
  action,
  subtitle,
  dark = false,
  hideRule = false,
  containerStyle,
}: Props) {
  const titleColor = dark ? colors.dark.text : colors.ink;
  const overlineColor = colors.primary;
  const metaColor = dark ? colors.dark.textMuted : colors.muted;
  const subtitleColor = dark ? colors.dark.textMuted : colors.muted;

  return (
    <View style={[styles.container, containerStyle]}>
      {(overline || meta) && (
        <View style={styles.overlineRow}>
          {overline ? (
            <Text style={[styles.overline, { color: overlineColor }]}>
              {overline.toUpperCase()}
            </Text>
          ) : null}
          {meta ? (
            <Text style={[styles.meta, { color: metaColor }]}>{meta.toUpperCase()}</Text>
          ) : null}
        </View>
      )}

      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
          {title}
        </Text>
        {action ? <View style={styles.actionSlot}>{action}</View> : null}
      </View>

      {subtitle ? (
        <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
      ) : null}

      {!hideRule ? <View style={styles.hairline} /> : null}
    </View>
  );
}

/**
 * Tiny pressable used next to an EditorialHeader — circular 44pt surface with
 * hairline border, ready to hold a 20pt SVG icon.
 */
export function EditorialHeaderAction({
  onPress,
  children,
  accessibilityLabel,
  dark = false,
}: {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.actionButton,
        dark
          ? { backgroundColor: 'rgba(254, 248, 236, 0.06)', borderColor: 'rgba(254, 248, 236, 0.14)' }
          : { backgroundColor: colors.surfaceTinted, borderColor: colors.borderLight },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  overlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: 2.8,
  },
  meta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: 2.4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: 2,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    letterSpacing: letterSpacing.tight,
  },
  subtitle: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.md,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
    opacity: 0.35,
    marginTop: spacing.sm,
  },
  actionSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
