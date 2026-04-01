import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllProducts } from '@/constants/products';
import { getAunty, AUNTIES } from '@/constants/aunties';
import { generateAuntyResponse } from '@/services/gemini';
import AuntyAvatar from '@/components/AuntyAvatar';
import Badge from '@/components/Badge';
import {
  colors, fonts, spacing, fontSize, fontWeight,
  radius, auntyColors, shadows, gradients, typography, animation,
} from '@/constants/theme';

type ChatMode = 'products' | 'council';

interface CouncilMessage {
  id: string;
  role: 'user' | 'council';
  text: string;
}

const COUNCIL_IDS = ['1', '2', '3', '4', '5', '6', '7'];

export default function ProductChatScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const products = getAllProducts();
  const scrollRef = useRef<ScrollView>(null);

  const [mode, setMode] = useState<ChatMode>('products');
  const [councilMessages, setCouncilMessages] = useState<CouncilMessage[]>([
    {
      id: '0',
      role: 'council',
      text: "Welcome! We're all here — seven aunties, one council. Ask us anything about your hair, your routine, or the products we swear by.",
    },
  ]);
  const [councilInput, setCouncilInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProductPress = (productId: string, auntyId: string) => {
    const aunty = getAunty(auntyId);
    navigation.navigate('AuntyConversation', {
      auntyId,
      initialQuestion: `Tell me about this product and how it fits into my routine.`,
    });
  };

  const handleCouncilSend = async () => {
    if (!councilInput.trim() || isLoading) return;
    const text = councilInput.trim();

    const userMsg: CouncilMessage = { id: Date.now().toString(), role: 'user', text };
    setCouncilMessages(prev => [...prev, userMsg]);
    setCouncilInput('');
    setIsLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const councilNames = Object.values(AUNTIES).map(a => `${a.name} (${a.title})`).join(', ');
      const prompt = `You are a council of 7 hair care aunties: ${councilNames}.
The user asked: "${text}"
Respond as the council speaking together with warmth and wisdom. Use "we" and speak collectively.
Keep it personal, encouraging, and under 180 words. Reference their specific expertise naturally.`;

      const response = await generateAuntyResponse(prompt);
      setCouncilMessages(prev => [...prev, { id: Date.now().toString(), role: 'council', text: response }]);
    } catch {
      setCouncilMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'council',
        text: "We're having a moment — try again and we'll be right here for you.",
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <LinearGradient
          colors={gradients.canvas}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.eyebrow}>Hair Advice</Text>
              <Text style={styles.title}>Chat</Text>
            </View>
            {/* Mode toggle pill */}
            <View style={styles.modePill}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'products' && styles.modeBtnActive]}
                onPress={() => setMode('products')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeBtnText, mode === 'products' && styles.modeBtnTextActive]}>
                  Products
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'council' && styles.modeBtnActive]}
                onPress={() => setMode('council')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeBtnText, mode === 'council' && styles.modeBtnTextActive]}>
                  Council
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {mode === 'products' ? (
          /* ── PRODUCTS MODE ── */
          <ScrollView
            contentContainerStyle={[styles.productsContent, { paddingBottom: insets.bottom + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Product cards */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Featured Products</Text>
              <Text style={styles.sectionSub}>Tap to chat with the aunty who recommends it</Text>
              <View style={styles.productGrid}>
                {products.map((product, i) => {
                  const aunty = getAunty(product.recommended_by_aunty_id);
                  const ac = auntyColors[product.recommended_by_aunty_id];
                  return (
                    <Animated.View key={product.id} entering={FadeInDown.delay(i * 60).springify()}>
                      <TouchableOpacity
                        style={[styles.productCard, { borderColor: `${ac.accent}35` }]}
                        onPress={() => handleProductPress(product.id, product.recommended_by_aunty_id)}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={[ac.bg, '#ffffff']}
                          style={styles.productCardGradient}
                        >
                          <View style={styles.productCardTop}>
                            <View style={[styles.productAuntyAvatar, { borderColor: `${ac.accent}60` }]}>
                              <AuntyAvatar auntyId={product.recommended_by_aunty_id} size={32} />
                            </View>
                            <Badge
                              label="Ask"
                              variant="aunty"
                              auntyColor={ac.accent}
                              size="sm"
                            />
                          </View>
                          <Text style={styles.productName}>{product.name}</Text>
                          <Text style={[styles.productAuntyName, { color: ac.text }]}>
                            {aunty.name} recommends
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </View>

            {/* Council call-to-action */}
            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
              <Text style={styles.sectionLabel}>The Full Council</Text>
              <TouchableOpacity
                style={styles.councilCTA}
                onPress={() => setMode('council')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={gradients.councilGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.councilCTAGradient}
                >
                  {/* Stacked avatars */}
                  <View style={styles.councilAvatarStack}>
                    {COUNCIL_IDS.map((id, i) => (
                      <View
                        key={id}
                        style={[
                          styles.councilStackAvatar,
                          {
                            marginLeft: i === 0 ? 0 : -14,
                            borderColor: auntyColors[id].accent,
                            zIndex: 7 - i,
                          },
                        ]}
                      >
                        <AuntyAvatar auntyId={id} size={38} />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.councilCTATitle}>Talk to the Council</Text>
                  <Text style={styles.councilCTASub}>All 7 aunties, one conversation →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        ) : (
          /* ── COUNCIL MODE ── */
          <View style={styles.councilContainer}>
            {/* All 7 aunties header strip */}
            <View style={styles.councilStrip}>
              <LinearGradient colors={['#FDF3C0', '#FEF8EC']} style={styles.councilStripGradient}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.councilStripRow}
                >
                  {COUNCIL_IDS.map((id, i) => {
                    const ac = auntyColors[id];
                    return (
                      <Animated.View
                        key={id}
                        entering={FadeIn.delay(i * 50)}
                        style={styles.councilMemberWrap}
                      >
                        <View style={[styles.councilMemberRing, { borderColor: ac.accent }]}>
                          <AuntyAvatar auntyId={id} size={42} />
                        </View>
                        <Text style={[styles.councilMemberName, { color: ac.text }]}>
                          {AUNTIES[id].name}
                        </Text>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
              </LinearGradient>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={[styles.messagesList, { paddingBottom: spacing.md }]}
              showsVerticalScrollIndicator={false}
            >
              {councilMessages.map((msg, i) => (
                <Animated.View
                  key={msg.id}
                  entering={FadeInDown.delay(i === 0 ? 0 : 50).springify()}
                  style={[
                    styles.messageBubble,
                    msg.role === 'user' ? styles.userBubble : styles.councilBubble,
                  ]}
                >
                  {msg.role === 'council' && (
                    <Text style={styles.councilLabel}>THE COUNCIL</Text>
                  )}
                  <Text style={[
                    styles.messageText,
                    msg.role === 'user' && styles.userMessageText,
                  ]}>
                    {msg.text}
                  </Text>
                </Animated.View>
              ))}
              {isLoading && (
                <View style={styles.thinkingBubble}>
                  <Text style={styles.councilLabel}>THE COUNCIL</Text>
                  <View style={styles.thinkingDots}>
                    {[0, 1, 2].map(i => (
                      <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
              <TextInput
                style={styles.input}
                placeholder="Ask the council anything..."
                placeholderTextColor={colors.muted}
                value={councilInput}
                onChangeText={setCouncilInput}
                multiline
                maxLength={500}
                editable={!isLoading}
                onSubmitEditing={handleCouncilSend}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!councilInput.trim() || isLoading) && styles.sendBtnOff]}
                onPress={handleCouncilSend}
                disabled={!councilInput.trim() || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.sendGradient}
                >
                  <Text style={styles.sendText}>↑</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: 2,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
  },
  modePill: {
    flexDirection: 'row',
    backgroundColor: colors.offWhite,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  modeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
    ...shadows.gold,
  },
  modeBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.muted,
  },
  modeBtnTextActive: {
    color: colors.ink,
  },

  // PRODUCTS
  productsContent: {
    padding: spacing.md,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.ink,
  },
  sectionSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  productCard: {
    width: 155,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...shadows.md,
  },
  productCardGradient: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  productCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  productAuntyAvatar: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 1,
  },
  productName: {
    fontFamily: fonts.display,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.ink,
    lineHeight: 18,
  },
  productAuntyName: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  councilCTA: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1.5,
    borderColor: `${colors.primary}60`,
  },
  councilCTAGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  councilAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  councilStackAvatar: {
    borderWidth: 2.5,
    borderRadius: 23,
    padding: 1,
  },
  councilCTATitle: {
    ...typography.h3,
    color: colors.ink,
  },
  councilCTASub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },

  // COUNCIL MODE
  councilContainer: {
    flex: 1,
  },
  councilStrip: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  councilStripGradient: {
    paddingVertical: spacing.sm,
  },
  councilStripRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  councilMemberWrap: {
    alignItems: 'center',
    gap: 4,
  },
  councilMemberRing: {
    borderWidth: 2.5,
    borderRadius: 999,
    padding: 2,
  },
  councilMemberName: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  messages: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.ink,
    borderBottomRightRadius: radius.xs,
  },
  councilBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    borderBottomLeftRadius: radius.xs,
  },
  councilLabel: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 21,
  },
  userMessageText: {
    color: colors.canvas,
    fontWeight: fontWeight.semibold,
  },
  thinkingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.xs,
    padding: spacing.md,
    ...shadows.sm,
  },
  thinkingDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    maxHeight: 100,
    ...shadows.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...shadows.gold,
  },
  sendBtnOff: {
    opacity: 0.45,
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: fontWeight.black,
    lineHeight: 22,
  },
});
