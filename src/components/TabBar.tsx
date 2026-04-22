/**
 * TabBar — Custom bottom tab bar. Premium, not default.
 *
 * 4 tabs with gold gradient active indicator, warm surface background,
 * haptic feedback, and inline SVG path icons.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import {
  colors,
  fonts,
  fontSize,
  spacing,
  shadows,
  gradients,
} from '../constants/theme';

// ─── Tab Config ─────────────────────────────────────────────────
interface TabDef {
  key: string;
  label: string;
  icon: (color: string) => React.ReactNode;
}

const ICON_SIZE = 24;

const TABS: TabDef[] = [
  {
    key: 'Home',
    label: 'Home',
    icon: (color: string) => (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15C15 14.4477 14.5523 14 14 14H10C9.44772 14 9 14.4477 9 15V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'Ritual',
    label: 'Check-In',
    icon: (color: string) => (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7Z"
          stroke={color}
          strokeWidth={2}
        />
        <Path d="M4 10H20" stroke={color} strokeWidth={2} />
        <Path d="M8 3V7" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M16 3V7" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M9 14H11" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M13 14H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M9 17H11" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: 'Products',
    label: 'Products',
    icon: (color: string) => (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M3 6H21" stroke={color} strokeWidth={2} />
        <Path
          d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'Chat',
    label: 'Chat',
    icon: (color: string) => (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 12C21 16.4183 16.9706 20 12 20C10.8053 20 9.66162 19.8004 8.6085 19.4341L3 21L4.48953 16.3754C3.55037 15.0911 3 13.5956 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M8 11.5H8.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M12 11.5H12.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M16 11.5H16.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: 'Learn',
    label: 'Learn',
    icon: (color: string) => (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 4C2 4 5 2 12 2C19 2 22 4 22 4V20C22 20 19 18 12 18C5 18 2 20 2 20V4Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 2V18"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INDICATOR_WIDTH = 24;

function TabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: TabDef;
  isActive: boolean;
  onPress: () => void;
}) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    opacity.value = withTiming(0.5, { duration: 80 });
  }, []);

  const handlePressOut = useCallback(() => {
    opacity.value = withTiming(1, { duration: 120 });
  }, []);

  const activeColor = colors.primary;
  const inactiveColor = colors.muted;
  const iconColor = isActive ? activeColor : inactiveColor;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabButton, animatedStyle]}
      accessibilityRole="tab"
      accessibilityLabel={`${tab.label} tab${isActive ? ', selected' : ''}`}
      accessibilityHint={`Navigate to the ${tab.label} screen`}
      accessibilityState={{ selected: isActive }}
    >
      {tab.icon(iconColor)}
      <Text
        style={[
          styles.tabLabel,
          {
            color: iconColor,
            fontFamily: isActive ? fonts.bodySemiBold : fonts.body,
          },
        ]}
      >
        {tab.label}
      </Text>
    </AnimatedPressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : spacing.sm;
  const tabBarHeight = Platform.OS === 'ios' ? 82 : 66;

  const [rowWidth, setRowWidth] = useState(0);
  const tabCount = state.routes.length;
  const tabWidth = tabCount > 0 ? rowWidth / tabCount : 0;

  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth <= 0) return;
    const targetX = state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
    indicatorX.value = withSpring(targetX, {
      damping: 22,
      stiffness: 220,
      mass: 0.6,
    });
  }, [state.index, tabWidth]);

  // Snap instantly on first layout so the bar doesn't fly in
  useEffect(() => {
    if (tabWidth <= 0) return;
    if (indicatorX.value === 0 && state.index > 0) {
      indicatorX.value = state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
    }
  }, [tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleRowLayout = useCallback((e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  }, []);

  const handlePress = useCallback(
    (routeName: string, isFocused: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!isFocused) {
        navigation.navigate(routeName);
      }
    },
    [navigation],
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {/* Sliding gold indicator — sits above the tab row */}
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicatorWrap,
            { width: INDICATOR_WIDTH, top: 0 },
            indicatorStyle,
          ]}
        >
          <LinearGradient
            colors={[...gradients.gold]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.indicatorBar}
          />
        </Animated.View>
      ) : null}

      <View style={styles.tabRow} onLayout={handleRowLayout}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.key === route.name) ?? TABS[index];
          if (!tab) return null;
          const isFocused = state.index === index;

          return (
            <TabButton
              key={route.key}
              tab={tab}
              isActive={isFocused}
              onPress={() => handlePress(route.name, isFocused)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.sm,
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    minHeight: 44,
    position: 'relative',
  },
  tabLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
  indicatorWrap: {
    position: 'absolute',
    height: 3,
    overflow: 'hidden',
  },
  indicatorBar: {
    flex: 1,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
