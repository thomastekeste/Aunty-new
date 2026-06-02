/**
 * ProductThumb — Square product image with a graceful fallback.
 *
 * Shows the product's imageUrl when available (faded in via expo-image).
 * When no image exists — or the remote image fails to load — it falls back
 * to a tasteful monogram placeholder: the brand's initial on an accent tint.
 * Editorial, on-brand, and never shows a broken-image box.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { colors, fonts, radius } from '../constants/theme';

interface Props {
  imageUrl?: string;
  brand: string;
  /** Side length of the (square) thumbnail. */
  size?: number;
  /** Aunty accent color for the placeholder tint + monogram. */
  accent: string;
  style?: StyleProp<ViewStyle>;
}

export function ProductThumb({ imageUrl, brand, size = 64, accent, style }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = !!imageUrl && !failed;

  const box: StyleProp<ViewStyle> = [
    styles.box,
    { width: size, height: size, borderRadius: radius.md },
    style,
  ];

  if (showImage) {
    return (
      <View style={box}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={220}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  const monogram = (brand?.trim()?.[0] || '?').toUpperCase();

  return (
    <View style={[box, { backgroundColor: `${accent}14` }]}>
      <Text
        style={[styles.monogram, { color: accent, fontSize: size * 0.42 }]}
        allowFontScaling={false}
      >
        {monogram}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
    backgroundColor: colors.canvasDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  monogram: {
    fontFamily: fonts.display,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
});
