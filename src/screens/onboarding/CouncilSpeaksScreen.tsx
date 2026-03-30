import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CouncilSpeaks'>;
const AUNTY_IDS = ['1', '2', '3', '4', '5', '6', '7'];

export default function CouncilSpeaksScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { councilResponse, data } = useOnboarding();
  const [visibleCount, setVisibleCount] = useState(0);

  // Stagger aunty messages in one by one
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
            delay={0} // Already staggered by visibleCount
          />
        ))}

        {visibleCount >= 7 && councilResponse?.consensus && (
          <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.consensusCard}>
            <Text style={styles.consensusLabel}>The Council</Text>
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
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.canvas,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  content: { padding: spacing.md },
  consensusCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.amber,
  },
  consensusLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.amberLight,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  consensusText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.canvas,
    lineHeight: 26,
  },
  signoff: {
    fontFamily: fonts.body,
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
  },
});
