/**
 * PhotoCaptureScreen — Optional hair photo capture before the council convenes.
 *
 * Captures up to 3 photos (front, side/back, close-up) so the AI
 * can visually analyze hair alongside the self-reported profile.
 * Photos are optional — the user can skip.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { CeremonialButton } from '../../components/CeremonialButton';
import { PressableScale } from '../../components/PressableScale';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  gradients,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PhotoCapture'>;

type PhotoSlot = 'front' | 'back' | 'closeup';

const SLOTS: { key: PhotoSlot; label: string; hint: string; emoji: string }[] = [
  { key: 'front', label: 'Front view', hint: 'Face the camera, hair down', emoji: '📸' },
  { key: 'back', label: 'Side or back', hint: 'Show your length + curl pattern', emoji: '🪞' },
  { key: 'closeup', label: 'Close-up', hint: 'Get close to show texture + porosity', emoji: '🔍' },
];

export default function PhotoCaptureScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { state, setPhotos } = useOnboarding();

  const auntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];

  const [photos, setLocalPhotos] = useState<Record<PhotoSlot, string | null>>({
    front: null,
    back: null,
    closeup: null,
  });

  const photoCount = Object.values(photos).filter(Boolean).length;

  const handleCapture = useCallback((slot: PhotoSlot) => {
    Alert.alert('Add photo', `${SLOTS.find(s => s.key === slot)?.label}`, [
      {
        text: 'Camera',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need camera access to take a hair photo.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            setLocalPhotos(prev => ({ ...prev, [slot]: result.assets[0].uri }));
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need access to your photos.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            setLocalPhotos(prev => ({ ...prev, [slot]: result.assets[0].uri }));
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const handleRemove = useCallback((slot: PhotoSlot) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalPhotos(prev => ({ ...prev, [slot]: null }));
  }, []);

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Save to onboarding context
    const captured: Record<string, string> = {};
    if (photos.front) captured.front = photos.front;
    if (photos.back) captured.back = photos.back;
    if (photos.closeup) captured.closeup = photos.closeup;
    if (Object.keys(captured).length > 0) {
      setPhotos(captured);
    }
    navigation.navigate('CouncilConvening');
  }, [photos, setPhotos, navigation]);

  const handleSkip = useCallback(() => {
    navigation.navigate('CouncilConvening');
  }, [navigation]);

  return (
    <LinearGradient colors={[...gradients.ceremony]} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.lg }]}>

        {/* Aunty header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.auntyHeader}>
          <AuntyAvatar auntyId={auntyId} size={44} />
          <View>
            <Text style={[styles.auntyName, { color: ac.accent }]}>{aunty.name}</Text>
            <Text style={styles.auntyMessage}>Let me see that hair, baby.</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.titleWrap}>
          <Text style={styles.title}>Show the council</Text>
          <Text style={styles.subtitle}>
            Photos help the aunties see what they're working with.{'\n'}
            Take one or all three — or skip if you're not ready.
          </Text>
        </Animated.View>

        {/* Photo slots */}
        <View style={styles.slotsContainer}>
          {SLOTS.map((slot, index) => (
            <Animated.View
              key={slot.key}
              entering={FadeInDown.delay(200 + index * 80).duration(350)}
            >
              {photos[slot.key] ? (
                <View style={styles.filledSlot}>
                  <Image source={{ uri: photos[slot.key]! }} style={styles.preview} />
                  <View style={styles.filledInfo}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    <Text style={[styles.slotCheck, { color: ac.accent }]}>Added {'✓'}</Text>
                  </View>
                  <PressableScale
                    onPress={() => handleRemove(slot.key)}
                    scaleTo={0.9}
                    haptic="light"
                    style={styles.removeBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${slot.label} photo`}
                  >
                    <Text style={styles.removeText}>{'✕'}</Text>
                  </PressableScale>
                </View>
              ) : (
                <PressableScale
                  onPress={() => handleCapture(slot.key)}
                  scaleTo={0.97}
                  haptic="light"
                  style={[styles.emptySlot, { borderColor: ac.accent + '25' }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${slot.label} photo`}
                >
                  <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                  <View style={styles.slotTextWrap}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    <Text style={styles.slotHint}>{slot.hint}</Text>
                  </View>
                  <Text style={[styles.addIcon, { color: ac.accent }]}>+</Text>
                </PressableScale>
              )}
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Animated.View entering={FadeInUp.delay(500)}>
          <CeremonialButton
            label={photoCount > 0 ? `Continue with ${photoCount} photo${photoCount > 1 ? 's' : ''}` : 'Continue without photos'}
            onPress={handleContinue}
            size="lg"
          />
        </Animated.View>
        <Pressable onPress={handleSkip} style={styles.skipLink}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  auntyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  auntyName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: fontSize.lg,
    letterSpacing: -0.2,
    lineHeight: fontSize.lg * 1.1,
  },
  auntyMessage: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    marginTop: 1,
  },

  titleWrap: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.dark.text,
    letterSpacing: -0.4,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
    lineHeight: fontSize.sm * 1.55,
  },

  slotsContainer: {
    gap: spacing.sm,
  },

  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.md,
    gap: spacing.sm,
  },
  slotEmoji: {
    fontSize: 24,
  },
  slotTextWrap: {
    flex: 1,
  },
  slotLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.dark.text,
  },
  slotHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    marginTop: 1,
  },
  addIcon: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xl,
  },

  filledSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceLight,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  preview: {
    width: 56,
    height: 72,
    borderRadius: radius.md,
  },
  filledInfo: {
    flex: 1,
  },
  slotCheck: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.dark.textMuted,
  },
});
