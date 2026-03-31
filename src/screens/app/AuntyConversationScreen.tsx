import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getAunty, AUNTY_IDS } from '@/constants/aunties';
import { generateAuntyResponse } from '@/services/gemini';
import AuntyPortrait from '@/components/AuntyPortrait';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';

interface Message {
  id: string;
  role: 'user' | 'aunty';
  text: string;
  timestamp: Date;
}

// Opening lines when you first visit an aunty
const AUNTY_WELCOME: Record<string, string> = {
  '1': "Ahn ahn, you came to me! Good. What's going on with this hair? Ask me anything, baby.",
  '2': "Pickney, I was waiting on you. What do you need to know? Ask me — roots, growth, scalp. I'm ready.",
  '3': "Chile! You came to the right place. I got answers. What's the question?",
  '4': "Ma chérie, you have come for knowledge. Good. Ask me. Technique, method, process — whatever you need.",
  '5': "Mija! You want advice? Perfect! I love this. Ask me anything about your beautiful curls!",
  '6': "Konjo. You came to talk. I respect that. Ask me what you need to know.",
  '7': "Habibti. You seek knowledge. Good. I have remedies for every question. What is it?",
};

export default function AuntyConversationScreen({ navigation, route }: any) {
  const { auntyId: initialAuntyId = '1', initialQuestion = '' } = route?.params ?? {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [activeAuntyId, setActiveAuntyId] = useState(initialAuntyId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showAuntyPicker, setShowAuntyPicker] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const thinkingAnim = useRef(new Animated.Value(0)).current;

  const aunty = getAunty(activeAuntyId);
  const ac = auntyColors[activeAuntyId];
  const firstName = user?.name?.split(' ')[0] ?? 'friend';

  // Initialize conversation with aunty welcome + optional initial question
  useEffect(() => {
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'aunty',
      text: AUNTY_WELCOME[activeAuntyId] ?? "Ask me anything about your hair.",
      timestamp: new Date(),
    };
    const msgs = [welcomeMsg];

    if (initialQuestion) {
      const userMsg: Message = {
        id: 'initial-user',
        role: 'user',
        text: initialQuestion,
        timestamp: new Date(),
      };
      msgs.push(userMsg);
      setMessages(msgs);
      // Trigger aunty response to initial question
      setTimeout(() => sendToAunty(initialQuestion, msgs), 500);
    } else {
      setMessages(msgs);
    }
  }, [activeAuntyId]);

  // Thinking dots animation
  useEffect(() => {
    if (isThinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(thinkingAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      thinkingAnim.setValue(0);
    }
  }, [isThinking]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendToAunty = async (text: string, currentMsgs?: Message[]) => {
    setIsThinking(true);
    scrollToBottom();
    try {
      const history = (currentMsgs ?? messages)
        .map(m => `${m.role === 'user' ? firstName : aunty.name}: ${m.text}`)
        .join('\n');

      const response = await generateAuntyResponse({
        auntyId: activeAuntyId,
        userQuestion: text,
        conversationHistory: history,
        userName: firstName,
        hairProfile: null,
      });

      const auntyMsg: Message = {
        id: `aunty-${Date.now()}`,
        role: 'aunty',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, auntyMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `aunty-fallback-${Date.now()}`,
        role: 'aunty',
        text: getFallbackResponse(activeAuntyId),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
      scrollToBottom();
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    sendToAunty(trimmed);
  };

  const switchAunty = (newAuntyId: string) => {
    setShowAuntyPicker(false);
    setActiveAuntyId(newAuntyId);
    setMessages([]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* ── Aunty Header ── */}
      <View style={[styles.header, { backgroundColor: ac.bgDark }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: ac.text }]}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerPortrait}>
            <AuntyPortrait auntyId={activeAuntyId} size={56} />
          </View>
          <View>
            <Text style={[styles.headerName, { color: ac.text }]}>{aunty.name}</Text>
            <Text style={[styles.headerTitle, { color: ac.text }]}>{aunty.title}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setShowAuntyPicker(!showAuntyPicker)}
          activeOpacity={0.7}
        >
          <Text style={[styles.switchText, { color: ac.text }]}>Switch</Text>
        </TouchableOpacity>
      </View>

      {/* ── Aunty Picker ── */}
      {showAuntyPicker && (
        <View style={styles.pickerWrap}>
          <Text style={styles.pickerLabel}>Choose an aunty</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pickerRow}>
              {AUNTY_IDS.map(id => {
                const a = getAunty(id);
                const aAc = auntyColors[id];
                const isActive = id === activeAuntyId;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.pickerChip, isActive && { borderColor: aAc.accent, backgroundColor: aAc.bg }]}
                    onPress={() => switchAunty(id)}
                    activeOpacity={0.75}
                  >
                    <AuntyAvatar auntyId={id} size={32} />
                    <View>
                      <Text style={[styles.pickerChipName, isActive && { color: aAc.text }]}>{a.name}</Text>
                      <Text style={styles.pickerChipSpec} numberOfLines={1}>{a.specialty.split(' ').slice(0, 2).join(' ')}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* ── Conversation ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.conversation}
        contentContainerStyle={[styles.conversationContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            auntyId={activeAuntyId}
            ac={ac}
            auntyName={aunty.name}
          />
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <View style={styles.thinkingWrap}>
            <AuntyAvatar auntyId={activeAuntyId} size={32} />
            <View style={[styles.thinkingBubble, { backgroundColor: ac.bg, borderColor: `${ac.accent}30` }]}>
              <View style={styles.thinkingDots}>
                {[0, 1, 2].map(i => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.thinkingDot,
                      { backgroundColor: ac.accent },
                      {
                        opacity: thinkingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: i === 1 ? [0.3, 1] : [1, 0.3],
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Input ── */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder={`Ask ${aunty.name}...`}
          placeholderTextColor={colors.mutedLight}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: ac.accent }, (!input.trim() || isThinking) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || isThinking}
          activeOpacity={0.8}
        >
          {isThinking
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendBtnText}>Send</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  auntyId,
  ac,
  auntyName,
}: {
  message: Message;
  auntyId: string;
  ac: { accent: string; bg: string; bgDark: string; text: string };
  auntyName: string;
}) {
  const isUser = message.role === 'user';
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enterAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  if (isUser) {
    return (
      <Animated.View
        style={[
          styles.userMsgWrap,
          {
            opacity: enterAnim,
            transform: [{ translateX: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.text}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.auntyMsgWrap,
        {
          opacity: enterAnim,
          transform: [{ translateX: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}
    >
      <AuntyAvatar auntyId={auntyId} size={36} />
      <View style={[styles.auntyMsgBubble, { backgroundColor: ac.bg, borderColor: `${ac.accent}25` }]}>
        <Text style={[styles.auntyMsgName, { color: ac.text }]}>{auntyName}</Text>
        <Text style={styles.auntyMsgText}>{message.text}</Text>
      </View>
    </Animated.View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getFallbackResponse(auntyId: string): string {
  const fallbacks: Record<string, string> = {
    '1': "Ahn ahn, I'm having a moment. But your question is good — ask me again and I'll answer properly, baby.",
    '2': "Di connection dropped, pickney. Ask me again — I want to answer this properly.",
    '3': "Chile, something went wrong on my end. Ask me again — this question deserves a real answer.",
    '4': "Ma chérie, the connection has failed me. Please, ask again — your question deserves a thoughtful answer.",
    '5': "Ay mija, something went wrong! Ask me again — I have so much to say about this!",
    '6': "Konjo, I lost the connection for a moment. Ask me again — I want to answer this properly.",
    '7': "Habibti, something disrupted us. Ask again — your question deserves a careful answer.",
  };
  return fallbacks[auntyId] ?? "Something went wrong. Please ask me again.";
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  backBtn: { minWidth: 60 },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerPortrait: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  headerName: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  headerTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    opacity: 0.7,
    marginTop: 1,
  },
  switchBtn: { minWidth: 60, alignItems: 'flex-end' },
  switchText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  // Picker
  pickerWrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    ...shadows.sm,
  },
  pickerLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.offWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  pickerChipName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  pickerChipSpec: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 1,
    maxWidth: 80,
  },

  // Conversation
  conversation: { flex: 1 },
  conversationContent: {
    padding: spacing.md,
    gap: spacing.md,
  },

  // User message
  userMsgWrap: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    borderBottomRightRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxWidth: '80%',
  },
  userBubbleText: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.canvas,
    lineHeight: 24,
  },

  // Aunty message
  auntyMsgWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  auntyMsgBubble: {
    flex: 1,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxWidth: '85%',
  },
  auntyMsgName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  auntyMsgText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.ink,
    lineHeight: 26,
  },

  // Thinking
  thinkingWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  thinkingBubble: {
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  thinkingDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  thinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // Input bar
  inputBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.ink,
    lineHeight: 24,
    maxHeight: 120,
  },
  sendBtn: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: '#fff',
  },
});
