import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllProducts } from '@/constants/products';
import { getAunty, AUNTIES } from '@/constants/aunties';
import { generateAuntyResponse } from '@/services/gemini';
import AuntyAvatar from '@/components/AuntyAvatar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, auntyColors, shadows } from '@/constants/theme';

type ChatMode = 'products' | 'council';

interface CouncilMessage {
  id: string;
  role: 'user' | 'council';
  text: string;
  timestamp: string;
}

export default function ProductChatScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const products = getAllProducts();

  const [mode, setMode] = useState<ChatMode>('products');
  const [councilMessages, setCouncilMessages] = useState<CouncilMessage[]>([
    {
      id: '0',
      role: 'council',
      text: 'Welcome! We're the full council of aunties. Ask us anything about your hair, products, or your routine.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [councilInput, setCouncilInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProductPress = (productId: string, auntyId: string) => {
    navigation.navigate('AuntyConversation', {
      auntyId,
      initialQuestion: `Tell me about this product and how it fits into my routine.`,
    });
  };

  const handleCouncilToggle = () => {
    setMode(mode === 'products' ? 'council' : 'products');
  };

  const handleCouncilSend = async () => {
    if (!councilInput.trim()) return;

    // Add user message
    const userMsg: CouncilMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: councilInput,
      timestamp: new Date().toISOString(),
    };

    setCouncilMessages([...councilMessages, userMsg]);
    setCouncilInput('');
    setIsLoading(true);

    try {
      // Generate unified council response
      const councilNames = Object.values(AUNTIES)
        .map(a => `${a.name} (${a.title})`)
        .join(', ');

      const prompt = `You are a council of 7 hair care aunties: ${councilNames}.
      The user asked: "${councilInput}"

      Respond as the council speaking together. Use "we" and speak collectively. Each aunty has a different perspective but you're all collaborating.
      Keep it warm, personal, and under 200 words. No need to introduce yourselves - just answer the question.`;

      const response = await generateAuntyResponse(prompt);

      const councilMsg: CouncilMessage = {
        id: Date.now().toString(),
        role: 'council',
        text: response,
        timestamp: new Date().toISOString(),
      };

      setCouncilMessages(prev => [...prev, councilMsg]);
    } catch (error) {
      console.error('Council response error:', error);
      const errorMsg: CouncilMessage = {
        id: Date.now().toString(),
        role: 'council',
        text: "We're having trouble responding right now. Try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setCouncilMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Ask about products</Text>
        <Text style={styles.title}>Product Chat</Text>
        <Text style={styles.subtitle}>
          {mode === 'products' ? 'Tap a product or talk to the whole council' : 'Talk to the full council'}
        </Text>
      </View>

      {mode === 'products' ? (
        // PRODUCTS MODE
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Carousel */}
          <Text style={styles.sectionLabel}>Products</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productCarousel}
            scrollEventThrottle={16}
          >
            {products.map(product => {
              const aunty = getAunty(product.recommended_by_aunty_id);
              const ac = auntyColors[product.recommended_by_aunty_id];

              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productChip, { borderColor: `${ac.accent}40`, backgroundColor: `${ac.accent}12` }]}
                  onPress={() => handleProductPress(product.id, product.recommended_by_aunty_id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.chipContent}>
                    <Text style={styles.productChipName}>{product.name}</Text>
                    <Text style={[styles.productChipBrand, { color: ac.accent }]}>{aunty.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Talk to Council Section */}
          <View style={styles.councilSection}>
            <Text style={styles.sectionLabel}>Or talk to the council</Text>
            <TouchableOpacity
              style={styles.councilCard}
              onPress={handleCouncilToggle}
              activeOpacity={0.8}
            >
              <View style={styles.councilAvatarRow}>
                {['1', '2', '3', '4', '5', '6', '7'].map((id, i) => (
                  <View
                    key={id}
                    style={[
                      styles.councilAvatar,
                      { marginLeft: i === 0 ? 0 : -12, borderColor: auntyColors[id].accent },
                    ]}
                  >
                    <AuntyAvatar auntyId={id} size={32} />
                  </View>
                ))}
              </View>
              <Text style={styles.councilTitle}>Talk to the council</Text>
              <Text style={styles.councilSubtitle}>Get advice from all seven aunties</Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How it works</Text>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletDot}>•</Text>
              <Text style={styles.infoBulletText}>Tap a product to chat with the aunty who recommends it</Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletDot}>•</Text>
              <Text style={styles.infoBulletText}>Ask questions about ingredients, application, or how it fits your routine</Text>
            </View>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletDot}>•</Text>
              <Text style={styles.infoBulletText}>Or talk to the full council for broader hair advice</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        // COUNCIL MODE
        <View style={styles.councilModeContainer}>
          {/* Council Aunties Header */}
          <View style={styles.councilHeader}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.councilHeaderRow}>
              {['1', '2', '3', '4', '5', '6', '7'].map(id => (
                <View key={id} style={styles.councilHeaderAvatar}>
                  <AuntyAvatar auntyId={id} size={40} />
                  <Text style={styles.councilHeaderName}>{AUNTIES[id].name}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleCouncilToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>← Products</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesList}>
            {councilMessages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userMessage : styles.councilMessage,
                ]}
              >
                <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>The council is thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
            <TextInput
              style={styles.input}
              placeholder="Ask the council..."
              placeholderTextColor={colors.muted}
              value={councilInput}
              onChangeText={setCouncilInput}
              multiline
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
              onPress={handleCouncilSend}
              disabled={isLoading || !councilInput.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  productCarousel: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  productChip: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    minWidth: 140,
    ...shadows.sm,
  },
  chipContent: {
    gap: spacing.xs,
  },
  productChipName: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  productChipBrand: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  councilSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  councilCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  councilAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  councilAvatar: {
    borderWidth: 2,
    borderRadius: 20,
  },
  councilTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  councilSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  infoTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  infoBullet: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoBulletDot: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  infoBulletText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },

  // COUNCIL MODE STYLES
  councilModeContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  councilHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
  },
  councilHeaderRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  councilHeaderAvatar: {
    alignItems: 'center',
    gap: 4,
  },
  councilHeaderName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    textAlign: 'center',
    maxWidth: 50,
  },
  backBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  backBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  councilMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  messageText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.ink,
    fontWeight: fontWeight.semibold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    fontStyle: 'italic',
  },
  inputContainer: {
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
