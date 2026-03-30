import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { checkinService } from '@/services/supabase';
import { analyzeCheckinProgress } from '@/services/gemini';
import { getAunty } from '@/constants/aunties';
import AuntyAvatar from '@/components/AuntyAvatar';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import { CameraIcon } from '@/components/Icons';
import { colors, fonts, spacing, fontSize, fontWeight, radius } from '@/constants/theme';

const AUNTY_GREETINGS: Record<string, string> = {
  '1': "Show me what that moisture routine has done. I need to see the results.",
  '2': "Roots first — how are they looking? Upload a photo and let me assess.",
  '3': "I've been waiting for this check-in. How's that retention holding up?",
  '4': "Patience and technique — show me the results of both.",
  '5': "Mija, it's time. Show me those curls. All of them.",
  '6': "Your roots have been working hard. Time to see what they've done.",
  '7': "The natural remedies should be working. Show me the evidence.",
};

export default function CheckinScreen({ navigation, route }: any) {
  const { auntyId = '1', userInitiated = false } = route?.params ?? {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isActive } = useSubscription();

  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [checkinId, setCheckinId] = useState<string | null>(null);

  const aunty = getAunty(auntyId);

  const pickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow photo access to check in.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setPhoto(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!photo || !user) return;
    setAnalyzing(true);
    try {
      // Create checkin record
      const weekNumber = 1; // TODO: calculate from user's onboarding date
      const checkin = await checkinService.create(user.id, auntyId, userInitiated ? 'user' : 'system', weekNumber);
      setCheckinId(checkin.id);

      // Analyze photo
      const response = await fetch(photo);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const analysis = await analyzeCheckinProgress(base64, {
        curl_type: '3b', texture_description: '', visible_concerns: [], condition_assessment: '',
      }, weekNumber);

      // Update checkin with analysis
      await checkinService.update(checkin.id, { ai_analysis_json: analysis });
      setResult(analysis);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Check-in failed. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isActive) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.gateTitle}>Check-ins require a subscription.</Text>
        <Text style={styles.gateSub}>$1.99/month to stay accountable to the aunties.</Text>
        <Button label="Upgrade" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Aunty portrait + greeting */}
        <View style={styles.portraitWrap}>
          <AuntyAvatar auntyId={auntyId} size={96} />
        </View>

        <AuntyBubble
          auntyId={auntyId}
          message={AUNTY_GREETINGS[auntyId] ?? "Let me see that progress."}
        />

        {!result ? (
          <>
            {/* Photo upload */}
            <TouchableOpacity style={styles.uploadZone} onPress={pickPhoto}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.uploadEmpty}>
                  <CameraIcon color={colors.muted} size={40} strokeWidth={1.4} />
                  <Text style={styles.uploadLabel}>Upload progress photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <Button
              label={analyzing ? 'Analyzing...' : 'Submit check-in'}
              onPress={handleSubmit}
              disabled={!photo || analyzing}
              loading={analyzing}
              style={{ marginTop: spacing.md }}
            />

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Result */}
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>
                {result.progress_detected ? '✓ Progress detected' : 'Keep going'}
              </Text>
              <Text style={styles.resultNotes}>{result.comparison_notes}</Text>

              {(result.suggested_adjustments ?? []).length > 0 && (
                <>
                  <Text style={styles.adjustLabel}>Adjustments:</Text>
                  {result.suggested_adjustments.map((a: string, i: number) => (
                    <Text key={i} style={styles.adjustItem}>• {a}</Text>
                  ))}
                </>
              )}

              {(result.next_steps ?? []).length > 0 && (
                <>
                  <Text style={styles.adjustLabel}>Next steps:</Text>
                  {result.next_steps.map((s: string, i: number) => (
                    <Text key={i} style={styles.adjustItem}>• {s}</Text>
                  ))}
                </>
              )}
            </View>

            <Button label="Done" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  centered: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  gateTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.ink, textAlign: 'center', marginBottom: spacing.sm },
  gateSub: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, textAlign: 'center' },
  content: { padding: spacing.md },
  portraitWrap: { alignItems: 'center', marginBottom: spacing.md },
  uploadZone: {
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.md,
    minHeight: 240,
  },
  uploadEmpty: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center' },
  uploadLabel: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.muted, marginTop: spacing.sm },
  photoPreview: { width: '100%', aspectRatio: 3 / 4 },
  skipBtn: { alignItems: 'center', paddingVertical: spacing.md },
  skipText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  resultLabel: { fontFamily: fonts.display, fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink, marginBottom: spacing.sm },
  resultNotes: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  adjustLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', marginTop: spacing.md, marginBottom: 4 },
  adjustItem: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
});
