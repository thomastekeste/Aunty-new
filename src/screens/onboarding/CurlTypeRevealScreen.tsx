import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CurlTypeReveal'>;

const CURL_DESCRIPTIONS: Record<string, string> = {
  '2a': 'Loose, fine waves. Prone to going flat. Needs lightweight products and minimal manipulation.',
  '2b': 'Defined S-shaped waves with medium texture. Balance moisture and hold.',
  '2c': 'Thick, defined waves that are frizz-prone. Needs frizz control and definition.',
  '3a': 'Loose, shiny spirals that dry beautifully with gel or cream.',
  '3b': 'Medium, springy ringlets that need consistent moisture and definition.',
  '3c': 'Tight corkscrews with high shrinkage. Deep conditioning is non-negotiable.',
  '4a': 'Tight S-coils that are very defined when moisturized. Absorbs product beautifully.',
  '4b': 'Z-shaped coils with no defined curl pattern. Needs heavy moisture and proper sealing.',
  '4c': 'Tightly coiled, densely packed hair with the highest shrinkage. Maximum moisture, always.',
};

export default function CurlTypeRevealScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { hairAnalysis } = useOnboarding();

  const curlType = hairAnalysis?.curl_type ?? '3b';
  const description = CURL_DESCRIPTIONS[curlType] ?? 'Your unique curl pattern has been identified.';
  const concerns = hairAnalysis?.visible_concerns ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark hero reveal */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>The council has spoken</Text>
          <Text style={styles.heroCurlType}>{curlType.toUpperCase()}</Text>
          <View style={styles.heroRule} />
          <Text style={styles.heroDesc}>{description}</Text>
        </View>

        {/* Ngozi's take */}
        <View style={styles.section}>
          <AuntyBubble
            auntyId="1"
            message={`${hairAnalysis?.condition_assessment ?? "I've seen what I need to see."} Now we build.`}
          />
        </View>

        {/* Texture read */}
        {hairAnalysis?.texture_description && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>What I saw</Text>
            <Text style={styles.cardBody}>{hairAnalysis.texture_description}</Text>
          </View>
        )}

        {/* Concerns */}
        {concerns.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>What we're addressing</Text>
            <View style={styles.tags}>
              {concerns.map((c, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="Keep going." onPress={() => navigation.navigate('WashFrequency')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { gap: spacing.md },

  hero: {
    backgroundColor: colors.ink,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  heroEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.amberLight,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  heroCurlType: {
    fontFamily: fonts.display,
    fontSize: 96,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -4,
    lineHeight: 96,
  },
  heroRule: {
    width: 48,
    height: 3,
    backgroundColor: colors.amber,
    borderRadius: 2,
    marginVertical: spacing.md,
  },
  heroDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: 'rgba(254,249,243,0.65)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },

  section: { paddingHorizontal: spacing.md },

  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.offWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  cardBody: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  footer: {
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.canvas,
  },
});
