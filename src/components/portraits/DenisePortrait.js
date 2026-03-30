import React from 'react';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs, ClipPath, G
} from 'react-native-svg';

// Aunty Denise — African American
// Deep brown skin. 4B hair in full twist out/puff. Gold hoops. Wearing purple. Direct confident expression.
export default function DenisePortrait({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="denise-circle">
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#denise-circle)">
        {/* Background – deep purple */}
        <Rect x="0" y="0" width="100" height="100" fill="#4040C0" />
        <Rect x="0" y="65" width="100" height="35" fill="#2E2E8A" />

        {/* Purple top – slightly visible at shoulder */}
        <Ellipse cx="50" cy="92" rx="32" ry="16" fill="#5050D0" />
        <Ellipse cx="50" cy="88" rx="26" ry="12" fill="#4040C0" />

        {/* Neck */}
        <Rect x="40" y="74" width="20" height="16" rx="3" fill="#3D1505" />

        {/* Head – deep brown */}
        <Ellipse cx="50" cy="53" rx="21" ry="25" fill="#3D1A05" />

        {/* Ear left */}
        <Ellipse cx="29" cy="57" rx="4" ry="5.5" fill="#2E1204" />
        <Ellipse cx="29.5" cy="57" rx="2" ry="3.5" fill="#3D1A05" />
        {/* Ear right */}
        <Ellipse cx="71" cy="57" rx="4" ry="5.5" fill="#2E1204" />
        <Ellipse cx="70.5" cy="57" rx="2" ry="3.5" fill="#3D1A05" />

        {/* Gold hoop earrings */}
        <Circle cx="28" cy="57" r="4" fill="none" stroke="#D4A017" strokeWidth="2.2" />
        <Circle cx="72" cy="57" r="4" fill="none" stroke="#D4A017" strokeWidth="2.2" />

        {/* 4B twist-out puff – full, voluminous */}
        {/* Puff base */}
        <Ellipse cx="50" cy="31" rx="28" ry="22" fill="#1A0800" />
        {/* Twist-out sections – coily defined sections */}
        <Path d="M30 36 Q24 28 28 22 Q32 26 30 36" fill="#0D0400" />
        <Path d="M36 30 Q30 22 34 16 Q38 20 36 30" fill="#150700" />
        <Path d="M42 26 Q38 18 44 13 Q46 17 42 26" fill="#0D0400" />
        <Path d="M50 24 Q50 16 54 12 Q56 16 50 24" fill="#1A0800" />
        <Path d="M50 24 Q50 16 46 12 Q44 16 50 24" fill="#0D0400" />
        <Path d="M58 26 Q62 18 56 13 Q54 17 58 26" fill="#150700" />
        <Path d="M64 30 Q70 22 66 16 Q62 20 64 30" fill="#0D0400" />
        <Path d="M70 36 Q76 28 72 22 Q68 26 70 36" fill="#1A0800" />
        {/* More coily wisps at top */}
        <Path d="M44 18 Q42 12 46 9 Q48 13 44 18" fill="#0D0400" />
        <Path d="M56 18 Q58 12 54 9 Q52 13 56 18" fill="#0D0400" />
        {/* Front hairline – 4B texture, low hairline */}
        <Path d="M29 38 Q50 32 71 38 Q68 42 50 40 Q32 42 29 38" fill="#1A0800" />

        {/* Forehead */}
        <Ellipse cx="50" cy="43" rx="19" ry="9" fill="#3D1A05" />

        {/* Cheekbones – defined */}
        <Ellipse cx="33" cy="59" rx="8" ry="5" fill="#2E1204" opacity="0.45" />
        <Ellipse cx="67" cy="59" rx="8" ry="5" fill="#2E1204" opacity="0.45" />

        {/* Nose */}
        <Ellipse cx="50" cy="61" rx="5" ry="3.5" fill="#2E1204" />
        <Circle cx="46" cy="62" r="2" fill="#261004" />
        <Circle cx="54" cy="62" r="2" fill="#261004" />

        {/* Eyes – direct, confident, not smiling — she's seen it all */}
        {/* Left */}
        <Ellipse cx="38" cy="53" rx="6" ry="3.2" fill="#0D0400" />
        <Ellipse cx="38" cy="53" rx="4" ry="2.5" fill="#1A0800" />
        <Circle cx="39.5" cy="52.2" r="1.2" fill="#FFFFFF" opacity="0.75" />
        <Path d="M32 51.5 Q38 49 44 51.5" stroke="#2E1204" strokeWidth="0.9" fill="none" />
        {/* Right */}
        <Ellipse cx="62" cy="53" rx="6" ry="3.2" fill="#0D0400" />
        <Ellipse cx="62" cy="53" rx="4" ry="2.5" fill="#1A0800" />
        <Circle cx="63.5" cy="52.2" r="1.2" fill="#FFFFFF" opacity="0.75" />
        <Path d="M56 51.5 Q62 49 68 51.5" stroke="#2E1204" strokeWidth="0.9" fill="none" />

        {/* Eyebrows – strong, straight, confident */}
        <Path d="M32 48 Q38 46 44 48" stroke="#0D0400" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        <Path d="M56 48 Q62 46 68 48" stroke="#0D0400" strokeWidth="2.3" fill="none" strokeLinecap="round" />

        {/* Lips – closed, direct expression — slight knowing press */}
        <Path d="M41 69 Q50 66.5 59 69 Q55 72.5 50 73 Q45 72.5 41 69Z" fill="#3D1204" />
        <Path d="M41 69 Q50 67 59 69" stroke="#4A1A08" strokeWidth="0.8" fill="none" />
        {/* Slightly pursed / direct expression */}
        <Path d="M43 69.5 Q50 68 57 69.5" stroke="#2E1204" strokeWidth="0.5" fill="none" opacity="0.5" />
      </G>
    </Svg>
  );
}
