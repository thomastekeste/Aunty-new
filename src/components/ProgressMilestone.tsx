import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AuntyAvatar from './AuntyAvatar';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors } from '@/constants/theme';
import { AUNTIES } from '@/constants/aunties';

interface Props {
  visible: boolean;
  milestone: 25 | 50 | 75;
  auntyId?: string;
  message?: string;
  onDismiss: () => void;
}

const MILESTONE_DATA: Record<25 | 50 | 75, { auntyId: string; message: string }> = {
  25: {
    auntyId: '2', // Marcia
    message: "You're warming up to us. Marcia's getting excited to help.",
  },
  50: {
    auntyId: '1', // Ngozi
    message: "Halfway there! The council is really seeing you now.",
  },
  75: {
    auntyId: '4', // Fatou
    message: "Almost ready — Fatou's sketching your routine.",
  },
};

const { height } = Dimensions.get('window');

export default function ProgressMilestone({
  visible,
  milestone,
  auntyId: customAuntyId,
  message: customMessage,
  onDismiss,
}: Props) {
  const data = MILESTONE_DATA[milestone];
  const auntyId = customAuntyId || data.auntyId;
  const message = customMessage || data.message;
  const aunty = AUNTIES[auntyId];
  const auntyColor = auntyColors[auntyId];

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [scaleAnim, opacityAnim, onDismiss]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(dismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, dismiss, scaleAnim, opacityAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={dismiss}
        />

        <Animated.View
          style={[
            styles.card,
            {
              borderTopColor: auntyColor.accent,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Milestone badge */}
          <View style={[styles.milestoneBadge, { backgroundColor: auntyColor.accent }]}>
            <Text style={styles.milestoneBadgeText}>{milestone}%</Text>
          </View>

          {/* Aunty avatar */}
          <AuntyAvatar auntyId={auntyId} size={80} />

          {/* Aunty name and celebration */}
          <Text style={[styles.auntyName, { color: auntyColor.accent }]}>
            {aunty.name}
          </Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Dismiss hint */}
          <Text style={styles.hint}>Tap to continue</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    borderTopWidth: 4,
    width: '80%',
    maxWidth: 320,
  },
  milestoneBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -30,
  },
  milestoneBadgeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.surface,
    fontFamily: fonts.display,
  },
  auntyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    fontFamily: fonts.display,
    marginTop: spacing.md,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.mutedBase,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.mutedLight,
    fontFamily: fonts.body,
  },
});
