import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export function BackIcon({ color = '#180800', size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 5l-7 7 7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronUpIcon({ color = '#180800', size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 15l-6-6-6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronDownIcon({ color = '#180800', size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CameraIcon({ color = '#180800', size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function UploadIcon({ color = '#180800', size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19V5M5 12l7-7 7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ color = '#180800', size = 20, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeIcon({ color = '#180800', size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M9 21V12h6v9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RoutineIcon({ color = '#180800', size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M9 7h6M9 11h6M9 15h4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProgressIcon({ color = '#180800', size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProductsIcon({ color = '#180800', size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 22c0 0 4-8 12-10S22 2 22 2s-2 10-10 12S2 22 2 22z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Hair-care & cultural iconography ─────────────────────────────────

/** Spiral curl — Definition goal */
export function CurlIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20c-4 0-7-3-7-7s3-7 7-7 6 2.5 6 5.5-2.5 5-5.5 5c-2.5 0-4.5-1.5-4.5-4 0-2 1.5-3.5 3.5-3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 9c1.5 0 2.5 1 2.5 2.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Water drop — Moisture */
export function DropIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C12 3 5 11 5 15.5a7 7 0 0014 0C19 11 12 3 12 3z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 16.5a3 3 0 003-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
}

/** Upward arrow with root — Length/Growth */
export function GrowthIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M7 10l5-5 5 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 20c0-3 4-5 4-5s4 2 4 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </Svg>
  );
}

/** Expanding wave — Volume */
export function VolumeIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 17c2-4 4-6 6-6s4 4 6 4 4-6 8-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M4 13c1.5-3 3-4 4.5-4s3 3 4.5 3 3-4 6-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** Leaf — Health */
export function LeafIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22V12M12 12C12 12 20 9 20 3c0 0-8 0-12 5s0 14 4 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12c0 0-8-1-8 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
}

/** Crown — Protective style / royalty / "best" */
export function CrownIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 18l3-9 4 6 3-10 3 10 4-6 3 9H2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M2 18h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Scissors — Big chop */
export function ScissorsIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="6" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Flame — Heat */
export function FlameIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c0 0-6 6-6 12a6 6 0 0012 0c0-4-3-7-3-7s-1 3-3 3-2-2-2-4c0 0 0 0 2-4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** No flame — Heat never */
export function NoHeatIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4c-2 3-2 5-2 7a4 4 0 008 0c0-3-2-5-2-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.4}
      />
      <Path d="M4 4l16 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Frizz — spreading wavy lines */
export function FrizzIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 12c-2-2-4-1-6 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 12c2-2 4-1 6 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 12c-1-3 0-5 1-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 12c0 3-1 5-2 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 12c-3-1-5 0-7 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 12c2 2 1 4-1 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Breakage — strand with snap */
export function BreakageIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6c2 2 3 4 3 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M18 18c-2-2-3-4-3-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 12l2-2 2 2 2-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Shrinkage — compress arrows */
export function ShrinkageIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v4M12 15v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 8l3 3 3-3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 16l3-3 3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />
    </Svg>
  );
}

/** Buildup — stacked layers */
export function BuildupIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 17l8 4 8-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 12l8 4 8-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 7l8 4 8-4-8-4-8 4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Scalp lightning — scalp concerns */
export function ScalpIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8 2 5 5 5 9c0 2.5 1.5 4.5 3 5.5V18h8v-3.5c1.5-1 3-3 3-5.5 0-4-3-7-7-7z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 22h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M13 6l-2 4h3l-2 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Checkmark shield — no concerns / all clear */
export function ShieldCheckIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L4 7v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V7L12 3z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Sun/dryness — scalp dry / dryness failure */
export function DryIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Snowflake — dandruff */
export function SnowflakeIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2M6 12l-2-2M6 12l-2 2M18 12l2-2M18 12l2 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Thinning — fading lines */
export function ThinningIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5c0 8 0 11 4 14" stroke={color} strokeWidth={strokeWidth * 1.2} strokeLinecap="round" />
      <Path d="M12 5c0 8 0 11 2 14" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" opacity={0.7} />
      <Path d="M15 6c0 7 0 10 1 13" stroke={color} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

/** Oil drops — oiliness */
export function OilIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 8C12 8 8 12 8 15a4 4 0 008 0c0-3-4-7-4-7z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 5c0 0-2 2-2 3.5a2.5 2.5 0 005 0C10 7 7 5 7 5z" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      <Path d="M17 4c0 0-1.5 1.5-1.5 2.5a1.5 1.5 0 003 0C18.5 5.5 17 4 17 4z" stroke={color} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
    </Svg>
  );
}

/** Hourglass — time */
export function HourglassIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M5 21h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M5 3l7 9-7 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 3l-7 9 7 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Timer / bolt — quick */
export function QuickIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 9v4l3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 2h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Calendar single — weekly */
export function CalWeekIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3 9h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 2v4M16 2v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M7 14h2M11 14h2M15 14h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Calendar relaxed — bi-weekly / monthly */
export function CalMonthIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3 9h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 2v4M16 2v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="16" r="3" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Loose wave — less frequent / relaxed */
export function LooseIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

/** Natural strand — never relaxed */
export function NaturalIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21C12 21 5 16 5 10a7 7 0 0114 0c0 6-7 11-7 11z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 10c0 0 0-4 3-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** Chemical flask — currently relaxed */
export function ChemicalIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 3v8l-5 9h16l-5-9V3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 3h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M6 16h12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

/** Transition arrow — growing out */
export function TransitionIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M14 7l5 5-5 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 7c0 0 0 3 3 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** Braid pattern — protective styling */
export function BraidIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 3c0 0 3 3 3 5s-3 4-3 6 3 4 3 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M15 3c0 0-3 3-3 5s3 4 3 6-3 4-3 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 8c2 1 4 1 6 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.5} />
      <Path d="M9 14c2 1 4 1 6 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** No definition — flat waves */
export function NoDefinitionIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" stroke={color} strokeWidth={strokeWidth * 0.6} strokeLinecap="round" opacity={0.4} />
      <Path d="M3 14c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" stroke={color} strokeWidth={strokeWidth * 0.6} strokeLinecap="round" opacity={0.4} />
      <Path d="M5 4l14 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.6} />
    </Svg>
  );
}

/** Crescent moon — rest day */
export function MoonIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Location pin — city */
export function LocationPinIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Ruler / measure — density ponytail test */
export function RulerIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="8" width="20" height="8" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M6 8v4M9 8v3M12 8v4M15 8v3M18 8v4" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
    </Svg>
  );
}

/** Balance / medium — neutral state */
export function BalanceIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M5 8l-3 6h6L5 8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 8l-3 6h6l-3-6z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 21h10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Strength / protein — elasticity */
export function StrengthIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4h2v4H6zM16 4h2v4h-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path d="M4 6h4M16 6h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 8v8M16 8v8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 12h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M6 14h2v4H6zM16 14h2v4h-2z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M4 16h4M16 16h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/** Float up — porosity strand floating */
export function FloatUpIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 19V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M7 12l5-5 5 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 20h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.4} />
      <Path d="M5 4h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

/** Float middle — porosity strand in middle */
export function FloatMiddleIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 4h14M5 20h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.35} />
      <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.35} />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Sink down — porosity strand sinking */
export function SinkDownIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M7 12l5 5 5-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 4h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.4} />
      <Path d="M5 20h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

/** Stretch — elasticity good stretch */
export function StretchIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M4 12l3-3M4 12l3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 12l-3-3M20 12l-3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

/** Water hardness wave */
export function WaveIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.45} />
    </Svg>
  );
}

/** Rock / mineral — very hard water */
export function MineralIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L4 9l2 10h12l2-10L12 3z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M4 9h16M8 9l2 10M16 9l-2 10M12 3l2 6M12 3l-2 6" stroke={color} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** Warning / hard water */
export function HardWaterIcon({ color = '#180800', size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 9C12 9 7 14 7 17a5 5 0 0010 0c0-3-5-8-5-8z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 14v2" stroke={color} strokeWidth={strokeWidth * 1.2} strokeLinecap="round" />
      <Circle cx="12" cy="18" r="0.8" fill={color} />
    </Svg>
  );
}
