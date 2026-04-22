/**
 * ChangeAuntyScreen — Pick a new aunty guide.
 *
 * Reuses the same aunty grid aesthetic from onboarding.
 * Pre-selects the current aunty. On confirm calls setChosenAunty() and pops back.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  letterSpacing,
  auntyColors,
  shadows,
} from '../../constants/theme';
import { AUNTIES, COUNCIL_ORDER, type AuntyId } from '../../constants/aunties';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { useOnboarding } from '../../context/OnboardingContext';

export default function ChangeAuntyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, setChosenAunty } = useOnboarding();

  const currentAuntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const [selected, setSelected] = useState<AuntyId>(currentAuntyId);
  const selectedAunty = AUNTIES[selected];
  const ac = auntyColors[selected];

  const handleSelect = useCallback((id: AuntyId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  }, []);

  const handleConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChosenAunty(selected);
    navigation.goBack();
  }, [selected, setChosenAunty, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Choose Your Aunty</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Your aunty is your personal hair guide. You can switch any time.</Text>

        {/* Aunty grid */}
        <View style={styles.grid}>
          {COUNCIL_ORDER.map((id, i) => {
            const aunty = AUNTIES[id];
            const active = selected === id;
            const cardAc = auntyColors[id];
            return (
              <Animated.View key={id} entering={FadeInDown.delay(i * 60).duration(350)}>
                <Pressable
                  style={[
                    styles.auntyCard,
                    active && { borderColor: cardAc.accent, borderWidth: 2.5, backgroundColor: cardAc.bgDark },
                  ]}
                  onPress={() => handleSelect(id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`${aunty.name}, ${aunty.title}`}
                >
                  <View style={[styles.avatarWrap, active && { ...shadows.md }]}>
                    <AuntyAvatar auntyId={id} size={64} showRing={active} glowing={active} />
                  </View>
                  <Text style={[styles.auntyName, active && { color: cardAc.accent }]}>{aunty.name}</Text>
                  <Text style={styles.auntyTitle} numberOfLines={1}>{aunty.title}</Text>
                  {active && (
                    <View style={[styles.selectedBadge, { backgroundColor: cardAc.accent }]}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Selected aunty greeting card */}
        {selectedAunty && (
          <Animated.View key={selected} entering={FadeInDown.duration(300)} style={[styles.greetingCard, { borderLeftColor: ac.accent, backgroundColor: ac.bgDark }]}>
            <AuntyAvatar auntyId={selected} size={40} showRing />
            <View style={{ flex: 1 }}>
              <Text style={[styles.greetingName, { color: ac.accent }]}>Aunty {selectedAunty.name} says:</Text>
              <Text style={styles.greetingText} numberOfLines={3}>{selectedAunty.greeting}</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Confirm button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={[styles.confirmBtn, { backgroundColor: ac.accent }]}
          onPress={handleConfirm}
          accessibilityRole="button"
          accessibilityLabel={`Choose Aunty ${selectedAunty?.name}`}
        >
          <Text style={styles.confirmBtnText}>Choose Aunty {selectedAunty?.name}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  navTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
    letterSpacing: letterSpacing.tight,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: fontSize.sm * 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  auntyCard: {
    width: 140,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    gap: spacing.xs,
    position: 'relative',
  },
  avatarWrap: {
    marginBottom: spacing.xs,
  },
  auntyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  auntyTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    textAlign: 'center',
  },
  auntyRegion: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    opacity: 0.7,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  greetingName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    marginBottom: 4,
  },
  greetingText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.inkLight,
    fontStyle: 'italic',
    lineHeight: fontSize.sm * 1.5,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  confirmBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: '#FFFFFF',
    letterSpacing: letterSpacing.wide,
  },
});
