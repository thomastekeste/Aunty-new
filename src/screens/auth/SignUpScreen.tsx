/**
 * SignUpScreen — Premium sign-up experience.
 *
 * "Join the Council" — dark ceremonial aesthetic with gold accents.
 * Email + password with gold underline inputs. Haptic feedback.
 * Routes to onboarding on success.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
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
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  gradients,
  letterSpacing,
  shadows,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<any, 'SignUp'>;

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isValid = name.trim().length > 0 && email.includes('@') && password.length >= 6;

  const handleSignUp = async () => {
    if (!isValid || loading) return;
    setError('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await signUp(email.trim(), password, name.trim());

    if (result.error) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auth state change will trigger navigation to onboarding
    }
    setLoading(false);
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
          {/* Header */}
          <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.header}>
            <Text style={styles.overline}>THE AUNTY CURL COUNCIL</Text>
            <Text style={styles.title}>Find Your{'\n'}Aunty</Text>
            <Text style={styles.subtitle}>
              Choose your personal hair companion and transform your journey.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>YOUR NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="What should we call you?"
                placeholderTextColor="rgba(254, 248, 236, 0.25)"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                style={styles.input}
                selectionColor={colors.primary}
                accessibilityLabel="Enter your name"
                accessibilityHint="Your first name for the aunties to use"
              />
              <View style={[styles.underline, name.trim().length > 0 && styles.underlineActive]} />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                ref={emailRef}
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
                accessibilityHint="Used for signing in to your account"
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
                placeholder="At least 6 characters"
                placeholderTextColor="rgba(254, 248, 236, 0.25)"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                style={styles.input}
                selectionColor={colors.primary}
                accessibilityLabel="Create a password"
                accessibilityHint="Must be at least 6 characters"
              />
              <View style={[styles.underline, password.length >= 6 && styles.underlineActive]} />
            </View>

            {/* Error */}
            {error ? (
              <Animated.Text entering={FadeIn.duration(200)} style={styles.error}>
                {error}
              </Animated.Text>
            ) : null}
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.ctaArea}>
            <Button
              label="Create Account"
              onPress={handleSignUp}
              variant="primary"
              size="lg"
              disabled={!isValid}
              loading={loading}
            />
          </Animated.View>

          {/* Sign In Link */}
          <Animated.View entering={FadeIn.delay(1000).duration(400)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('SignIn');
              }}
              style={styles.linkButton}
              accessibilityRole="button"
              accessibilityLabel="Go to sign in"
              accessibilityHint="Navigate to the sign in screen if you already have an account"
            >
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkHighlight}>Sign In</Text>
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
  header: {
    marginTop: spacing.xxl,
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
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.dark.textMuted,
    marginTop: spacing.md,
    lineHeight: fontSize.md * 1.5,
  },
  form: {
    gap: spacing.lg,
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
    fontFamily: fonts.displayMedium,
    fontSize: fontSize.xl,
    color: colors.dark.text,
    paddingVertical: spacing.md,
    letterSpacing: letterSpacing.tight,
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
});
