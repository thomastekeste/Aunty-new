import React from 'react';
import { View, StyleSheet } from 'react-native';
import AuntyPortrait from './AuntyPortrait';
import { auntyOrder } from '../data/aunties';

export default function PortraitRow({ size = 48, overlap = 16, style }) {
  return (
    <View style={[styles.row, style]}>
      {auntyOrder.map((id, i) => (
        <AuntyPortrait
          key={id}
          aunty={id}
          size={size}
          style={[
            styles.portrait,
            i > 0 && { marginLeft: -overlap },
            { zIndex: auntyOrder.length - i },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portrait: {
    borderWidth: 2,
    borderColor: '#FBF6F0',
  },
});
