import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PortraitRow from '../components/PortraitRow';
import ProgressCircle from '../components/ProgressCircle';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Aunty</Text>
          <Text style={styles.subtitle}>The curl council.</Text>
        </View>

        <PortraitRow size={50} overlap={14} style={{ marginTop: 24 }} />

        <Text style={styles.greeting}>
          Welcome back, Kezia.
        </Text>
        <Text style={styles.greetingSub}>
          Di aunties dey watch dem coils, yuh hear?
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR CHECK-IN SCHEDULE</Text>
          <View style={styles.weekRow}>
            <ProgressCircle week={1} active label="Done" />
            <ProgressCircle week={2} active={false} label="Week 2" />
            <ProgressCircle week={3} active={false} label="Week 3" />
            <ProgressCircle week={4} active={false} label="Week 4" />
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkInButton}
          onPress={() => navigation.navigate('CheckIn')}
          activeOpacity={0.8}
        >
          <Text style={styles.checkInText}>Weekly check-in</Text>
        </TouchableOpacity>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Go live and make ya aunty proud."
          </Text>
          <Text style={styles.quoteAttribution}>— The Council</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  wordmark: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  greeting: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  greetingSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 24,
    marginTop: 28,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  checkInButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  checkInText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
  quoteCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteText: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  quoteAttribution: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
