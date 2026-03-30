import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RoutineCard from '../components/RoutineCard';
import ProductRow from '../components/ProductRow';
import { BackIcon } from '../components/Icons';
import { colors } from '../theme';

const products = [
  { name: 'Jamaican Black Castor Oil', brand: 'Sunny Isle', aunty: 'marcia', price: '$12' },
  { name: 'Raw Shea Butter', brand: 'SheaMoisture', aunty: 'ngozi', price: '$10' },
  { name: 'Fenugreek Protein Mask', brand: 'Dabur', aunty: 'amara', price: '$14' },
  { name: 'Rhassoul Clay', brand: 'Moroccan Natural', aunty: 'salma', price: '$18' },
  { name: '100% Argan Oil', brand: 'OGX', aunty: 'salma', price: '$11' },
  { name: 'Honey Curl Defining Cream', brand: 'TGIN', aunty: 'denise', price: '$16' },
  { name: 'Flaxseed Curl Gel', brand: "Aunt Jackie's", aunty: 'carmen', price: '$9' },
];

export default function RoutineScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <BackIcon color={colors.textSecondary} size={22} strokeWidth={1.8} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Council-approved routine.</Text>
            <Text style={styles.subtitle}>
              4B/4C · High porosity · Moisture-focused
            </Text>
          </View>

          <View style={styles.curlCard}>
            <View style={styles.curlCardTop}>
              <View>
                <Text style={styles.curlType}>4B/4C</Text>
                <Text style={styles.curlDetail}>High porosity · Dense</Text>
              </View>
            </View>
            <View style={styles.tagRow}>
              {['Moisture-starved', 'LOC method', 'JBCO', 'Protein treatment', 'Weekly wash'].map(
                (tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                )
              )}
            </View>
          </View>

          <Text style={styles.sectionLabel}>YOUR WEEKLY ROUTINE</Text>

          <View style={styles.cardSection}>
            <RoutineCard
              day="Wash day — Sunday"
              owners={['ngozi', 'amara', 'marcia']}
              steps={[
                'JBCO scalp massage 5 min per section',
                'Fenugreek and castor protein pre-treatment 20 min',
                'Hot oil blend shea and argan 30 min under heat',
                'Rhassoul clay clarifying rinse',
                'Sulfate-free cleanse cool rinse to seal',
                'Deep condition under heat 20 min',
              ]}
            />

            <RoutineCard
              day="Style day — Monday"
              owners={['denise', 'carmen']}
              steps={[
                'LOC method on soaking wet hair',
                'Flaxseed gel applied section by section',
                'Thread-stretch two sections for length retention',
                'Air dry under satin scarf or diffuse low heat',
              ]}
            />

            <RoutineCard
              day="Refresh — Wednesday"
              owners={['carmen', 'salma']}
              steps={[
                'Water and aloe vera spritz scrunch upward',
                'Seal with argan oil small amount on palms',
                'Optional finger coil any shrunken sections',
              ]}
            />
          </View>

          <Text style={styles.sectionLabel}>AUNTY-APPROVED PRODUCTS</Text>

          <View style={styles.productSection}>
            {products.map((p) => (
              <ProductRow key={p.name} {...p} />
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('SendOff')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>
              The aunties have one more thing to say.
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
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 12,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  curlCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  curlCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  curlType: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 48,
    color: colors.primary,
  },
  curlDetail: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.25)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  cardSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  productSection: {
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
});
