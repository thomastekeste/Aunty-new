/**
 * EditorialCard — Magazine-style selection card.
 *
 * Replaces OptionCard for the redesign. Visual signature:
 *   • aunty-tinted left bar (4px → 6px when selected)
 *   • warm dark glass surface with a subtle top-edge highlight
 *   • oversized icon zone (left of bar) for emoji/glyph
 *   • label in editorial serif, description in italic muted serif
 *   • on select: card lifts (shadow grows), bar thickens, gold checkmark
 *     badge drops in with a spring from the top-right corner
 *   • on press: spring scale 0.985 + opacity 0.9
 */

import React, { useCallback, useEffect } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  salon,
} from '../constants/theme';
import type { AuntyId } from '../constants/aunties';

interface Props {
  label: string;
  description?: string;
  icon?: string | React.ReactNode;
  selected: boolean;
  onPress: () => void;
  auntyId: AuntyId;
  index?: number;
  /** Compact mode = no icon zone, tighter padding (used for grids). */
  compact?: boolean;
  /** Optional tag chip displayed top-right (e.g. "POPULAR"). */
  tag?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 16, stiffness: 220, mass: 0.35 };
const SELECT_SPRING = { damping: 14, stiffness: 180, mass: 0.6 };

export function EditorialCard({
  label,
  description,
  icon,
  selected,
  onPress,
  auntyId,
  index = 0,
  compact = false,
  tag,
}: Props) {
  const ac = auntyColors[auntyId];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const lift = useSharedValue(selected ? 1 : 0);
  const checkScale = useSharedValue(selected ? 1 : 0);
  const barWidth = useSharedValue(selected ? salon.bar.widthSelected : salon.bar.width);

  useEffect(() => {
    lift.value = withTiming(selected ? 1 : 0, { duration: 220 });
    barWidth.value = withTiming(selected ? salon.bar.widthSelected : salon.bar.width, { duration: 200 });
    checkScale.value = selected
      ? withSpring(1, SELECT_SPRING)
      : withTiming(0, { duration: 160 });
  }, [selected]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.985, PRESS_SPRING);
    opacity.value = withTiming(0.92, { duration: 90 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, PRESS_SPRING);
    opacity.value = withTiming(1, { duration: 140 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardLiftStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.25 + lift.value * 0.25,
    shadowRadius: 12 + lift.value * 14,
    transform: [{ translateY: -lift.value * 1.5 }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: barWidth.value,
    backgroundColor: ac.accent,
    opacity: 0.5 + lift.value * 0.5,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(360)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label}${selected ? ', selected' : ''}`}
        accessibilityHint={description}
      >
        <Animated.View
          style={[
            styles.card,
            compact && styles.cardCompact,
            cardLiftStyle,
            {
              shadowColor: ac.accent,
              backgroundColor: selected ? ac.accent + '14' : salon.card.surface,
              borderColor: selected ? ac.accent + '55' : salon.card.border,
            },
          ]}
        >
          {/* aunty-tinted left bar */}
          <Animated.View style={[styles.bar, barStyle]} />

          {/* top-edge inner highlight */}
          <LinearGradient
            colors={['rgba(255, 250, 240, 0.07)', 'rgba(255, 250, 240, 0)']}
            style={styles.topHighlight}
            pointerEvents="none"
          />

          <View style={[styles.body, compact && styles.bodyCompact]}>
            {icon && !compact ? (
              <View
                style={[
                  styles.iconZone,
                  { backgroundColor: selected ? ac.accent + '22' : 'rgba(255, 250, 240, 0.04)' },
                ]}
              >
                {typeof icon === 'string' ? (
                  <Text style={styles.iconGlyph}>{icon}</Text>
                ) : (
                  icon
                )}
              </View>
            ) : null}

            <View style={styles.text}>
              <Text
                style={[
                  styles.label,
                  selected && { color: colors.dark.text },
                ]}
                numberOfLines={2}
              >
                {label}
              </Text>
              {description ? (
                <Text style={styles.description}>{description}</Text>
              ) : null}
            </View>
          </View>

          {tag ? (
            <View style={[styles.tag, { backgroundColor: ac.accent }]}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ) : null}

          <Animated.View style={[styles.checkBadge, checkStyle, { backgroundColor: ac.accent }]}>
            <Text style={styles.checkGlyph}>{'\u2713'}</Text>
          </Animated.View>
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  cardCompact: {
    minHeight: 92,
  },
  bar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md + salon.bar.widthSelected,
    paddingRight: spacing.md,
  },
  bodyCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  iconZone: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 24 },
  text: { flex: 1 },
  label: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.lg,
    color: colors.dark.text,
    letterSpacing: -0.1,
  },
  description: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    marginTop: 4,
    lineHeight: fontSize.sm * 1.4,
  },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  tagText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1.4,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  checkGlyph: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    lineHeight: 16,
  },
});
