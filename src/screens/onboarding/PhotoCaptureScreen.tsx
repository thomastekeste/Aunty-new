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
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import { CeremonialButton } from '../../components/CeremonialButton';
import { useOnboarding } from '../../context/OnboardingContext';
import { AUNTIES } from '../../constants/aunties';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
} from '../../constants/theme';
import type { OnboardingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PhotoCapture'>;

type PhotoSlot = 'front' | 'back' | 'closeup';

const SLOTS: { key: PhotoSlot; label: string; hint: string }[] = [
  { key: 'front', label: 'Front view', hint: 'Face the camera, hair down' },
  { key: 'back', label: 'Side or back', hint: 'Show your length and curl pattern' },
  { key: 'closeup', label: 'Close-up', hint: 'Get close to show texture and porosity' },
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
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.xxl }]}>

        {/* Aunty header — quiet, centered */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.auntyHeader}>
          <AuntyAvatar auntyId={auntyId} size={56} showRing glowing />
          <Text style={[styles.auntyName, { color: ac.accent }]}>{aunty.name}</Text>
          <Text style={styles.auntyMessage}>Let me see that hair, baby.</Text>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeIn.delay(150).duration(460)} style={styles.titleWrap}>
          <Text style={styles.title}>Show the council</Text>
          <Text style={styles.subtitle}>
            Photos help the aunties see what they&apos;re working with. Take one, all three, or skip for now.
          </Text>
        </Animated.View>

        {/* Photo slots — open rows divided by hairlines */}
        <View style={styles.slotsContainer}>
          {SLOTS.map((slot, index) => (
            <Animated.View
              key={slot.key}
              entering={FadeIn.delay(250 + index * 90).duration(420)}
              style={[styles.slotRow, index > 0 && styles.slotRowDivided]}
            >
              {photos[slot.key] ? (
                <View style={styles.rowInner}>
                  <Image source={{ uri: photos[slot.key]! }} style={styles.preview} />
                  <View style={styles.slotTextWrap}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    <Text style={[styles.slotCheck, { color: ac.accent }]}>Added</Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemove(slot.key)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${slot.label} photo`}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleCapture(slot.key)}
                  style={styles.rowInner}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${slot.label} photo`}
                >
                  <Text style={[styles.slotIndex, { color: ac.accent }]}>
                    {`0${index + 1}`}
                  </Text>
                  <View style={styles.slotTextWrap}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    <Text style={styles.slotHint}>{slot.hint}</Text>
                  </View>
                  <Text style={[styles.addAction, { color: ac.accent }]}>Add</Text>
                </Pressable>
              )}
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Animated.View entering={FadeIn.delay(550).duration(460)}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  auntyHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  auntyName: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    letterSpacing: -0.2,
    marginTop: spacing.sm,
  },
  auntyMessage: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 2,
  },

  titleWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: fontSize.sm * 1.6,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },

  slotsContainer: {
    marginTop: spacing.xs,
  },

  slotRow: {
    paddingVertical: spacing.lg,
  },
  slotRowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  slotIndex: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    letterSpacing: 0.5,
    width: 28,
  },
  slotTextWrap: {
    flex: 1,
  },
  slotLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  slotHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  addAction: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    letterSpacing: 0.3,
  },
  preview: {
    width: 52,
    height: 68,
    borderRadius: radius.md,
  },
  slotCheck: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  removeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.muted,
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
    color: colors.muted,
  },
});
