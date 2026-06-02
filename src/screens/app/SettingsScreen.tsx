/**
 * SettingsScreen — User preferences, profile, and account management.
 *
 * Warm canvas background with editorial list sections.
 * Matches the app's luxe, culturally grounded aesthetic.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { deleteAccount } from '../../services/api';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  typography,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import {
  DISCLAIMER_FULL,
  AFFILIATE_DISCLOSURE,
  RECOMMENDATION_METHOD,
} from '../../constants/legal';

// ─── Helpers ────────────────────────────────────────────────────

function getHairProfileSummary(profile: Record<string, any>): string {
  const parts: string[] = [];
  if (profile.curlType) parts.push(`Type ${profile.curlType.toUpperCase()}`);
  if (profile.porosity) parts.push(`${profile.porosity} porosity`);
  if (profile.density) parts.push(`${profile.density} density`);
  if (profile.primaryGoal) {
    const goalLabels: Record<string, string> = {
      moisture: 'Moisture',
      growth: 'Growth',
      definition: 'Definition',
      'damage-repair': 'Damage Repair',
      'scalp-health': 'Scalp Health',
      'simplify-routine': 'Simplify Routine',
      transition: 'Transition',
    };
    parts.push(goalLabels[profile.primaryGoal] || profile.primaryGoal);
  }
  return parts.length > 0 ? parts.join(' \u00b7 ') : 'Not set';
}

// ─── Section Components ─────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
  );
}

function ListRow({
  label,
  value,
  onPress,
  isDestructive,
  showChevron = true,
  rightElement,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !rightElement}
      style={styles.listRow}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
    >
      <View style={styles.listRowLeft}>
        <Text
          style={[
            styles.listRowLabel,
            isDestructive && { color: colors.error },
          ]}
        >
          {label}
        </Text>
        {value && <Text style={styles.listRowValue}>{value}</Text>}
      </View>
      {rightElement ? (
        rightElement
      ) : onPress && showChevron ? (
        <Text style={styles.chevron}>{'\u203a'}</Text>
      ) : null}
    </Pressable>
  );
}

// ─── Main Screen ────────────────────────────────────────────────

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { state: onboardingState, reset: resetOnboarding } = useOnboarding();
  const { signOut } = useAuth();
  const { mode: themeMode, isDark, setMode: setThemeMode } = useTheme();
  const { restorePurchases } = useSubscription();

  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestorePurchases = useCallback(async () => {
    if (isRestoring) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRestoring(true);
    try {
      const restored = await restorePurchases();
      Alert.alert(
        restored ? 'Purchases Restored' : 'Nothing to Restore',
        restored
          ? 'Your subscription has been restored.'
          : "We couldn't find an active subscription on this Apple ID. If you believe this is an error, contact support@auntycurl.com.",
      );
    } catch {
      Alert.alert('Restore Failed', 'Something went wrong. Please try again or contact support@auntycurl.com.');
    } finally {
      setIsRestoring(false);
    }
  }, [isRestoring, restorePurchases]);

  const { name, hairProfile, chosenAuntyId } = onboardingState.data;
  const auntyId: AuntyId = chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const profileSummary = getHairProfileSummary(hairProfile);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load preferences from storage
  useEffect(() => {
    (async () => {
      try {
        const notifPref = await AsyncStorage.getItem('notifications_enabled');
        if (notifPref !== null) setNotificationsEnabled(notifPref === 'true');
      } catch (e) {
        // Use defaults
      }
    })();
  }, []);

  const handleToggleNotifications = useCallback(async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notifications_enabled', String(value));
    } catch (e) {
      console.warn('[Settings] Failed to save notification preference');
    }
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark';
    setThemeMode(next);
  }, [themeMode, setThemeMode]);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your progress will be saved locally.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            resetOnboarding();
          },
        },
      ]
    );
  }, [resetOnboarding]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data (hair profile, routines, check-ins, photos). This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your progress will be lost forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      await deleteAccount();
                      await AsyncStorage.clear();
                      resetOnboarding();
                    } catch (err) {
                      Alert.alert('Error', 'Failed to delete account. Please try again or contact support@auntycurl.com.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [resetOnboarding]);

  const themeModeLabel = themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light';

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>{'\u2039'}</Text>
          </Pressable>
          <Text style={[typography.h2]}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ─── Profile Section ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <SectionHeader title="Profile" />
          <View style={[styles.card, shadows.sm]}>
            <ListRow label="Name" value={name || 'Not set'} />
            <View style={styles.divider} />
            <ListRow
              label="Hair Profile"
              value={profileSummary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                (navigation as any).navigate('HairProfile');
              }}
            />
          </View>
        </Animated.View>

        {/* ─── Preferences Section ─────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="Preferences" />
          <View style={[styles.card, shadows.sm]}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                (navigation as any).navigate('ChangeAunty');
              }}
              style={styles.auntyRow}
              accessibilityRole="button"
              accessibilityLabel={`Change aunty, currently ${aunty.name}`}
            >
              <AuntyAvatar auntyId={auntyId} size={44} showRing />
              <View style={{ flex: 1 }}>
                <Text style={styles.auntyRowName}>{aunty.name}</Text>
                <Text style={styles.auntyRowTitle}>{aunty.title} — {aunty.region}</Text>
              </View>
              <Text style={styles.changeLabel}>Change</Text>
              <Text style={styles.chevron}>{'›'}</Text>
            </Pressable>
            <View style={styles.divider} />
            <ListRow
              label="Notifications"
              showChevron={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notificationsEnabled ? colors.primaryLight : colors.surface}
                />
              }
            />
            <View style={styles.divider} />
            <ListRow
              label="Appearance"
              value={themeModeLabel}
              onPress={handleToggleDarkMode}
            />
          </View>
        </Animated.View>

        {/* ─── Subscription Section ────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <SectionHeader title="Subscription" />
          <View style={[styles.card, shadows.sm]}>
            <ListRow
              label="Manage Subscription"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL('https://apps.apple.com/account/subscriptions');
              }}
            />
            <View style={styles.divider} />
            <ListRow
              label={isRestoring ? 'Restoring…' : 'Restore Purchases'}
              onPress={handleRestorePurchases}
            />
          </View>
        </Animated.View>

        {/* ─── Support Section ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SectionHeader title="Support" />
          <View style={[styles.card, shadows.sm]}>
            <ListRow
              label="Help & FAQ"
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Help', 'Email us at support@auntycurl.com'); }}
            />
            <View style={styles.divider} />
            <ListRow
              label="Send Feedback"
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Feedback', 'Email us at feedback@auntycurl.com'); }}
            />
            <View style={styles.divider} />
            <ListRow
              label="Privacy Policy"
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL('https://auntycurl.com/privacy'); }}
            />
            <View style={styles.divider} />
            <ListRow
              label="Terms of Service"
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL('https://auntycurl.com/terms'); }}
            />
          </View>
        </Animated.View>

        {/* ─── About Section ───────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <SectionHeader title="About" />
          <View style={[styles.card, shadows.sm]}>
            <ListRow
              label="How we choose your products"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  'How the Council chooses',
                  RECOMMENDATION_METHOD.map((s) => `${s.title}\n${s.body}`).join('\n\n') +
                    `\n\n${AFFILIATE_DISCLOSURE}`,
                );
              }}
            />
            <View style={styles.divider} />
            <ListRow
              label="Disclaimer"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Disclaimer', DISCLAIMER_FULL);
              }}
            />
          </View>
        </Animated.View>

        {/* ─── Account Section ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)}>
          <SectionHeader title="Account" />
          <View style={[styles.card, shadows.sm]}>
            <ListRow
              label="Sign Out"
              isDestructive
              onPress={handleSignOut}
              showChevron={false}
            />
            <View style={styles.divider} />
            <ListRow
              label="Delete Account"
              isDestructive
              onPress={handleDeleteAccount}
              showChevron={false}
            />
          </View>
        </Animated.View>

        {/* ─── Developer (dev builds only) ─────────────── */}
        {__DEV__ && (
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <SectionHeader title="Developer" />
            <View style={[styles.card, shadows.sm]}>
              <ListRow
                label="Preview send-off"
                value="The Co-Signed Letter"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  (navigation as any).navigate('SendOffPreview');
                }}
              />
            </View>
          </Animated.View>
        )}

        {/* ─── Version ─────────────────────────────────── */}
        <Text style={styles.version}>Aunty Curl Council v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backArrow: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.ink,
    marginTop: -2,
  },
  sectionHeader: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  listRowLeft: {
    flex: 1,
    gap: 2,
  },
  listRowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  listRowValue: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  chevron: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.muted,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },
  auntyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  auntyRowName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
  },
  auntyRowTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 1,
  },
  changeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
    letterSpacing: letterSpacing.wide,
  },
});
