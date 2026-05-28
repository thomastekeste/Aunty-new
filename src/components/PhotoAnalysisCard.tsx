/**
 * PhotoAnalysisCard — Displays AI hair photo analysis results.
 *
 * Used in check-in flow (compact) and onboarding verdict (full).
 * Styled with aunty accent color theming.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuntyAvatar } from './AuntyAvatar';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
} from '../constants/theme';
import type { PhotoAnalysis } from '../types';
import type { AuntyId } from '../constants/aunties';

interface Props {
  analysis: PhotoAnalysis;
  auntyId: AuntyId;
  compact?: boolean;
}

const MOISTURE_COLORS: Record<string, string> = {
  low: colors.jewel.rose,
  adequate: colors.jewel.amber,
  good: colors.jewel.emerald,
};

const MOISTURE_LABELS: Record<string, string> = {
  low: 'Needs moisture',
  adequate: 'Adequate',
  good: 'Well moisturized',
};

export function PhotoAnalysisCard({ analysis, auntyId, compact = false }: Props) {
  const ac = auntyColors[auntyId] || auntyColors.denise;
  const moistureColor = MOISTURE_COLORS[analysis.moistureLevel] || colors.jewel.amber;

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.card, { borderColor: ac.accent + '30' }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <AuntyAvatar auntyId={auntyId} size={28} />
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: ac.accent }]}>Hair Analysis</Text>
          <Text style={styles.aiDisclosure}>AI-powered analysis</Text>
        </View>
      </View>

      {/* Curl Pattern + Moisture */}
      <View style={styles.topRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Curl Pattern</Text>
          <Text style={styles.statValue}>{analysis.observedCurlPattern}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Moisture</Text>
          <View style={[styles.moistureBadge, { backgroundColor: moistureColor + '20' }]}>
            <View style={[styles.moistureDot, { backgroundColor: moistureColor }]} />
            <Text style={[styles.moistureText, { color: moistureColor }]}>
              {MOISTURE_LABELS[analysis.moistureLevel] || analysis.moistureLevel}
            </Text>
          </View>
        </View>
      </View>

      {!compact && (
        <>
          {/* Porosity + Density */}
          <View style={styles.topRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Porosity</Text>
              <Text style={styles.statValue}>{analysis.observedPorosity}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Density</Text>
              <Text style={styles.statValue}>{analysis.observedDensity}</Text>
            </View>
          </View>

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.jewel.emerald }]}>Strengths</Text>
              {analysis.strengths.map((s, i) => (
                <Text key={i} style={styles.listItem}>{'•'} {s}</Text>
              ))}
            </View>
          )}

          {/* Damage indicators */}
          {analysis.damageIndicators.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.jewel.rose }]}>Watch out for</Text>
              {analysis.damageIndicators.map((d, i) => (
                <Text key={i} style={[styles.listItem, { color: colors.jewel.rose + 'CC' }]}>
                  {'•'} {d}
                </Text>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: ac.accent }]}>Recommendations</Text>
              {analysis.recommendations.map((r, i) => (
                <Text key={i} style={styles.listItem}>{i + 1}. {r}</Text>
              ))}
            </View>
          )}
        </>
      )}

      {/* Overall assessment */}
      <View style={[styles.assessmentWrap, { borderTopColor: colors.dark.border }]}>
        <Text style={styles.assessment}>{analysis.overallAssessment}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
  },
  aiDisclosure: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs * 0.85,
    color: colors.dark.textMuted,
    marginTop: 1,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs * 0.85,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.text,
  },
  moistureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  moistureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moistureText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs * 0.85,
  },
  section: {
    gap: 3,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  listItem: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.text,
    lineHeight: fontSize.sm * 1.5,
    paddingLeft: spacing.xs,
  },
  assessmentWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  assessment: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    lineHeight: fontSize.sm * 1.55,
  },
});
