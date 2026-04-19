/**
 * SignInScreen — Welcome back. Dark ceremonial aesthetic.
 *
 * "Welcome Back" — email + password sign-in with gold accents.
 * Links to sign-up and forgot password.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CeremonialButton } from '../../components/CeremonialButton';
import { useAuth } from '../../context/AuthContext';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  gradients,
  letterSpacing,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<any, 'SignIn'>;

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const isValid = email.includes('@') && password.length >= 6;

  const handleSignIn = async () => {
    if (!isValid || loading) return;
    setError('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await signIn(email.trim(), password);

    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auth state change will trigger navigation
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Reset Password',
      'Password reset functionality coming soon. Contact support if you need help.',
      [{ text: 'OK' }],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[...gradients.ceremony]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back to sign up"
          >
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.header}>
            <Text style={styles.overline}>THE AUNTY CURL COUNCIL</Text>
            <Text style={styles.title}>Welcome{'\n'}Back</Text>
            <Text style={styles.subtitle}>
              Your aunty remembers you. Sign in to continue your journey.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.formCard}>
            <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="rgba(254, 248, 236, 0.25)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={styles.input}
                selectionColor={colors.primary}
                accessibilityLabel="Enter your email address"
                accessibilityHint="The email you used to create your account"
              />
              <View style={[styles.underline, email.includes('@') && styles.underlineActive]} />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor="rgba(254, 248, 236, 0.25)"
                secureTextEntry
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
                style={styles.input}
                selectionColor={colors.primary}
                accessibilityLabel="Enter your password"
                accessibilityHint="The password for your account"
              />
              <View style={[styles.underline, password.length >= 6 && styles.underlineActive]} />
            </View>

            {/* Forgot Password */}
            <Pressable
              onPress={handleForgotPassword}
              style={({ pressed }) => [styles.forgotButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              accessibilityHint="Get help resetting your password"
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {/* Error */}
            {error ? (
              <Animated.Text entering={FadeIn.duration(200)} style={styles.error}>
                {error}
              </Animated.Text>
            ) : null}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.ctaArea}>
            <CeremonialButton
              label="Sign in"
              onPress={handleSignIn}
              size="lg"
              disabled={!isValid}
              loading={loading}
            />
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View entering={FadeIn.delay(700).duration(400)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Go to create account"
              accessibilityHint="Navigate to the sign up screen to create a new account"
            >
              <Text style={styles.linkText}>
                New here?{' '}
                <Text style={styles.linkHighlight}>Create Account</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  backButton: {
    paddingVertical: spacing.md,
    alignSelf: 'flex-start',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backArrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    color: colors.dark.text,
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  overline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.widest,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.display,
    color: colors.canvas,
    letterSpacing: letterSpacing.tighter,
    lineHeight: fontSize.display * 1.05,
  },
  subtitle: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    marginTop: spacing.md,
    lineHeight: fontSize.md * 1.55,
    letterSpacing: -0.1,
  },
  form: {
    gap: spacing.lg,
  },
  formCard: {
    backgroundColor: 'rgba(26, 15, 8, 0.38)',
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    letterSpacing: letterSpacing.widest,
  },
  input: {
    fontFamily: fonts.serifMedium,
    fontSize: fontSize.xl,
    color: colors.dark.text,
    paddingVertical: spacing.md,
    letterSpacing: -0.2,
    minHeight: 44,
  },
  underline: {
    height: 2,
    backgroundColor: colors.dark.border,
    borderRadius: 1,
  },
  underlineActive: {
    backgroundColor: colors.primary,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
    letterSpacing: letterSpacing.wide,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  ctaArea: {
    marginBottom: spacing.lg,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
  },
  linkHighlight: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
