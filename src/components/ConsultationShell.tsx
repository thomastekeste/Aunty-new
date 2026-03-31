/**
 * Duolingo-style shell for all consultation screens (5–18).
 * Dark background · aunty avatar + speech bubble · full-width option rows · locked Continue button.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ProgressBar from './ProgressBar';
import AuntyAvatar from './AuntyAvatar';
import { BackIcon } from './Icons';
import { colors, auntyColors, spacing, fontSize, fontWeight, fonts, radius } from '@/constants/theme';

// Dark warm charcoal — the consultation "focus mode" background
const SHELL_BG = '#171210';
const SHELL_SURFACE = 'rgba(255,255,255,0.06)';

interface ConsultationShellProps {
  step: number;
  totalSteps: number;
  auntyId: string;
  auntyMessage: string;
  question: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ConsultationShell({
  step,
  totalSteps,
  auntyId,
  auntyMessage,
  question,
  onBack,
  children,
  footer,
}: ConsultationShellProps) {
  const insets = useSafeAreaInsets();
  const ac = auntyColors[auntyId];
  const consultationStep = step - 4;
  const consultationTotal = totalSteps - 4;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Top bar — back + progress */}
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon color="rgba(255,255,255,0.7)" size={22} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.progressWrap}>
          <ProgressBar current={consultationStep} total={consultationTotal} dark />
        </View>
        <Text style={styles.stepCount}>{consultationStep}/{consultationTotal}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Aunty + speech bubble row — Duolingo style */}
        <View style={styles.bubbleRow}>
          {/* Avatar with accent ring */}
          <View style={[styles.avatarRing, { borderColor: ac.accent }]}>
            <AuntyAvatar auntyId={auntyId} size={72} />
          </View>

          {/* Speech bubble with left tail */}
          <View style={styles.bubbleWrap}>
            <View style={styles.bubbleTail} />
            <View style={[styles.bubble, { borderColor: `${ac.accent}30` }]}>
              <Text style={styles.bubbleText}>{auntyMessage}</Text>
            </View>
          </View>
        </View>

        {/* Question */}
        <Text style={styles.question}>{question}</Text>

        {/* Options */}
        <View style={styles.options}>{children}</View>
      </ScrollView>

      {/* Footer — locked Continue button */}
      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SHELL_BG,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrap: { flex: 1 },
  stepCount: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: fontWeight.bold,
    width: 30,
    textAlign: 'right',
  },

  // Aunty + bubble
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  avatarRing: {
    borderWidth: 2.5,
    borderRadius: 40,
    padding: 2,
    flexShrink: 0,
  },
  bubbleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    fontWeight: fontWeight.medium,
  },

  // Question
  question: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: '#ffffff',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    letterSpacing: -0.5,
    lineHeight: 34,
  },

  // Options
  scroll: { flex: 1 },
  content: { paddingTop: spacing.sm },
  options: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: SHELL_BG,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
});
