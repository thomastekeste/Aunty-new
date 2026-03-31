import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import { AUNTIES } from '@/constants/aunties';
import AuntyBubble from '@/components/AuntyBubble';
import AuntyAvatar from '@/components/AuntyAvatar';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors, shadows } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CouncilSpeaks'>;
const AUNTY_IDS = ['1', '2', '3', '4', '5', '6', '7'];

export default function CouncilSpeaksScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { councilResponse, data } = useOnboarding();
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = AUNTY_IDS.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), i * 600 + 300)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const messages = AUNTY_IDS.map(id => councilResponse?.[id]).filter(Boolean) as any[];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>The verdict is in</Text>
        <Text style={styles.title}>The aunties are weighing in.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {messages.slice(0, visibleCount).map((msg, i) => (
          <AuntyBubble
            key={msg.aunty_id}
            auntyId={msg.aunty_id}
            message={msg.message}
            animated
            delay={0}
          />
        ))}

        {visibleCount >= 7 && councilResponse?.consensus && (
          <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.consensusCard}>
            {/* Glow orb */}
            <View style={styles.consensusGlow} />

            {/* All 7 aunty avatars */}
            <View style={styles.consensusAvatarRow}>
              {AUNTY_IDS.map((id, i) => (
                <View
                  key={id}
                  style={[
                    styles.consensusAvatar,
                    { marginLeft: i === 0 ? 0 : -10, zIndex: AUNTY_IDS.length - i, borderColor: auntyColors[id].accent },
                  ]}
                >
                  <AuntyAvatar auntyId={id} size={32} />
                </View>
              ))}
            </View>

            <Text style={styles.consensusLabel}>The Collective</Text>
            <View style={styles.consensusRule} />
            <Text style={styles.consensusText}>{String(councilResponse.consensus)}</Text>
            <Text style={styles.signoff}>— All seven aunties</Text>
          </Animated.View>
        )}
      </ScrollView>

      {visibleCount >= 7 && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(800)}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <Button label="See your routine." onPress={() => navigation.navigate('Routine')} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  content: { padding: spacing.md, gap: spacing.sm },

  // Consensus card
  consensusCard: {
    backgroundColor: colors.inkDeep,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    ...shadows.lg,
  },
  consensusGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  consensusAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  consensusAvatar: {
    borderWidth: 2,
    borderRadius: 18,
  },
  consensusLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  consensusRule: {
    width: 32,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  consensusText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.canvas,
    lineHeight: 28,
  },
  signoff: {
    fontFamily: fonts.body,
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: 'rgba(254,249,243,0.4)',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
});
