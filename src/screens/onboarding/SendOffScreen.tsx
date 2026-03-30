import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import { routineService } from '@/services/supabase';
import { userService } from '@/services/supabase';
import { notificationService } from '@/services/notifications';
import { useSubscription } from '@/context/SubscriptionContext';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, spacing, fontSize, fontWeight, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SendOff'>;
const AUNTY_IDS = ['1', '2', '3', '4', '5', '6', '7'];

export default function SendOffScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const { data, hairAnalysis, councilResponse, routine } = useOnboarding();
  const { isActive } = useSubscription();

  const portraitsFade = useRef(new Animated.Value(0)).current;
  const messageFade = useRef(new Animated.Value(0)).current;
  const signoffFade = useRef(new Animated.Value(0)).current;
  const finalLineScale = useRef(new Animated.Value(0.6)).current;
  const finalLineFade = useRef(new Animated.Value(0)).current;
  const calendarSlide = useRef(new Animated.Value(60)).current;
  const calendarFade = useRef(new Animated.Value(0)).current;
  const sharesFade = useRef(new Animated.Value(0)).current;

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Save routine to Supabase
    if (user && routine && councilResponse && !saved) {
      setSaved(true);
      routineService.save(user.id, routine, councilResponse).catch(console.error);
      userService.update(user.id, {
        onboarding_complete: true,
        onboarding_step_completed: 22,
      }).then(() => {
        updateUser({ onboarding_complete: true });
      }).catch(console.error);

      // Schedule check-in notifications if subscribed
      if (isActive) {
        notificationService.scheduleCheckinReminders().catch(console.error);
      }
    }

    // Run animation sequence
    Animated.sequence([
      // Portraits drop in
      Animated.timing(portraitsFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      // Message fades in
      Animated.delay(200),
      Animated.timing(messageFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(400),
      Animated.timing(signoffFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(400),
      // Final line scales in
      Animated.parallel([
        Animated.timing(finalLineFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(finalLineScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
      Animated.delay(600),
      // Calendar slides up
      Animated.parallel([
        Animated.timing(calendarSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(calendarFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      // Shares fade in
      Animated.timing(sharesFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My curl type is ${hairAnalysis?.curl_type?.toUpperCase() ?? 'natural'} and the Aunty council just built my personalized routine. Get yours at auntyco.app`,
      });
    } catch {}
  };

  const handleContinue = () => {
    // Navigate to home — RootNavigator will switch because onboarding_complete = true
    // Force re-render by updating user context
    navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
  };

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Overlapping portraits */}
      <Animated.View style={[styles.portraits, { opacity: portraitsFade }]}>
        {AUNTY_IDS.map((id, i) => (
          <View key={id} style={[styles.avatarWrap, { marginLeft: i === 0 ? 0 : -14 }]}>
            <AuntyAvatar auntyId={id} size={56} />
          </View>
        ))}
      </Animated.View>

      {/* Personalized message */}
      <Animated.Text style={[styles.message, { opacity: messageFade }]}>
        {data.name ?? 'Friend'}, your {hairAnalysis?.curl_type?.toUpperCase() ?? 'natural'} hair routine is ready.
      </Animated.Text>

      <Animated.Text style={[styles.signoff, { opacity: signoffFade }]}>
        — All seven aunties
      </Animated.Text>

      {/* Final line */}
      <Animated.Text
        style={[
          styles.finalLine,
          { opacity: finalLineFade, transform: [{ scale: finalLineScale }] },
        ]}
      >
        Go live and make ya aunty proud.
      </Animated.Text>

      {/* 4-week calendar */}
      <Animated.View
        style={[
          styles.calendar,
          { opacity: calendarFade, transform: [{ translateY: calendarSlide }] },
        ]}
      >
        {weeks.map((w, i) => (
          <View key={i} style={styles.weekDot}>
            <View style={[styles.dot, i === 0 && styles.dotActive]} />
            <Text style={styles.weekLabel}>{w}</Text>
          </View>
        ))}
        <Text style={styles.calendarNote}>The aunties will check in. Don't ghost them.</Text>
      </Animated.View>

      {/* Share + Continue */}
      <Animated.View style={[styles.actions, { opacity: sharesFade }]}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share my result</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Go to my routine →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  portraits: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: { borderWidth: 2, borderColor: colors.ink, borderRadius: 32 },
  message: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.canvas,
    textAlign: 'center', lineHeight: 30, marginBottom: spacing.sm,
  },
  signoff: {
    fontFamily: fonts.body,
    marginBottom: spacing.xl, textTransform: 'uppercase', letterSpacing: 1,
  },
  finalLine: {
    fontFamily: fonts.display,
    fontSize: 26, fontWeight: fontWeight.black, color: colors.amber,
    textAlign: 'center', lineHeight: 32, marginBottom: spacing.xl,
  },
  calendar: {
    alignItems: 'center', marginBottom: spacing.xl,
  },
  weekDot: { alignItems: 'center', marginBottom: spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(245,196,138,0.25)', marginBottom: 2 },
  dotActive: { backgroundColor: colors.amber },
  weekLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted, fontWeight: fontWeight.medium },
  calendarNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm, color: colors.muted, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: 20,
  },
  actions: { gap: spacing.sm, alignItems: 'center', width: '100%' },
  shareBtn: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    borderWidth: 1.5, borderColor: 'rgba(245,196,138,0.35)', borderRadius: 999,
    width: '100%', alignItems: 'center',
  },
  shareBtnText: { fontFamily: fonts.body, fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.amberLight },
  continueBtn: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    backgroundColor: colors.amber, borderRadius: 999,
    width: '100%', alignItems: 'center',
    shadowColor: colors.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueBtnText: { fontFamily: fonts.body, fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.canvas },
});
