import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { colors, spacing, fontSize, fontWeight, fonts, radius } from '@/constants/theme';
import AuntyAvatar from '@/components/AuntyAvatar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;
const AUNTY_IDS = ['1', '2', '3', '4', '5', '6', '7'];

export default function SplashScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top council row */}
      <View style={styles.councilRow}>
        {AUNTY_IDS.map((id, i) => (
          <View
            key={id}
            style={[styles.avatarWrap, { marginLeft: i === 0 ? 0 : -14, zIndex: AUNTY_IDS.length - i }]}
          >
            <AuntyAvatar auntyId={id} size={56} />
          </View>
        ))}
      </View>

      {/* Wordmark block */}
      <View style={styles.wordmarkBlock}>
        <Text style={styles.wordmark}>Aunty</Text>
        {/* Amber signature rule */}
        <View style={styles.rule} />
        <Text style={styles.tagline}>The Curl Council</Text>
      </View>

      {/* CTA block */}
      <View style={styles.ctaBlock}>
        <TouchableOpacity
          style={styles.primaryCta}
          onPress={() => navigation.navigate('MeetCouncil')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryCtaText}>Meet the council</Text>
        </TouchableOpacity>

        {/* Hidden dev button for quick testing if needed */}
        {/* Uncomment below to enable "Test onboarding" shortcut */}
        {/* <TouchableOpacity style={styles.devBtn} onPress={() => navigation.navigate('PorosityTest')}>
          <Text style={styles.devBtnText}>Skip to tests</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  councilRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: 32,
  },
  wordmarkBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 80,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -3,
    lineHeight: 80,
  },
  rule: {
    width: 64,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.secondary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  ctaBlock: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  primaryCta: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryCtaText: {
    fontFamily: fonts.body,
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  devBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  devBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
  devDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.muted,
    opacity: 0.4,
  },
});
