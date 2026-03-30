/**
 * Shell used for all consultation screens (5-18).
 * Renders: safe area, back arrow, progress bar, aunty bubble, question, options.
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
import ProgressBar from './ProgressBar';
import AuntyBubble from './AuntyBubble';
import { BackIcon } from './Icons';
import { colors, spacing, fontSize, fontWeight, fonts } from '@/constants/theme';

interface ConsultationShellProps {
  step: number;        // Current step (e.g. 5)
  totalSteps: number;  // Total steps in consultation (e.g. 18)
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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <BackIcon color={colors.ink} size={22} strokeWidth={1.8} />
          </TouchableOpacity>
        ) : (
          <View style={styles.back} />
        )}
        <View style={styles.progressWrap}>
          <ProgressBar current={step - 4} total={totalSteps - 4} />
        </View>
        <Text style={styles.stepCount}>{step - 4}/{totalSteps - 4}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuntyBubble auntyId={auntyId} message={auntyMessage} />

        <Text style={styles.question}>{question}</Text>

        <View style={styles.options}>{children}</View>
      </ScrollView>

      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  progressWrap: { flex: 1 },
  stepCount: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted, fontWeight: fontWeight.medium, width: 36, textAlign: 'right' },
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  question: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 30,
  },
  options: { gap: spacing.xs },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
  },
});
