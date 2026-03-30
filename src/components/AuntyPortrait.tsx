/**
 * AuntyPortrait — Illustrated SVG portraits for each aunty.
 * Each portrait has a distinct hair style, skin tone, and character accessories
 * reflecting their African/Caribbean/diasporic identity.
 */
import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';

interface AuntyPortraitProps {
  auntyId: string;
  size?: number;
}

// Ngozi (1) — Nigerian. High puff afro, deep brown skin, gold earrings.
function NgoziFace({ s }: { s: number }) {
  const scale = s / 100;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background circle */}
      <Circle cx="50" cy="50" r="50" fill="#8B4F1C" />
      {/* Neck */}
      <Rect x="42" y="72" width="16" height="18" rx="4" fill="#6B3820" />
      {/* Head */}
      <Circle cx="50" cy="58" r="22" fill="#6B3820" />
      {/* Big afro puff — extends above head */}
      <Circle cx="50" cy="36" r="26" fill="#1a0f0a" />
      {/* Afro texture detail */}
      <Circle cx="38" cy="30" r="8" fill="#2a1a10" />
      <Circle cx="62" cy="30" r="8" fill="#2a1a10" />
      <Circle cx="50" cy="22" r="9" fill="#2a1a10" />
      {/* Face — slightly lighter skin for face */}
      <Circle cx="50" cy="60" r="18" fill="#7A4428" />
      {/* Eyes */}
      <Circle cx="43" cy="56" r="3.5" fill="#1a0f0a" />
      <Circle cx="57" cy="56" r="3.5" fill="#1a0f0a" />
      <Circle cx="44" cy="55" r="1.2" fill="#fff" />
      <Circle cx="58" cy="55" r="1.2" fill="#fff" />
      {/* Nose */}
      <Ellipse cx="50" cy="62" rx="2.5" ry="1.5" fill="#5a2c10" />
      {/* Smile */}
      <Path d="M 44 68 Q 50 74 56 68" stroke="#3a1a08" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Gold earrings */}
      <Circle cx="32" cy="62" r="2.5" fill="#d4a574" />
      <Circle cx="68" cy="62" r="2.5" fill="#d4a574" />
    </Svg>
  );
}

// Marcia (2) — Jamaican. Headwrap/locs, medium brown skin, authoritative.
function MarciaFace({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#1A5C34" />
      {/* Neck */}
      <Rect x="42" y="72" width="16" height="18" rx="4" fill="#5C3018" />
      {/* Head */}
      <Circle cx="50" cy="60" r="22" fill="#7A4020" />
      {/* Face */}
      <Circle cx="50" cy="61" r="18" fill="#8B4A28" />
      {/* Headwrap — layered fabric on top */}
      <Ellipse cx="50" cy="42" rx="26" ry="14" fill="#2d7d4a" />
      <Ellipse cx="50" cy="40" rx="22" ry="11" fill="#1A5C34" />
      <Ellipse cx="50" cy="38" rx="18" ry="9" fill="#3a9060" />
      {/* Headwrap knot at top */}
      <Circle cx="50" cy="30" r="7" fill="#2d7d4a" />
      <Circle cx="44" cy="32" r="4" fill="#1A5C34" />
      <Circle cx="56" cy="32" r="4" fill="#1A5C34" />
      {/* Locs peeking out sides */}
      <Path d="M 28 52 Q 24 60 26 70" stroke="#1a0f0a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M 30 55 Q 26 65 28 75" stroke="#1a0f0a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M 72 52 Q 76 60 74 70" stroke="#1a0f0a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M 70 55 Q 74 65 72 75" stroke="#1a0f0a" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <Circle cx="43" cy="57" r="3.5" fill="#1a0f0a" />
      <Circle cx="57" cy="57" r="3.5" fill="#1a0f0a" />
      <Circle cx="44" cy="56" r="1.2" fill="#fff" />
      <Circle cx="58" cy="56" r="1.2" fill="#fff" />
      {/* Nose */}
      <Ellipse cx="50" cy="63" rx="2.5" ry="1.5" fill="#5a2c10" />
      {/* Mouth — slight knowing smile */}
      <Path d="M 44 69 Q 50 73 56 69" stroke="#3a1a08" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// Denise (3) — African American. Defined twist-out, deep toffee skin, confident.
function DeniseFace({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#0D3348" />
      {/* Neck */}
      <Rect x="42" y="72" width="16" height="18" rx="4" fill="#3D1E10" />
      {/* Head base */}
      <Circle cx="50" cy="60" r="22" fill="#4A2210" />
      {/* Twist-out hair — multiple coil shapes */}
      <Circle cx="50" cy="38" r="22" fill="#1a0f0a" />
      {/* Twist texture — defined sections */}
      <Path d="M 30 45 Q 34 35 38 28 Q 42 22 46 28 Q 44 35 40 42" fill="#2a1a0a" />
      <Path d="M 54 28 Q 58 22 62 28 Q 66 35 70 45 Q 62 40 54 28" fill="#2a1a0a" />
      <Path d="M 40 25 Q 50 18 60 25 Q 55 30 50 30 Q 45 30 40 25" fill="#2a1a0a" />
      {/* Individual twist coils */}
      <Circle cx="36" cy="34" r="5" fill="#1a0f0a" />
      <Circle cx="50" cy="25" r="6" fill="#1a0f0a" />
      <Circle cx="64" cy="34" r="5" fill="#1a0f0a" />
      <Circle cx="42" cy="38" r="4" fill="#2a1505" />
      <Circle cx="58" cy="38" r="4" fill="#2a1505" />
      {/* Face */}
      <Circle cx="50" cy="62" r="18" fill="#5C2A12" />
      {/* Eyes — bold, direct */}
      <Circle cx="43" cy="58" r="3.5" fill="#1a0f0a" />
      <Circle cx="57" cy="58" r="3.5" fill="#1a0f0a" />
      <Circle cx="44" cy="57" r="1.2" fill="#fff" />
      <Circle cx="58" cy="57" r="1.2" fill="#fff" />
      {/* Nose */}
      <Ellipse cx="50" cy="64" rx="2.8" ry="1.6" fill="#3a1a06" />
      {/* Confident smile */}
      <Path d="M 43 70 Q 50 76 57 70" stroke="#2a0e04" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Small gold studs */}
      <Circle cx="32" cy="63" r="2" fill="#9DD4EE" />
      <Circle cx="68" cy="63" r="2" fill="#9DD4EE" />
    </Svg>
  );
}

// Fatou (4) — Senegalese. Long box braids, rich brown skin, elegant.
function FatouFace({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#4A1E2A" />
      {/* Long box braids falling down */}
      {/* Left braids */}
      <Path d="M 30 45 Q 26 60 28 80 Q 29 86 30 80 Q 31 70 30 60" stroke="#1a0f0a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 34 44 Q 30 60 32 82 Q 33 88 34 82 Q 35 70 34 60" stroke="#1a0f0a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 38 43 Q 35 58 37 80 Q 38 86 39 80" stroke="#1a0f0a" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Right braids */}
      <Path d="M 70 45 Q 74 60 72 80 Q 71 86 70 80 Q 69 70 70 60" stroke="#1a0f0a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 66 44 Q 70 60 68 82 Q 67 88 66 82 Q 65 70 66 60" stroke="#1a0f0a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 62 43 Q 65 58 63 80 Q 62 86 61 80" stroke="#1a0f0a" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Bead tips */}
      <Circle cx="30" cy="82" r="3" fill="#6b3fa0" />
      <Circle cx="34" cy="84" r="3" fill="#d4a574" />
      <Circle cx="38" cy="82" r="3" fill="#6b3fa0" />
      <Circle cx="70" cy="82" r="3" fill="#d4a574" />
      <Circle cx="66" cy="84" r="3" fill="#6b3fa0" />
      <Circle cx="62" cy="82" r="3" fill="#d4a574" />
      {/* Neck */}
      <Rect x="42" y="72" width="16" height="14" rx="4" fill="#5C2C18" />
      {/* Head */}
      <Circle cx="50" cy="58" r="22" fill="#7A4225" />
      {/* Hair top — braids going back */}
      <Ellipse cx="50" cy="40" rx="20" ry="14" fill="#1a0f0a" />
      {/* Braid part lines on top */}
      <Path d="M 38 36 L 50 30 L 62 36" stroke="#2a1a0a" strokeWidth="1.5" fill="none" />
      <Path d="M 36 40 L 50 33 L 64 40" stroke="#2a1a0a" strokeWidth="1.5" fill="none" />
      {/* Face */}
      <Circle cx="50" cy="60" r="18" fill="#8B4A2C" />
      {/* Eyes — elegant, lidded */}
      <Circle cx="43" cy="56" r="3.5" fill="#1a0f0a" />
      <Circle cx="57" cy="56" r="3.5" fill="#1a0f0a" />
      <Circle cx="44" cy="55" r="1.2" fill="#fff" />
      <Circle cx="58" cy="55" r="1.2" fill="#fff" />
      {/* Eyebrows — elegant arched */}
      <Path d="M 39 51 Q 43 49 47 51" stroke="#1a0f0a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M 53 51 Q 57 49 61 51" stroke="#1a0f0a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <Ellipse cx="50" cy="62" rx="2.2" ry="1.4" fill="#5a2c10" />
      {/* Subtle smile */}
      <Path d="M 45 68 Q 50 71 55 68" stroke="#3a1a08" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// Carmen (5) — Afro-Latina. Big wash & go curls, warm tan skin, joyful.
function CarmenFace({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#8B1C42" />
      {/* Neck */}
      <Rect x="42" y="72" width="16" height="18" rx="4" fill="#A06840" />
      {/* Head */}
      <Circle cx="50" cy="60" r="22" fill="#C47A45" />
      {/* Big fluffy curls all around */}
      <Circle cx="50" cy="35" r="24" fill="#1a0f0a" />
      {/* Curl texture — bouncy clusters */}
      <Circle cx="35" cy="38" r="9" fill="#2a1a0a" />
      <Circle cx="65" cy="38" r="9" fill="#2a1a0a" />
      <Circle cx="50" cy="26" r="10" fill="#2a1a0a" />
      <Circle cx="41" cy="30" r="7" fill="#1a0f0a" />
      <Circle cx="59" cy="30" r="7" fill="#1a0f0a" />
      <Circle cx="28" cy="48" r="7" fill="#2a1a0a" />
      <Circle cx="72" cy="48" r="7" fill="#2a1a0a" />
      {/* Curl spirals suggestion */}
      <Circle cx="38" cy="44" r="4" fill="#1a0505" />
      <Circle cx="62" cy="44" r="4" fill="#1a0505" />
      <Circle cx="50" cy="36" r="5" fill="#1a0505" />
      {/* Face — warm tan */}
      <Circle cx="50" cy="62" r="18" fill="#D4885A" />
      {/* Eyes — wide, joyful */}
      <Circle cx="43" cy="57" r="4" fill="#1a0f0a" />
      <Circle cx="57" cy="57" r="4" fill="#1a0f0a" />
      <Circle cx="44.5" cy="56" r="1.5" fill="#fff" />
      <Circle cx="58.5" cy="56" r="1.5" fill="#fff" />
      {/* Nose */}
      <Ellipse cx="50" cy="63" rx="2.8" ry="1.6" fill="#A05828" />
      {/* Big joyful smile */}
      <Path d="M 41 70 Q 50 78 59 70" stroke="#7A3518" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M 43 70 Q 50 75 57 70" stroke="#fff" strokeWidth="1" fill="rgba(255,255,255,0.3)" />
      {/* Small hoop earrings */}
      <Circle cx="31" cy="63" r="3" fill="none" stroke="#d62d5f" strokeWidth="2" />
      <Circle cx="69" cy="63" r="3" fill="none" stroke="#d62d5f" strokeWidth="2" />
    </Svg>
  );
}

// Amara (6) — East African. Crown braids, deep ebony skin, regal.
function AmaraFace({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#7A3800" />
      {/* Neck */}
      <Rect x="42" y="72" width="16" height="18" rx="4" fill="#1C0A04" />
      {/* Head */}
      <Circle cx="50" cy="60" r="22" fill="#2C1008" />
      {/* Crown braids — braids arranged in a halo/crown */}
      {/* Base hair */}
      <Ellipse cx="50" cy="40" rx="22" ry="16" fill="#1a0f0a" />
      {/* Crown braid loop left */}
      <Path d="M 28 48 Q 20 35 30 25 Q 40 18 50 22 Q 46 30 38 36" fill="#1a0f0a" stroke="#2a1a0a" strokeWidth="2" />
      {/* Crown braid loop right */}
      <Path d="M 72 48 Q 80 35 70 25 Q 60 18 50 22 Q 54 30 62 36" fill="#1a0f0a" stroke="#2a1a0a" strokeWidth="2" />
      {/* Braid top detail */}
      <Path d="M 32 28 Q 50 18 68 28" stroke="#2a1505" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M 30 33 Q 50 22 70 33" stroke="#2a1505" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Crown accent — small gold detail */}
      <Circle cx="50" cy="24" r="3" fill="#c85a3a" />
      <Circle cx="38" cy="26" r="2" fill="#c85a3a" />
      <Circle cx="62" cy="26" r="2" fill="#c85a3a" />
      {/* Face — deep ebony */}
      <Circle cx="50" cy="62" r="18" fill="#3C1A0C" />
      {/* Eyes — deep, soulful */}
      <Circle cx="43" cy="57" r="3.5" fill="#0a0604" />
      <Circle cx="57" cy="57" r="3.5" fill="#0a0604" />
      <Circle cx="44" cy="56" r="1.3" fill="#fff" />
      <Circle cx="58" cy="56" r="1.3" fill="#fff" />
      {/* Strong eyebrows */}
      <Path d="M 38 52 Q 43 50 47 52" stroke="#0a0604" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M 53 52 Q 57 50 62 52" stroke="#0a0604" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Nose — broader, beautiful */}
      <Ellipse cx="50" cy="63" rx="3" ry="1.8" fill="#1a0804" />
      {/* Calm, regal smile */}
      <Path d="M 44 70 Q 50 74 56 70" stroke="#1a0804" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// Salma (7) — North African. Elegant silk press + subtle wrap, golden brown skin.
function SalmaFace({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="50" fill="#0D3D5E" />
      {/* Neck */}
      <Rect x="42" y="72" width="16" height="18" rx="4" fill="#8A5830" />
      {/* Head */}
      <Circle cx="50" cy="58" r="22" fill="#A06840" />
      {/* Elegant draped hair / silk press flowing */}
      {/* Left side hair */}
      <Path d="M 28 52 Q 24 40 28 30 Q 34 22 42 20 Q 50 18 50 28" fill="#1a0f0a" />
      {/* Right side hair */}
      <Path d="M 72 52 Q 76 40 72 30 Q 66 22 58 20 Q 50 18 50 28" fill="#1a0f0a" />
      {/* Hair top */}
      <Ellipse cx="50" cy="30" rx="20" ry="14" fill="#1a0f0a" />
      {/* Hair flowing down left */}
      <Path d="M 28 52 Q 25 65 28 80" stroke="#1a0f0a" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Hair flowing down right */}
      <Path d="M 72 52 Q 75 65 72 80" stroke="#1a0f0a" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Silk sheen on hair */}
      <Path d="M 35 28 Q 40 22 50 20 Q 60 22 65 28" stroke="rgba(154,204,232,0.3)" strokeWidth="2" fill="none" />
      {/* Face — warm golden brown */}
      <Circle cx="50" cy="60" r="18" fill="#B87848" />
      {/* Eyes — defined, almond shape */}
      <Ellipse cx="43" cy="56" rx="4.5" ry="3" fill="#1a0f0a" />
      <Ellipse cx="57" cy="56" rx="4.5" ry="3" fill="#1a0f0a" />
      <Circle cx="44" cy="55.5" r="1.3" fill="#fff" />
      <Circle cx="58" cy="55.5" r="1.3" fill="#fff" />
      {/* Kohl-lined upper lids */}
      <Path d="M 38 53 Q 43 51 48 53" stroke="#1a0f0a" strokeWidth="1.5" fill="none" />
      <Path d="M 52 53 Q 57 51 62 53" stroke="#1a0f0a" strokeWidth="1.5" fill="none" />
      {/* Nose */}
      <Ellipse cx="50" cy="62" rx="2.2" ry="1.4" fill="#7A4820" />
      {/* Soft, knowing smile */}
      <Path d="M 44 68 Q 50 72 56 68" stroke="#5A2C10" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Subtle earring — crescent */}
      <Path d="M 31 61 Q 28 65 31 69" stroke="#9ACCE8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Path d="M 69 61 Q 72 65 69 69" stroke="#9ACCE8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

const PORTRAITS: Record<string, React.ComponentType<{ s: number }>> = {
  '1': NgoziFace,
  '2': MarciaFace,
  '3': DeniseFace,
  '4': FatouFace,
  '5': CarmenFace,
  '6': AmaraFace,
  '7': SalmaFace,
};

export default function AuntyPortrait({ auntyId, size = 56 }: AuntyPortraitProps) {
  const Portrait = PORTRAITS[auntyId];
  if (!Portrait) return null;
  return <Portrait s={size} />;
}
