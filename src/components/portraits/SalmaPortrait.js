import React from 'react';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs, ClipPath, G
} from 'react-native-svg';

// Aunty Salma — North African (Moroccan/Egyptian)
// Olive-warm brown skin. Dark kohl-lined eyes. Thick wavy/coily hair.
// Gold statement jewelry. Expressive knowing smile.
export default function SalmaPortrait({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="salma-circle">
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#salma-circle)">
        {/* Background – warm teal-blue */}
        <Rect x="0" y="0" width="100" height="100" fill="#1A6080" />
        <Rect x="0" y="68" width="100" height="32" fill="#124560" />

        {/* Clothing – warm layered top */}
        <Ellipse cx="50" cy="94" rx="40" ry="18" fill="#1A7090" />
        <Ellipse cx="50" cy="90" rx="30" ry="13" fill="#1A6080" />
        {/* Gold necklace – large statement */}
        <Path d="M36 78 Q50 73 64 78" stroke="#D4A017" strokeWidth="3" fill="none" />
        <Circle cx="50" cy="76" r="4" fill="#D4A017" />
        <Circle cx="50" cy="76" r="2.5" fill="#F0C830" />
        <Circle cx="43" cy="78" r="2.5" fill="#D4A017" />
        <Circle cx="57" cy="78" r="2.5" fill="#D4A017" />

        {/* Neck */}
        <Rect x="40" y="72" width="20" height="16" rx="4" fill="#9A6030" />

        {/* Head – olive-warm brown skin */}
        <Ellipse cx="50" cy="52" rx="22" ry="26" fill="#B0703A" />

        {/* Ear left */}
        <Ellipse cx="28" cy="56" rx="4" ry="5.5" fill="#9A6030" />
        <Ellipse cx="28.5" cy="56" rx="2" ry="3.5" fill="#B0703A" />
        {/* Ear right */}
        <Ellipse cx="72" cy="56" rx="4" ry="5.5" fill="#9A6030" />
        <Ellipse cx="71.5" cy="56" rx="2" ry="3.5" fill="#B0703A" />

        {/* Gold large hoop earrings */}
        <Circle cx="27" cy="57" r="5.5" fill="none" stroke="#D4A017" strokeWidth="2.8" />
        <Circle cx="73" cy="57" r="5.5" fill="none" stroke="#D4A017" strokeWidth="2.8" />
        {/* Hoop accent shine */}
        <Path d="M23 54 Q24 52 26 53" stroke="#F0C830" strokeWidth="1" fill="none" opacity="0.8" />
        <Path d="M70 54 Q72 52 74 53" stroke="#F0C830" strokeWidth="1" fill="none" opacity="0.8" />

        {/* Wavy/coily hair – thick, worn loose */}
        {/* Hair mass */}
        <Ellipse cx="50" cy="30" rx="28" ry="20" fill="#1A0800" />
        {/* Wavy volume sides */}
        <Path d="M24 36 Q14 44 16 60 Q18 64 20 60 Q18 48 24 42" fill="#150700" />
        <Path d="M76 36 Q86 44 84 60 Q82 64 80 60 Q82 48 76 42" fill="#150700" />
        {/* Wavy texture strands */}
        <Path d="M30 28 Q24 22 28 16 Q34 18 32 24 Q34 26 30 28" fill="#0D0400" />
        <Path d="M38 22 Q34 14 40 11 Q44 14 40 20" fill="#1A0800" />
        <Path d="M50 20 Q48 12 54 9 Q56 13 52 18" fill="#0D0400" />
        <Path d="M62 22 Q66 14 60 11 Q56 14 60 20" fill="#1A0800" />
        <Path d="M70 28 Q76 22 72 16 Q66 18 68 24 Q66 26 70 28" fill="#0D0400" />
        {/* Coily curl wisps at hairline */}
        <Path d="M32 34 Q28 30 32 26 Q34 28 34 32 Q32 32 32 34" fill="#1A0800" />
        <Path d="M68 34 Q72 30 68 26 Q66 28 66 32 Q68 32 68 34" fill="#1A0800" />

        {/* Forehead */}
        <Ellipse cx="50" cy="40" rx="20" ry="10" fill="#B0703A" />

        {/* Cheekbones – full, expressive */}
        <Ellipse cx="33" cy="58" rx="9" ry="5.5" fill="#9A6030" opacity="0.35" />
        <Ellipse cx="67" cy="58" rx="9" ry="5.5" fill="#9A6030" opacity="0.35" />

        {/* Nose – prominent, defined */}
        <Ellipse cx="50" cy="60" rx="5" ry="4" fill="#9A6030" />
        <Circle cx="46.5" cy="61.5" r="1.8" fill="#8A5020" />
        <Circle cx="53.5" cy="61.5" r="1.8" fill="#8A5020" />

        {/* Eyes – dark, kohl-lined, expressive — knowing smile in eyes */}
        {/* Left — kohl line extends at corners */}
        <Ellipse cx="37" cy="52" rx="7" ry="3.5" fill="#0D0400" />
        <Ellipse cx="37" cy="52" rx="5" ry="2.8" fill="#150700" />
        <Circle cx="38.5" cy="51" r="1.3" fill="#FFFFFF" opacity="0.8" />
        {/* Kohl liner – extended cat-eye */}
        <Path d="M30 51 Q37 48 44 51" stroke="#0D0400" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <Path d="M44 51 Q46 50 47 52" stroke="#0D0400" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Right */}
        <Ellipse cx="63" cy="52" rx="7" ry="3.5" fill="#0D0400" />
        <Ellipse cx="63" cy="52" rx="5" ry="2.8" fill="#150700" />
        <Circle cx="64.5" cy="51" r="1.3" fill="#FFFFFF" opacity="0.8" />
        <Path d="M56 51 Q63 48 70 51" stroke="#0D0400" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <Path d="M56 51 Q54 50 53 52" stroke="#0D0400" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Eyebrows – thick, full, arched */}
        <Path d="M30 47 Q37 44.5 44 47.5" stroke="#0D0400" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <Path d="M56 47.5 Q63 44.5 70 47" stroke="#0D0400" strokeWidth="2.4" fill="none" strokeLinecap="round" />

        {/* Lips – full, knowing smile — she has remedies */}
        <Path d="M40 67.5 Q50 64.5 60 67.5 Q56 72 50 72.5 Q44 72 40 67.5Z" fill="#8B3A18" />
        {/* Knowing smile — slightly asymmetric */}
        <Path d="M40 67.5 Q50 65.5 60 67.5" stroke="#9A4020" strokeWidth="0.9" fill="none" />
        {/* Slight dimples */}
        <Path d="M38 66 Q36 63 38 61" stroke="#9A6030" strokeWidth="0.8" fill="none" opacity="0.6" />
        <Path d="M62 66 Q64 63 62 61" stroke="#9A6030" strokeWidth="0.8" fill="none" opacity="0.6" />
        {/* Lower lip fullness */}
        <Path d="M42 70 Q50 72.5 58 70" fill="#A04020" opacity="0.4" />
      </G>
    </Svg>
  );
}
