import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackIcon, StrengthIcon, StretchIcon, BreakageIcon } from '@/components/Icons';
import { OnboardingStackParamList, Elasticity } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyAvatar from '@/components/AuntyAvatar';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ElasticityTest'>;

const OPTIONS: Array<{
  key: 'snapped' | 'stretched' | 'barely';
  label: string;
  icon: string;
  color: string;
  elasticity: Elasticity;
  protein_needs: Elasticity;
  revealMsg: string;
}> = [
  {
    key: 'snapped',
    label: 'Snapped quickly',
    icon: <BreakageIcon color="#E0142C" size={26} strokeWidth={2} />,
    color: '#E0142C',
    elasticity: 'low',
    protein_needs: 'high',
    revealMsg: "That strand snapped fast — your hair needs protein, serious. We add that to the routine, don't skip it.",
  },
  {
    key: 'stretched',
    label: 'Stretched well, then snapped',
    icon: <StretchIcon color="#F5C542" size={26} strokeWidth={2} />,
    color: '#F5C542',
    elasticity: 'normal',
    protein_needs: 'normal',
    revealMsg: "Good elasticity — that strand stretched before it broke. Your protein-moisture balance is solid. We build from here.",
  },
  {
    key: 'barely',
    label: 'Barely stretched at all',
    icon: <StrengthIcon color="#9B5DE5" size={26} strokeWidth={1.8} />,
    color: '#9B5DE5',
    elasticity: 'low',
    protein_needs: 'high',
    revealMsg: "No stretch at all. Over-processed or protein-overloaded. We balance you out — moisture first, then reassess.",
  },
];

export default function ElasticityTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setData } = useOnboarding();
  const [selection, setSelection] = useState<typeof OPTIONS[0] | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleContinue = () => {
    if (!selection) return;
    setData({ elasticity: selection.elasticity });
    navigation.navigate('DensityTest');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={colors.ink} size={22} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar current={3} total={14} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {!showResult ? (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.stepBadge}>Step 2 of 3</Text>
              <Text style={styles.heading}>Elasticity Test</Text>
              <Text style={styles.tagline}>Does your hair have protein strength?</Text>
            </View>

            <View style={styles.fullCard}>
              <View style={styles.cardIconSection}>
                <View style={styles.largeIcon}><StrengthIcon color={colors.primary} size={64} strokeWidth={1.5} /></View>
                <View style={styles.geometricDecor} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardQuestion}>How much does your hair stretch?</Text>
                <Text style={styles.cardDescription}>
                  Take a wet strand of hair between two fingers and gently stretch it. Elasticity tells us if your hair needs protein to strengthen its structure.
                </Text>
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionTitle}>How to perform the test:</Text>
                  <Text style={styles.instructionText}>• Use a wet strand of clean hair</Text>
                  <Text style={styles.instructionText}>• Hold between thumb and index finger</Text>
                  <Text style={styles.instructionText}>• Gently pull — take your time</Text>
                </View>
              </View>
            </View>

            <View style={styles.fullCard}>
              <Text style={styles.cardQuestion}>What happened when you stretched it?</Text>
              <Text style={styles.cardDescription}>Select the best description:</Text>
              <View style={styles.optionsContainer}>
                {OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.answerCard,
                      selection?.key === opt.key && styles.answerCardSelected,
                      { borderColor: selection?.key === opt.key ? opt.color : colors.borderLight },
                      selection?.key === opt.key && { backgroundColor: `${opt.color}12` },
                    ]}
                    onPress={() => setSelection(opt)}
                  >
                    <View style={styles.answerIcon}>{opt.icon}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.answerText, selection?.key === opt.key && { color: opt.color, fontWeight: fontWeight.black }]}>
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selection && (
              <Button label="See what that means" onPress={() => setShowResult(true)} />
            )}
          </>
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.stepBadge}>Your Result</Text>
              <Text style={styles.heading}>{selection!.elasticity === 'normal' ? 'Normal Elasticity' : 'Low Elasticity'}</Text>
            </View>

            <View style={[styles.fullCard, { borderLeftWidth: 6, borderLeftColor: selection!.color }]}>
              <View style={styles.resultHeader}>
                <View style={styles.resultIcon}>{selection!.icon}</View>
                <View>
                  <Text style={styles.resultLabel}>Protein Profile</Text>
                  <Text style={[styles.resultTitle, { color: selection!.color }]}>
                    {selection!.protein_needs === 'high' ? 'High Protein Needs' : 'Normal Protein Needs'}
                  </Text>
                </View>
              </View>

              <Text style={styles.proteinInfo}>
                Protein needs: <Text style={[styles.proteinBold, { color: selection!.color }]}>
                  {selection!.protein_needs === 'high' ? 'High — build strength' : 'Normal — maintain balance'}
                </Text>
              </Text>

              <AuntyBubble auntyId="4" message={selection!.revealMsg} />
            </View>

            <Button label="Continue" onPress={handleContinue} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  progressWrap: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.lg },

  // Header
  headerSection: {
    marginBottom: spacing.sm,
  },
  stepBadge: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },

  // Full-box cards
  fullCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  cardIconSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  largeIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  geometricDecor: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    backgroundColor: colors.accent,
    opacity: 0.04,
    borderRadius: 60,
  },
  cardContent: {
    gap: spacing.md,
  },
  cardQuestion: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  instructionBox: {
    backgroundColor: 'rgba(251,86,7,0.05)',
    borderLeft: 4,
    borderLeftColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  instructionTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Options
  optionsContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.canvas,
    gap: spacing.md,
  },
  answerCardSelected: {
    borderWidth: 2.5,
    backgroundColor: 'transparent',
  },
  answerIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  // Result
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  resultIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  proteinInfo: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  proteinBold: {
    fontWeight: fontWeight.black,
  },
});
