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
  onGoHome: () => void;
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

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12H15V22"
        stroke={color}
        strokeWidth={2}
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
  onGoHome,
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
          {/* Home button */}
          <PressableScale
            onPress={onGoHome}
            scaleTo={0.9}
            haptic="light"
            style={styles.homeBtn}
            accessibilityRole="button"
            accessibilityLabel="Go home"
          >
            <HomeIcon color={colors.muted} />
          </PressableScale>

          {/* Tappable avatar + name → ChangeAunty */}
          <PressableScale
            onPress={onChangeAunty}
            scaleTo={0.97}
            haptic="light"
            style={styles.profileSection}
          >
            <View style={styles.avatarContainer}>
              <AuntyAvatar auntyId={auntyId} size={36} showRing glowing />
              {/* Online dot */}
              <View style={[styles.onlineDot, { backgroundColor: accentColor, borderColor: gradient[0] }]} />
            </View>

            <View style={styles.textSection}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{aunty.name}</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
                <ChevronDown color={colors.muted} />
              </View>
              <Text style={[styles.signOff, { color: accentColor }]} numberOfLines={1}>
                {aunty.signOff}
              </Text>
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
    paddingBottom: spacing.sm,
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
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  homeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceTinted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  aiBadge: {
    backgroundColor: colors.surfaceTinted,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  aiBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.5,
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
  // disclosure removed — now inline AI badge in nameRow
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
