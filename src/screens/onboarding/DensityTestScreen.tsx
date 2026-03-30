import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackIcon } from '@/components/Icons';
import { OnboardingStackParamList, Density } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyAvatar from '@/components/AuntyAvatar';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DensityTest'>;

const OPTIONS: Array<{ key: Density; label: string; description: string; revealMsg: string }> = [
  {
    key: 'thin',
    label: 'Thin — less than a pencil',
    description: 'Fine, lightweight products. Heavy creams will weigh you down.',
    revealMsg: "Fine hair — every product choice matters. We go light, strategic, and deliberate. Don't pile it on.",
  },
  {
    key: 'medium',
    label: 'Medium — about a pencil',
    description: 'Most products work for you. Balance moisture and weight.',
    revealMsg: "Medium density — you have flexibility. We'll balance moisture without overdoing the weight.",
  },
  {
    key: 'thick',
    label: 'Thick — thicker than a pencil',
    description: 'Your hair can handle heavier products and longer wash days.',
    revealMsg: "Thick density — your hair is substantial. Richer products, thorough wash days. Nothing lightweight for you.",
  },
];

export default function DensityTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setData } = useOnboarding();
  const [selection, setSelection] = useState<Density | null>(null);
  const [showResult, setShowResult] = useState(false);

  const selected = OPTIONS.find(o => o.key === selection);

  const handleContinue = () => {
    if (!selection) return;
    setData({ density: selection });
    navigation.navigate('PhotoUpload');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={colors.ink} size={22} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar current={4} total={14} />
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

        <Text style={styles.heading}>Density Test</Text>
        <Text style={styles.body}>
          Without brushing, pull your hair into a low ponytail. How thick is the ponytail?
        </Text>

        {!showResult ? (
          <>
            {OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.option, selection === opt.key && styles.optionSelected]}
                onPress={() => setSelection(opt.key)}
              >
                <Text style={[styles.optionText, selection === opt.key && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}

            {selection && (
              <Button
                label="See my result"
                onPress={() => setShowResult(true)}
                style={{ marginTop: spacing.md }}
              />
            )}
          </>
        ) : (
          <>
            <AuntyBubble auntyId="3" message={selected!.revealMsg} />
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>
                {selected!.key.charAt(0).toUpperCase() + selected!.key.slice(1)} Density
              </Text>
              <Text style={styles.resultBody}>{selected!.description}</Text>
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm,
  },
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  progressWrap: { flex: 1 },
  content: { padding: spacing.md },
  councilRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  councilAvatar: { borderWidth: 2, borderColor: colors.canvas, borderRadius: 20 },
  heading: { fontFamily: fonts.display, fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.ink, marginBottom: spacing.sm },
  body: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg },
  option: {
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: colors.border, marginBottom: spacing.sm, backgroundColor: colors.canvas,
  },
  optionSelected: { borderColor: colors.amber, backgroundColor: colors.surface },
  optionText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  optionTextSelected: { fontWeight: fontWeight.bold, color: colors.ink },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  resultTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.ink, marginBottom: spacing.sm },
  resultBody: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
});
