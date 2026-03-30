import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuntyPortrait from '../components/AuntyPortrait';
import AuntyBubble from '../components/AuntyBubble';
import { CheckIcon, CloseIcon, MinusIcon, CameraIcon } from '../components/Icons';
import { colors } from '../theme';

const followedOptions = [
  { label: 'Yes', Icon: CheckIcon },
  { label: 'Mostly', Icon: MinusIcon },
  { label: 'No', Icon: CloseIcon },
];

function getResponseBubble(followed, moisture, frizz, condition) {
  if (
    (moisture >= 4 || moisture === 0) &&
    (frizz <= 2 || frizz === 0) &&
    (condition >= 4 || condition === 0) &&
    followed === 'Yes'
  ) {
    return {
      aunty: 'ngozi',
      message:
        'CHAI! All seven of us dey clap right now o! Continue like dis, you hear? Di routine dey work and your hair know am! Eh heh, na so we like am!',
    };
  }
  if (followed === 'No') {
    return {
      aunty: 'denise',
      message:
        'Baby. We ain\'t build this whole routine for it to just collect dust. You finna get back on it this week, you hear me? Your hair counting on you and so are we. Don\'t play with us.',
    };
  }
  if (moisture > 0 && moisture <= 2) {
    return {
      aunty: 'ngozi',
      message:
        'Ahn ahn! Dat moisture level no dey where e suppose dey o. Double up on di hot oil treatment dis week — shea and argan under heat for 30 minutes. Your ends need am, abeg no dey waste time.',
    };
  }
  if (frizz >= 4) {
    return {
      aunty: 'carmen',
      message:
        'Ay mija, the frizz means we need más gel on wetter hair, entiendes? Try the flaxseed gel on soaking wet hair next wash day, sección por sección. Tus rizos will thank you, te lo prometo.',
    };
  }
  return {
    aunty: 'marcia',
    message:
      'Yuh making progress, pickney! Keep consistent wid di routine and wi check in again next week. Roots first, always. Mi proud a yuh, yuh hear?',
  };
}

export default function CheckInScreen() {
  const [followed, setFollowed] = useState('');
  const [moisture, setMoisture] = useState(0);
  const [frizz, setFrizz] = useState(0);
  const [condition, setCondition] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const responseBubble = getResponseBubble(followed, moisture, frizz, condition);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <AuntyPortrait size={56} aunty="marcia" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>How di hair doing, pickney?</Text>
          </View>
        </View>

        {!submitted ? (
          <View style={styles.questionsWrap}>
            <Text style={styles.questionTitle}>
              Did you follow the routine this week?
            </Text>
            <View style={styles.optionCardsRow}>
              {followedOptions.map((opt) => {
                const active = followed === opt.label;
                const iconColor = active ? colors.amberDeep : colors.brownLight;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.optionCard,
                      active && styles.optionCardActive,
                    ]}
                    onPress={() => setFollowed(opt.label)}
                    activeOpacity={0.7}
                  >
                    <opt.Icon color={iconColor} size={22} strokeWidth={2.2} />
                    <Text
                      style={[
                        styles.optionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.questionTitle}>Moisture level</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.ratingCircle,
                    moisture === n && styles.ratingCircleActive,
                  ]}
                  onPress={() => setMoisture(n)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.ratingNumber, moisture === n && styles.ratingNumberActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabelText}>Bone dry</Text>
              <Text style={styles.ratingLabelText}>Dripping</Text>
            </View>

            <Text style={styles.questionTitle}>Frizz level</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.ratingCircle,
                    frizz === n && styles.ratingCircleActive,
                  ]}
                  onPress={() => setFrizz(n)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.ratingNumber, frizz === n && styles.ratingNumberActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabelText}>Smooth</Text>
              <Text style={styles.ratingLabelText}>Wild</Text>
            </View>

            <Text style={styles.questionTitle}>Overall hair condition</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.starButton,
                    condition >= n && styles.starButtonActive,
                  ]}
                  onPress={() => setCondition(n)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.starText,
                      condition >= n && styles.starTextActive,
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.uploadSlot}
              activeOpacity={0.7}
            >
              <CameraIcon color={colors.amber} size={28} strokeWidth={1.6} />
              <Text style={styles.uploadLabel}>Add progress photo</Text>
              <Text style={styles.optionalLabel}>Optional</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>Submit check-in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.responseWrap}>
            <AuntyBubble
              aunty={responseBubble.aunty}
              message={responseBubble.message}
              delay={300}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: '#E8F5EE',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 20,
    color: '#1A5C32',
  },
  questionsWrap: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  questionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.brown,
    marginBottom: 12,
    marginTop: 20,
  },
  optionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 4,
  },
  optionCardActive: {
    backgroundColor: colors.amberLight,
    borderColor: colors.amber,
  },
  optionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: colors.brownLight,
  },
  optionLabelActive: {
    color: colors.amberDeep,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.creamDark,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingCircleActive: {
    borderColor: colors.amber,
    backgroundColor: colors.amberLight,
  },
  ratingNumber: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.brownLight,
  },
  ratingNumberActive: {
    color: colors.amberDeep,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ratingLabelText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 9,
    color: colors.brownLight,
  },
  starButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButtonActive: {},
  starText: {
    fontSize: 28,
    color: colors.border,
  },
  starTextActive: {
    color: colors.amber,
  },
  uploadSlot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  uploadLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.brown,
  },
  optionalLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 10,
    color: colors.brownLight,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: colors.amber,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
  responseWrap: {
    paddingTop: 24,
  },
});
