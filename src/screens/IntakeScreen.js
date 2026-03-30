import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuntyPortrait from '../components/AuntyPortrait';
import PillOption from '../components/PillOption';
import { UploadIcon, CheckIcon, BackIcon } from '../components/Icons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

// Each question has an aunty who "asks" it
const questions = [
  {
    aunty: 'marcia',
    quote: 'Wah gwaan, pickney! Show mi wah wi working wid.',
    sub: 'Natural light, no filter — mek di aunties see di truth.',
    type: 'photo',
    label: 'Add your photos',
  },
  {
    aunty: 'ngozi',
    quote: 'How often do you wash, abeg tell me the truth o.',
    sub: null,
    label: 'How often do you wash?',
    options: ['Weekly', 'Every 2 weeks', 'Monthly'],
    multi: false,
  },
  {
    aunty: 'carmen',
    quote: 'Mija, what is your hair telling you it needs?',
    sub: null,
    label: 'Your main goal',
    options: ['Length', 'Moisture', 'Definition', 'Volume'],
    multi: false,
  },
  {
    aunty: 'denise',
    quote: 'Chile, what has been failing you? Be honest.',
    sub: 'Pick all that apply.',
    label: 'What has failed you',
    options: ['Frizz', 'Dryness', 'Breakage', 'No definition', 'Shrinkage'],
    multi: true,
  },
  {
    aunty: 'salma',
    quote: 'Habibti, your water situation matters more than you think.',
    sub: null,
    label: 'Your water situation',
    options: ['Hard water', 'Soft water', 'Not sure'],
    multi: false,
  },
  {
    aunty: 'fatou',
    quote: 'La chaleur, ma chérie — tell me how you use heat.',
    sub: null,
    label: 'Heat styling',
    options: ['Never', 'Rarely', 'Sometimes', 'Often'],
    multi: false,
  },
  {
    aunty: 'amara',
    quote: 'Konjo, do you give your hair time to rest?',
    sub: null,
    label: 'Do you protective style?',
    options: ['Yes regularly', 'Sometimes', 'Never'],
    multi: false,
  },
  {
    aunty: 'marcia',
    quote: 'And the scalp — roots first, always. Any concerns?',
    sub: 'Pick all that apply.',
    label: 'Any scalp concerns?',
    options: ['Dryness', 'Dandruff', 'Itchiness', 'Thinning', 'None'],
    multi: true,
  },
  {
    aunty: 'ngozi',
    quote: 'Last one. Previously relaxed? No shame in di answer o.',
    sub: null,
    label: 'Previously relaxed?',
    options: ['Yes currently', 'Transitioning', 'Never relaxed'],
    multi: false,
  },
];

function QuestionCard({ question, answer, onAnswer, onPhotoToggle, photoSlots }) {
  const slideAnim = useRef(new Animated.Value(24)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slotLabels = ['Front', 'Back', 'Closeup'];

  useEffect(() => {
    slideAnim.setValue(24);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [question]);

  const handleSelect = (option) => {
    if (question.multi) {
      const arr = Array.isArray(answer) ? answer : [];
      if (arr.includes(option)) {
        onAnswer(arr.filter((o) => o !== option));
      } else {
        onAnswer([...arr, option]);
      }
    } else {
      onAnswer(option);
    }
  };

  const isSelected = (option) => {
    if (Array.isArray(answer)) return answer.includes(option);
    return answer === option;
  };

  return (
    <Animated.View
      style={[
        styles.questionCard,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Aunty header */}
      <View style={[styles.auntyHeader, { backgroundColor: `${question.aunty === 'marcia' ? '#E8F5EE' : question.aunty === 'ngozi' ? '#FFF3E8' : question.aunty === 'carmen' ? '#FFF0F4' : question.aunty === 'denise' ? '#EEF2FF' : question.aunty === 'salma' ? '#F0F8FF' : question.aunty === 'fatou' ? '#F5F0FF' : '#FFF8EC'}` }]}>
        <AuntyPortrait size={56} aunty={question.aunty} />
        <View style={styles.auntyHeaderText}>
          <Text style={styles.auntyQuoteText}>"{question.quote}"</Text>
          {question.sub && (
            <Text style={styles.auntySubText}>{question.sub}</Text>
          )}
        </View>
      </View>

      {/* Question body */}
      <View style={styles.questionBody}>
        {question.type === 'photo' ? (
          <View style={styles.photoRow}>
            {slotLabels.map((label, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.photoSlot,
                  photoSlots[i] && styles.photoSlotFilled,
                ]}
                onPress={() => onPhotoToggle(i)}
                activeOpacity={0.7}
              >
                {photoSlots[i] ? (
                  <CheckIcon color={colors.amber} size={22} strokeWidth={2.4} />
                ) : (
                  <UploadIcon color={colors.amber} size={22} strokeWidth={1.8} />
                )}
                <Text
                  style={[
                    styles.slotLabel,
                    photoSlots[i] && styles.slotLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.pillRow}>
            {question.options.map((opt) => (
              <PillOption
                key={opt}
                label={opt}
                selected={isSelected(opt)}
                onPress={() => handleSelect(opt)}
              />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function IntakeScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [photoSlots, setPhotoSlots] = useState([false, false, false]);

  const current = questions[step];
  const total = questions.length;
  const progress = (step + 1) / total;

  const canAdvance = () => {
    if (current.type === 'photo') return true; // photos optional
    const ans = answers[step];
    if (current.multi) return Array.isArray(ans) && ans.length > 0;
    return !!ans;
  };

  const handleNext = () => {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      navigation.navigate('Loading');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      navigation.goBack();
    }
  };

  const togglePhoto = (index) => {
    const next = [...photoSlots];
    next[index] = !next[index];
    setPhotoSlots(next);
  };

  const ctaLabel = step === total - 1
    ? 'Take it to the council.'
    : canAdvance()
    ? 'Next'
    : current.type === 'photo'
    ? 'Skip for now'
    : 'Pick one to continue';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>

        {/* Header bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <BackIcon color={colors.brownLight} size={22} strokeWidth={1.8} />
          </TouchableOpacity>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
              ]}
            />
          </View>

          <Text style={styles.stepCounter}>{step + 1}/{total}</Text>
        </View>

        {/* Question card */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <QuestionCard
            key={step}
            question={current}
            answer={answers[step]}
            onAnswer={(val) => setAnswers((prev) => ({ ...prev, [step]: val }))}
            onPhotoToggle={togglePhoto}
            photoSlots={photoSlots}
          />
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              !canAdvance() && current.type !== 'photo' && styles.ctaButtonDisabled,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.ctaText,
              !canAdvance() && current.type !== 'photo' && styles.ctaTextDisabled,
            ]}>
              {ctaLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.creamDark,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.amber,
    borderRadius: 2,
  },
  stepCounter: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: colors.brownLight,
    minWidth: 28,
    textAlign: 'right',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  questionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  auntyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 14,
  },
  auntyHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  auntyQuoteText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 16,
    color: colors.brown,
    lineHeight: 24,
  },
  auntySubText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: colors.brownLight,
    marginTop: 6,
  },
  questionBody: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 4,
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: colors.amberLight,
    backgroundColor: colors.creamDark,
  },
  slotLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 9,
    color: colors.brownLight,
  },
  slotLabelActive: {
    color: colors.amberDeep,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cream,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.amber,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.creamDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
  ctaTextDisabled: {
    color: colors.brownLight,
  },
});
