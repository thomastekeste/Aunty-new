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
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, auntyColors, spacing, fonts, fontSize, radius, shadows, letterSpacing } from '../../constants/theme';
import { AUNTIES, type AuntyId } from '../../constants/aunties';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import type { AppStackParamList } from '../../types';

import { ChatHeader } from '../../components/chat/ChatHeader';
import { WelcomeCard } from '../../components/chat/WelcomeCard';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { QuickSuggestions } from '../../components/chat/QuickSuggestions';
import { ChatInput } from '../../components/chat/ChatInput';
import { AuntyAvatar } from '../../components/AuntyAvatar';
import { PaywallModal } from '../../components/PaywallModal';

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
  const { isSubscribed, isLoading: subLoading } = useSubscription();

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
  const [showPaywall, setShowPaywall] = useState(false);
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

  const handleGoHome = useCallback(() => {
    (navigation as any).navigate('Tabs', { screen: 'Home' });
  }, [navigation]);

  // ─── Derived state ──────────────────────────────────────────────
  const lastMessage = messages[messages.length - 1];
  const lastSenderIsAunty = !lastMessage || lastMessage.sender === 'aunty';
  const showWelcome = messages.length === 0;

  // ─── Subscription gate ──────────────────────────────────────────
  if (!subLoading && !isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.canvas }]}>
        <ChatHeader
          auntyId={auntyId}
          aunty={aunty}
          accentColor={ac.accent}
          gradient={ac.gradient}
          messageCount={0}
          onNewChat={() => {}}
          onChangeAunty={() => navigation.navigate('ChangeAunty')}
          onGoHome={() => (navigation as any).navigate('Tabs', { screen: 'Home' })}
          topInset={insets.top}
        />

        <ScrollView
          contentContainerStyle={[gateStyles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={gateStyles.avatarRow}>
            <AuntyAvatar auntyId={auntyId} size={80} showRing />
          </View>

          <Text style={gateStyles.headline}>
            {aunty.name} is waiting{'\n'}for you.
          </Text>
          <Text style={gateStyles.sub}>
            Ask her anything about your hair — she knows your curl type, your goals, and your routine. Subscribe to start the conversation.
          </Text>

          <View style={[gateStyles.card, shadows.sm]}>
            {[
              { emoji: '💬', text: 'Unlimited chat with your aunty' },
              { emoji: '🧴', text: 'Your full personalised product prescription' },
              { emoji: '📋', text: 'Weekly ritual plan, step by step' },
              { emoji: '📈', text: 'Progress tracking & check-ins' },
            ].map(({ emoji, text }) => (
              <View key={text} style={gateStyles.featureRow}>
                <Text style={gateStyles.featureEmoji}>{emoji}</Text>
                <Text style={gateStyles.featureText}>{text}</Text>
              </View>
            ))}
          </View>

          <LinearGradient
            colors={ac.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[gateStyles.ctaBtn, shadows.md]}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowPaywall(true);
              }}
              style={gateStyles.ctaInner}
              accessibilityRole="button"
              accessibilityLabel="Subscribe to chat with your aunty"
            >
              <Text style={gateStyles.ctaText}>Unlock — Chat with {aunty.name}</Text>
            </Pressable>
          </LinearGradient>

          <Pressable
            onPress={() => (navigation as any).navigate('Tabs', { screen: 'Home' })}
            style={gateStyles.backLink}
            accessibilityRole="button"
          >
            <Text style={gateStyles.backLinkText}>Back to home</Text>
          </Pressable>
        </ScrollView>

        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onSubscribe={() => setShowPaywall(false)}
        />
      </View>
    );
  }

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
        onGoHome={handleGoHome}
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

const gateStyles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  avatarRow: {
    marginBottom: spacing.lg,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: letterSpacing.tighter,
    lineHeight: fontSize.xxl * 1.15,
    marginBottom: spacing.md,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.6,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureEmoji: {
    fontSize: fontSize.lg,
    width: 28,
    textAlign: 'center',
  },
  featureText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.ink,
    flex: 1,
  },
  ctaBtn: {
    borderRadius: radius.full,
    width: '100%',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  ctaInner: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.canvas,
    letterSpacing: letterSpacing.wide,
  },
  backLink: {
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  backLinkText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
  },
});
