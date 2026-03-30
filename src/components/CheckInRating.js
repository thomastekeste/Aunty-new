import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function CheckInRating({ question, value, onChange, labels = [] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.circle, value === n && styles.activeCircle]}
            onPress={() => onChange(n)}
            activeOpacity={0.7}
          >
            <Text style={[styles.number, value === n && styles.activeNumber]}>
              {labels[n - 1] || n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {labels.length >= 2 && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{labels[0]}</Text>
          <Text style={styles.labelText}>{labels[labels.length - 1]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  question: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.brown,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.creamDark,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  number: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.brownLight,
  },
  activeNumber: {
    color: colors.white,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  labelText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 9,
    color: colors.brownLight,
  },
});
