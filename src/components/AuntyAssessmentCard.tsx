import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuntyAvatar from './AuntyAvatar';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors } from '@/constants/theme';
import { AUNTIES } from '@/constants/aunties';

interface Props {
  auntyId: string;
  title: string;
  message: string;
  findings?: string[];
}

export default function AuntyAssessmentCard({
  auntyId,
  title,
  message,
  findings = [],
}: Props) {
  const aunty = AUNTIES[auntyId];
  const auntyColor = auntyColors[auntyId];

  return (
    <View style={[styles.root, { borderLeftColor: auntyColor.accent }]}>
      {/* Header with aunty info */}
      <View style={styles.header}>
        <AuntyAvatar auntyId={auntyId} size={48} />
        <View style={styles.headerText}>
          <Text style={[styles.auntyName, { color: auntyColor.accent }]}>
            {aunty.name}'s Assessment
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {/* Assessment message */}
      <Text style={styles.assessment}>{message}</Text>

      {/* Key findings */}
      {findings.length > 0 && (
        <View style={styles.findingsContainer}>
          {findings.map((finding, index) => (
            <View key={index} style={styles.findingItem}>
              <View style={[styles.findingDot, { backgroundColor: auntyColor.accent }]} />
              <Text style={styles.findingText}>{finding}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  auntyName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    fontFamily: fonts.display,
  },
  assessment: {
    fontSize: fontSize.sm,
    color: colors.mutedBase,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  findingsContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  findingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  findingText: {
    fontSize: fontSize.xs,
    color: colors.mutedBase,
    flex: 1,
    fontFamily: fonts.body,
  },
});
