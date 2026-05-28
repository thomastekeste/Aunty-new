/**
 * CouncilScreen (Chat) — 1-on-1 chat with your chosen aunty.
 *
 * Orchestrates chat components: ChatHeader, WelcomeCard, MessageBubble,
 * TypingIndicator, QuickSuggestions, ChatInput.
 * Handles state, API calls, and AsyncStorage persistence.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, auntyColors, spacing } from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../types';

import { ChatHeader } from '../../components/chat/ChatHeader';
import { WelcomeCard } from '../../components/chat/WelcomeCard';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { QuickSuggestions } from '../../components/chat/QuickSuggestions';
import { ChatInput } from '../../components/chat/ChatInput';

const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? 'http://localhost:3001' : '');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aunty';
  timestamp: string;
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ─── Fallback when both AIs are completely down ────────────────────
function generateFallbackResponse(aunty: typeof AUNTIES[AuntyId], userText: string): string {
  const lower = userText.toLowerCase();
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (lower.includes('dry') || lower.includes('moisture')) {
    return pick([
      `Your hair is THIRSTY. ${aunty.ingredient.split(',')[0]} on damp hair, seal it in, and stop skipping deep condition day.`,
      `How often are you deep conditioning? Be honest with me.`,
    ]);
  }
  if (lower.includes('wash') || lower.includes('routine')) {
    return pick([
      `Pre-poo before you wash. Always. Oil on dry hair, 20 minutes, then wash.`,
      `How often you washing? Because if you're washing every day we need to talk.`,
    ]);
  }
  if (lower.includes('break') || lower.includes('damage') || lower.includes('thin')) {
    return pick([
      `Breathe. Does your hair feel mushy or does it snap? That tells me everything.`,
      `When did this start? Something changed — new product, stress, heat?`,
    ]);
  }
  if (lower.includes('scalp') || lower.includes('itch')) {
    return pick([
      `Your scalp is the soil. Warm oil massage before wash day, every time.`,
      `If it's been going on for weeks please see a dermatologist.`,
    ]);
  }
  if (lower.includes('grow') || lower.includes('length')) {
    return pick([
      `Your hair IS growing. The issue is retention. Protect those ends. Satin pillowcase.`,
      `Patience. Protect your ends, stop checking every week, and in 6 months you'll see it.`,
    ]);
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.length < 15) {
    return `${aunty.greeting} What's going on with your hair today?`;
  }
  return pick([
    `Mmm okay. Tell me more — what's your hair been doing lately?`,
    `What's your current routine looking like? Walk me through a wash day.`,
    `How long have you been natural? That changes my answer completely.`,
  ]);
}

// ─── Message grouping helper ──────────────────────────────────────
function getGroupInfo(messages: Message[], index: number) {
  const current = messages[index];
  const prev = index > 0 ? messages[index - 1] : null;
  const next = index < messages.length - 1 ? messages[index + 1] : null;
  return {
    isFirstInGroup: !prev || prev.sender !== current.sender,
    isLastInGroup: !next || next.sender !== current.sender,
  };
}

export default function CouncilScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { state } = useOnboarding();
  const { session } = useAuth();

  const auntyId: AuntyId = state.data.chosenAuntyId || 'denise';
  const aunty = AUNTIES[auntyId];
  const ac = auntyColors[auntyId];
  const name = state.data.name || 'Queen';
  const hairProfile = state.data.hairProfile || {};

  const STORAGE_KEY = `chat_history_${auntyId}`;
  const MAX_MESSAGES = 50;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isSendingRef = useRef(false);

  // ─── Load persisted messages ────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: Message[] = JSON.parse(raw);
          if (saved.length > 0) {
            setMessages(saved.slice(-MAX_MESSAGES));
            setIsLoaded(true);
            return;
          }
        }
      } catch {}
      // Empty state — WelcomeCard handles the greeting
      setMessages([]);
      setIsLoaded(true);
    })();
  }, [auntyId]);

  // ─── Persist messages ───────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || messages.length === 0) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES))).catch(() => {});
  }, [messages, isLoaded]);

  // ─── Send message (accepts override text for quick suggestions) ─
  const handleSend = useCallback(async (overrideText?: string) => {
    const trimmed = (overrideText || inputText).trim();
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
    if (!overrideText) setInputText('');
    setIsTyping(true);

    let responseText: string;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const history = [...messages, userMsg].slice(-20).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: trimmed,
          auntyId,
          conversationHistory: history,
          hairProfile,
          userName: name,
        }),
        signal: controller.signal,
      });

      if (res.status === 503) {
        responseText = `Sorry love, my brain is being slow right now. Try again in a minute? I promise I'll be back.`;
      } else if (!res.ok) {
        throw new Error(`API ${res.status}`);
      } else {
        const data = await res.json();
        responseText = data.response || generateFallbackResponse(aunty, trimmed);
      }
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
  }, [inputText, auntyId, aunty, name, hairProfile, messages, session]);

  // ─── New chat ───────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setMessages([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, [STORAGE_KEY]);

  // ─── Navigation ─────────────────────────────────────────────────
  const handleChangeAunty = useCallback(() => {
    navigation.navigate('ChangeAunty');
  }, [navigation]);

  // ─── Derived state ──────────────────────────────────────────────
  const lastMessage = messages[messages.length - 1];
  const lastSenderIsAunty = !lastMessage || lastMessage.sender === 'aunty';
  const showWelcome = messages.length === 0;

  // ─── Render message ─────────────────────────────────────────────
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const { isFirstInGroup, isLastInGroup } = getGroupInfo(messages, index);
    return (
      <MessageBubble
        item={item}
        auntyId={auntyId}
        auntyName={aunty.name}
        accentColor={ac.accent}
        bgColor={ac.bg}
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
      />
    );
  }, [messages, auntyId, aunty.name, ac.accent, ac.bg]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.canvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ChatHeader
        auntyId={auntyId}
        aunty={aunty}
        accentColor={ac.accent}
        gradient={ac.gradient}
        messageCount={messages.length}
        onNewChat={handleNewChat}
        onChangeAunty={handleChangeAunty}
        topInset={insets.top}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          showWelcome ? (
            <WelcomeCard
              auntyId={auntyId}
              aunty={aunty}
              accentColor={ac.accent}
              gradient={ac.gradient}
            />
          ) : null
        }
        ListFooterComponent={
          isTyping ? (
            <TypingIndicator
              auntyId={auntyId}
              accentColor={ac.accent}
              bgColor={ac.bg}
            />
          ) : null
        }
      />

      <View style={{ paddingBottom: insets.bottom + spacing.sm }}>
        <QuickSuggestions
          auntyId={auntyId}
          messageCount={messages.length}
          isTyping={isTyping}
          lastSenderIsAunty={lastSenderIsAunty}
          onSend={handleSend}
          accentColor={ac.accent}
          bgColor={ac.bg}
          textColor={ac.text}
        />
        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={() => handleSend()}
          auntyName={aunty.name}
          accentColor={ac.accent}
          gradient={ac.gradient}
          isTyping={isTyping}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
