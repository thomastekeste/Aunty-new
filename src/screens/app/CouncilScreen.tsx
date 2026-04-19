/**
 * CouncilScreen (now Chat) -- 1-on-1 chat with your chosen aunty.
 *
 * Header shows chosen aunty's avatar + name.
 * Messages from aunty (left, colored) and user (right, dark).
 * Calls Gemini API or falls back to local personality-based responses.
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
import {
  loadChat,
  debouncedSaveChat,
  clearChat,
  type StoredMessage,
} from '../../services/chatStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Message extends StoredMessage {
  // StoredMessage fields: id, text, sender, timestamp, imageUri?
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function generateFallbackResponse(aunty: typeof AUNTIES[AuntyId], userText: string): string {
  const lower = userText.toLowerCase();

  if (lower.includes('dry') || lower.includes('moisture')) {
    return `${aunty.greeting} When it comes to moisture, ${aunty.ingredient.toLowerCase()} is your best friend. Make sure you're sealing in that hydration. Your hair is thirsty and we are going to quench it.`;
  }
  if (lower.includes('product') || lower.includes('recommend')) {
    return `Check the Products tab -- I've already lined up some essentials for you. My go-to is always ${aunty.ingredient.toLowerCase()}. Start there and see how your hair responds.`;
  }
  if (lower.includes('wash') || lower.includes('routine')) {
    return `On wash day, I like to start with a pre-poo treatment, then cleanse gently. ${aunty.ingredient} is key for me. Take your time -- rushing wash day is how breakage happens.`;
  }

  // Default warm response using personality
  return `${aunty.quote} Remember, this journey is yours and I'm here every step of the way. What else is on your mind?`;
}

export default function CouncilScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useOnboarding();
  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const name = state.data.name || 'Queen';
  const hairProfile = state.data.hairProfile || {};

  // Build profile-aware greeting
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
    {
      id: '1',
      text: profileGreeting,
      sender: 'aunty',
      timestamp: getTimestamp(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isSendingRef = useRef(false);
  const [showPrompts, setShowPrompts] = useState(true);

  // Load persisted chat on mount
  useEffect(() => {
    let cancelled = false;
    loadChat(auntyId).then((saved) => {
      if (cancelled || saved.length === 0) return;
      setMessages(saved as Message[]);
      setShowPrompts(false); // returning users don't need prompt rail
    });
    return () => { cancelled = true; };
  }, [auntyId]);

  const QUICK_PROMPTS = useMemo(() => {
    const base = [
      'What should I do on wash day?',
      'How do I reduce frizz?',
      'What products do you recommend?',
      'How often should I deep condition?',
    ];
    if (hairProfile.porosity === 'high') base.unshift('My hair loses moisture fast — help!');
    if (hairProfile.porosity === 'low') base.unshift('Products just sit on my hair. What do I do?');
    if (hairProfile.primaryGoal === 'growth') base.unshift('How do I retain length?');
    if (hairProfile.primaryGoal === 'definition') base.unshift('How do I get better curl definition?');
    return base.slice(0, 5);
  }, [hairProfile.porosity, hairProfile.primaryGoal]);

  // Cap conversation history to last 50 messages to prevent unbounded growth
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

    let responseText: string;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      // Send last 20 messages for AI context (keeps payload small)
      const history = [...messages, userMsg].slice(-20).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const body: Record<string, unknown> = {
        message: trimmed,
        auntyId,
        conversationHistory: history,
      };
      if (imageToSend) {
        // Convert to base64 for backend (backend can adopt multimodal support later)
        try {
          const response = await fetch(imageToSend);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
          });
          body.imageBase64 = base64;
        } catch {
          // If image encoding fails, send without it
        }
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
      'Clear Conversation',
      `Start fresh with Aunty ${aunty.name}? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearChat(auntyId).catch(() => {});
            setMessages([{
              id: Date.now().toString(),
              text: profileGreeting,
              sender: 'aunty',
              timestamp: getTimestamp(),
            }]);
            setShowPrompts(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  }, [auntyId, aunty.name, profileGreeting]);

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === 'user') {
      return (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.userMessageRow}>
          <View style={styles.userBubble}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.messageThumbnail} resizeMode="cover" />
            )}
            {item.text && item.text !== '📷' && (
              <Text style={styles.userMessageText}>{item.text}</Text>
            )}
            <Text style={styles.userTimestamp}>{item.timestamp}</Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View entering={FadeInDown.duration(200)} style={styles.auntyMessageRow}>
        <AuntyAvatar auntyId={auntyId} size={36} showRing={false} />
        <View style={styles.auntyMessageContent}>
          <View style={styles.auntyNameRow}>
            <Text style={[styles.auntyName, { color: ac.accent }]}>{aunty.name}</Text>
            <Text style={styles.auntyTimestamp}>{item.timestamp}</Text>
          </View>
          <View style={[styles.auntyBubble, { backgroundColor: ac.bg, borderLeftColor: ac.accent }]}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.messageThumbnail} resizeMode="cover" />
            )}
            <Text style={[styles.auntyMessageText, { color: colors.ink }]}>{item.text}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.canvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerContent}>
          <AuntyAvatar auntyId={auntyId} size={40} showRing glowing />
          <View style={styles.headerText}>
            <Text style={[typography.h3]}>{aunty.name}</Text>
            <Text style={[typography.caption, { color: ac.accent }]}>{aunty.title}</Text>
            <Text style={styles.aiDisclosure}>AI-powered character</Text>
          </View>
          <Pressable
            onPress={handleClearConversation}
            style={styles.clearBtn}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear conversation"
          >
            <Text style={styles.clearBtnText}>⋯</Text>
          </Pressable>
        </View>
      </View>

      {/* Messages */}
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
            <Animated.View entering={FadeInDown.duration(200)} style={styles.auntyMessageRow}>
              <AuntyAvatar auntyId={auntyId} size={36} showRing={false} />
              <View style={styles.auntyMessageContent}>
                <View style={[styles.auntyBubble, { backgroundColor: ac.bg, borderLeftColor: ac.accent }]}>
                  <Text style={[styles.typingText, { color: ac.accent }]}>typing...</Text>
                </View>
              </View>
            </Animated.View>
          ) : null
        }
      />

      {/* Quick Prompts — shown until user types or dismisses */}
      {showPrompts && messages.length < 3 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptRow}
          keyboardShouldPersistTaps="handled"
        >
          {QUICK_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt}
              style={styles.promptChip}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setInputText(prompt);
                setShowPrompts(false);
              }}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
        {/* Pending image preview */}
        {pendingImageUri && (
          <View style={styles.pendingImageRow}>
            <Image source={{ uri: pendingImageUri }} style={styles.pendingThumbnail} resizeMode="cover" />
            <Pressable onPress={() => setPendingImageUri(null)} style={styles.removePendingBtn} hitSlop={8}>
              <Text style={styles.removePendingText}>✕</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.inputRow}>
          {/* Image attach button */}
          <Pressable
            onPress={handleImageAttach}
            style={styles.attachBtn}
            accessibilityRole="button"
            accessibilityLabel="Attach image"
          >
            <Text style={styles.attachBtnText}>📎</Text>
          </Pressable>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={(t) => { setInputText(t); if (t.length > 0) setShowPrompts(false); }}
            placeholder={`Ask ${aunty.name}...`}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            accessibilityLabel={`Type your message to ${aunty.name}`}
            accessibilityHint={`Ask Aunty ${aunty.name} a question about your hair`}
          />
          <Pressable
            onPress={handleSend}
            disabled={(!inputText.trim() && !pendingImageUri) || isTyping}
            style={[
              styles.sendButton,
              ((!inputText.trim() && !pendingImageUri) || isTyping) && styles.sendButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityHint={`Send your question to ${aunty.name}`}
          >
            <LinearGradient
              colors={(inputText.trim() || pendingImageUri) && !isTyping ? [...gradients.gold] : [colors.border, colors.border]}
              style={styles.sendButtonGradient}
            >
              <Text style={[styles.sendIcon, { color: (inputText.trim() || pendingImageUri) && !isTyping ? colors.ink : colors.muted }]}>
                {'\u2191'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  aiDisclosure: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  auntyMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    maxWidth: '88%',
  },
  auntyMessageContent: {
    flex: 1,
  },
  auntyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  auntyName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
  },
  auntyTimestamp: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  auntyBubble: {
    borderRadius: radius.md,
    borderTopLeftRadius: radius.xs,
    padding: spacing.md,
    borderLeftWidth: 3,
  },
  auntyMessageText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
  },
  typingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    borderTopRightRadius: radius.xs,
    padding: spacing.md,
    maxWidth: '82%',
  },
  userMessageText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.canvas,
  },
  userTimestamp: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.dark.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  promptRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  promptChip: {
    backgroundColor: colors.canvasDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  promptChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.inkLight,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.ink,
    backgroundColor: colors.canvasDeep,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: spacing.md,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xl,
    marginTop: -2,
  },

  // Clear conversation button in header
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.canvasDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  clearBtnText: {
    fontSize: fontSize.xl,
    color: colors.muted,
    lineHeight: 22,
  },

  // Message image thumbnails
  messageThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },

  // Image attach + pending preview
  attachBtn: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachBtnText: {
    fontSize: 20,
  },
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    marginLeft: -16,
  },
  removePendingText: {
    fontSize: 10,
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
  },
});
