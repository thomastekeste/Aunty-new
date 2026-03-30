import React from 'react';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs, ClipPath, G, Polygon
} from 'react-native-svg';

// Aunty Fatou — Senegalese
// Very deep rich brown skin. High elegant forehead. Sharp bone structure.
// Grand boubou headwrap in purple and gold. Regal calm expression.
export default function FatouPortrait({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="fatou-circle">
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#fatou-circle)">
        {/* Background – deep royal purple */}
        <Rect x="0" y="0" width="100" height="100" fill="#5030A0" />
        <Rect x="0" y="68" width="100" height="32" fill="#3A1E78" />

        {/* Boubou fabric – purple and gold at shoulders */}
        <Ellipse cx="50" cy="94" rx="40" ry="18" fill="#6040B0" />
        {/* Gold embroidery border on boubou */}
        <Path d="M10 82 Q50 76 90 82" stroke="#D4A017" strokeWidth="3" fill="none" />
        <Path d="M10 82 Q50 76 90 82" stroke="#F0C830" strokeWidth="1" fill="none" />
        {/* Embroidery dots */}
        <Circle cx="25" cy="81" r="1.5" fill="#D4A017" />
        <Circle cx="40" cy="79" r="1.5" fill="#D4A017" />
        <Circle cx="50" cy="78" r="1.5" fill="#D4A017" />
        <Circle cx="60" cy="79" r="1.5" fill="#D4A017" />
        <Circle cx="75" cy="81" r="1.5" fill="#D4A017" />

        {/* Neck – long elegant */}
        <Rect x="41" y="72" width="18" height="20" rx="4" fill="#1A0800" />

        {/* Head – very deep rich brown, longer elegant shape */}
        <Ellipse cx="50" cy="52" rx="20" ry="26" fill="#1A0800" />

        {/* Ear left */}
        <Ellipse cx="30" cy="56" rx="3.5" ry="5" fill="#150600" />
        {/* Ear right */}
        <Ellipse cx="70" cy="56" rx="3.5" ry="5" fill="#150600" />

        {/* Grand headwrap – tall, majestic, purple and gold */}
        {/* Main headwrap body */}
        <Ellipse cx="50" cy="28" rx="26" ry="20" fill="#5030A0" />
        {/* Tall crown of wrap */}
        <Path d="M28 24 Q50 8 72 24 Q70 34 50 32 Q30 34 28 24Z" fill="#6040B0" />
        {/* Gold accent band on wrap */}
        <Path d="M26 28 Q50 20 74 28" stroke="#D4A017" strokeWidth="2.5" fill="none" />
        <Path d="M27 30 Q50 22 73 30" stroke="#F0C830" strokeWidth="1" fill="none" opacity="0.7" />
        {/* Wrap fold/knot detail */}
        <Path d="M44 32 Q50 36 56 32 Q54 28 50 30 Q46 28 44 32Z" fill="#7050C0" />
        {/* Gold knot accent */}
        <Circle cx="50" cy="31" r="3.5" fill="#D4A017" />
        <Circle cx="50" cy="31" r="2" fill="#F0C830" />
        {/* Wrap drape left */}
        <Path d="M28 26 Q22 32 24 40 Q26 42 28 40 Q28 34 30 28" fill="#5030A0" />
        {/* Wrap drape right */}
        <Path d="M72 26 Q78 32 76 40 Q74 42 72 40 Q72 34 70 28" fill="#5030A0" />

        {/* High elegant forehead – very prominent */}
        <Ellipse cx="50" cy="40" rx="18" ry="10" fill="#1A0800" />

        {/* Sharp defined cheekbones */}
        <Ellipse cx="32" cy="57" rx="7" ry="4.5" fill="#150600" opacity="0.6" />
        <Ellipse cx="68" cy="57" rx="7" ry="4.5" fill="#150600" opacity="0.6" />

        {/* Refined nose – sharp, slender */}
        <Path d="M47 58 Q50 55 53 58 Q52 62 50 63 Q48 62 47 58Z" fill="#150600" />
        <Ellipse cx="47.5" cy="61.5" rx="1.5" ry="1.2" fill="#0D0400" />
        <Ellipse cx="52.5" cy="61.5" rx="1.5" ry="1.2" fill="#0D0400" />

        {/* Eyes – sharp, defined, regal — quiet authority */}
        {/* Left */}
        <Ellipse cx="37" cy="51" rx="6.5" ry="3" fill="#0D0400" />
        <Ellipse cx="37" cy="51" rx="4.5" ry="2.2" fill="#1A0800" />
        <Circle cx="38.5" cy="50.3" r="1.1" fill="#FFFFFF" opacity="0.7" />
        {/* Subtle eyeliner */}
        <Path d="M30.5 50 Q37 47 43.5 50" stroke="#0D0400" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Right */}
        <Ellipse cx="63" cy="51" rx="6.5" ry="3" fill="#0D0400" />
        <Ellipse cx="63" cy="51" rx="4.5" ry="2.2" fill="#1A0800" />
        <Circle cx="64.5" cy="50.3" r="1.1" fill="#FFFFFF" opacity="0.7" />
        <Path d="M56.5 50 Q63 47 69.5 50" stroke="#0D0400" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Eyebrows – refined, arched, strong */}
        <Path d="M31 46.5 Q37 44 43 46.5" stroke="#0D0400" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <Path d="M57 46.5 Q63 44 69 46.5" stroke="#0D0400" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* Lips – composed, closed — regal calm */}
        <Path d="M42 67.5 Q50 65 58 67.5 Q55 71 50 71.5 Q45 71 42 67.5Z" fill="#2E1204" />
        <Path d="M42 67.5 Q50 65.5 58 67.5" stroke="#1A0800" strokeWidth="0.8" fill="none" />
        {/* Very slight composed expression */}
        <Path d="M43 68 Q50 66.5 57 68" stroke="#3D1A08" strokeWidth="0.5" fill="none" opacity="0.5" />
      </G>
    </Svg>
  );
}
