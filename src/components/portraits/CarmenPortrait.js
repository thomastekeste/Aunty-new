import React from 'react';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs, ClipPath, G
} from 'react-native-svg';

// Aunty Carmen — Afro-Latina
// Medium warm brown skin. 3C/4A curls loose, wild, and full. Gold hoops. Wearing rose/red. Pure energy.
export default function CarmenPortrait({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="carmen-circle">
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#carmen-circle)">
        {/* Background – vibrant rose/red */}
        <Rect x="0" y="0" width="100" height="100" fill="#C03060" />
        <Rect x="0" y="68" width="100" height="32" fill="#A02050" />

        {/* Rose top at shoulder */}
        <Ellipse cx="50" cy="94" rx="38" ry="18" fill="#D04070" />
        <Ellipse cx="50" cy="90" rx="28" ry="12" fill="#C03060" />

        {/* Wild 3C/4A curls – loose, full, everywhere */}
        {/* Side curls falling */}
        <Path d="M22 38 Q10 46 12 60 Q16 68 18 62 Q16 52 22 44" fill="#2A1008" />
        <Path d="M20 40 Q8 50 10 64 Q14 72 16 66 Q14 54 20 46" fill="#1A0800" />
        <Path d="M78 38 Q90 46 88 60 Q84 68 82 62 Q84 52 78 44" fill="#2A1008" />
        <Path d="M80 40 Q92 50 90 64 Q86 72 84 66 Q86 54 80 46" fill="#1A0800" />

        {/* Curls at top – wild and free */}
        <Ellipse cx="50" cy="26" rx="30" ry="22" fill="#1A0800" />
        {/* Individual spiral curls rendered as coiling paths */}
        <Path d="M30 30 Q24 22 28 16 Q32 14 34 18 Q30 22 30 30" fill="#0D0400" />
        <Path d="M36 24 Q32 16 38 12 Q42 12 42 16 Q38 18 36 24" fill="#150700" />
        <Path d="M44 20 Q42 12 48 9 Q52 10 50 14 Q46 16 44 20" fill="#0D0400" />
        <Path d="M56 20 Q58 12 52 9 Q48 10 50 14 Q54 16 56 20" fill="#1A0800" />
        <Path d="M64 24 Q68 16 62 12 Q58 12 58 16 Q62 18 64 24" fill="#0D0400" />
        <Path d="M70 30 Q76 22 72 16 Q68 14 66 18 Q70 22 70 30" fill="#150700" />
        {/* Front curl wisps – 3C spirals */}
        <Path d="M34 34 Q28 28 32 24 Q36 24 36 28 Q34 30 34 34" fill="#120600" />
        <Path d="M66 34 Q72 28 68 24 Q64 24 64 28 Q66 30 66 34" fill="#120600" />

        {/* Neck */}
        <Rect x="39" y="73" width="22" height="17" rx="4" fill="#7A4018" />

        {/* Head – medium warm brown */}
        <Ellipse cx="50" cy="53" rx="22" ry="25" fill="#8B4A1A" />

        {/* Ear left */}
        <Ellipse cx="28" cy="56" rx="4" ry="5.5" fill="#7A3A14" />
        <Ellipse cx="28.5" cy="56" rx="2" ry="3.5" fill="#8B4A1A" />
        {/* Ear right */}
        <Ellipse cx="72" cy="56" rx="4" ry="5.5" fill="#7A3A14" />
        <Ellipse cx="71.5" cy="56" rx="2" ry="3.5" fill="#8B4A1A" />

        {/* Gold hoop earrings – big and fun */}
        <Circle cx="27" cy="57" r="5" fill="none" stroke="#D4A017" strokeWidth="2.5" />
        <Circle cx="73" cy="57" r="5" fill="none" stroke="#D4A017" strokeWidth="2.5" />

        {/* Forehead */}
        <Ellipse cx="50" cy="41" rx="19" ry="9" fill="#8B4A1A" />

        {/* Warm full cheeks – joyful round face */}
        <Ellipse cx="33" cy="59" rx="10" ry="7" fill="#7A3A14" opacity="0.35" />
        <Ellipse cx="67" cy="59" rx="10" ry="7" fill="#7A3A14" opacity="0.35" />

        {/* Nose – warm, rounded */}
        <Ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#7A3A14" />
        <Circle cx="46.5" cy="61" r="2" fill="#6B2E10" />
        <Circle cx="53.5" cy="61" r="2" fill="#6B2E10" />

        {/* Eyes – warm, bright, joyful expression — lit up */}
        {/* Left */}
        <Ellipse cx="37" cy="52" rx="6.5" ry="3.5" fill="#1A0800" />
        <Ellipse cx="37" cy="52" rx="4.5" ry="2.8" fill="#0D0400" />
        <Circle cx="38.5" cy="51" r="1.3" fill="#FFFFFF" opacity="0.85" />
        <Path d="M30.5 50.5 Q37 48 43.5 50.5" stroke="#6B2E10" strokeWidth="1" fill="none" />
        {/* Right */}
        <Ellipse cx="63" cy="52" rx="6.5" ry="3.5" fill="#1A0800" />
        <Ellipse cx="63" cy="52" rx="4.5" ry="2.8" fill="#0D0400" />
        <Circle cx="64.5" cy="51" r="1.3" fill="#FFFFFF" opacity="0.85" />
        <Path d="M56.5 50.5 Q63 48 69.5 50.5" stroke="#6B2E10" strokeWidth="1" fill="none" />

        {/* Eyebrows – expressive, arched high — pure energy */}
        <Path d="M31 47 Q37 44 43 47" stroke="#1A0800" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Path d="M57 47 Q63 44 69 47" stroke="#1A0800" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Big warm bright smile – GORGEOUS */}
        <Path d="M39 68 Q50 64 61 68 Q56 73 50 74 Q44 73 39 68Z" fill="#6B2010" />
        {/* Teeth – big open smile */}
        <Path d="M40.5 68.5 Q50 65.5 59.5 68.5 Q55 71 50 71.5 Q45 71 40.5 68.5Z" fill="#F8F4EE" />
        {/* Lower lip */}
        <Path d="M40.5 70.5 Q50 73.5 59.5 70.5" stroke="#5A1808" strokeWidth="1" fill="none" />
        {/* Deep smile lines */}
        <Path d="M37 66 Q34 62 36 58" stroke="#8B4A1A" strokeWidth="0.9" fill="none" opacity="0.65" />
        <Path d="M63 66 Q66 62 64 58" stroke="#8B4A1A" strokeWidth="0.9" fill="none" opacity="0.65" />
      </G>
    </Svg>
  );
}
