import React from 'react';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs, ClipPath, G, Polygon
} from 'react-native-svg';

// Aunty Ngozi — Nigerian
// Deep warm brown skin. 4C hair in full puff. Ankara print. Gold stud earrings.
// Warm authoritative expression.
export default function NgozPortrait({ size = 56 }) {
  const s = size / 100;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="ngozi-circle">
          <Circle cx="50" cy="50" r="50" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#ngozi-circle)">
        {/* Background – warm amber/orange Ankara feel */}
        <Rect x="0" y="0" width="100" height="100" fill="#D4581A" />

        {/* Ankara pattern blocks – geometric */}
        <Rect x="0" y="60" width="100" height="40" fill="#C04010" />
        <Polygon points="0,60 20,45 40,60" fill="#E8731F" />
        <Polygon points="20,45 40,60 60,45" fill="#B83A0E" />
        <Polygon points="40,60 60,45 80,60" fill="#E8731F" />
        <Polygon points="60,45 80,60 100,45" fill="#B83A0E" />
        <Polygon points="80,60 100,45 100,60" fill="#E8731F" />

        {/* Ankara accent dots */}
        <Circle cx="10" cy="70" r="3" fill="#F0A020" opacity="0.7" />
        <Circle cx="30" cy="75" r="2" fill="#F0A020" opacity="0.7" />
        <Circle cx="70" cy="70" r="3" fill="#F0A020" opacity="0.7" />
        <Circle cx="90" cy="75" r="2" fill="#F0A020" opacity="0.7" />
        <Circle cx="50" cy="80" r="3" fill="#F0A020" opacity="0.7" />

        {/* Neck */}
        <Rect x="38" y="74" width="24" height="18" rx="4" fill="#5C2A0E" />

        {/* Head shape – deep warm brown */}
        <Ellipse cx="50" cy="52" rx="22" ry="26" fill="#5C2A0E" />

        {/* Ear left */}
        <Ellipse cx="28" cy="55" rx="4" ry="5.5" fill="#4A2008" />
        <Ellipse cx="28.5" cy="55" rx="2" ry="3.5" fill="#5C2A0E" />

        {/* Ear right */}
        <Ellipse cx="72" cy="55" rx="4" ry="5.5" fill="#4A2008" />
        <Ellipse cx="71.5" cy="55" rx="2" ry="3.5" fill="#5C2A0E" />

        {/* Gold stud earrings */}
        <Circle cx="27" cy="54" r="2.2" fill="#D4A017" />
        <Circle cx="73" cy="54" r="2.2" fill="#D4A017" />

        {/* 4C hair puff – large, full, natural */}
        {/* Main puff mass */}
        <Ellipse cx="50" cy="28" rx="30" ry="24" fill="#1A0A00" />
        {/* Puff volume layering for depth */}
        <Ellipse cx="36" cy="30" rx="14" ry="18" fill="#2A1005" />
        <Ellipse cx="64" cy="30" rx="14" ry="18" fill="#2A1005" />
        <Ellipse cx="50" cy="20" rx="24" ry="16" fill="#1A0A00" />
        {/* Texture wisps */}
        <Path d="M30 28 Q26 22 30 18 Q34 22 30 28" fill="#120600" />
        <Path d="M70 28 Q74 22 70 18 Q66 22 70 28" fill="#120600" />
        <Path d="M40 18 Q38 12 44 10 Q46 14 40 18" fill="#120600" />
        <Path d="M60 18 Q62 12 56 10 Q54 14 60 18" fill="#120600" />
        <Path d="M50 14 Q50 8 54 6 Q56 10 50 14" fill="#120600" />
        <Path d="M50 14 Q50 8 46 6 Q44 10 50 14" fill="#120600" />

        {/* Forehead */}
        <Ellipse cx="50" cy="40" rx="19" ry="10" fill="#5C2A0E" />

        {/* High cheekbones – subtle shading */}
        <Ellipse cx="34" cy="57" rx="8" ry="5" fill="#4A2008" opacity="0.5" />
        <Ellipse cx="66" cy="57" rx="8" ry="5" fill="#4A2008" opacity="0.5" />

        {/* Nose – broad, beautiful */}
        <Ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#4A2008" />
        <Circle cx="46" cy="61" r="2" fill="#3D1A05" />
        <Circle cx="54" cy="61" r="2" fill="#3D1A05" />

        {/* Eyes – dark almond shaped */}
        {/* Left eye */}
        <Ellipse cx="38" cy="52" rx="6" ry="3.5" fill="#1A0A00" />
        <Ellipse cx="38" cy="52" rx="4" ry="2.8" fill="#0D0500" />
        <Circle cx="39.5" cy="51.2" r="1.2" fill="#FFFFFF" opacity="0.7" />
        {/* Left eyelid crease */}
        <Path d="M32 50 Q38 47 44 50" stroke="#3D1A05" strokeWidth="0.8" fill="none" />

        {/* Right eye */}
        <Ellipse cx="62" cy="52" rx="6" ry="3.5" fill="#1A0A00" />
        <Ellipse cx="62" cy="52" rx="4" ry="2.8" fill="#0D0500" />
        <Circle cx="63.5" cy="51.2" r="1.2" fill="#FFFFFF" opacity="0.7" />
        {/* Right eyelid crease */}
        <Path d="M56 50 Q62 47 68 50" stroke="#3D1A05" strokeWidth="0.8" fill="none" />

        {/* Eyebrows – strong, full */}
        <Path d="M32 47 Q38 44.5 44 47" stroke="#0D0500" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <Path d="M56 47 Q62 44.5 68 47" stroke="#0D0500" strokeWidth="2.2" fill="none" strokeLinecap="round" />

        {/* Lips – full, warm confident expression */}
        <Path d="M42 68 Q50 65 58 68 Q54 72 50 72.5 Q46 72 42 68Z" fill="#6B2010" />
        <Path d="M42 68 Q50 66 58 68" stroke="#7A2814" strokeWidth="0.8" fill="none" />
        {/* Slight smile lines */}
        <Path d="M40 67 Q38 64 40 62" stroke="#4A2008" strokeWidth="0.7" fill="none" opacity="0.6" />
        <Path d="M60 67 Q62 64 60 62" stroke="#4A2008" strokeWidth="0.7" fill="none" opacity="0.6" />
      </G>
    </Svg>
  );
}
