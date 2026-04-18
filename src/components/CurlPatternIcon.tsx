/**
 * CurlPatternIcon — Real strand illustrations from the standard curl chart.
 *
 * Each type is a hand-drawn strand silhouette (white pixels on transparent),
 * rendered as a tinted Image so it can take on the aunty's accent color when
 * the card is selected, or a muted neutral when it's at rest.
 *
 * Source assets live in `assets/curl-types/{type}.png`.
 */

import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import type { CurlType } from '../types';

interface Props {
  type: CurlType;
  size?: number;
  /** Tint applied to the strand silhouette. */
  color?: string;
  /** Optional aspect-ratio override. Defaults to the strand's natural 11:50. */
  aspectRatio?: number;
  style?: StyleProp<ImageStyle>;
}

const SOURCES: Record<CurlType, number> = {
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

// Source crops are 110×500. Maintain that ratio when rendering so strands
// don't get stretched. `size` controls the height of the rendered strand.
const NATIVE_W = 110;
const NATIVE_H = 500;

export function CurlPatternIcon({
  type,
  size = 56,
  color = '#FEF8EC',
  aspectRatio = NATIVE_W / NATIVE_H,
  style,
}: Props) {
  const height = size;
  const width = height * aspectRatio;

  return (
    <Image
      source={SOURCES[type]}
      style={[
        {
          width,
          height,
          tintColor: color,
        },
        style,
      ]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}
