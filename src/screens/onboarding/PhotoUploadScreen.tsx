import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackIcon, CameraIcon } from '@/components/Icons';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import { analyzeIntakePhotos } from '@/services/gemini';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { colors, spacing, fontSize, fontWeight, radius, fonts } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PhotoUpload'>;
type PhotoKey = 'front' | 'back' | 'closeup';

const SLOTS: Array<{ key: PhotoKey; label: string; hint: string; guidance: string }> = [
  {
    key: 'front',
    label: 'Front',
    hint: 'Face forward, natural light',
    guidance: 'Stand facing a window. Hold phone at eye level. Let your hair fall naturally.',
  },
  {
    key: 'back',
    label: 'Back',
    hint: 'Show your length',
    guidance: 'Use a mirror or ask someone. Pull hair to one side to show full length.',
  },
  {
    key: 'closeup',
    label: 'Close-up',
    hint: 'Curl pattern detail',
    guidance: 'Pick a defined section. Get within 15cm. Good lighting — this is the most important shot.',
  },
];

const MOCK_ANALYSIS = {
  curl_type: '3c' as const,
  texture_description: 'Tight, defined coils with significant volume. Hair appears healthy with good elasticity.',
  visible_concerns: ['Dryness', 'Shrinkage'],
  condition_assessment: "I can see these curls are thirsty. The potential is there — we just need to unlock it.",
};

async function imageToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function PhotoUploadScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, setData, setHairAnalysis } = useOnboarding();
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, string>>>(data.intake_photos ?? {});
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedGuidance, setExpandedGuidance] = useState<PhotoKey | null>(null);
  const [auntyMsg, setAuntyMsg] = useState(
    "Now I need to see it with my own eyes. Natural light, no filter. Show me the real thing."
  );

  const uploadedCount = Object.keys(photos).length;
  const canContinue = uploadedCount >= 2;

  const pickPhoto = async (key: PhotoKey) => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        if (!cam.granted) {
          Alert.alert('Permission needed', 'Allow photo access to continue.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const updated = { ...photos, [key]: uri };
        setPhotos(updated);
        setData({ intake_photos: updated });

        const count = Object.keys(updated).length;
        if (count === 1) setAuntyMsg("Good. Keep them coming — I need to see all angles.");
        if (count === 2) setAuntyMsg("Now I'm getting somewhere. One more if you have it.");
        if (count === 3) setAuntyMsg("Good. I've seen enough. Let me analyze this.");
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const retakePhoto = async (key: PhotoKey) => {
    // Show options: retake from camera or pick from library
    Alert.alert(
      'Replace photo',
      'Choose how to get a new photo',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const cam = await ImagePicker.requestCameraPermissionsAsync();
              if (!cam.granted) {
                Alert.alert('Permission needed', 'Allow camera access.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
              });
              if (!result.canceled && result.assets[0]) {
                const updated = { ...photos, [key]: result.assets[0].uri };
                setPhotos(updated);
                setData({ intake_photos: updated });
              }
            } catch {
              Alert.alert('Error', 'Could not open camera.');
            }
          },
        },
        { text: 'Photo Library', onPress: () => pickPhoto(key) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleContinue = async () => {
    if (!canContinue) return;
    setAnalyzing(true);
    setAuntyMsg("Give me a moment. I'm looking at everything...");
    try {
      const uris = Object.values(photos).filter(Boolean) as string[];
      const base64Images = await Promise.all(uris.map(imageToBase64));
      const analysis = await analyzeIntakePhotos(base64Images, data);
      setHairAnalysis(analysis);
      navigation.navigate('CurlTypeReveal');
    } catch (e) {
      console.warn('Gemini analysis failed, using defaults:', e);
      setHairAnalysis(MOCK_ANALYSIS);
      navigation.navigate('CurlTypeReveal');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSkip = () => {
    setHairAnalysis(MOCK_ANALYSIS);
    navigation.navigate('CurlTypeReveal');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon color={colors.ink} size={22} strokeWidth={1.8} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <ProgressBar current={5} total={14} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <AuntyBubble auntyId="1" message={auntyMsg} />

        <Text style={styles.heading}>Your Hair, Right Now</Text>
        <Text style={styles.body}>
          No filter. No blowout. Your hair exactly as it is — that's what we need.
          {'\n'}Tap a slot for tips on getting the right shot.
        </Text>

        <View style={styles.uploadGrid}>
          {SLOTS.map(slot => {
            const hasPhoto = !!photos[slot.key];
            const isExpanded = expandedGuidance === slot.key;

            return (
              <View key={slot.key} style={styles.slotWrap}>
                <TouchableOpacity
                  style={styles.uploadSlot}
                  onPress={() => hasPhoto ? undefined : pickPhoto(slot.key)}
                  onLongPress={() => setExpandedGuidance(isExpanded ? null : slot.key)}
                  activeOpacity={hasPhoto ? 1 : 0.7}
                >
                  {hasPhoto ? (
                    <Image source={{ uri: photos[slot.key] }} style={styles.preview} />
                  ) : (
                    <TouchableOpacity
                      style={styles.slotEmpty}
                      onPress={() => pickPhoto(slot.key)}
                      activeOpacity={0.7}
                    >
                      <CameraIcon color={colors.muted} size={28} strokeWidth={1.6} />
                      <Text style={styles.slotAddText}>Tap to add</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                <Text style={styles.slotLabel}>{slot.label}</Text>
                <Text style={styles.slotHint}>{slot.hint}</Text>

                {hasPhoto && (
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => retakePhoto(slot.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Expanded guidance card */}
        {expandedGuidance && (
          <View style={styles.guidanceCard}>
            <Text style={styles.guidanceTitle}>
              {SLOTS.find(s => s.key === expandedGuidance)?.label} photo tips
            </Text>
            <Text style={styles.guidanceText}>
              {SLOTS.find(s => s.key === expandedGuidance)?.guidance}
            </Text>
            <TouchableOpacity onPress={() => setExpandedGuidance(null)}>
              <Text style={styles.guidanceClose}>Got it</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Guidance pill prompts */}
        {!expandedGuidance && (
          <View style={styles.guidancePills}>
            {SLOTS.filter(s => !photos[s.key]).map(slot => (
              <TouchableOpacity
                key={slot.key}
                style={styles.guidancePill}
                onPress={() => setExpandedGuidance(slot.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.guidancePillText}>Tips for {slot.label.toLowerCase()} photo</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip photos for now</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={
            analyzing
              ? 'Analyzing your hair...'
              : canContinue
              ? "Ngozi has seen enough."
              : `Add ${2 - uploadedCount} more photo${2 - uploadedCount !== 1 ? 's' : ''}`
          }
          onPress={handleContinue}
          disabled={!canContinue || analyzing}
          loading={analyzing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm,
  },
  progressWrap: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  heading: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  uploadGrid: { flexDirection: 'row', gap: spacing.sm },
  slotWrap: { flex: 1, alignItems: 'center', gap: 4 },
  uploadSlot: { width: '100%' },
  slotEmpty: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  slotAddText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  preview: { width: '100%', aspectRatio: 3 / 4, borderRadius: radius.md },
  slotLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  slotHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    textAlign: 'center',
  },
  retakeBtn: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 2,
  },
  retakeBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.bold,
  },

  // Guidance card
  guidanceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    gap: spacing.sm,
  },
  guidanceTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textTransform: 'capitalize',
  },
  guidanceText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  guidanceClose: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    alignSelf: 'flex-end',
  },

  // Guidance pills
  guidancePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  guidancePill: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.offWhite,
  },
  guidancePillText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },

  skipBtn: { alignItems: 'center', paddingVertical: spacing.md },
  skipText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.canvas,
  },
});
