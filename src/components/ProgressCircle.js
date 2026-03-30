import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function ProgressCircle({ week, active, label }) {
  return (
    <View style={styles.container}>
      <View style={[styles.circle, active ? styles.active : styles.inactive]}>
        <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>
          W{week}
        </Text>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: colors.amber,
  },
  inactive: {
    backgroundColor: colors.creamDark,
    borderWidth: 1.5,
    borderColor: colors.amber,
  },
  text: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
  },
  activeText: {
    color: colors.white,
  },
  inactiveText: {
    color: colors.amber,
  },
  label: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 9,
    color: colors.brownLight,
    marginTop: 4,
  },
});
