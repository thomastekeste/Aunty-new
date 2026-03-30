import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PortraitRow from '../components/PortraitRow';
import ProgressCircle from '../components/ProgressCircle';
import { colors } from '../theme';

export default function SendOffScreen({ navigation }) {
  const portraitSlide = useRef(new Animated.Value(-20)).current;
  const portraitOpacity = useRef(new Animated.Value(0)).current;

  const messageSlide = useRef(new Animated.Value(10)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  const attributionOpacity = useRef(new Animated.Value(0)).current;

  const mainLineScale = useRef(new Animated.Value(0.95)).current;
  const mainLineOpacity = useRef(new Animated.Value(0)).current;

  const checkInSlide = useRef(new Animated.Value(30)).current;
  const checkInOpacity = useRef(new Animated.Value(0)).current;

  const shareOpacity = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = [
      // 200ms: portraits drop in
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(portraitSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(portraitOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      // 700ms: message fades up
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(messageSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(messageOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),

      // 1300ms: attribution fades in
      Animated.delay(100),
      Animated.timing(attributionOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),

      // 1700ms: main line scales and fades in
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(mainLineScale, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(mainLineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),

      // 2400ms: check-in strip slides up
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(checkInSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(checkInOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      // 2900ms: share buttons fade in
      Animated.delay(100),
      Animated.timing(shareOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),

      // 3300ms: bottom text fades in
      Animated.delay(100),
      Animated.timing(bottomOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ];

    Animated.sequence(sequence).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Portraits */}
        <Animated.View
          style={{
            opacity: portraitOpacity,
            transform: [{ translateY: portraitSlide }],
            marginTop: 40,
          }}
        >
          <PortraitRow size={50} overlap={14} />
        </Animated.View>

        {/* Personalized message */}
        <Animated.View
          style={{
            opacity: messageOpacity,
            transform: [{ translateY: messageSlide }],
            marginTop: 28,
            alignItems: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Text style={styles.personalMessage}>
            Kezia, your 4B/4C coils are going to be{' '}
            <Text style={styles.thrivingWord}>thriving</Text> by week 3. All
            seven of us put our foot in this routine. Now go.
          </Text>
        </Animated.View>

        {/* Attribution */}
        <Animated.View
          style={{
            opacity: attributionOpacity,
            marginTop: 12,
            alignItems: 'center',
          }}
        >
          <Text style={styles.attribution}>— All seven aunties</Text>
        </Animated.View>

        {/* Main line — the brand moment */}
        <Animated.View
          style={{
            opacity: mainLineOpacity,
            transform: [{ scale: mainLineScale }],
            marginTop: 40,
            marginBottom: 40,
            paddingHorizontal: 24,
          }}
        >
          <Text style={styles.mainLine}>
            Go live and make ya aunty proud.
          </Text>
        </Animated.View>

        {/* Check-in strip */}
        <Animated.View
          style={[
            styles.checkInCard,
            {
              opacity: checkInOpacity,
              transform: [{ translateY: checkInSlide }],
            },
          ]}
        >
          <Text style={styles.checkInLabel}>YOUR CHECK-IN SCHEDULE</Text>
          <View style={styles.weekRow}>
            <ProgressCircle week={1} active label="Today" />
            <ProgressCircle week={2} active={false} label="Week 2" />
            <ProgressCircle week={3} active={false} label="Week 3" />
            <ProgressCircle week={4} active={false} label="Week 4" />
          </View>
        </Animated.View>

        {/* Share buttons */}
        <Animated.View
          style={[styles.shareRow, { opacity: shareOpacity }]}
        >
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
            <Text style={styles.shareText}>Share my send-off</Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
            <Text style={styles.shareText}>#makeyourauntproud</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom text */}
        <Animated.View
          style={{ opacity: bottomOpacity, marginTop: 24, alignItems: 'center' }}
        >
          <Text style={styles.bottomText}>
            Di aunties go check in. Don't ghost dem o.
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Main')}
          activeOpacity={0.7}
        >
          <Text style={styles.homeButtonText}>Go to your dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startOver}
          onPress={() => navigation.navigate('Welcome')}
          activeOpacity={0.6}
        >
          <Text style={styles.startOverText}>Start over</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    alignItems: 'center',
    paddingBottom: 20,
  },
  personalMessage: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 19,
    color: colors.brown,
    textAlign: 'center',
    lineHeight: 19 * 1.45,
    maxWidth: 300,
  },
  thrivingWord: {
    color: colors.amber,
    fontFamily: 'Fraunces_700Bold_Italic',
  },
  attribution: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.brownLight,
    fontStyle: 'italic',
  },
  mainLine: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 32,
    color: colors.amber,
    textAlign: 'center',
    lineHeight: 32 * 1.35,
    letterSpacing: -0.5,
  },
  checkInCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.amberLight,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    alignItems: 'center',
    width: '85%',
  },
  checkInLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: colors.amber,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  shareRow: {
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.creamDark,
    borderWidth: 1.5,
    borderColor: colors.amber,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  shareText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: colors.amber,
  },
  bottomText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: colors.brownLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: colors.amber,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  homeButtonText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.white,
  },
  startOver: {
    marginTop: 16,
    paddingVertical: 8,
  },
  startOverText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.brownLight,
    textDecorationLine: 'underline',
  },
});
