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
import { CameraIcon, CheckIcon, ArrowRightIcon } from '@/components/Icons';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';

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
          <View style={[styles.avatarRing, { borderColor: `${auntyColors[auntyId]?.accent ?? colors.primary}50`, shadowColor: auntyColors[auntyId]?.accent ?? colors.primary }]}>
            <AuntyAvatar auntyId={auntyId} size={96} />
          </View>
          <View style={[styles.auntyNameBadge, { backgroundColor: auntyColors[auntyId]?.accent ?? colors.primary }]}>
            <Text style={styles.auntyNameText}>{getAunty(auntyId).name.split(' ')[0]}</Text>
          </View>
        </View>

        <AuntyBubble
          auntyId={auntyId}
          message={AUNTY_GREETINGS[auntyId] ?? "Let me see that progress."}
        />

        {!result ? (
          <>
            {/* Photo upload */}
            <TouchableOpacity
              style={[styles.uploadZone, photo && styles.uploadZoneFilled]}
              onPress={pickPhoto}
              activeOpacity={0.8}
            >
              {photo ? (
                <>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <View style={styles.photoOverlay}>
                    <View style={styles.photoOverlayPill}>
                      <CameraIcon color="#fff" size={14} strokeWidth={2} />
                      <Text style={styles.photoOverlayText}>Change photo</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.uploadEmpty}>
                  <View style={styles.uploadIconCircle}>
                    <CameraIcon color={colors.primary} size={32} strokeWidth={1.6} />
                  </View>
                  <Text style={styles.uploadLabel}>Tap to add progress photo</Text>
                  <Text style={styles.uploadSub}>The aunties need to see your curls</Text>
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
            <View style={[styles.resultCard, { borderTopColor: auntyColors[auntyId]?.accent ?? colors.primary }]}>
              <View style={styles.resultHeader}>
                {result.progress_detected ? (
                  <View style={styles.resultBadgeSuccess}>
                    <CheckIcon color="#fff" size={14} strokeWidth={2.5} />
                    <Text style={styles.resultBadgeText}>Progress detected</Text>
                  </View>
                ) : (
                  <View style={styles.resultBadgeNeutral}>
                    <Text style={styles.resultBadgeNeutralText}>Keep going</Text>
                  </View>
                )}
              </View>
              <Text style={styles.resultNotes}>{result.comparison_notes}</Text>

              {(result.suggested_adjustments ?? []).length > 0 && (
                <View style={styles.adjustSection}>
                  <Text style={styles.adjustLabel}>Adjustments from {getAunty(auntyId).name.split(' ')[0]}</Text>
                  {result.suggested_adjustments.map((a: string, i: number) => (
                    <View key={i} style={styles.adjustRow}>
                      <View style={[styles.adjustDot, { backgroundColor: auntyColors[auntyId]?.accent ?? colors.primary }]} />
                      <Text style={styles.adjustItem}>{a}</Text>
                    </View>
                  ))}
                </View>
              )}

              {(result.next_steps ?? []).length > 0 && (
                <View style={styles.adjustSection}>
                  <Text style={styles.adjustLabel}>Next steps</Text>
                  {result.next_steps.map((s: string, i: number) => (
                    <View key={i} style={styles.adjustRow}>
                      <View style={[styles.adjustDot, { backgroundColor: colors.accent }]} />
                      <Text style={styles.adjustItem}>{s}</Text>
                    </View>
                  ))}
                </View>
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
  content: { padding: spacing.md, gap: spacing.md },
  portraitWrap: { alignItems: 'center', marginBottom: spacing.sm, paddingTop: spacing.sm },
  avatarRing: {
    borderRadius: 54,
    borderWidth: 3,
    padding: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  auntyNameBadge: {
    marginTop: -14,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'center',
  },
  auntyNameText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  uploadZone: {
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 240,
    backgroundColor: colors.surface,
  },
  uploadZoneFilled: {
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  uploadEmpty: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,197,66,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,66,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  uploadLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.ink,
    textAlign: 'center',
  },
  uploadSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
  },
  photoPreview: { width: '100%', aspectRatio: 3 / 4 },
  photoOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  photoOverlayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  photoOverlayText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  skipBtn: { alignItems: 'center', paddingVertical: spacing.md },
  skipText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderTopWidth: 4,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  resultHeader: { flexDirection: 'row' },
  resultBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  resultBadgeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultBadgeNeutral: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  resultBadgeNeutralText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultNotes: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  adjustSection: { gap: spacing.xs },
  adjustLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  adjustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  adjustItem: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
});
