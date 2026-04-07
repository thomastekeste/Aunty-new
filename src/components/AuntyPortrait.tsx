/**
 * AuntyPortrait — SVG illustrated portraits for each aunty.
 *
 * Each portrait is a distinct, culturally specific illustration
 * with unique hair, skin tone, accessories, and expression.
 * These are the soul of the app's visual identity.
 */

import React from 'react';
import Svg, { Circle, Path, Rect, Ellipse, G } from 'react-native-svg';
import type { AuntyId } from '../constants/aunties';

interface Props {
  auntyId: AuntyId;
  size?: number;
}

export function AuntyPortrait({ auntyId, size = 80 }: Props) {
  const scale = size / 100;

  const portraits: Record<AuntyId, () => React.ReactNode> = {
    ngozi: () => (
      <G>
        {/* High puff afro */}
        <Circle cx="50" cy="32" r="30" fill="#1A0F08" />
        <Circle cx="50" cy="28" r="26" fill="#2D1B0E" />
        {/* Face */}
        <Ellipse cx="50" cy="52" rx="22" ry="26" fill="#7A4428" />
        {/* Eyes */}
        <Ellipse cx="42" cy="48" rx="3" ry="2.5" fill="#1A0F08" />
        <Ellipse cx="58" cy="48" rx="3" ry="2.5" fill="#1A0F08" />
        <Circle cx="43" cy="47.5" r="0.8" fill="white" />
        <Circle cx="59" cy="47.5" r="0.8" fill="white" />
        {/* Warm smile */}
        <Path d="M 42 58 Q 50 65 58 58" stroke="#5C2A12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Gold earrings */}
        <Circle cx="28" cy="55" r="3" fill="#D4A04A" />
        <Circle cx="72" cy="55" r="3" fill="#D4A04A" />
        {/* Nose */}
        <Path d="M 48 52 Q 50 56 52 52" stroke="#5C2A12" strokeWidth="1" fill="none" />
      </G>
    ),
    marcia: () => (
      <G>
        {/* Headwrap */}
        <Path d="M 25 40 Q 25 15 50 15 Q 75 15 75 40 L 72 42 Q 50 38 28 42 Z" fill="#1A7A4A" />
        <Path d="M 28 38 Q 50 34 72 38 L 72 42 Q 50 38 28 42 Z" fill="#12603A" />
        {/* Locs peeking */}
        <Path d="M 26 42 Q 22 55 24 65" stroke="#1A0F08" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M 74 42 Q 78 55 76 65" stroke="#1A0F08" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Face */}
        <Ellipse cx="50" cy="52" rx="22" ry="24" fill="#8B5A30" />
        {/* Eyes — knowing */}
        <Ellipse cx="42" cy="48" rx="3" ry="2" fill="#1A0F08" />
        <Ellipse cx="58" cy="48" rx="3" ry="2" fill="#1A0F08" />
        <Circle cx="43" cy="47.5" r="0.8" fill="white" />
        <Circle cx="59" cy="47.5" r="0.8" fill="white" />
        {/* Gentle smile */}
        <Path d="M 44 58 Q 50 62 56 58" stroke="#5C2A12" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <Path d="M 48 52 Q 50 55 52 52" stroke="#6B3A18" strokeWidth="1" fill="none" />
      </G>
    ),
    denise: () => (
      <G>
        {/* Twist-out crown */}
        <Circle cx="35" cy="25" r="8" fill="#2D1B0E" />
        <Circle cx="50" cy="20" r="9" fill="#2D1B0E" />
        <Circle cx="65" cy="25" r="8" fill="#2D1B0E" />
        <Circle cx="30" cy="35" r="7" fill="#1A0F08" />
        <Circle cx="70" cy="35" r="7" fill="#1A0F08" />
        {/* Face */}
        <Ellipse cx="50" cy="52" rx="22" ry="25" fill="#5C2A12" />
        {/* Eyes — wise, kind */}
        <Ellipse cx="42" cy="48" rx="3.5" ry="2.5" fill="#1A0F08" />
        <Ellipse cx="58" cy="48" rx="3.5" ry="2.5" fill="#1A0F08" />
        <Circle cx="43" cy="47.5" r="1" fill="white" />
        <Circle cx="59" cy="47.5" r="1" fill="white" />
        {/* Confident smile */}
        <Path d="M 40 58 Q 50 66 60 58" stroke="#3D1A08" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Small earrings */}
        <Circle cx="28" cy="52" r="2.5" fill="#3D5A99" />
        <Circle cx="72" cy="52" r="2.5" fill="#3D5A99" />
        {/* Nose */}
        <Path d="M 47 52 Q 50 56 53 52" stroke="#3D1A08" strokeWidth="1" fill="none" />
      </G>
    ),
    fatou: () => (
      <G>
        {/* Long braids */}
        <Path d="M 35 18 L 32 70" stroke="#1A0F08" strokeWidth="4" strokeLinecap="round" />
        <Path d="M 42 16 L 38 72" stroke="#1A0F08" strokeWidth="4" strokeLinecap="round" />
        <Path d="M 58 16 L 62 72" stroke="#1A0F08" strokeWidth="4" strokeLinecap="round" />
        <Path d="M 65 18 L 68 70" stroke="#1A0F08" strokeWidth="4" strokeLinecap="round" />
        {/* Beaded tips */}
        <Circle cx="32" cy="72" r="2" fill="#7B3F6B" />
        <Circle cx="38" cy="74" r="2" fill="#D4A04A" />
        <Circle cx="62" cy="74" r="2" fill="#7B3F6B" />
        <Circle cx="68" cy="72" r="2" fill="#D4A04A" />
        {/* Face */}
        <Ellipse cx="50" cy="48" rx="20" ry="24" fill="#6B3A18" />
        {/* Elegant eyes */}
        <Ellipse cx="43" cy="44" rx="3" ry="2" fill="#1A0F08" />
        <Ellipse cx="57" cy="44" rx="3" ry="2" fill="#1A0F08" />
        {/* Arched brows */}
        <Path d="M 38 40 Q 43 37 48 40" stroke="#3D1A08" strokeWidth="1.2" fill="none" />
        <Path d="M 52 40 Q 57 37 62 40" stroke="#3D1A08" strokeWidth="1.2" fill="none" />
        {/* Refined smile */}
        <Path d="M 44 54 Q 50 58 56 54" stroke="#4A2010" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </G>
    ),
    carmen: () => (
      <G>
        {/* Big fluffy curls */}
        <Circle cx="30" cy="28" r="10" fill="#2D1B0E" />
        <Circle cx="50" cy="18" r="12" fill="#2D1B0E" />
        <Circle cx="70" cy="28" r="10" fill="#2D1B0E" />
        <Circle cx="25" cy="42" r="9" fill="#1A0F08" />
        <Circle cx="75" cy="42" r="9" fill="#1A0F08" />
        <Circle cx="35" cy="22" r="8" fill="#1A0F08" />
        <Circle cx="65" cy="22" r="8" fill="#1A0F08" />
        {/* Face */}
        <Ellipse cx="50" cy="48" rx="21" ry="24" fill="#D4885A" />
        {/* Bright eyes */}
        <Ellipse cx="42" cy="44" rx="3.5" ry="3" fill="#1A0F08" />
        <Ellipse cx="58" cy="44" rx="3.5" ry="3" fill="#1A0F08" />
        <Circle cx="43.5" cy="43.5" r="1.2" fill="white" />
        <Circle cx="59.5" cy="43.5" r="1.2" fill="white" />
        {/* Wide joyful smile */}
        <Path d="M 38 54 Q 50 66 62 54" stroke="#8B4A28" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Path d="M 42 56 Q 50 60 58 56" fill="white" />
        {/* Pink hoop earrings */}
        <Circle cx="28" cy="50" r="4" fill="none" stroke="#C2456E" strokeWidth="2" />
        <Circle cx="72" cy="50" r="4" fill="none" stroke="#C2456E" strokeWidth="2" />
      </G>
    ),
    amara: () => (
      <G>
        {/* Crown braids — halo */}
        <Path d="M 25 38 Q 25 12 50 12 Q 75 12 75 38" stroke="#1A0F08" strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* Gold crown accents */}
        <Circle cx="38" cy="14" r="2" fill="#D4A04A" />
        <Circle cx="50" cy="11" r="2" fill="#D4A04A" />
        <Circle cx="62" cy="14" r="2" fill="#D4A04A" />
        {/* Face */}
        <Ellipse cx="50" cy="48" rx="22" ry="26" fill="#3C1A0C" />
        {/* Strong eyes */}
        <Ellipse cx="42" cy="44" rx="3" ry="2.5" fill="#0D0704" />
        <Ellipse cx="58" cy="44" rx="3" ry="2.5" fill="#0D0704" />
        <Circle cx="43" cy="43.5" r="0.8" fill="white" />
        <Circle cx="59" cy="43.5" r="0.8" fill="white" />
        {/* Strong brows */}
        <Path d="M 37 40 Q 42 37 47 40" stroke="#0D0704" strokeWidth="1.5" fill="none" />
        <Path d="M 53 40 Q 58 37 63 40" stroke="#0D0704" strokeWidth="1.5" fill="none" />
        {/* Calm regal smile */}
        <Path d="M 44 55 Q 50 59 56 55" stroke="#1A0F08" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </G>
    ),
    salma: () => (
      <G>
        {/* Elegant flowing hair */}
        <Path d="M 30 25 Q 28 50 30 70" stroke="#2D1B0E" strokeWidth="6" fill="none" />
        <Path d="M 35 22 Q 32 48 34 68" stroke="#1A0F08" strokeWidth="5" fill="none" />
        <Path d="M 65 22 Q 68 48 66 68" stroke="#1A0F08" strokeWidth="5" fill="none" />
        <Path d="M 70 25 Q 72 50 70 70" stroke="#2D1B0E" strokeWidth="6" fill="none" />
        {/* Top hair volume */}
        <Ellipse cx="50" cy="22" rx="22" ry="12" fill="#1A0F08" />
        {/* Face */}
        <Ellipse cx="50" cy="48" rx="20" ry="24" fill="#B87848" />
        {/* Almond eyes with kohl */}
        <Path d="M 38 44 Q 43 41 48 44 Q 43 46 38 44" fill="#1A0F08" />
        <Path d="M 52 44 Q 57 41 62 44 Q 57 46 52 44" fill="#1A0F08" />
        <Circle cx="43" cy="43.5" r="0.6" fill="white" />
        <Circle cx="57" cy="43.5" r="0.6" fill="white" />
        {/* Gentle smile */}
        <Path d="M 44 55 Q 50 59 56 55" stroke="#7A4420" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Crescent earrings */}
        <Path d="M 28 50 Q 24 48 28 44" stroke="#2A7B7B" strokeWidth="2" fill="none" />
        <Path d="M 72 50 Q 76 48 72 44" stroke="#2A7B7B" strokeWidth="2" fill="none" />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#F5EBD5" />
      <G transform={`scale(${1})`}>
        {portraits[auntyId]?.()}
      </G>
    </Svg>
  );
}
