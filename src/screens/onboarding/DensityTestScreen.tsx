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

const OPTIONS: Array<{
  key: Density;
  label: string;
  icon: string;
  color: string;
  description: string;
  revealMsg: string;
}> = [
  {
    key: 'thin',
    label: 'Thin — less than a pencil',
    icon: '✨',
    color: '#00B4D8',
    description: 'Fine, lightweight products. Heavy creams will weigh you down.',
    revealMsg: "Fine hair — every product choice matters. We go light, strategic, and deliberate. Don't pile it on.",
  },
  {
    key: 'medium',
    label: 'Medium — about a pencil',
    icon: '↔️',
    color: '#F5C542',
    description: 'Most products work for you. Balance moisture and weight.',
    revealMsg: "Medium density — you have flexibility. We'll balance moisture without overdoing the weight.",
  },
  {
    key: 'thick',
    label: 'Thick — thicker than a pencil',
    icon: '💪',
    color: '#FB5607',
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
        {!showResult ? (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.stepBadge}>Step 3 of 3</Text>
              <Text style={styles.heading}>Density Test</Text>
              <Text style={styles.tagline}>Understanding your hair thickness</Text>
            </View>

            <View style={styles.fullCard}>
              <View style={styles.cardIconSection}>
                <Text style={styles.largeIcon}>📏</Text>
                <View style={styles.geometricDecor} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardQuestion}>How thick is your hair?</Text>
                <Text style={styles.cardDescription}>
                  Without brushing, pull your hair into a low ponytail. Density tells us how much hair volume you're working with — this affects product choice and wash time.
                </Text>
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionTitle}>How to measure:</Text>
                  <Text style={styles.instructionText}>• Pull hair into a low ponytail (no brushing)</Text>
                  <Text style={styles.instructionText}>• Compare thickness to a pencil</Text>
                  <Text style={styles.instructionText}>• Be honest about what you see</Text>
                </View>
              </View>
            </View>

            <View style={styles.fullCard}>
              <Text style={styles.cardQuestion}>What's your density?</Text>
              <Text style={styles.cardDescription}>Select your ponytail thickness:</Text>
              <View style={styles.optionsContainer}>
                {OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.answerCard,
                      selection === opt.key && styles.answerCardSelected,
                      { borderColor: selection === opt.key ? opt.color : colors.borderLight },
                      selection === opt.key && { backgroundColor: `${opt.color}12` },
                    ]}
                    onPress={() => setSelection(opt.key)}
                  >
                    <Text style={styles.answerIcon}>{opt.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.answerText, selection === opt.key && { color: opt.color, fontWeight: fontWeight.black }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.answerSubtext, selection === opt.key && { color: opt.color }]}>
                        {opt.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selection && (
              <Button
                label="See my result"
                onPress={() => setShowResult(true)}
              />
            )}
          </>
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.stepBadge}>Your Result</Text>
              <Text style={styles.heading}>{selected!.key.charAt(0).toUpperCase() + selected!.key.slice(1)} Density</Text>
            </View>

            <View style={[styles.fullCard, { borderLeftWidth: 6, borderLeftColor: selected!.color }]}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultIcon, { color: selected!.color }]}>{selected!.icon}</Text>
                <View>
                  <Text style={styles.resultLabel}>Density Profile</Text>
                  <Text style={[styles.resultTitle, { color: selected!.color }]}>
                    {selected!.key.charAt(0).toUpperCase() + selected!.key.slice(1)} Density
                  </Text>
                </View>
              </View>

              <Text style={styles.resultDescription}>{selected!.description}</Text>

              <AuntyBubble auntyId="3" message={selected!.revealMsg} />
            </View>

            <Button label="Continue to photos" onPress={handleContinue} />
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
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  geometricDecor: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    backgroundColor: colors.primary,
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
    backgroundColor: 'rgba(245,197,66,0.05)',
    borderLeft: 4,
    borderLeftColor: colors.primary,
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
    alignItems: 'flex-start',
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
    fontSize: 28,
    marginTop: spacing.xs,
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  answerSubtext: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
    fontWeight: fontWeight.medium,
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
    fontSize: 40,
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
  resultDescription: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
});
