import React from 'react';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs, ClipPath, G, Line
} from 'react-native-svg';

// Aunty Marcia — Jamaican
// Medium-deep warm brown skin. Long locs. Yellow/green headband. Wide bright smile.
export default function MarciaPortrait({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="marcia-circle">
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#marcia-circle)">
        {/* Background – lush green */}
        <Rect x="0" y="0" width="100" height="100" fill="#2D7D4A" />
        <Rect x="0" y="65" width="100" height="35" fill="#1F5E36" />

        {/* Locs flowing down — behind body */}
        <Path d="M28 42 Q18 55 16 75 Q18 80 22 78 Q24 65 32 52" fill="#1A0A00" />
        <Path d="M30 42 Q20 58 19 78 Q21 83 25 81 Q26 66 34 52" fill="#120600" />
        <Path d="M72 42 Q82 55 84 75 Q82 80 78 78 Q76 65 68 52" fill="#1A0A00" />
        <Path d="M70 42 Q80 58 81 78 Q79 83 75 81 Q74 66 66 52" fill="#120600" />
        <Path d="M34 42 Q26 60 25 82 Q27 86 30 84 Q30 68 38 52" fill="#1A0A00" />
        <Path d="M66 42 Q74 60 75 82 Q73 86 70 84 Q70 68 62 52" fill="#1A0A00" />

        {/* Neck */}
        <Rect x="39" y="74" width="22" height="18" rx="4" fill="#7A3D1A" />

        {/* Head shape – medium-deep warm brown */}
        <Ellipse cx="50" cy="53" rx="22" ry="25" fill="#8B4513" />

        {/* Ear left */}
        <Ellipse cx="28" cy="56" rx="4" ry="5" fill="#7A3A10" />
        <Ellipse cx="28.5" cy="56" rx="2" ry="3" fill="#8B4513" />
        {/* Ear right */}
        <Ellipse cx="72" cy="56" rx="4" ry="5" fill="#7A3A10" />
        <Ellipse cx="71.5" cy="56" rx="2" ry="3" fill="#8B4513" />

        {/* Headband – yellow and green */}
        <Path d="M25 36 Q50 28 75 36 Q72 40 50 38 Q28 40 25 36Z" fill="#F5C842" />
        <Path d="M26 37 Q50 30 74 37 Q72 39 50 37 Q28 39 26 37Z" fill="#2D9E54" opacity="0.6" />
        <Path d="M28 38 Q50 32 72 38" stroke="#F5C842" strokeWidth="1.5" fill="none" />

        {/* Hair mass – locs at top */}
        <Ellipse cx="50" cy="36" rx="27" ry="14" fill="#1A0A00" />
        {/* Loc texture strands at top */}
        <Path d="M36 30 Q34 24 38 22 Q40 26 36 30" fill="#0D0500" />
        <Path d="M44 28 Q42 22 46 20 Q48 24 44 28" fill="#0D0500" />
        <Path d="M56 28 Q58 22 54 20 Q52 24 56 28" fill="#0D0500" />
        <Path d="M64 30 Q66 24 62 22 Q60 26 64 30" fill="#0D0500" />

        {/* Forehead */}
        <Ellipse cx="50" cy="42" rx="19" ry="9" fill="#8B4513" />

        {/* Warm cheeks – fuller face, warmth */}
        <Ellipse cx="34" cy="58" rx="9" ry="6" fill="#7A3A10" opacity="0.4" />
        <Ellipse cx="66" cy="58" rx="9" ry="6" fill="#7A3A10" opacity="0.4" />

        {/* Nose */}
        <Ellipse cx="50" cy="60" rx="4.5" ry="3.5" fill="#6B3010" />
        <Circle cx="46.5" cy="61" r="1.8" fill="#5A2808" />
        <Circle cx="53.5" cy="61" r="1.8" fill="#5A2808" />

        {/* Eyes – bright warm eyes, warm expression */}
        {/* Left */}
        <Ellipse cx="38" cy="52" rx="6" ry="3.5" fill="#0D0500" />
        <Ellipse cx="38" cy="52" rx="4" ry="2.5" fill="#1A0A00" />
        <Circle cx="39.5" cy="51" r="1.3" fill="#FFFFFF" opacity="0.8" />
        <Path d="M32 50.5 Q38 48 44 50.5" stroke="#5A2808" strokeWidth="0.9" fill="none" />
        {/* Right */}
        <Ellipse cx="62" cy="52" rx="6" ry="3.5" fill="#0D0500" />
        <Ellipse cx="62" cy="52" rx="4" ry="2.5" fill="#1A0A00" />
        <Circle cx="63.5" cy="51" r="1.3" fill="#FFFFFF" opacity="0.8" />
        <Path d="M56 50.5 Q62 48 68 50.5" stroke="#5A2808" strokeWidth="0.9" fill="none" />

        {/* Eyebrows – natural arched */}
        <Path d="M32 47.5 Q38 45 44 47" stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Path d="M56 47 Q62 45 68 47.5" stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Wide bright smile — the warmest person in the room */}
        {/* Upper lip */}
        <Path d="M40 68 Q45 65.5 50 66 Q55 65.5 60 68 Q55 71.5 50 72 Q45 71.5 40 68Z" fill="#5A2010" />
        {/* Teeth showing */}
        <Path d="M41 68.5 Q50 66.5 59 68.5 Q55 70 50 70.5 Q45 70 41 68.5Z" fill="#F5F0E8" />
        {/* Lower lip */}
        <Path d="M41 70 Q50 72.5 59 70" stroke="#4A1808" strokeWidth="1" fill="none" />
        {/* Smile dimple lines */}
        <Path d="M38 66 Q36 63 38 60" stroke="#7A3A10" strokeWidth="0.8" fill="none" opacity="0.7" />
        <Path d="M62 66 Q64 63 62 60" stroke="#7A3A10" strokeWidth="0.8" fill="none" opacity="0.7" />
      </G>
    </Svg>
  );
}
