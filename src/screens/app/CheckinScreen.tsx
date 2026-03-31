import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { checkinService } from '@/services/supabase';
import { analyzeCheckinProgress } from '@/services/gemini';
import { getAunty } from '@/constants/aunties';
import AuntyPortrait from '@/components/AuntyPortrait';
import AuntyAvatar from '@/components/AuntyAvatar';
import { CameraIcon } from '@/components/Icons';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';

// Tea-session openers — warm, inviting, not clinical
const OPEN_QUESTIONS: Record<string, string> = {
  '1': "Come sit with me, baby. Tell me — how has your hair been feeling this week?",
  '2': "Pull up a chair, pickney. I want to hear about your week. Start from the roots.",
  '3': "Chile, I've been thinking about you. Tell me everything. How did the hair do?",
  '4': "Ma chérie, let's catch up. How has the technique been treating you this week?",
  '5': "Mija! I've been waiting for this. Tell me — how are those curls doing?",
  '6': "Konjo, come. Sit. Tell me how the hair has been feeling from the inside this week.",
  '7': "Habibti, I've been thinking of you. Tell me — how is your hair, truly?",
};

// Aunty reactions after seeing results
const PROGRESS_REACTIONS: Record<string, { good: string; neutral: string; concern: string }> = {
  '1': {
    good: "Ahn ahn! Do you SEE this moisture? I see you've been listening to me o. This is what I wanted.",
    neutral: "I see improvement, baby. Not where we want to be yet, but we're moving. Don't stop.",
    concern: "Okay, this tells me something. Your moisture levels are not where they should be. Let's talk about your wash routine.",
  },
  '2': {
    good: "Yes pickney! Di roots dem happy! Look at that growth — you've been consistent and it shows.",
    neutral: "The roots are speaking. I see effort. Let's push a little more next week.",
    concern: "Di roots need more attention, love. Tell me — are you massaging consistently?",
  },
  '3': {
    good: "OKAY. Now THAT'S what retention looks like! You did exactly what I said and it worked!",
    neutral: "We're getting there, chile. Not perfect yet, but you're not where you were. That's progress.",
    concern: "Something's off with the retention. We need to look at your night routine specifically.",
  },
  '4': {
    good: "Voilà, ma chérie. The technique is working. Look at that definition — that's method, not product.",
    neutral: "The technique is improving. I can see the effort. A few adjustments and we'll be perfect.",
    concern: "The definition tells me we need to revisit the application technique. It's not you — it's the process.",
  },
  '5': {
    good: "¡Ay mija! ¡Esos rizos! Look at THAT! Your curls are thriving and you did this! YOU did this!",
    neutral: "I see you working, corazón. The curls are responding, just slowly. Keep going for me.",
    concern: "Hmm, the curl pattern is struggling. Let's talk about what products you've been using this week.",
  },
  '6': {
    good: "Strong. Look at that strength, konjo. Your roots — do you see the difference? I see it.",
    neutral: "Strength comes slowly. But I see the foundation building. Don't give up on the process.",
    concern: "The hair is telling me it needs more protein. Talk to me about your strengthening treatments.",
  },
  '7': {
    good: "Mashallah, habibti. Nature delivered exactly what it promised. Look at this hair. Look at it.",
    neutral: "The remedies are working, just at their own pace. Nature cannot be rushed, but it never fails.",
    concern: "The hair needs a different remedy, habibti. Tell me exactly what you've been applying.",
  },
};

// Post-analysis encouragement
const CLOSING_MESSAGES: Record<string, string> = {
  '1': "You showed up. That is half the battle, baby. See you next week — keep up the moisture.",
  '2': "Roots first, always. You did good. Rest now, pickney. Come back to me stronger.",
  '3': "Consistent and showing up. That's my girl. See you same time next week.",
  '4': "La patience. La technique. You have both. See you next week, ma chérie.",
  '5': "You are DOING IT, mija! Your curls know you care. See you next week, corazón!",
  '6': "Steady and strong, konjo. That's the only way. See you next week.",
  '7': "Sabr, habibti. You're doing everything right. Nature is patient. Be patient with yourself.",
};

type CheckinStep = 'chat' | 'photo' | 'analyzing' | 'result';

export default function CheckinScreen({ navigation, route }: any) {
  const { auntyId = '1', userInitiated = false } = route?.params ?? {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [step, setStep] = useState<CheckinStep>('chat');
  const [weekNote, setWeekNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const resultAnim = useRef(new Animated.Value(0)).current;

  const aunty = getAunty(auntyId);
  const ac = auntyColors[auntyId];
  const firstName = user?.name?.split(' ')[0] ?? 'friend';

  const pickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow photo access to share with your aunty.');
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

  const handleSubmitChat = () => {
    if (!weekNote.trim()) {
      Alert.alert('Tell me a little', `${aunty.name} needs at least a few words to help you.`);
      return;
    }
    setStep('photo');
  };

  const handleSkipPhoto = async () => {
    // Submit without photo — aunty still responds to the week note
    if (!user) return;
    setAnalyzing(true);
    setStep('analyzing');
    try {
      const weekNumber = 1;
      const checkin = await checkinService.create(user.id, auntyId, userInitiated ? 'user' : 'system', weekNumber);
      await checkinService.update(checkin.id, {
        progress_notes: weekNote,
        ai_analysis_json: {
          comparison_notes: getTextOnlyResponse(auntyId, weekNote),
          progress_detected: true,
          suggested_adjustments: [],
          next_steps: [],
        },
      });
      setResult({ textOnly: true, notes: weekNote });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong. Try again.');
      setStep('photo');
    } finally {
      setAnalyzing(false);
      setStep('result');
      Animated.spring(resultAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
    }
  };

  const handleSubmitPhoto = async () => {
    if (!photo || !user) return;
    setAnalyzing(true);
    setStep('analyzing');
    try {
      const weekNumber = 1;
      const checkin = await checkinService.create(user.id, auntyId, userInitiated ? 'user' : 'system', weekNumber);

      const response = await fetch(photo);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const analysis = await analyzeCheckinProgress(base64, {
        curl_type: '3b',
        texture_description: '',
        visible_concerns: [],
        condition_assessment: '',
      }, weekNumber);

      await checkinService.update(checkin.id, {
        progress_notes: weekNote,
        ai_analysis_json: analysis,
      });
      setResult(analysis);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong. Try again.');
      setStep('photo');
    } finally {
      setAnalyzing(false);
      setStep('result');
      Animated.spring(resultAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Aunty Portrait Header ── */}
        <View style={[styles.header, { backgroundColor: ac.bgDark }]}>
          <View style={styles.headerPortrait}>
            <AuntyPortrait auntyId={auntyId} size={90} />
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.headerAuntyName, { color: ac.text }]}>{aunty.name}</Text>
            <Text style={[styles.headerTitle, { color: ac.text }]}>
              {step === 'result' ? 'Hair check-in complete' : 'Hair check-in'}
            </Text>
          </View>
        </View>

        {/* ── Step: Chat — Opening Question ── */}
        {step === 'chat' && (
          <>
            <View style={[styles.auntyBubble, { borderLeftColor: ac.accent }]}>
              <Text style={[styles.auntyBubbleName, { color: ac.text }]}>
                {aunty.name.toUpperCase()} · {aunty.title}
              </Text>
              <Text style={styles.auntyBubbleText}>
                {OPEN_QUESTIONS[auntyId] ?? "Tell me — how has your hair been this week?"}
              </Text>
            </View>

            <View style={styles.chatInputWrap}>
              <TextInput
                style={styles.chatInput}
                placeholder={`Talk to ${aunty.name}... How has your hair felt? Any wins? Any struggles?`}
                placeholderTextColor={colors.mutedLight}
                value={weekNote}
                onChangeText={setWeekNote}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: ac.accent }, !weekNote.trim() && styles.primaryBtnDisabled]}
              onPress={handleSubmitChat}
              activeOpacity={0.85}
              disabled={!weekNote.trim()}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>Not today</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Step: Photo — Optional ── */}
        {step === 'photo' && (
          <>
            {/* Aunty reaction to chat note */}
            <View style={[styles.auntyBubble, { borderLeftColor: ac.accent }]}>
              <Text style={[styles.auntyBubbleName, { color: ac.text }]}>{aunty.name.toUpperCase()}</Text>
              <Text style={styles.auntyBubbleText}>
                {getChatReaction(auntyId, weekNote)}
              </Text>
            </View>

            {/* What user wrote */}
            <View style={styles.userChatBubble}>
              <Text style={styles.userChatLabel}>You said:</Text>
              <Text style={styles.userChatText}>{weekNote}</Text>
            </View>

            {/* Photo prompt */}
            <View style={[styles.photoPromptCard, { borderColor: `${ac.accent}40` }]}>
              <Text style={styles.photoPromptTitle}>
                Got a photo to share?
              </Text>
              <Text style={styles.photoPromptSub}>
                {getPhotoPrompt(auntyId)} You don't have to — even without a photo, I'm here.
              </Text>

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
                    <View style={[styles.uploadIconCircle, { borderColor: `${ac.accent}50`, backgroundColor: `${ac.accent}10` }]}>
                      <CameraIcon color={ac.accent} size={28} strokeWidth={1.6} />
                    </View>
                    <Text style={styles.uploadLabel}>Tap to add a photo</Text>
                    <Text style={styles.uploadSub}>Optional — but I love to see</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: ac.accent }, !photo && styles.primaryBtnDisabled]}
              onPress={handleSubmitPhoto}
              activeOpacity={0.85}
              disabled={!photo}
            >
              <Text style={styles.primaryBtnText}>
                {photo ? `Share with ${aunty.name}` : 'Add a photo first'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleSkipPhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnText}>Continue without a photo</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Step: Analyzing ── */}
        {step === 'analyzing' && (
          <View style={styles.analyzingWrap}>
            <View style={styles.analyzingPortrait}>
              <AuntyPortrait auntyId={auntyId} size={96} />
            </View>
            <Text style={[styles.analyzingTitle, { color: ac.text }]}>{aunty.name} is looking...</Text>
            <Text style={styles.analyzingText}>
              {getAnalyzingMessage(auntyId)}
            </Text>
          </View>
        )}

        {/* ── Step: Result ── */}
        {step === 'result' && result && (
          <Animated.View
            style={[
              styles.resultWrap,
              {
                opacity: resultAnim,
                transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              },
            ]}
          >
            {/* Aunty's personal reaction */}
            <View style={[styles.resultReactionCard, { borderTopColor: ac.accent }]}>
              <View style={styles.resultReactionHeader}>
                <AuntyAvatar auntyId={auntyId} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultAuntyName, { color: ac.text }]}>{aunty.name}</Text>
                  <Text style={styles.resultAuntyTitle}>{aunty.title}</Text>
                </View>
              </View>

              <Text style={styles.resultReactionText}>
                {result.textOnly
                  ? getTextOnlyResponse(auntyId, weekNote)
                  : getProgressReaction(auntyId, result)}
              </Text>

              {/* Analysis notes */}
              {!result.textOnly && result.comparison_notes && (
                <View style={styles.resultNotesBox}>
                  <Text style={[styles.resultNotesLabel, { color: ac.text }]}>What I see:</Text>
                  <Text style={styles.resultNotesText}>{result.comparison_notes}</Text>
                </View>
              )}
            </View>

            {/* Adjustments / next steps */}
            {!result.textOnly && (result.suggested_adjustments ?? []).length > 0 && (
              <View style={[styles.adjustmentsCard, { borderTopColor: ac.accent }]}>
                <Text style={[styles.adjustmentsLabel, { color: ac.text }]}>
                  {aunty.name}'s adjustments for next week
                </Text>
                {result.suggested_adjustments.map((a: string, i: number) => (
                  <View key={i} style={styles.adjustRow}>
                    <View style={[styles.adjustDot, { backgroundColor: ac.accent }]} />
                    <Text style={styles.adjustText}>{a}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Closing message */}
            <View style={[styles.closingCard, { backgroundColor: ac.bgDark }]}>
              <Text style={[styles.closingText, { color: ac.text }]}>
                {CLOSING_MESSAGES[auntyId] ?? "See you next week. Keep going."}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: ac.accent, marginTop: spacing.sm }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getChatReaction(auntyId: string, note: string): string {
  const lower = note.toLowerCase();
  const frustrated = lower.includes('frustrated') || lower.includes('not working') || lower.includes('giving up');
  const happy = lower.includes('love') || lower.includes('great') || lower.includes('amazing') || lower.includes('good');
  const tired = lower.includes('tired') || lower.includes('busy') || lower.includes("didn't have time");

  const reactions: Record<string, { happy: string; frustrated: string; tired: string; neutral: string }> = {
    '1': {
      happy: "Ahn ahn! That's the energy I need to hear. Now let me see this hair!",
      frustrated: "I hear the frustration, baby. That's why I'm here. Don't give up — we figure this out together.",
      tired: "Tired is okay. You still showed up. Now let me see where we are.",
      neutral: "Okay, I hear you. Now show me — I want to see what we're working with.",
    },
    '2': {
      happy: "Yes pickney! That's the spirit! Let me see those roots!",
      frustrated: "Di journey is long, love. But you're not alone. Come, let me assess.",
      tired: "Tired roots still grow. Show me what this week looked like.",
      neutral: "Good. Now let me see — photos tell me what words can't.",
    },
    '3': {
      happy: "CHILE! Let me see this progress! Don't keep me waiting!",
      frustrated: "Uh uh, we're not quitting. Tell me exactly what happened and we fix it.",
      tired: "Tired but still here. That's what matters. Let me see where we are.",
      neutral: "Okay. Now the photo. I need to see this myself.",
    },
    '4': {
      happy: "Bien! The attitude is right. Let me see if the technique matches.",
      frustrated: "Frustration is useful information. Let me see what happened technically.",
      tired: "Fatigue is part of the journey. Show me what you managed to do.",
      neutral: "Good. The photo will tell me the rest, ma chérie.",
    },
    '5': {
      happy: "¡Ay sí! Now SHOW me those curls! I need to see!",
      frustrated: "Mija, no te preocupes. We figure it out. Let me see what's happening.",
      tired: "Tired is okay, corazón. Even tired, you came. That's love.",
      neutral: "Okay mija, let me see what's happening with those curls.",
    },
    '6': {
      happy: "Strong week. Now show me the results, konjo.",
      frustrated: "Frustration means you care. I hear you. Let me see.",
      tired: "Rest is part of the process. Show me what you managed.",
      neutral: "Good. Let me see what the hair is telling us, konjo.",
    },
    '7': {
      happy: "Mashallah. Now habibti, show me — let me see what nature has done.",
      frustrated: "Sabr, habibti. Patience. Let me see what the hair needs.",
      tired: "Your body knows when to rest. But your hair still needs care. Let me see.",
      neutral: "Good. Share with me — a photo tells me what words miss.",
    },
  };

  const set = reactions[auntyId] ?? reactions['1'];
  if (frustrated) return set.frustrated;
  if (happy) return set.happy;
  if (tired) return set.tired;
  return set.neutral;
}

function getPhotoPrompt(auntyId: string): string {
  const prompts: Record<string, string> = {
    '1': "A photo helps me see your moisture levels — your shine, your definition.",
    '2': "I look at the roots specifically. Even a quick snap of your hairline tells me a lot.",
    '3': "A photo shows me retention, definition, and length. Front and back if you can.",
    '4': "I look at your curl pattern and definition. Even a quick one is enough.",
    '5': "Show me those curls, mija! Even a selfie counts.",
    '6': "I look at the health of the strands — shine, texture, density.",
    '7': "A photo shows me how the remedies are working — color, moisture, texture.",
  };
  return prompts[auntyId] ?? "A photo helps me give you more specific feedback.";
}

function getAnalyzingMessage(auntyId: string): string {
  const messages: Record<string, string> = {
    '1': "Looking at your moisture levels, your shine, your curl pattern... give me a moment.",
    '2': "Studying those roots... examining your hairline... the growth patterns...",
    '3': "Checking the retention, the definition, the length... I see everything.",
    '4': "Analyzing the technique results — your curl pattern, your definition...",
    '5': "Looking at those beautiful curls — the definition, the bounce, the shine...",
    '6': "Examining the strand health, the texture, the strength indicators...",
    '7': "Reading what the hair is saying — color, texture, moisture response...",
  };
  return messages[auntyId] ?? "Looking carefully at your hair...";
}

function getProgressReaction(auntyId: string, result: any): string {
  const reactions = PROGRESS_REACTIONS[auntyId];
  if (!reactions) return "I see your progress. Keep going.";
  if (result.progress_detected) return reactions.good;
  if (result.health_score && result.health_score < 40) return reactions.concern;
  return reactions.neutral;
}

function getTextOnlyResponse(auntyId: string, note: string): string {
  const lower = note.toLowerCase();
  const frustrated = lower.includes('frustrated') || lower.includes('not working');
  const happy = lower.includes('great') || lower.includes('amazing') || lower.includes('love');

  const responses: Record<string, string> = {
    '1': frustrated
      ? "Hair is complicated, baby. Science is complicated. But we don't give up — we investigate. Tell me more next time and bring a photo."
      : happy
      ? "That joy? That's your hair responding to your care. Keep it up. Next time, bring me a photo so I can celebrate properly."
      : "Thank you for checking in, baby. Even without a photo, you showing up matters. Next week, let's add a photo so I can really see.",
    '2': frustrated
      ? "Di roots need patience, pickney. Tell me everything next time — and bring a photo. I want to understand exactly what's happening."
      : happy
      ? "Yes! That happiness — your roots are speaking. Come back with a photo next week and let me confirm what you're feeling."
      : "You checked in. That matters. Roots grow slowly, but they remember every time you show up. See you next week.",
    '3': frustrated
      ? "We not giving up, chile. Come back with a photo next week — I need to see what's happening before we adjust the routine."
      : happy
      ? "Good! Now bring me proof next week! I need to see this progress with my own eyes."
      : "Consistent check-ins build consistent results. See you next week — bring the photo.",
    '4': frustrated
      ? "Frustration means something in the technique needs adjusting. Next week, a photo will help me diagnose exactly what."
      : happy
      ? "Bien, ma chérie. Next week, share a photo — let me confirm what you're feeling is showing."
      : "Your check-in is noted. Next week, bring a photo — technique shows in the results.",
    '5': frustrated
      ? "Mija, no te rindas! Come back next week with a photo and we'll figure it out together."
      : happy
      ? "Yes corazón! Now I need to see it! Bring me a photo next week!"
      : "Thank you for checking in, mija. Your curls appreciate you showing up. Next week — photo!",
    '6': frustrated
      ? "Strength is built through struggle, konjo. Come back with a photo and we investigate together."
      : happy
      ? "Strong week. I want to see the evidence next time. Bring a photo and let me confirm what you're feeling."
      : "You came. That's strength. Next week — a photo helps me help you better.",
    '7': frustrated
      ? "Sabr habibti. Patience with the remedies. Next week, bring a photo and we reassess."
      : happy
      ? "Mashallah! Next week, share a photo — let me see what nature has done."
      : "You checked in, habibti. The relationship matters. Next week — bring a photo.",
  };
  return responses[auntyId] ?? "Thank you for checking in. Come back with a photo next week.";
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.md, gap: spacing.md },

  // Header
  header: {
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  headerPortrait: {
    borderRadius: 48,
    overflow: 'hidden',
  },
  headerRight: { flex: 1 },
  headerAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },

  // Aunty speech bubble
  auntyBubble: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    padding: spacing.md,
    ...shadows.sm,
  },
  auntyBubbleName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  auntyBubbleText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 26,
  },

  // User bubble
  userChatBubble: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  userChatLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.muted,
    marginBottom: 4,
  },
  userChatText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    lineHeight: 22,
  },

  // Chat input
  chatInputWrap: {},
  chatInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.ink,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    ...shadows.sm,
  },

  // Photo prompt
  photoPromptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    ...shadows.sm,
    gap: spacing.sm,
  },
  photoPromptTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  photoPromptSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  uploadZone: {
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    overflow: 'hidden',
    minHeight: 200,
    backgroundColor: colors.offWhite,
  },
  uploadZoneFilled: {
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  uploadEmpty: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  uploadLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
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

  // Analyzing
  analyzingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  analyzingPortrait: {
    borderRadius: 48,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  analyzingTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  analyzingText: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },

  // Result
  resultWrap: { gap: spacing.md },
  resultReactionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderTopWidth: 4,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  resultReactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultAuntyName: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  resultAuntyTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  resultReactionText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 28,
  },
  resultNotesBox: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.xs,
  },
  resultNotesLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  resultNotesText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },

  // Adjustments
  adjustmentsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderTopWidth: 3,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  adjustmentsLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
  adjustText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Closing
  closingCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  closingText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    lineHeight: 26,
    textAlign: 'center',
  },

  // Buttons
  primaryBtn: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: '#fff',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: fontWeight.semibold,
  },
});
