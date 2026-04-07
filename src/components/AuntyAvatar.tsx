/**
 * AuntyAvatar — Circular avatar with portrait, colored ring, and optional glow.
 * The primary visual identity element for each aunty across the app.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuntyPortrait } from './AuntyPortrait';
import { auntyColors } from '../constants/theme';
import { AUNTIES, type AuntyId } from '../constants/aunties';

interface Props {
  auntyId: AuntyId;
  size?: number;
  showRing?: boolean;
  glowing?: boolean;
}

export function AuntyAvatar({ auntyId, size = 56, showRing = true, glowing = false }: Props) {
  const ac = auntyColors[auntyId];
  const aunty = AUNTIES[auntyId];
  const ringWidth = size > 48 ? 3 : 2;
  const outerSize = showRing ? size + ringWidth * 2 + 4 : size;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={aunty ? `${aunty.name}, ${aunty.title}, ${aunty.region}` : `Aunty ${auntyId}`}
      style={[
        styles.container,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
        },
        showRing && {
          borderWidth: ringWidth,
          borderColor: ac?.accent ?? '#D4A04A',
        },
        glowing && {
          shadowColor: ac?.accent ?? '#D4A04A',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
        },
      ]}
    >
      <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
        <AuntyPortrait auntyId={auntyId} size={size} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  inner: {
    overflow: 'hidden',
  },
});
