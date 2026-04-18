/**
 * CurlPatternIcon — Real strand illustrations from the chart.
 *
 * Crops are dark strokes on cream, displayed inside a cream-tinted
 * rounded frame so they sit correctly against the dark card surface.
 * The frame border tints with the aunty accent on selection.
 */

import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import type { CurlType } from '../types';

interface Props {
  type: CurlType;
  /** Height of the illustration frame. Width auto-fits via aspect ratio. */
  size?: number;
  /** Border/accent color — aunty accent when selected, muted when not. */
  color?: string;
  selected?: boolean;
}

const SOURCES: Record<CurlType, ReturnType<typeof require>> = {
  '2a': require('../../assets/curl-types/2a.png'),
  '2b': require('../../assets/curl-types/2b.png'),
  '2c': require('../../assets/curl-types/2c.png'),
  '3a': require('../../assets/curl-types/3a.png'),
  '3b': require('../../assets/curl-types/3b.png'),
  '3c': require('../../assets/curl-types/3c.png'),
  '4a': require('../../assets/curl-types/4a.png'),
  '4b': require('../../assets/curl-types/4b.png'),
  '4c': require('../../assets/curl-types/4c.png'),
};

// Source crops are 92×485 — roughly 1:5.27 portrait
const ASPECT = 92 / 485;

export function CurlPatternIcon({ type, size = 80, color = 'rgba(254,248,236,0.2)', selected = false }: Props) {
  const height = size;
  const width = Math.round(height * ASPECT);
  const frameW = width + 14;
  const frameH = height + 14;

  return (
    <View
      style={[
        styles.frame,
        {
          width: frameW,
          height: frameH,
          borderRadius: 10,
          borderColor: selected ? color : 'rgba(254,248,236,0.12)',
          borderWidth: selected ? 1.5 : 1,
          backgroundColor: selected
            ? 'rgba(245, 237, 220, 0.96)'
            : 'rgba(245, 237, 220, 0.82)',
        },
      ]}
    >
      <Image
        source={SOURCES[type]}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
