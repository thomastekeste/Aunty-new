import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import AuntyBubble from '@/components/AuntyBubble';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { colors, fonts, spacing, fontSize, fontWeight, radius, shadows } from '@/constants/theme';
import {
  CityData,
  WaterHardness,
  WATER_HARDNESS_LABELS,
  WATER_HARDNESS_COLORS,
  WATER_HARDNESS_TIPS,
  searchCities,
} from '@/constants/cities';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Location'>;

const HARDNESS_ICONS: Record<WaterHardness, string> = {
  soft: '💧',
  medium: '🌊',
  hard: '⚠️',
  very_hard: '🪨',
};

export default function LocationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { data, setData } = useOnboarding();
  const [query, setQuery] = useState(data.city ?? '');
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const results = showDropdown ? searchCities(query) : [];

  const handleSelectCity = (city: CityData) => {
    setSelectedCity(city);
    setQuery(`${city.name}, ${city.country}`);
    setShowDropdown(false);
  };

  const handleTextChange = (text: string) => {
    setQuery(text);
    setSelectedCity(null);
    setShowDropdown(text.trim().length >= 2);
  };

  const handleContinue = () => {
    if (!selectedCity && query.trim().length === 0) return;
    setData({
      city: selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : query,
      water_hardness: selectedCity?.hardness ?? 'medium',
    });
    navigation.navigate('PorosityTest');
  };

  const canContinue = selectedCity !== null || query.trim().length > 0;
  const hardnessColor = selectedCity ? WATER_HARDNESS_COLORS[selectedCity.hardness] : null;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <ProgressBar current={1} total={14} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <AuntyBubble
          auntyId="7"
          message="Where are you coming to us from? Your water situation matters more than you think."
        />

        <View style={styles.questionBlock}>
          <Text style={styles.stepBadge}>Your Location</Text>
          <Text style={styles.question}>What city are you in?</Text>
          <Text style={styles.questionSub}>We'll check your water hardness so your routine accounts for mineral buildup.</Text>
        </View>

        {/* Search input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>📍</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleTextChange}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            placeholder="Start typing your city..."
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={canContinue ? handleContinue : undefined}
          />
          {selectedCity && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setSelectedCity(null); setShowDropdown(false); }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown results */}
        {showDropdown && results.length > 0 && (
          <View style={styles.dropdown}>
            {results.map((city, i) => {
              const color = WATER_HARDNESS_COLORS[city.hardness];
              return (
                <TouchableOpacity
                  key={`${city.name}-${city.country}`}
                  style={[
                    styles.dropdownItem,
                    i < results.length - 1 && styles.dropdownItemBorder,
                  ]}
                  onPress={() => handleSelectCity(city)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownLeft}>
                    <Text style={styles.dropdownCity}>{city.name}</Text>
                    <Text style={styles.dropdownCountry}>
                      {city.region ? `${city.region}, ` : ''}{city.country}
                    </Text>
                  </View>
                  <View style={[styles.hardnessBadge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
                    <Text style={styles.hardnessIcon}>{HARDNESS_ICONS[city.hardness]}</Text>
                    <Text style={[styles.hardnessBadgeText, { color }]}>
                      {city.hardness === 'very_hard' ? 'Very Hard' : WATER_HARDNESS_LABELS[city.hardness].split(' ')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* No results */}
        {showDropdown && query.trim().length >= 2 && results.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No city found — try a different spelling</Text>
          </View>
        )}

        {/* Water hardness result card */}
        {selectedCity && (
          <View style={[styles.resultCard, { borderLeftColor: hardnessColor! }]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{HARDNESS_ICONS[selectedCity.hardness]}</Text>
              <View style={styles.resultHeaderText}>
                <Text style={styles.resultCityName}>{selectedCity.name}</Text>
                <Text style={[styles.resultHardnessLabel, { color: hardnessColor! }]}>
                  {WATER_HARDNESS_LABELS[selectedCity.hardness]} · ~{selectedCity.mgL} mg/L
                </Text>
              </View>
            </View>

            <Text style={styles.resultTip}>{WATER_HARDNESS_TIPS[selectedCity.hardness]}</Text>

            {/* Hardness scale visual */}
            <View style={styles.scaleRow}>
              {(['soft', 'medium', 'hard', 'very_hard'] as WaterHardness[]).map(h => (
                <View
                  key={h}
                  style={[
                    styles.scaleBlock,
                    {
                      backgroundColor: h === selectedCity.hardness
                        ? WATER_HARDNESS_COLORS[h]
                        : `${WATER_HARDNESS_COLORS[h]}30`,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>Soft</Text>
              <Text style={styles.scaleLabel}>Very Hard</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={selectedCity ? `Continue with ${selectedCity.name}` : 'Continue'}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  topBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  content: { padding: spacing.md, gap: spacing.lg },

  questionBlock: {
    gap: spacing.xs,
  },
  stepBadge: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -1,
  },
  questionSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 20,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.ink,
    paddingVertical: spacing.md,
    fontWeight: fontWeight.medium,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    fontSize: 14,
    color: colors.muted,
  },

  // Dropdown
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.md,
    marginTop: -spacing.sm,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  dropdownCity: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  dropdownCountry: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: 2,
  },
  hardnessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  hardnessIcon: {
    fontSize: 12,
  },
  hardnessBadgeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // No results
  noResults: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: -spacing.sm,
  },
  noResultsText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },

  // Result card
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 5,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resultIcon: {
    fontSize: 36,
  },
  resultHeaderText: {
    flex: 1,
  },
  resultCityName: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  resultHardnessLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  resultTip: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Hardness scale
  scaleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  scaleBlock: {
    flex: 1,
    borderRadius: 4,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.canvas,
  },
});
