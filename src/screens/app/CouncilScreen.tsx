/**
 * CouncilScreen — Private 1-on-1 consultation with your chosen aunty.
 *
 * Premium dark consultation shell. Grouped messages. Serif aunty voice.
 * Cinematic header. No left-border bubbles. Aunty-tinted atmosphere.
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuntyAvatar } from '../../components/AuntyAvatar';
import {
  colors,
  auntyColors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadows,
  gradients,
  typography,
  letterSpacing,
} from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { buildCouncilQuickPrompts } from '../../utils/councilQuickPrompts';
import type { HairProfile } from '../../types';
import {
  loadChat,
  debouncedSaveChat,
  clearChat,
  type StoredMessage,
} from '../../services/chatStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const EMPTY_HAIR_PROFILE: HairProfile = {};

interface Message extends StoredMessage {
  // StoredMessage: id, text, sender, timestamp, imageUri?
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ── Elegant typing indicator ─────────────────────────────────────
function TypingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 420 };
    const seq = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(withTiming(1, cfg), withTiming(0, cfg)),
          -1,
          false,
        ),
      );
    };
    seq(dot1, 0);
    seq(dot2, 140);
    seq(dot3, 280);
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -6]) }],
    opacity: interpolate(dot1.value, [0, 0.5, 1], [0.4, 1, 0.4]),
  }));
  const s2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -6]) }],
    opacity: interpolate(dot2.value, [0, 0.5, 1], [0.4, 1, 0.4]),
  }));
  const s3 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -6]) }],
    opacity: interpolate(dot3.value, [0, 0.5, 1], [0.4, 1, 0.4]),
  }));

  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4 }}>
      {[s1, s2, s3].map((style, i) => (
        <Animated.View
          key={i}
          style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, style]}
        />
      ))}
    </View>
  );
}

function generateFallbackResponse(aunty: typeof AUNTIES[AuntyId], userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes('dry') || lower.includes('moisture')) {
    return `${aunty.greeting} When it comes to moisture, ${aunty.ingredient.toLowerCase()} is your best friend. Make sure you're sealing in that hydration. Your hair is thirsty and we are going to quench it.`;
  }
  if (lower.includes('product') || lower.includes('recommend')) {
    return `Check the Products tab — I've already lined up some essentials for you. My go-to is always ${aunty.ingredient.toLowerCase()}. Start there and see how your hair responds.`;
  }
  if (lower.includes('wash') || lower.includes('routine')) {
    return `On wash day, I like to start with a pre-poo treatment, then cleanse gently. ${aunty.ingredient} is key for me. Take your time — rushing wash day is how breakage happens.`;
  }
  return `${aunty.quote} Remember, this journey is yours and I'm here every step of the way. What else is on your mind?`;
}

// ── Message bubble components ─────────────────────────────────────
type AcColors = { accent: string; bg: string; bgDark: string; text: string; gradient: [string, string] };

function AuntyBubble({
  item,
  auntyId,
  showAvatar,
  showName,
  ac,
  aunty,
}: {
  item: Message;
  auntyId: AuntyId;
  showAvatar: boolean;
  showName: boolean;
  ac: AcColors;
  aunty: typeof AUNTIES[AuntyId];
}) {
  return (
    <Animated.View entering={FadeInUp.duration(240).springify()} style={styles.auntyMessageRow}>
      <View style={styles.auntyAvatarSlot}>
        {showAvatar ? (
          <AuntyAvatar auntyId={auntyId} size={32} showRing={false} />
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>
      <View style={styles.auntyBubbleGroup}>
        {showName && (
          <Text style={[styles.auntyNameLabel, { color: ac.accent }]}>{aunty.name}</Text>
        )}
        <View style={[styles.auntyBubble, { backgroundColor: ac.bg }]}>
          {item.imageUri && (
            <Image source={{ uri: item.imageUri }} style={styles.messageThumbnail} resizeMode="cover" />
          )}
          {item.text && item.text !== '📷' && (
            <Text style={styles.auntyMessageText}>{item.text}</Text>
          )}
          <Text style={[styles.messageTime, { color: ac.accent + '80' }]}>{item.timestamp}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function UserBubble({ item }: { item: Message }) {
  return (
    <Animated.View entering={FadeInDown.duration(200)} style={styles.userMessageRow}>
      <View style={styles.userBubble}>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.messageThumbnail} resizeMode="cover" />
        )}
        {item.text && item.text !== '📷' && (
          <Text style={styles.userMessageText}>{item.text}</Text>
        )}
        <Text style={styles.userTime}>{item.timestamp}</Text>
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────
export default function CouncilScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const name = state.data.name || 'Queen';
  const hairProfile = state.data.hairProfile ?? EMPTY_HAIR_PROFILE;

  const profileGreeting = useMemo(() => {
    const parts: string[] = [];
    if (hairProfile.curlType) parts.push(`${hairProfile.curlType} curls`);
    if (hairProfile.porosity) parts.push(`${hairProfile.porosity} porosity`);
    if (hairProfile.primaryGoal) {
      const goalMap: Record<string, string> = {
        moisture: 'moisture', growth: 'growth', definition: 'curl definition',
        'damage-repair': 'damage repair', 'scalp-health': 'scalp health',
        'simplify-routine': 'simplifying your routine', transition: 'transitioning',
      };
      parts.push(`working on ${goalMap[hairProfile.primaryGoal] || hairProfile.primaryGoal}`);
    }
    const profileLine = parts.length > 0
      ? ` I see you've got ${parts.join(', ')} — you're in the right place.`
      : '';
    return `${aunty.greeting}${name ? ` ${name}.` : ''}${profileLine} Ask me anything.`;
  }, [aunty.greeting, name, hairProfile.curlType, hairProfile.porosity, hairProfile.primaryGoal]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: profileGreeting, sender: 'aunty', timestamp: getTimestamp() },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isSendingRef = useRef(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const inputRef = useRef<TextInput>(null);

  // Pulse animation for online indicator
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.4], [0.8, 0.2]),
  }));

  // Load persisted chat
  useEffect(() => {
    let cancelled = false;
    loadChat(auntyId).then((saved) => {
      if (cancelled || saved.length === 0) return;
      setMessages(saved as Message[]);
      setShowPrompts(false);
    });
    return () => { cancelled = true; };
  }, [auntyId]);

  const QUICK_PROMPTS = useMemo(
    () => buildCouncilQuickPrompts(hairProfile, auntyId),
    [hairProfile, auntyId],
  );

  const MAX_MESSAGES = 50;

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if ((!trimmed && !pendingImageUri) || isSendingRef.current) return;
    isSendingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed || '📷',
      sender: 'user',
      timestamp: getTimestamp(),
      ...(pendingImageUri ? { imageUri: pendingImageUri } : {}),
    };
    const imageToSend = pendingImageUri;
    setPendingImageUri(null);
    setMessages((prev) => {
      const next = [...prev, userMsg].slice(-MAX_MESSAGES);
      debouncedSaveChat(auntyId, next);
      return next;
    });
    setInputText('');
    setIsTyping(true);
    setShowPrompts(false);

    let responseText: string;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const history = [...messages, userMsg].slice(-20).map((m) => ({ sender: m.sender, text: m.text }));
      const body: Record<string, unknown> = { message: trimmed, auntyId, conversationHistory: history };
      if (imageToSend) {
        try {
          const response = await fetch(imageToSend);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
          });
          body.imageBase64 = base64;
        } catch { /* ignore encoding errors */ }
      }
      const res = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      responseText = data.response || generateFallbackResponse(aunty, trimmed);
    } catch {
      responseText = generateFallbackResponse(aunty, trimmed);
    } finally {
      clearTimeout(timeout);
    }

    setIsTyping(false);
    isSendingRef.current = false;
    const auntyMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'aunty',
      timestamp: getTimestamp(),
    };
    setMessages((prev) => {
      const next = [...prev, auntyMsg].slice(-MAX_MESSAGES);
      debouncedSaveChat(auntyId, next);
      return next;
    });
  }, [inputText, pendingImageUri, auntyId, aunty, name, hairProfile, messages]);

  const handleImageAttach = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access in Settings to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingImageUri(result.assets[0].uri);
    }
  }, []);

  const handleClearConversation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Clear Consultation',
      `Start fresh with Aunty ${aunty.name}? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearChat(auntyId).catch(() => {});
            setMessages([{ id: Date.now().toString(), text: profileGreeting, sender: 'aunty', timestamp: getTimestamp() }]);
            setShowPrompts(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  }, [auntyId, aunty.name, profileGreeting]);

  // Determine if avatar / name should show (group consecutive messages)
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    if (item.sender === 'user') return <UserBubble item={item} />;

    const prevMsg = messages[index - 1];
    const showAvatar = !prevMsg || prevMsg.sender !== 'aunty';
    const showName = showAvatar;

    return (
      <AuntyBubble
        item={item}
        auntyId={auntyId}
        showAvatar={showAvatar}
        showName={showName}
        ac={ac}
        aunty={aunty}
      />
    );
  }, [messages, auntyId, ac, aunty]);

  const canSend = (inputText.trim().length > 0 || !!pendingImageUri) && !isTyping;

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.canvas }]}>
      {/* ── Cinematic Header ─────────────────────────────────────── */}
      <LinearGradient
        colors={[ac.bg, colors.canvas]}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        {/* Ambient glow behind avatar */}
        <View style={[styles.headerGlow, { backgroundColor: ac.accent }]} />

        <View style={styles.headerInner}>
          {/* Avatar + Online indicator */}
          <View style={styles.headerAvatarWrap}>
            <AuntyAvatar auntyId={auntyId} size={48} showRing glowing />
            {/* Pulsing online dot */}
            <View style={styles.onlineDotWrap}>
              <Animated.View style={[styles.onlineDotPulse, { backgroundColor: ac.accent }, pulseStyle]} />
              <View style={[styles.onlineDot, { backgroundColor: ac.accent }]} />
            </View>
          </View>

          {/* Name + specialty */}
          <View style={styles.headerMeta}>
            <Text style={styles.headerName}>{aunty.name}</Text>
            <Text style={[styles.headerSpecialty, { color: ac.accent }]}>{aunty.title}</Text>
            <Text style={styles.headerStatus}>In session</Text>
          </View>

          {/* Actions */}
          <Pressable
            onPress={handleClearConversation}
            style={styles.menuBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Clear consultation"
          >
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
            <View style={styles.menuDot} />
          </Pressable>
        </View>

        {/* Thin aunty accent rule */}
        <View style={[styles.headerRule, { backgroundColor: ac.accent }]} />
      </LinearGradient>

      {/* ── Message List ─────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isTyping ? (
              <Animated.View entering={FadeInDown.duration(250)} style={styles.auntyMessageRow}>
                <View style={styles.auntyAvatarSlot}>
                  <AuntyAvatar auntyId={auntyId} size={32} showRing={false} />
                </View>
                <View style={styles.auntyBubbleGroup}>
                  <View style={[styles.auntyBubble, styles.typingBubble, { backgroundColor: ac.bg }]}>
                    <TypingDots color={ac.accent} />
                  </View>
                </View>
              </Animated.View>
            ) : null
          }
        />

        {/* ── Quick Prompts ───────────────────────────────────────── */}
        {showPrompts && messages.length < 3 && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.promptSection}>
            <Text style={[styles.promptLabel, { color: ac.accent }]}>Ask me about</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptRow}
              keyboardShouldPersistTaps="handled"
            >
              {QUICK_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  style={[styles.promptChip, { borderColor: ac.accent + '60', backgroundColor: colors.surface }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInputText(prompt);
                    setShowPrompts(false);
                    inputRef.current?.focus();
                  }}
                >
                  <Text style={[styles.promptChipText, { color: ac.accent }]}>{prompt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* ── Input Bar ──────────────────────────────────────────── */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          {pendingImageUri && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.pendingImageRow}>
              <Image source={{ uri: pendingImageUri }} style={styles.pendingThumbnail} resizeMode="cover" />
              <Pressable onPress={() => setPendingImageUri(null)} style={styles.removePendingBtn} hitSlop={8}>
                <Text style={styles.removePendingText}>✕</Text>
              </Pressable>
            </Animated.View>
          )}

          <View style={styles.inputRow}>
            {/* Attach photo */}
            <Pressable
              onPress={handleImageAttach}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Attach photo"
            >
              <CameraIcon color={colors.muted} />
            </Pressable>

            {/* Text field */}
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={(t) => { setInputText(t); if (t.length > 0) setShowPrompts(false); }}
              placeholder={`Ask Aunty ${aunty.name}…`}
              placeholderTextColor={colors.muted}
              multiline
              maxLength={500}
              accessibilityLabel={`Message Aunty ${aunty.name}`}
            />

            {/* Send */}
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={[styles.sendBtn, canSend && { backgroundColor: ac.accent }]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Text style={[styles.sendIcon, { color: canSend ? '#FFF' : colors.muted }]}>↑</Text>
            </Pressable>
          </View>

          <Text style={styles.aiNote}>AI-powered · Aunty Curl Council</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Inline SVG Camera Icon ────────────────────────────────────────
function CameraIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color }}>⊕</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  flex: { flex: 1 },

  // ── Header ─────────────────────────────────────────────────────
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.06,
    top: -60,
    left: -30,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  headerAvatarWrap: {
    position: 'relative',
  },
  onlineDotWrap: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    borderColor: colors.canvas,
    position: 'absolute',
  },
  onlineDotPulse: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    fontFamily: fonts.serifBold,
    fontSize: fontSize.lg,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  headerSpecialty: {
    fontFamily: fonts.serifItalic,
    fontSize: fontSize.sm,
  },
  headerStatus: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 0.3,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  menuDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  headerRule: {
    height: 1,
    borderRadius: 1,
    opacity: 0.25,
  },

  // ── Messages ────────────────────────────────────────────────────
  messageList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },

  // Aunty
  auntyMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '88%',
    marginBottom: spacing.xs,
  },
  auntyAvatarSlot: {
    width: 32,
    alignItems: 'center',
    paddingBottom: 2,
  },
  auntyBubbleGroup: {
    flex: 1,
    gap: 3,
  },
  auntyNameLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    marginLeft: spacing.xs,
    marginBottom: 2,
  },
  auntyBubble: {
    borderRadius: radius.xl,
    borderTopLeftRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: 4,
  },
  typingBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  auntyMessageText: {
    fontFamily: fonts.serifMedium ?? fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
    lineHeight: fontSize.base * 1.65,
  },
  messageTime: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 0.2,
    marginTop: 2,
    alignSelf: 'flex-end',
  },

  // User
  userMessageRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    borderTopRightRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxWidth: '78%',
    gap: 4,
  },
  userMessageText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.ink,
    lineHeight: fontSize.base * 1.6,
  },
  userTime: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(45, 27, 14, 0.55)',
    alignSelf: 'flex-end',
  },

  // Thumbnail
  messageThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
  },

  // ── Quick Prompts ────────────────────────────────────────────────
  promptSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
  promptLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  promptRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  promptChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  promptChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
  },

  // ── Input Area ───────────────────────────────────────────────────
  inputArea: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconBtn: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    maxHeight: 120,
    minHeight: 40,
    lineHeight: fontSize.base * 1.4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendIcon: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg,
    marginTop: -1,
  },
  aiNote: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
    letterSpacing: 0.4,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    opacity: 0.7,
  },

  // ── Pending image ─────────────────────────────────────────────
  pendingImageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  pendingThumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  removePendingBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginLeft: -18,
  },
  removePendingText: {
    fontSize: 9,
    color: colors.canvas,
    fontFamily: fonts.bodySemiBold,
  },
});
