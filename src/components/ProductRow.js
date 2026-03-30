import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAunty } from '../data/aunties';
import { LeafIcon } from './Icons';
import { colors } from '../theme';

export default function ProductRow({ name, brand, aunty, price }) {
  const auntyData = getAunty(aunty);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.icon,
          { backgroundColor: auntyData?.colors.bg || colors.creamDark },
        ]}
      >
        <LeafIcon color={auntyData?.colors.accent || colors.amber} size={18} strokeWidth={1.8} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.brand}>
          {brand} · {auntyData?.name || aunty}
        </Text>
      </View>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  brand: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});
