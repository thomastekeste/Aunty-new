import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuntyPortrait from './AuntyPortrait';
import { colors, fonts } from '../theme';

export default function RoutineCard({ day, owners = [], steps = [] }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.day}>{day}</Text>
        <View style={styles.ownersPill}>
          <View style={styles.portraitRow}>
            {owners.map((id, i) => (
              <AuntyPortrait
                key={id}
                aunty={id}
                size={24}
                style={[styles.miniPortrait, i > 0 && { marginLeft: -8 }]}
              />
            ))}
          </View>
        </View>
      </View>
      {steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.dot} />
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  day: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  ownersPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPortrait: {
    borderWidth: 2,
    borderColor: colors.surface,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 10,
  },
  stepText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
});
