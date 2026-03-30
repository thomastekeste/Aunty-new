import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackIcon } from '@/components/Icons';
import { OnboardingStackParamList, Elasticity } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyAvatar from '@/components/AuntyAvatar';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ElasticityTest'>;
type SubStep = 'intro' | 'result';

const OPTIONS: Array<{
  key: 'snapped' | 'stretched' | 'barely';
  label: string;
  elasticity: Elasticity;
  protein_needs: Elasticity;
  revealMsg: string;
}> = [
  {
    key: 'snapped',
    label: 'Snapped quickly',
    elasticity: 'low',
    protein_needs: 'high',
    revealMsg: "That strand snapped fast — your hair needs protein, serious. We add that to the routine, don't skip it.",
  },
  {
    key: 'stretched',
    label: 'Stretched well, then snapped',
    elasticity: 'normal',
    protein_needs: 'normal',
    revealMsg: "Good elasticity — that strand stretched before it broke. Your protein-moisture balance is solid. We build from here.",
  },
  {
    key: 'barely',
    label: 'Barely stretched at all',
    elasticity: 'low',
    protein_needs: 'high',
    revealMsg: "No stretch at all. Over-processed or protein-overloaded. We balance you out — moisture first, then reassess.",
  },
];

export default function ElasticityTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setData } = useOnboarding();
  const [subStep, setSubStep] = useState<SubStep>('intro');
  const [selection, setSelection] = useState<typeof OPTIONS[0] | null>(null);

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
        <View style={styles.councilRow}>
          {['1','2','3','4','5','6','7'].map((id, i) => (
            <View key={id} style={[styles.councilAvatar, { marginLeft: i === 0 ? 0 : -8 }]}>
              <AuntyAvatar auntyId={id} size={36} />
            </View>
          ))}
        </View>

        {subStep === 'intro' ? (
          <>
            <Text style={styles.heading}>Strand Elasticity Test</Text>
            <Text style={styles.body}>
              Take a wet strand of hair between two fingers and gently stretch it. This tells us if your hair needs protein.
            </Text>
            <View style={styles.illustrationBox}>
              <Text style={styles.illustrationText}>Stretch it slowly — take your time.</Text>
            </View>
            <Text style={styles.optionHeading}>What happened?</Text>
            {OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.option, selection?.key === opt.key && styles.optionSelected]}
                onPress={() => setSelection(opt)}
              >
                <Text style={[styles.optionText, selection?.key === opt.key && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            {selection && (
              <Button label="See what that means" onPress={() => setSubStep('result')} style={{ marginTop: spacing.md }} />
            )}
          </>
        ) : (
          <>
            <AuntyBubble auntyId="4" message={selection!.revealMsg} />
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>
                {selection!.elasticity === 'normal' ? 'Normal Elasticity' : 'Low Elasticity'}
              </Text>
              <Text style={styles.resultBody}>
                Protein needs: <Text style={{ fontWeight: fontWeight.bold }}>
                  {selection!.protein_needs === 'high' ? 'High' : 'Normal'}
                </Text>
              </Text>
            </View>
            <Button label="Continue" onPress={handleContinue} style={{ marginTop: spacing.md }} />
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
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  progressWrap: { flex: 1 },
  content: { padding: spacing.md },
  councilRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  councilAvatar: { borderWidth: 2, borderColor: colors.canvas, borderRadius: 20 },
  heading: { fontFamily: fonts.display, fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.ink, marginBottom: spacing.sm },
  body: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg },
  illustrationBox: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  illustrationEmoji: { fontSize: 48, marginBottom: spacing.sm },
  illustrationText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, fontWeight: fontWeight.medium },
  optionHeading: { fontFamily: fonts.body, fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink, marginBottom: spacing.md },
  option: {
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: colors.border, marginBottom: spacing.sm, backgroundColor: colors.canvas,
  },
  optionSelected: { borderColor: colors.amber, backgroundColor: colors.surface },
  optionText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  optionTextSelected: { fontWeight: fontWeight.bold, color: colors.ink },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  resultTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.ink, marginBottom: spacing.sm },
  resultBody: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
});
