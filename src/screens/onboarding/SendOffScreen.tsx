/**
 * SendOffScreen — The emotional close.
 *
 * "The Letter": the council's blessing writes itself in gold script and is
 * signed by your aunty (see HandwrittenBlessing). On complete, the "Let's go"
 * CTA rises over the warm cream ground.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HandwrittenBlessing } from '../../components/HandwrittenBlessing';
import { CeremonialButton } from '../../components/CeremonialButton';
import type { AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { API_URL } from '../../services/api';
import { supabase } from '../../services/supabase';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';

export default function SendOffScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { state, complete } = useOnboarding();
  const name = state.data.name || 'Queen';
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';

  const [showButton, setShowButton] = useState(false);
  const [runId, setRunId] = useState(0); // dev replay: remounts the animation

  const handleComplete = useCallback(() => {
    setShowButton(true);
  }, []);

  const handleReplay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowButton(false);
    setRunId((n) => n + 1);
  }, []);

  const handleBegin = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try { await AsyncStorage.setItem('onboarding_completed_at', new Date().toISOString()); } catch {}
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      fetch(`${API_URL}/api/onboarding/intake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(state.data),
      }).catch(() => {});
    } catch {}
    complete();
  }, [complete, state.data]);

  return (
    <View style={styles.container}>
      <HandwrittenBlessing key={runId} name={name} chosenAuntyId={auntyId} onComplete={handleComplete} />

      {__DEV__ && (
        <View
          pointerEvents="box-none"
          style={[styles.devBar, { paddingTop: insets.top + spacing.sm }]}
        >
          {navigation.canGoBack() && (
            <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.devPill}>
              <Text style={styles.devPillText}>{'\u2039'} Back</Text>
            </Pressable>
          )}
          <Pressable onPress={handleReplay} hitSlop={10} style={styles.devPill}>
            <Text style={styles.devPillText}>{'\u21BB'} Replay</Text>
          </Pressable>
        </View>
      )}

      {showButton && (
        <View
          pointerEvents="box-none"
          style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.xl }]}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={styles.btnWrap}>
            <CeremonialButton label="Let's go" onPress={handleBegin} size="lg" />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  devBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 30,
  },
  devPill: {
    backgroundColor: 'rgba(45, 27, 14, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  devPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.canvas,
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  btnWrap: { width: '100%' },
});
