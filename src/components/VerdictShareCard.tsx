/**
 * 9:16 share asset for "The Verdict" — captured off-screen and shared.
 */
import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ComponentRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { AuntyAvatar } from './AuntyAvatar';
import type { AuntyId } from '../constants/aunties';
import { auntyColors, colors, fonts, fontSize, spacing, gradients, letterSpacing } from '../constants/theme';

const CARD_W = 360;
const CARD_H = Math.round((CARD_W * 16) / 9);

export const VERDICT_SHARE_CARD_WIDTH = CARD_W;
export const VERDICT_SHARE_CARD_HEIGHT = CARD_H;

interface Props {
  auntyId: AuntyId;
  auntyName: string;
  findings: string[];
}

export const VerdictShareCard = forwardRef<ComponentRef<typeof View>, Props>(function VerdictShareCard(
  { auntyId, auntyName, findings },
  ref,
) {
  const ac = auntyColors[auntyId];

  return (
    <View ref={ref} style={styles.wrap} collapsable={false}>
      <LinearGradient colors={[...gradients.ceremony]} style={styles.card} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
        <View style={[styles.ambient, { backgroundColor: ac.accent }]} />
        <Text style={styles.overline}>THE COUNCIL</Text>
        <Text style={styles.title}>Verdict</Text>
        <View style={styles.avatarBlock}>
          <AuntyAvatar auntyId={auntyId} size={80} showRing glowing />
        </View>
        <Text style={[styles.name, { color: ac.accent }]}>Aunty {auntyName}</Text>
        <View style={styles.hairline} />
        {findings.map((line, i) => (
          <View key={i} style={styles.row}>
            <View style={[styles.bullet, { backgroundColor: ac.accent }]} />
            <Text style={styles.finding} numberOfLines={4} adjustsFontSizeToFit>
              {line}
            </Text>
          </View>
        ))}
        <View style={styles.footer}>
          <Text style={styles.brand}>Aunty Curl Council</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: colors.dark.bg,
  },
  card: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  ambient: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -140,
    alignSelf: 'center',
    opacity: 0.2,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 3.2,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 34,
    color: colors.dark.text,
    marginTop: spacing.sm,
  },
  avatarBlock: {
    marginTop: spacing.md,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    marginTop: spacing.md,
  },
  hairline: {
    width: 40,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.primary,
    opacity: 0.5,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    marginBottom: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  finding: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.dark.text,
  },
  footer: {
    marginTop: 'auto',
  },
  brand: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    color: colors.dark.textMuted,
  },
});
