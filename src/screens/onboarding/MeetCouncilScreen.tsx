import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { AUNTIES, AUNTY_IDS } from '@/constants/aunties';
import { ChevronUpIcon, ChevronDownIcon } from '@/components/Icons';
import AuntyAvatar from '@/components/AuntyAvatar';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors, shadows } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<OnboardingStackParamList, 'MeetCouncil'>;

export default function MeetCouncilScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Decorative glow behind header */}
      <View style={styles.headerGlow} />

      <View style={styles.header}>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>Your personal council</Text>
        </View>
        <Text style={styles.title}>Seven Aunties.</Text>
        <Text style={styles.titleAccent}>One Mission.</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {AUNTY_IDS.map((id, index) => {
          const aunty = AUNTIES[id];
          const isExpanded = expanded === id;
          const ac = auntyColors[id];

          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.card,
                isExpanded && styles.cardExpanded,
              ]}
              onPress={() => {
                LayoutAnimation.configureNext({
                  duration: 280,
                  create: { type: 'easeInEaseOut', property: 'opacity' },
                  update: { type: 'spring', springDamping: 0.7 },
                  delete: { type: 'easeInEaseOut', property: 'opacity' },
                });
                setExpanded(isExpanded ? null : id);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.cardMain}>
                {/* Color swatch side panel */}
                <View style={[styles.swatchPanel, { backgroundColor: ac.accent }]}>
                  <Text style={styles.swatchNumber}>{index + 1}</Text>
                </View>

                {/* Avatar */}
                <View style={[styles.avatarRing, { borderColor: `${ac.accent}60` }]}>
                  <AuntyAvatar auntyId={id} size={50} />
                </View>

                {/* Text */}
                <View style={styles.cardText}>
                  <Text style={styles.name}>{aunty.name}</Text>
                  <Text style={[styles.titleTag, { color: ac.accent }]}>{aunty.title}</Text>
                  <Text style={styles.region}>{aunty.region}</Text>
                </View>

                {/* Expand icon */}
                <View style={[styles.chevronWrap, { backgroundColor: `${ac.accent}18`, borderColor: `${ac.accent}35` }]}>
                  {isExpanded
                    ? <ChevronUpIcon color={ac.accent} size={14} strokeWidth={2.5} />
                    : <ChevronDownIcon color={ac.accent} size={14} strokeWidth={2.5} />
                  }
                </View>
              </View>

              {/* Expanded content */}
              {isExpanded && (
                <View style={[styles.expandedSection, { borderTopColor: `${ac.accent}25`, backgroundColor: ac.bgDark }]}>
                  {/* Specialty pill */}
                  <View style={[styles.specialtyPill, { backgroundColor: ac.accent }]}>
                    <Text style={styles.specialtyText}>{aunty.specialty}</Text>
                  </View>

                  <Text style={[styles.quoteMark, { color: ac.accent }]}>"</Text>
                  <Text style={[styles.quoteText, { color: colors.canvas }]}>
                    {aunty.quote}
                  </Text>

                  {/* Ingredient tag */}
                  <View style={styles.ingredientRow}>
                    <View style={[styles.ingredientPill, { borderColor: `${ac.accent}55` }]}>
                      <View style={[styles.ingredientDot, { backgroundColor: ac.accent }]} />
                      <Text style={[styles.ingredientText, { color: ac.accent }]}>
                        {aunty.ingredient}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="The council is ready for you."
          onPress={() => navigation.navigate('Name')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  // Decorative glow
  headerGlow: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.04,
  },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,197,66,0.08)',
  },
  headerPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,197,66,0.08)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  headerPillText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
    lineHeight: 40,
  },
  titleAccent: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.primary,
    letterSpacing: -1,
    lineHeight: 40,
  },

  list: { flex: 1 },

  // Card
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  cardExpanded: {
    borderColor: colors.border,
  },

  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  // Bold color swatch panel — the aunty's color identity
  swatchPanel: {
    width: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  swatchNumber: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.65)',
  },

  avatarRing: {
    borderRadius: 29,
    borderWidth: 2,
    padding: 1,
  },
  cardText: { flex: 1, paddingVertical: spacing.md },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  titleTag: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  region: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 3,
  },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  // Expanded
  expandedSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  specialtyPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginBottom: spacing.sm,
  },
  specialtyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  quoteMark: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 40,
    fontWeight: fontWeight.black,
    opacity: 0.4,
  },
  quoteText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    lineHeight: 26,
    marginTop: -spacing.xs,
    color: colors.ink,
  },
  ingredientRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
  },
  ingredientPill: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ingredientDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  ingredientText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,197,66,0.08)',
    backgroundColor: colors.canvas,
  },
});
