import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Name'>;

export default function NameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, setData } = useOnboarding();
  const [name, setName] = useState(data.name ?? '');

  const canContinue = name.trim().length > 0;

  const handleContinue = () => {
    setData({ name: name.trim() });
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <AuntyBubble
          auntyId="3"
          message="Before we get into anything — what do we call you?"
        />

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          autoFocus
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={canContinue ? handleContinue : undefined}
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={name.trim() ? `That's me.` : 'Enter your name'}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, padding: spacing.md },
  input: {
    fontFamily: fonts.display,
    marginTop: spacing.lg,
    fontSize: 36,
    fontWeight: fontWeight.black,
    color: colors.ink,
    borderBottomWidth: 2,
    borderBottomColor: colors.amber,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    letterSpacing: -1,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.canvas,
  },
});
