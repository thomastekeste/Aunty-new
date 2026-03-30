import React from 'react';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs, ClipPath, G
} from 'react-native-svg';

// Aunty Amara — East African (Ethiopian/Eritrean)
// Warm reddish-brown skin with cool undertones. Sharp defined features, strong brow, almond eyes.
// Traditional habesha kemis white dress with colored embroidery border. Gold cross. Graceful composed expression.
export default function AmaraPortrait({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="amara-circle">
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#amara-circle)">
        {/* Background – warm amber-brown */}
        <Rect x="0" y="0" width="100" height="100" fill="#B85C00" />
        <Rect x="0" y="68" width="100" height="32" fill="#8A4400" />

        {/* Habesha kemis – white with colored border embroidery */}
        <Ellipse cx="50" cy="95" rx="44" ry="20" fill="#F8F4EE" />
        <Ellipse cx="50" cy="90" rx="36" ry="15" fill="#FDFAF5" />
        {/* Embroidery border – colorful traditional */}
        <Path d="M14 82 Q50 76 86 82" stroke="#C03030" strokeWidth="3" fill="none" />
        <Path d="M14 82 Q50 76 86 82" stroke="#F0C830" strokeWidth="1.5" fill="none" opacity="0.8" />
        <Path d="M14 79 Q50 73 86 79" stroke="#2D7D4A" strokeWidth="1.5" fill="none" />
        {/* Embroidery diamond pattern */}
        <Path d="M30 80 L33 77 L36 80 L33 83Z" fill="#C03030" />
        <Path d="M46 78 L49 75 L52 78 L49 81Z" fill="#C03030" />
        <Path d="M62 80 L65 77 L68 80 L65 83Z" fill="#C03030" />

        {/* Neck – long slender */}
        <Rect x="41" y="73" width="18" height="16" rx="4" fill="#8B4A18" />

        {/* Head – warm reddish-brown with cool undertones */}
        <Ellipse cx="50" cy="52" rx="20" ry="25" fill="#A05020" />

        {/* Ear left */}
        <Ellipse cx="30" cy="55" rx="3.5" ry="5" fill="#8B4018" />
        {/* Ear right */}
        <Ellipse cx="70" cy="55" rx="3.5" ry="5" fill="#8B4018" />

        {/* Gold cross necklace */}
        <Rect x="47.5" y="76" width="5" height="8" rx="0.5" fill="#D4A017" />
        <Rect x="45" y="79" width="10" height="2.5" rx="0.5" fill="#D4A017" />
        <Circle cx="50" cy="78.5" r="1" fill="#F0C830" />

        {/* Natural hair – long, flowing, dark */}
        {/* Hair mass behind head */}
        <Ellipse cx="50" cy="35" rx="24" ry="20" fill="#150700" />
        {/* Hair flowing over sides */}
        <Path d="M28 36 Q18 46 20 62 Q22 66 24 62 Q22 50 30 42" fill="#1A0800" />
        <Path d="M72 36 Q82 46 80 62 Q78 66 76 62 Q78 50 70 42" fill="#1A0800" />
        {/* Hair texture strands */}
        <Path d="M36 26 Q32 18 38 14 Q40 18 36 26" fill="#0D0400" />
        <Path d="M44 22 Q42 14 48 11 Q50 15 44 22" fill="#1A0800" />
        <Path d="M56 22 Q58 14 52 11 Q50 15 56 22" fill="#0D0400" />
        <Path d="M64 26 Q68 18 62 14 Q60 18 64 26" fill="#1A0800" />
        {/* Center part – traditional */}
        <Path d="M50 16 Q50 26 50 34" stroke="#0D0400" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* Forehead – high, clean */}
        <Ellipse cx="50" cy="40" rx="18" ry="9" fill="#A05020" />

        {/* Sharp defined features – strong brow, high cheekbones */}
        <Ellipse cx="33" cy="56" rx="7" ry="4" fill="#8B4018" opacity="0.45" />
        <Ellipse cx="67" cy="56" rx="7" ry="4" fill="#8B4018" opacity="0.45" />

        {/* Refined nose – defined bridge */}
        <Path d="M48 55 Q50 52 52 55 Q52 61 50 62 Q48 61 48 55Z" fill="#8B4018" />
        <Ellipse cx="47.5" cy="61" rx="1.5" ry="1.2" fill="#6B3010" />
        <Ellipse cx="52.5" cy="61" rx="1.5" ry="1.2" fill="#6B3010" />

        {/* Eyes – almond-shaped, sharp, defined — graceful */}
        {/* Left */}
        <Ellipse cx="37" cy="51" rx="6.5" ry="2.8" fill="#0D0400" />
        <Ellipse cx="37" cy="51" rx="4.5" ry="2" fill="#150700" />
        <Circle cx="38.5" cy="50.3" r="1" fill="#FFFFFF" opacity="0.7" />
        {/* Almond tail */}
        <Path d="M30.5 50 Q37 47 43.5 50 Q41 52 37 51.5 Q33 52 30.5 50Z" fill="#0D0400" opacity="0.3" />
        {/* Right */}
        <Ellipse cx="63" cy="51" rx="6.5" ry="2.8" fill="#0D0400" />
        <Ellipse cx="63" cy="51" rx="4.5" ry="2" fill="#150700" />
        <Circle cx="64.5" cy="50.3" r="1" fill="#FFFFFF" opacity="0.7" />
        <Path d="M56.5 50 Q63 47 69.5 50 Q67 52 63 51.5 Q59 52 56.5 50Z" fill="#0D0400" opacity="0.3" />

        {/* Eyebrows – strong, defined, thick */}
        <Path d="M31 46.5 Q37 44 43 47" stroke="#0D0400" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        <Path d="M57 47 Q63 44 69 46.5" stroke="#0D0400" strokeWidth="2.3" fill="none" strokeLinecap="round" />

        {/* Lips – graceful composed expression, slight warmth underneath */}
        <Path d="M42 67 Q50 64.5 58 67 Q55 70.5 50 71 Q45 70.5 42 67Z" fill="#7A3010" />
        <Path d="M42 67 Q50 65 58 67" stroke="#8B3818" strokeWidth="0.8" fill="none" />
        {/* Graceful slight expression */}
        <Path d="M44 67.5 Q50 66 56 67.5" stroke="#6B2A10" strokeWidth="0.6" fill="none" opacity="0.5" />
      </G>
    </Svg>
  );
}
