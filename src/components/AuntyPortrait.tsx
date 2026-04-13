/**
 * AuntyPortrait — SVG illustrated portraits for each aunty.
 *
 * Each portrait is a distinct, culturally specific illustration
 * with unique face shape, hair, skin tone, clothing, and expression.
 * Portraits include neck, clothing neckline, proper lips, nose detail,
 * and cheekbone highlights for a realistic feel.
 *
 * Skin tones: #6B3A1C (Denise, deepest) to #9A6844 (Salma, warmest golden)
 */

import React from 'react';
import Svg, { Circle, Path, Ellipse, G } from 'react-native-svg';
import type { AuntyId } from '../constants/aunties';

interface Props {
  auntyId: AuntyId;
  size?: number;
}

export function AuntyPortrait({ auntyId, size = 80 }: Props) {
  const portraits: Record<AuntyId, () => React.ReactNode> = {

    // ─── NGOZI — Nigerian, Bold, Round-faced ─────────────────────
    ngozi: () => (
      <G>
        {/* Afro — large textured puff */}
        <Circle cx="50" cy="26" r="28" fill="#1A0F08" />
        <Circle cx="34" cy="30" r="14" fill="#2D1B0E" />
        <Circle cx="66" cy="30" r="14" fill="#2D1B0E" />
        <Circle cx="50" cy="20" r="16" fill="#2D1B0E" />
        <Circle cx="28" cy="38" r="10" fill="#1A0F08" />
        <Circle cx="72" cy="38" r="10" fill="#1A0F08" />
        <Circle cx="42" cy="18" r="10" fill="#1A0F08" />
        <Circle cx="58" cy="18" r="10" fill="#1A0F08" />
        {/* Clothing — warm gold top */}
        <Path d="M 20 88 Q 30 82 42 80 L 42 100 L 20 100 Z" fill="#C49340" />
        <Path d="M 80 88 Q 70 82 58 80 L 58 100 L 80 100 Z" fill="#C49340" />
        <Path d="M 42 80 L 42 100 L 58 100 L 58 80 Q 50 84 42 80" fill="#B8862E" />
        {/* Neck */}
        <Path d="M 42 72 L 42 80 Q 50 84 58 80 L 58 72" fill="#8B5A34" />
        {/* Face — round, full cheeks */}
        <Path d="M 28 48 Q 28 30 50 30 Q 72 30 72 48 Q 72 72 50 76 Q 28 72 28 48" fill="#8B5A34" />
        {/* Cheek highlights */}
        <Ellipse cx="36" cy="56" rx="6" ry="4" fill="#A06A42" opacity={0.4} />
        <Ellipse cx="64" cy="56" rx="6" ry="4" fill="#A06A42" opacity={0.4} />
        {/* Eyes */}
        <Ellipse cx="40" cy="48" rx="4" ry="3" fill="white" />
        <Ellipse cx="60" cy="48" rx="4" ry="3" fill="white" />
        <Ellipse cx="41" cy="48" rx="2.5" ry="2.5" fill="#1A0F08" />
        <Ellipse cx="61" cy="48" rx="2.5" ry="2.5" fill="#1A0F08" />
        <Circle cx="42" cy="47.5" r="0.8" fill="white" />
        <Circle cx="62" cy="47.5" r="0.8" fill="white" />
        {/* Eyebrows — bold arches */}
        <Path d="M 34 43 Q 40 40 46 43" stroke="#3D2010" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <Path d="M 54 43 Q 60 40 66 43" stroke="#3D2010" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Nose — broad, strong */}
        <Path d="M 48 48 L 47 54" stroke="#6A4020" strokeWidth="0.8" fill="none" />
        <Path d="M 52 48 L 53 54" stroke="#6A4020" strokeWidth="0.8" fill="none" />
        <Path d="M 44 56 Q 47 58 50 57 Q 53 58 56 56" stroke="#6A4020" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Lips — big warm smile */}
        <Path d="M 38 62 Q 44 60 50 61 Q 56 60 62 62" stroke="#6A4020" strokeWidth="1" fill="none" />
        <Path d="M 38 62 Q 50 72 62 62" fill="#7A4428" />
        <Path d="M 40 64 Q 50 69 60 64" fill="white" />
        {/* Gold hoop earrings */}
        <Circle cx="26" cy="54" r="5" fill="none" stroke="#D4A04A" strokeWidth="2.5" />
        <Circle cx="74" cy="54" r="5" fill="none" stroke="#D4A04A" strokeWidth="2.5" />
        {/* Gold necklace */}
        <Path d="M 42 76 Q 50 80 58 76" stroke="#D4A04A" strokeWidth="1.5" fill="none" />
      </G>
    ),

    // ─── MARCIA — Jamaican, Patient, Elongated face ──────────────
    marcia: () => (
      <G>
        {/* Headwrap — layered green with knot */}
        <Path d="M 24 40 Q 22 18 50 14 Q 78 18 76 40 L 74 44 Q 50 38 26 44 Z" fill="#1A7A4A" />
        <Path d="M 26 36 Q 50 30 74 36 L 74 42 Q 50 36 26 42 Z" fill="#12603A" />
        {/* Wrap knot on top */}
        <Ellipse cx="58" cy="16" rx="6" ry="4" fill="#1A7A4A" />
        <Ellipse cx="56" cy="14" rx="5" ry="3.5" fill="#12603A" />
        {/* Locs framing face */}
        <Path d="M 24 44 Q 20 56 18 70 Q 17 76 19 80" stroke="#1A0F08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <Path d="M 26 44 Q 23 58 22 72" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Path d="M 76 44 Q 80 56 82 70 Q 83 76 81 80" stroke="#1A0F08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <Path d="M 74 44 Q 77 58 78 72" stroke="#2D1B0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Clothing — emerald green top matching wrap */}
        <Path d="M 20 90 Q 30 84 44 82 L 44 100 L 20 100 Z" fill="#12603A" />
        <Path d="M 80 90 Q 70 84 56 82 L 56 100 L 80 100 Z" fill="#12603A" />
        <Path d="M 44 82 L 44 100 L 56 100 L 56 82 Q 50 86 44 82" fill="#0E4E2E" />
        {/* Neck */}
        <Path d="M 44 74 L 44 82 Q 50 86 56 82 L 56 74" fill="#7A4A28" />
        {/* Face — elongated oval */}
        <Path d="M 30 46 Q 30 28 50 28 Q 70 28 70 46 Q 70 72 50 78 Q 30 72 30 46" fill="#7A4A28" />
        {/* Cheek highlights */}
        <Ellipse cx="37" cy="56" rx="5" ry="3.5" fill="#8C5A34" opacity={0.35} />
        <Ellipse cx="63" cy="56" rx="5" ry="3.5" fill="#8C5A34" opacity={0.35} />
        {/* Eyes — knowing, warm */}
        <Ellipse cx="41" cy="48" rx="3.5" ry="2.5" fill="white" />
        <Ellipse cx="59" cy="48" rx="3.5" ry="2.5" fill="white" />
        <Ellipse cx="42" cy="48.5" rx="2.2" ry="2.2" fill="#1A0F08" />
        <Ellipse cx="60" cy="48.5" rx="2.2" ry="2.2" fill="#1A0F08" />
        <Circle cx="42.5" cy="48" r="0.7" fill="white" />
        <Circle cx="60.5" cy="48" r="0.7" fill="white" />
        {/* Upper eyelid line */}
        <Path d="M 37 46 Q 41 44 45 46" stroke="#5A3418" strokeWidth="0.8" fill="none" />
        <Path d="M 55 46 Q 59 44 63 46" stroke="#5A3418" strokeWidth="0.8" fill="none" />
        {/* Eyebrows */}
        <Path d="M 36 43 Q 41 40.5 46 43" stroke="#2D1B0E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Path d="M 54 43 Q 59 40.5 64 43" stroke="#2D1B0E" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <Path d="M 49 46 L 48 54" stroke="#5A3418" strokeWidth="0.8" fill="none" />
        <Path d="M 46 56 Q 50 58 54 56" stroke="#5A3418" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Lips — warm knowing smile */}
        <Path d="M 40 62 Q 45 60 50 61 Q 55 60 60 62" stroke="#5A3418" strokeWidth="1" fill="none" />
        <Path d="M 40 62 Q 50 69 60 62" fill="#664028" />
        <Path d="M 42 63.5 Q 50 67 58 63.5" fill="white" opacity={0.15} />
      </G>
    ),

    // ─── DENISE — African American, Wise, Wide maternal face ─────
    denise: () => (
      <G>
        {/* Twist-out natural crown — full, defined */}
        <Circle cx="32" cy="24" r="10" fill="#2D1B0E" />
        <Circle cx="50" cy="18" r="12" fill="#2D1B0E" />
        <Circle cx="68" cy="24" r="10" fill="#2D1B0E" />
        <Circle cx="26" cy="34" r="9" fill="#1A0F08" />
        <Circle cx="74" cy="34" r="9" fill="#1A0F08" />
        <Circle cx="40" cy="16" r="9" fill="#1A0F08" />
        <Circle cx="60" cy="16" r="9" fill="#1A0F08" />
        <Circle cx="50" cy="12" r="8" fill="#2D1B0E" />
        {/* Clothing — deep indigo top */}
        <Path d="M 18 88 Q 28 82 43 80 L 43 100 L 18 100 Z" fill="#3D5A99" />
        <Path d="M 82 88 Q 72 82 57 80 L 57 100 L 82 100 Z" fill="#3D5A99" />
        <Path d="M 43 80 L 43 100 L 57 100 L 57 80 Q 50 85 43 80" fill="#2A4070" />
        {/* Neck */}
        <Path d="M 43 72 L 43 80 Q 50 85 57 80 L 57 72" fill="#6B3A1C" />
        {/* Face — wider, softer, maternal */}
        <Path d="M 26 46 Q 26 28 50 28 Q 74 28 74 46 Q 74 70 50 76 Q 26 70 26 46" fill="#6B3A1C" />
        {/* Cheek highlights */}
        <Ellipse cx="35" cy="56" rx="6" ry="4" fill="#7C4A28" opacity={0.35} />
        <Ellipse cx="65" cy="56" rx="6" ry="4" fill="#7C4A28" opacity={0.35} />
        {/* Eyes — warm, wise, larger */}
        <Ellipse cx="40" cy="47" rx="4.5" ry="3" fill="white" />
        <Ellipse cx="60" cy="47" rx="4.5" ry="3" fill="white" />
        <Ellipse cx="41" cy="47.5" rx="2.8" ry="2.5" fill="#1A0F08" />
        <Ellipse cx="61" cy="47.5" rx="2.8" ry="2.5" fill="#1A0F08" />
        <Circle cx="42" cy="47" r="1" fill="white" />
        <Circle cx="62" cy="47" r="1" fill="white" />
        {/* Eyebrows — expressive */}
        <Path d="M 33 42 Q 40 38.5 47 42" stroke="#2D1B0E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <Path d="M 53 42 Q 60 38.5 67 42" stroke="#2D1B0E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Nose — broad, warm */}
        <Path d="M 48 46 L 47 54" stroke="#4C2810" strokeWidth="0.8" fill="none" />
        <Path d="M 52 46 L 53 54" stroke="#4C2810" strokeWidth="0.8" fill="none" />
        <Path d="M 44 56 Q 47 58 50 57.5 Q 53 58 56 56" stroke="#4C2810" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Lips — big warm beaming smile */}
        <Path d="M 36 62 Q 43 59 50 60 Q 57 59 64 62" stroke="#4C2810" strokeWidth="1" fill="none" />
        <Path d="M 36 62 Q 50 74 64 62" fill="#5A3018" />
        <Path d="M 39 64 Q 50 71 61 64" fill="white" />
        {/* Indigo drop earrings */}
        <Circle cx="24" cy="52" r="2" fill="#3D5A99" />
        <Ellipse cx="24" cy="57" rx="2.5" ry="3.5" fill="#3D5A99" />
        <Circle cx="76" cy="52" r="2" fill="#3D5A99" />
        <Ellipse cx="76" cy="57" rx="2.5" ry="3.5" fill="#3D5A99" />
      </G>
    ),

    // ─── FATOU — Senegalese, Precise, Slim elegant face ──────────
    fatou: () => (
      <G>
        {/* Long braids — defined */}
        <Path d="M 34 20 Q 33 45 30 72" stroke="#1A0F08" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <Path d="M 40 18 Q 38 44 36 74" stroke="#2D1B0E" strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M 60 18 Q 62 44 64 74" stroke="#2D1B0E" strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M 66 20 Q 67 45 70 72" stroke="#1A0F08" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        {/* Hair top — center part */}
        <Path d="M 34 20 Q 50 12 66 20" stroke="#1A0F08" strokeWidth="6" fill="none" />
        <Path d="M 50 12 L 50 20" stroke="#805030" strokeWidth="0.8" fill="none" />
        {/* Beaded tips */}
        <Circle cx="30" cy="74" r="2.5" fill="#7B3F6B" />
        <Circle cx="36" cy="76" r="2.5" fill="#D4A04A" />
        <Circle cx="64" cy="76" r="2.5" fill="#D4A04A" />
        <Circle cx="70" cy="74" r="2.5" fill="#7B3F6B" />
        {/* Clothing — plum/purple wrap top */}
        <Path d="M 22 90 Q 32 84 44 82 L 44 100 L 22 100 Z" fill="#7B3F6B" />
        <Path d="M 78 90 Q 68 84 56 82 L 56 100 L 78 100 Z" fill="#7B3F6B" />
        <Path d="M 44 82 L 44 100 L 56 100 L 56 82 Q 50 86 44 82" fill="#5C2A4A" />
        {/* Neck */}
        <Path d="M 44 72 L 44 82 Q 50 86 56 82 L 56 72" fill="#805030" />
        {/* Face — slim, elongated, high cheekbones */}
        <Path d="M 32 44 Q 32 24 50 22 Q 68 24 68 44 Q 68 70 50 76 Q 32 70 32 44" fill="#805030" />
        {/* High cheekbone highlights */}
        <Ellipse cx="38" cy="52" rx="4" ry="3" fill="#926040" opacity={0.4} />
        <Ellipse cx="62" cy="52" rx="4" ry="3" fill="#926040" opacity={0.4} />
        {/* Eyes — elegant almond */}
        <Path d="M 36 46 Q 42 43 47 46 Q 42 48.5 36 46" fill="white" />
        <Path d="M 53 46 Q 58 43 64 46 Q 58 48.5 53 46" fill="white" />
        <Ellipse cx="42" cy="46" rx="2" ry="2" fill="#1A0F08" />
        <Ellipse cx="58" cy="46" rx="2" ry="2" fill="#1A0F08" />
        <Circle cx="42.5" cy="45.5" r="0.6" fill="white" />
        <Circle cx="58.5" cy="45.5" r="0.6" fill="white" />
        {/* Eyebrows — high elegant arches */}
        <Path d="M 35 41 Q 42 37 48 41" stroke="#3D2010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Path d="M 52 41 Q 58 37 65 41" stroke="#3D2010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Nose — refined */}
        <Path d="M 49 42 L 48 52" stroke="#603818" strokeWidth="0.7" fill="none" />
        <Path d="M 51 42 L 52 52" stroke="#603818" strokeWidth="0.7" fill="none" />
        <Path d="M 46 54 Q 50 56 54 54" stroke="#603818" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* Lips — warm composed smile */}
        <Path d="M 42 60 Q 46 58.5 50 59 Q 54 58.5 58 60" stroke="#603818" strokeWidth="0.8" fill="none" />
        <Path d="M 42 60 Q 50 66 58 60" fill="#6E4426" />
        <Path d="M 44 61.5 Q 50 64 56 61.5" fill="white" opacity={0.15} />
      </G>
    ),

    // ─── CARMEN — Afro-Latina, Joyful, Heart-shaped face ─────────
    carmen: () => (
      <G>
        {/* Voluminous curl halo */}
        <Circle cx="28" cy="28" r="12" fill="#2D1B0E" />
        <Circle cx="50" cy="16" r="14" fill="#2D1B0E" />
        <Circle cx="72" cy="28" r="12" fill="#2D1B0E" />
        <Circle cx="22" cy="42" r="10" fill="#1A0F08" />
        <Circle cx="78" cy="42" r="10" fill="#1A0F08" />
        <Circle cx="36" cy="18" r="10" fill="#1A0F08" />
        <Circle cx="64" cy="18" r="10" fill="#1A0F08" />
        <Circle cx="30" cy="36" r="8" fill="#2D1B0E" />
        <Circle cx="70" cy="36" r="8" fill="#2D1B0E" />
        <Circle cx="44" cy="12" r="7" fill="#1A0F08" />
        <Circle cx="56" cy="12" r="7" fill="#1A0F08" />
        {/* Clothing — coral/rose off-shoulder top */}
        <Path d="M 20 86 Q 30 80 43 78 L 43 100 L 20 100 Z" fill="#C2456E" />
        <Path d="M 80 86 Q 70 80 57 78 L 57 100 L 80 100 Z" fill="#C2456E" />
        <Path d="M 43 78 L 43 100 L 57 100 L 57 78 Q 50 82 43 78" fill="#A83858" />
        {/* Neck */}
        <Path d="M 43 70 L 43 78 Q 50 82 57 78 L 57 70" fill="#946040" />
        {/* Face — heart-shaped */}
        <Path d="M 28 44 Q 27 28 50 28 Q 73 28 72 44 Q 72 62 50 74 Q 28 62 28 44" fill="#946040" />
        {/* Cheek highlights */}
        <Ellipse cx="36" cy="52" rx="5" ry="4" fill="#A87050" opacity={0.4} />
        <Ellipse cx="64" cy="52" rx="5" ry="4" fill="#A87050" opacity={0.4} />
        {/* Eyes — big, bright */}
        <Ellipse cx="40" cy="46" rx="4.5" ry="3.5" fill="white" />
        <Ellipse cx="60" cy="46" rx="4.5" ry="3.5" fill="white" />
        <Ellipse cx="41" cy="46.5" rx="2.8" ry="2.8" fill="#1A0F08" />
        <Ellipse cx="61" cy="46.5" rx="2.8" ry="2.8" fill="#1A0F08" />
        <Circle cx="42.5" cy="45.5" r="1.2" fill="white" />
        <Circle cx="62.5" cy="45.5" r="1.2" fill="white" />
        {/* Eyebrows — playful */}
        <Path d="M 34 41 Q 40 38 46 41" stroke="#3D2010" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <Path d="M 54 41 Q 60 38 66 41" stroke="#3D2010" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <Path d="M 49 44 L 48 52" stroke="#70482C" strokeWidth="0.7" fill="none" />
        <Path d="M 46 54 Q 50 56 54 54" stroke="#70482C" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {/* Lips — biggest smile, teeth showing, joyful */}
        <Path d="M 36 58 Q 43 55 50 56 Q 57 55 64 58" stroke="#70482C" strokeWidth="1" fill="none" />
        <Path d="M 36 58 Q 50 72 64 58" fill="#7E4E34" />
        <Path d="M 39 60 Q 50 68 61 60" fill="white" />
        {/* Pink hoop earrings */}
        <Circle cx="26" cy="48" r="5" fill="none" stroke="#C2456E" strokeWidth="2.5" />
        <Circle cx="74" cy="48" r="5" fill="none" stroke="#C2456E" strokeWidth="2.5" />
      </G>
    ),

    // ─── SELAM — Ethiopian-Eritrean, Steady, Elongated regal face ─
    amara: () => (
      <G>
        {/* Crown braids — thick halo */}
        <Path d="M 24 40 Q 22 14 50 10 Q 78 14 76 40" stroke="#1A0F08" strokeWidth="9" fill="none" strokeLinecap="round" />
        <Path d="M 28 36 Q 28 18 50 14 Q 72 18 72 36" stroke="#2D1B0E" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Gold bead accents */}
        <Circle cx="30" cy="20" r="2" fill="#D4A04A" />
        <Circle cx="42" cy="13" r="2" fill="#D4A04A" />
        <Circle cx="50" cy="10.5" r="2.5" fill="#D4A04A" />
        <Circle cx="58" cy="13" r="2" fill="#D4A04A" />
        <Circle cx="70" cy="20" r="2" fill="#D4A04A" />
        {/* Clothing — warm white/cream traditional neckline */}
        <Path d="M 20 90 Q 30 84 44 82 L 44 100 L 20 100 Z" fill="#F0E6D2" />
        <Path d="M 80 90 Q 70 84 56 82 L 56 100 L 80 100 Z" fill="#F0E6D2" />
        <Path d="M 44 82 L 44 100 L 56 100 L 56 82 Q 50 86 44 82" fill="#E0D4BE" />
        {/* Embroidered neckline trim */}
        <Path d="M 36 86 Q 50 90 64 86" stroke="#D4A04A" strokeWidth="1.5" fill="none" />
        <Path d="M 34 88 Q 50 92 66 88" stroke="#B85C2A" strokeWidth="1" fill="none" />
        {/* Neck */}
        <Path d="M 44 74 L 44 82 Q 50 86 56 82 L 56 74" fill="#6E3E1E" />
        {/* Gold necklace */}
        <Path d="M 44 78 Q 50 82 56 78" stroke="#D4A04A" strokeWidth="1.5" fill="none" />
        <Circle cx="50" cy="82" r="2" fill="#D4A04A" />
        {/* Face — elongated, defined jaw */}
        <Path d="M 30 44 Q 30 24 50 22 Q 70 24 70 44 Q 70 68 50 78 Q 30 68 30 44" fill="#6E3E1E" />
        {/* Cheek highlights */}
        <Ellipse cx="37" cy="54" rx="5" ry="3.5" fill="#804E2C" opacity={0.35} />
        <Ellipse cx="63" cy="54" rx="5" ry="3.5" fill="#804E2C" opacity={0.35} />
        {/* Eyes — strong, defined */}
        <Ellipse cx="41" cy="46" rx="4" ry="2.8" fill="white" />
        <Ellipse cx="59" cy="46" rx="4" ry="2.8" fill="white" />
        <Ellipse cx="42" cy="46.5" rx="2.2" ry="2.2" fill="#1A0F08" />
        <Ellipse cx="60" cy="46.5" rx="2.2" ry="2.2" fill="#1A0F08" />
        <Circle cx="42.5" cy="46" r="0.7" fill="white" />
        <Circle cx="60.5" cy="46" r="0.7" fill="white" />
        {/* Eyebrows — strong */}
        <Path d="M 35 41 Q 41 37 47 41" stroke="#2D1B0E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <Path d="M 53 41 Q 59 37 65 41" stroke="#2D1B0E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Nose — defined bridge */}
        <Path d="M 49 42 L 48 52" stroke="#502C12" strokeWidth="0.8" fill="none" />
        <Path d="M 51 42 L 52 52" stroke="#502C12" strokeWidth="0.8" fill="none" />
        <Path d="M 46 54 Q 50 56.5 54 54" stroke="#502C12" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {/* Lips — warm steady smile */}
        <Path d="M 42 60 Q 46 58 50 59 Q 54 58 58 60" stroke="#502C12" strokeWidth="0.8" fill="none" />
        <Path d="M 42 60 Q 50 67 58 60" fill="#5C3418" />
        <Path d="M 44 61.5 Q 50 65 56 61.5" fill="white" opacity={0.15} />
      </G>
    ),

    // ─── SALMA — Moroccan, Calm, Classic oval face ───────────────
    salma: () => (
      <G>
        {/* Flowing wavy hair */}
        <Path d="M 28 26 Q 24 46 26 68 Q 25 76 28 80" stroke="#2D1B0E" strokeWidth="7" fill="none" />
        <Path d="M 33 22 Q 28 44 30 66 Q 29 74 32 78" stroke="#1A0F08" strokeWidth="5.5" fill="none" />
        <Path d="M 38 20 Q 34 42 36 62" stroke="#2D1B0E" strokeWidth="4" fill="none" />
        <Path d="M 62 20 Q 66 42 64 62" stroke="#2D1B0E" strokeWidth="4" fill="none" />
        <Path d="M 67 22 Q 72 44 70 66 Q 71 74 68 78" stroke="#1A0F08" strokeWidth="5.5" fill="none" />
        <Path d="M 72 26 Q 76 46 74 68 Q 75 76 72 80" stroke="#2D1B0E" strokeWidth="7" fill="none" />
        {/* Top hair volume */}
        <Ellipse cx="50" cy="20" rx="24" ry="13" fill="#1A0F08" />
        <Ellipse cx="50" cy="18" rx="18" ry="8" fill="#2D1B0E" />
        {/* Clothing — teal drape top */}
        <Path d="M 22 88 Q 32 82 44 80 L 44 100 L 22 100 Z" fill="#2A7B7B" />
        <Path d="M 78 88 Q 68 82 56 80 L 56 100 L 78 100 Z" fill="#2A7B7B" />
        <Path d="M 44 80 L 44 100 L 56 100 L 56 80 Q 50 84 44 80" fill="#1E5C5C" />
        {/* Neck */}
        <Path d="M 44 72 L 44 80 Q 50 84 56 80 L 56 72" fill="#9A6844" />
        {/* Face — classic oval */}
        <Path d="M 30 46 Q 30 26 50 24 Q 70 26 70 46 Q 70 70 50 76 Q 30 70 30 46" fill="#9A6844" />
        {/* Cheek highlights */}
        <Ellipse cx="37" cy="54" rx="5" ry="3.5" fill="#AE7854" opacity={0.35} />
        <Ellipse cx="63" cy="54" rx="5" ry="3.5" fill="#AE7854" opacity={0.35} />
        {/* Eyes — kohl-lined almond */}
        <Path d="M 35 46 Q 42 42 48 46 Q 42 49 35 46" fill="white" />
        <Path d="M 52 46 Q 58 42 65 46 Q 58 49 52 46" fill="white" />
        <Ellipse cx="42" cy="46" rx="2" ry="2" fill="#1A0F08" />
        <Ellipse cx="58" cy="46" rx="2" ry="2" fill="#1A0F08" />
        <Circle cx="42.5" cy="45.5" r="0.6" fill="white" />
        <Circle cx="58.5" cy="45.5" r="0.6" fill="white" />
        {/* Kohl liner wings */}
        <Path d="M 34 46 Q 33 45 32 44" stroke="#1A0F08" strokeWidth="1" fill="none" strokeLinecap="round" />
        <Path d="M 66 46 Q 67 45 68 44" stroke="#1A0F08" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Eyebrows */}
        <Path d="M 35 41 Q 42 38 48 41" stroke="#3D2010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <Path d="M 52 41 Q 58 38 65 41" stroke="#3D2010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Nose — refined */}
        <Path d="M 49 42 L 48 52" stroke="#74482A" strokeWidth="0.7" fill="none" />
        <Path d="M 51 42 L 52 52" stroke="#74482A" strokeWidth="0.7" fill="none" />
        <Path d="M 46 54 Q 50 56 54 54" stroke="#74482A" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* Lips — serene warm smile */}
        <Path d="M 42 60 Q 46 58 50 59 Q 54 58 58 60" stroke="#74482A" strokeWidth="0.8" fill="none" />
        <Path d="M 42 60 Q 50 66 58 60" fill="#846044" />
        <Path d="M 44 61.5 Q 50 64 56 61.5" fill="white" opacity={0.15} />
        {/* Teal crescent earrings */}
        <Path d="M 28 50 Q 22 46 28 42" stroke="#2A7B7B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <Path d="M 72 50 Q 78 46 72 42" stroke="#2A7B7B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#F5EBD5" />
      <G>
        {portraits[auntyId]?.()}
      </G>
    </Svg>
  );
}
