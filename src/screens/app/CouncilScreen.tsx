/**
 * CouncilScreen (now Chat) -- 1-on-1 chat with your chosen aunty.
 *
 * Header shows chosen aunty's avatar + name.
 * Messages from aunty (left, colored) and user (right, dark).
 * Calls Gemini API or falls back to local personality-based responses.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aunty';
  timestamp: string;
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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `${aunty.greeting} Ask me anything about your hair journey.`,
      sender: 'aunty',
      timestamp: getTimestamp(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isSendingRef = useRef(false);

  // Cap conversation history to last 50 messages to prevent unbounded growth
  const MAX_MESSAGES = 50;

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSendingRef.current) return;
    isSendingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: getTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg].slice(-MAX_MESSAGES));
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

      const res = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          auntyId,
          conversationHistory: history,
        }),
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
    setMessages((prev) => [...prev, auntyMsg].slice(-MAX_MESSAGES));
  }, [inputText, auntyId, aunty, name, hairProfile, messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === 'user') {
      return (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.userMessageRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userMessageText}>{item.text}</Text>
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

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Ask ${aunty.name}...`}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            accessibilityLabel={`Type your message to ${aunty.name}`}
            accessibilityHint={`Ask Aunty ${aunty.name} a question about your hair`}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityHint={`Send your question to ${aunty.name}`}
          >
            <LinearGradient
              colors={inputText.trim() && !isTyping ? [...gradients.gold] : [colors.border, colors.border]}
              style={styles.sendButtonGradient}
            >
              <Text style={[styles.sendIcon, { color: inputText.trim() && !isTyping ? colors.ink : colors.muted }]}>
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
});
