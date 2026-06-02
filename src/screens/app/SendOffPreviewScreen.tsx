/**
 * SendOffPreviewScreen — DEV-only harness for the send-off "letter".
 *
 * The real SendOff is unreachable once onboarding is complete, so this lets us
 * verify and iterate on HandwrittenBlessing in isolation. It has NO onboarding
 * side effects: no complete(), no intake POST, no storage writes.
 *
 * Replay re-mounts the blessing; "Next aunty" cycles the signer so we can check
 * all seven signatures/flourishes.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HandwrittenBlessing } from '../../components/HandwrittenBlessing';
import { COUNCIL_ORDER, AUNTIES, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors, fonts, fontSize, spacing, radius } from '../../constants/theme';

export default function SendOffPreviewScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const name = state.data.name || 'Amara';

  const [auntyIndex, setAuntyIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState(false);

  const auntyId: AuntyId = COUNCIL_ORDER[auntyIndex];

  const replay = useCallback(() => {
    setDone(false);
    setRunId((n) => n + 1);
  }, []);

  const nextAunty = useCallback(() => {
    setDone(false);
    setAuntyIndex((i) => (i + 1) % COUNCIL_ORDER.length);
    setRunId((n) => n + 1);
  }, []);

  return (
    <View style={styles.container}>
      <HandwrittenBlessing
        key={`${auntyId}-${runId}`}
        name={name}
        chosenAuntyId={auntyId}
        onComplete={() => setDone(true)}
      />

      <View style={[styles.devBar, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.pill}>
          <Text style={styles.pillText}>Close</Text>
        </Pressable>
        <Text style={styles.label}>
          DEV · signed by {AUNTIES[auntyId].name}
          {done ? ' · done' : ''}
        </Text>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.lg }]} pointerEvents="box-none">
        <Pressable onPress={replay} style={styles.pill}>
          <Text style={styles.pillText}>↻ Replay</Text>
        </Pressable>
        <Pressable onPress={nextAunty} style={styles.pill}>
          <Text style={styles.pillText}>Next aunty →</Text>
        </Pressable>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 20,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 0.3,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 20,
  },
  pill: {
    backgroundColor: 'rgba(45, 27, 14, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  pillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.canvas,
    letterSpacing: 0.3,
  },
});
