import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import AuntyPortrait from './AuntyPortrait';
import { getAunty } from '../data/aunties';
import { colors, fonts } from '../theme';

export default function AuntyBubble({ aunty, message, delay = 0, onFinish }) {
  const auntyData = getAunty(aunty);
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      ]).start(() => {
        onFinish?.();
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!auntyData) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <AuntyPortrait size={40} aunty={aunty} />
      <View style={styles.bubbleWrap}>
        <Text style={[styles.name, { color: auntyData.colors.accent }]}>
          {auntyData.shortName}
        </Text>
        <View
          style={[styles.bubble, { backgroundColor: auntyData.colors.bg }]}
        >
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  bubbleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    marginBottom: 6,
    fontWeight: '600',
    color: colors.text,
  },
  bubble: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.15)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  message: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    lineHeight: 13 * 1.65,
    color: colors.text,
  },
});
