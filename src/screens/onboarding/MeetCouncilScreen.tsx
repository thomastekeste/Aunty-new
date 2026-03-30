import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { AUNTIES, AUNTY_IDS } from '@/constants/aunties';
import { ChevronUpIcon, ChevronDownIcon } from '@/components/Icons';
import AuntyAvatar from '@/components/AuntyAvatar';
import Button from '@/components/Button';
import { colors, spacing, fontSize, fontWeight, radius, fonts, auntyColors } from '@/constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'MeetCouncil'>;

export default function MeetCouncilScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>The Council</Text>
        <Text style={styles.subtitle}>Seven aunties. One mission.</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {AUNTY_IDS.map(id => {
          const aunty = AUNTIES[id];
          const isExpanded = expanded === id;

          return (
            <TouchableOpacity
              key={id}
              style={styles.card}
              onPress={() => setExpanded(isExpanded ? null : id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardMain}>
                <AuntyAvatar auntyId={id} size={52} />
                <View style={styles.cardText}>
                  <Text style={styles.name}>{aunty.name}</Text>
                  <Text style={styles.region}>{aunty.region}</Text>
                  <Text style={styles.specialty}>{aunty.specialty}</Text>
                </View>
                {isExpanded
                  ? <ChevronUpIcon color={colors.muted} size={18} strokeWidth={1.8} />
                  : <ChevronDownIcon color={colors.muted} size={18} strokeWidth={1.8} />
                }
              </View>

              {isExpanded && (
                <View style={styles.quote}>
                  <Text style={styles.quoteText}>"{aunty.quote}"</Text>
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
  root: { flex: 1, backgroundColor: colors.ink },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,123,58,0.25)',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.canvas,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.amberLight,
    marginTop: spacing.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  list: { flex: 1 },
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(201,123,58,0.2)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  cardText: { flex: 1 },
  name: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.canvas,
  },
  region: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.amberLight,
    marginTop: 2,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specialty: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: 'rgba(254,249,243,0.55)',
    marginTop: 3,
  },
  chevron: { fontFamily: fonts.body, fontSize: 16, color: colors.muted },
  quote: {
    padding: spacing.md,
    paddingTop: 0,
    paddingLeft: spacing.md + 52 + spacing.md,
    backgroundColor: 'rgba(201,123,58,0.10)',
  },
  quoteText: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.amberLight,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,123,58,0.25)',
    backgroundColor: colors.ink,
  },
});
