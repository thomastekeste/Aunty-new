import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuntyBubble from '../components/AuntyBubble';
import { BackIcon } from '../components/Icons';
import { colors } from '../theme';

const bubbles = [
  {
    aunty: 'ngozi',
    message:
      'Ahn ahn! See dis dryness for the ends — you think say you fit hide am from me? Abeg, before ANYTHING, we go do hot oil treatment. Shea butter, coconut oil, under heat for 30 minutes minimum o. Dis hair dey thirsty and e don dey thirsty for long time. No dey play with me.',
  },
  {
    aunty: 'marcia',
    message:
      'Wah Ngozi seh bout di moisture is true still. But mi a go to di scalp first because dat is di root of everything, yuh understand? JBCO massage before every single wash. Mi want blood circulating to dem follicles. Di length will come afta wi fix wah underneath. Roots first, pickney.',
  },
  {
    aunty: 'denise',
    message:
      'Chile, I peeped that 4B crown and 4C nape right away. And them edges? Baby that\'s over-manipulation, period. We finna do the LOC method and then you putting the hands DOWN. Satin bonnet every single night. Not sometimes — every night. I\'m not playing with you.',
  },
  {
    aunty: 'fatou',
    message:
      'Oui, Denise a raison about the technique. Nos grand-mères, they had waist-length hair with nothing but karité butter and patience, ma chérie. Before every protective style, I want you to thread-stretch first, d\'accord? This preserves the length Marcia is growing. La patience est la clé.',
  },
  {
    aunty: 'carmen',
    message:
      'Ay mija, tu patrón de rizos underneath all of this is GORGEOUS — I can see it trying to come out, mami! Flaxseed gel on soaking wet hair, sección por sección, and you\'re gonna be in SHOCK. Tus rizos already there, corazón. We just gotta coax them out. Confía en mí.',
  },
  {
    aunty: 'amara',
    message:
      'Konjo, let me speak about the strength of the hair shaft itself. Yehabesha women have used fenugreek and castor oil for centuries to strengthen from the inside. What Carmen wants to define, first we must make strong, betam. I will add a protein treatment — like our enatoch taught us.',
  },
  {
    aunty: 'salma',
    message:
      'Yalla habibti, I am bringing the ghassoul clay and the argan oil. The clay will clarify the scalp — what Marcia is treating, they work together, mashallah. Our jeddah sealed moisture with argan since forever. Hadi hiya the way we lock everything in after what Ngozi did, inshallah.',
  },
];

function ConsensusCard({ visible, navigation }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showCta, setShowCta] = useState(false);
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        setShowCta(true);
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1000);
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.consensusCard,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.consensusText}>
        The aunties have reached consensus.
      </Text>
      <View style={styles.typingDots}>
        <PulsingDot delay={0} />
        <PulsingDot delay={200} />
        <PulsingDot delay={400} />
      </View>
      {showCta && (
        <Animated.View style={{ opacity: ctaOpacity, marginTop: 16 }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Routine')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>See your routine.</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function PulsingDot({ delay }) {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 400, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay]);

  return <Animated.View style={[styles.pulsingDot, { opacity }]} />;
}

export default function CouncilScreen({ navigation }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showConsensus, setShowConsensus] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visibleCount < bubbles.length) {
      const timer = setTimeout(() => {
        setVisibleCount((c) => c + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowConsensus(true), 600);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

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

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            The aunties are weighing in.
          </Text>
          <Text style={styles.headerSub}>
            They see your hair. They all have thoughts.
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {bubbles.slice(0, visibleCount).map((b, i) => (
            <AuntyBubble
              key={b.aunty}
              aunty={b.aunty}
              message={b.message}
              delay={0}
            />
          ))}

          <ConsensusCard visible={showConsensus} navigation={navigation} />

          <View style={{ height: 120 }} />
        </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  consensusCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  consensusText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginTop: 12,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 3,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
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
