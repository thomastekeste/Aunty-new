import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { userService } from '@/services/supabase';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import { colors, fonts, spacing, fontSize, fontWeight, radius } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signUp, isLoading, error, updateUser } = useAuth();
  const { data } = useOnboarding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canContinue = email.includes('@') && password.length >= 6;

  const handleSignUp = async () => {
    if (!canContinue) return;
    try {
      await signUp(email.trim().toLowerCase(), password, data.name ?? 'Friend');
      navigation.navigate('Location');
    } catch (e: any) {
      Alert.alert('Sign Up Error', e.message ?? 'Something went wrong.');
    }
  };

  const handleSkipToDemo = () => {
    const demoUser = {
      id: 'demo-' + Date.now(),
      name: data.name ?? 'Demo User',
      email: 'demo@aunty.local',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_complete: false,
    };
    updateUser(demoUser as any);
    navigation.navigate('Location');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuntyBubble
          auntyId="2"
          message="We need somewhere to keep your routine safe, baby."
        />

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="6+ characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.consent}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your hair data is kept private and never sold.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Let's build your routine."
          onPress={handleSignUp}
          loading={isLoading}
          disabled={!canContinue}
        />
        <TouchableOpacity
          onPress={handleSkipToDemo}
          style={styles.testButton}
        >
          <Text style={styles.testButtonText}>Skip to demo</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  form: { marginTop: spacing.lg, gap: spacing.sm },
  inputLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  input: {
    fontFamily: fonts.body,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.ink,
    backgroundColor: colors.offWhite,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  consent: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    lineHeight: 18,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
    gap: spacing.sm,
  },
  testButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  testButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: fontWeight.medium,
    textDecorationLine: 'underline',
  },
});
