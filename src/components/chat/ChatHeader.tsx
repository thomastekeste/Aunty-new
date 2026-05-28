/**
 * ChatHeader — Premium header with aunty gradient, navigation, and online dot.
 *
 * Tapping the avatar/name navigates to ChangeAunty screen.
 * Gradient background tinted with the aunty's color.
 * New-chat button clears conversation.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AuntyAvatar } from '../AuntyAvatar';
import { PressableScale } from '../PressableScale';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
} from '../../constants/theme';
import type { Aunty, AuntyId } from '../../constants/aunties';

interface Props {
  auntyId: AuntyId;
  aunty: Aunty;
  accentColor: string;
  gradient: [string, string];
  messageCount: number;
  onNewChat: () => void;
  onChangeAunty: () => void;
  topInset: number;
}

function ChevronDown({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChatHeader({
  auntyId,
  aunty,
  accentColor,
  gradient,
  messageCount,
  onNewChat,
  onChangeAunty,
  topInset,
}: Props) {
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <LinearGradient
        colors={[gradient[0], colors.canvas]}
        style={[styles.container, { paddingTop: topInset + spacing.sm }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.row}>
          {/* Tappable avatar + name → ChangeAunty */}
          <PressableScale
            onPress={onChangeAunty}
            scaleTo={0.97}
            haptic="light"
            style={styles.profileSection}
          >
            <View style={styles.avatarContainer}>
              <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
              {/* Online dot */}
              <View style={[styles.onlineDot, { backgroundColor: accentColor, borderColor: gradient[0] }]} />
            </View>

            <View style={styles.textSection}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{aunty.name}</Text>
                <ChevronDown color={colors.muted} />
              </View>
              <Text style={[styles.signOff, { color: accentColor }]} numberOfLines={1}>
                {aunty.signOff}
              </Text>
              <Text style={styles.disclosure}>AI character</Text>
            </View>
          </PressableScale>

          {/* New chat button */}
          {messageCount > 1 && (
            <PressableScale
              onPress={onNewChat}
              scaleTo={0.9}
              haptic="medium"
              style={styles.newChatBtn}
              accessibilityRole="button"
              accessibilityLabel="New conversation"
            >
              <PlusIcon color={colors.muted} />
            </PressableScale>
          )}
        </View>
      </LinearGradient>

      {/* Gradient separator */}
      <LinearGradient
        colors={[accentColor + '30', 'transparent', accentColor + '30']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.separator}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  textSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  signOff: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    marginTop: 1,
  },
  disclosure: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs - 1,
    color: colors.muted,
    marginTop: 1,
  },
  newChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTinted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
  },
});
