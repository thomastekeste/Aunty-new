/**
 * OptionCard — Selection card for single/multi-select consultation answers.
 *
 * Dark surface style with icon box, label, and accent-colored selected state.
 * Designed for warm, premium feel on dark consultation backgrounds.
 */

import React, { useCallback } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
} from '../constants/theme';
import type { AuntyId } from '../constants/aunties';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  auntyId: AuntyId;
  index?: number;
}

export function OptionCard({
  label,
  description,
  icon,
  selected,
  onPress,
  auntyId,
  index = 0,
}: Props) {
  const ac = auntyColors[auntyId];
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    opacity.value = withTiming(0.85, { duration: 90 });
    scale.value = withSpring(0.985, { damping: 16, stiffness: 220, mass: 0.35 });
  }, []);

  const handlePressOut = useCallback(() => {
    opacity.value = withTiming(1, { duration: 140 });
    scale.value = withSpring(1, { damping: 16, stiffness: 220, mass: 0.35 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Animated.View entering={FadeInDown.delay(80 * index).duration(400)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label}${selected ? ', selected' : ', not selected'}`}
        accessibilityHint={description ? description : `Tap to ${selected ? 'deselect' : 'select'} ${label}`}
      >
        <View
          style={[
            styles.card,
            selected && {
              borderColor: ac.accent,
              backgroundColor: ac.accent + '1F',
            },
          ]}
        >
          {icon && icon.length > 0 ? (
            <View
              style={[
                styles.iconBox,
                selected && { backgroundColor: ac.accent + '25' },
              ]}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </View>
          ) : null}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                selected && { color: colors.dark.text },
              ]}
            >
              {label}
            </Text>
            {description ? (
              <Text
                style={[
                  styles.description,
                  selected && { color: colors.dark.textMuted },
                ]}
              >
                {description}
              </Text>
            ) : null}
          </View>
          {selected && (
            <View style={[styles.checkmark, { backgroundColor: ac.accent }]}>
              <Text style={styles.checkmarkText}>{'\u2713'}</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    marginBottom: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.dark.textMuted,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    marginTop: 2,
    lineHeight: fontSize.sm * 1.4,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
});
