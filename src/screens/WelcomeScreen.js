import React, { useEffect, useRef } from 'react';
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
import { getAllAunties } from '../data/aunties';
import { colors, fonts } from '../theme';

const { width } = Dimensions.get('window');

function AuntyRow({ aunty, index }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 80;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.auntyRow,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <AuntyPortrait size={56} aunty={aunty.id} />
      <View style={styles.auntyInfo}>
        <Text style={styles.auntyName}>{aunty.name}</Text>
        <Text style={[styles.auntyRegion, { color: aunty.colors.accent }]}>
          {aunty.region}
        </Text>
        <Text style={styles.auntySpecialty}>{aunty.specialty}</Text>
        <Text style={styles.auntyQuote}>"{aunty.quote}"</Text>
      </View>
    </Animated.View>
  );
}

export default function WelcomeScreen({ navigation }) {
  const allAunties = getAllAunties();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroCircle} />
            <Text style={styles.wordmark}>Aunty</Text>
            <Text style={styles.subtitle}>The curl council.</Text>
            <Text style={styles.description}>
              Seven aunties. Your hair. One collective blessing. For every curl,
              coil, and wave — no matter where you're from.
            </Text>
          </View>

          <View style={styles.councilSection}>
            <Text style={styles.sectionLabel}>YOUR COUNCIL</Text>
            {allAunties.map((aunty, i) => (
              <AuntyRow key={aunty.id} aunty={aunty} index={i} />
            ))}
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Intake')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>The council is ready for you.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7}>
            <Text style={styles.outlineText}>
              Already have a routine? Sign in.
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  hero: {
    background: 'linear-gradient(135deg, #FDF2F8 0%, #F9F5FB 100%)',
    backgroundColor: colors.background,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroCircle: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary,
    opacity: 0.15,
  },
  wordmark: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 56,
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 16,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  description: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 14 * 1.6,
    marginTop: 14,
    maxWidth: 300,
  },
  councilSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.12 * 10,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  auntyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  auntyInfo: {
    flex: 1,
    marginLeft: 14,
  },
  auntyName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  auntyRegion: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  auntySpecialty: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  auntyQuote: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.background,
  },
  outlineText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
