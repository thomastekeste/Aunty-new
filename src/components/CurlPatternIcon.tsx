/**
 * CurlPatternIcon — Accurate curl pattern SVGs matching the standard chart.
 *
 * 2a-2c: S-waves, loose to deep
 * 3a-3c: Loop spirals, loose to tight
 * 4a-4c: Zigzag coils, loose to dense
 *
 * Based on the standard curl type classification chart.
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { CurlType } from '../types';

interface Props {
  type: CurlType;
  size?: number;
  color?: string;
}

export function CurlPatternIcon({ type, size = 48, color = '#FEF8EC' }: Props) {
  const w = size;
  const h = size;
  const cx = w / 2; // center x

  const patterns: Record<CurlType, () => React.ReactNode> = {
    // ── Wavy: S-curves, increasing amplitude ──
    '2a': () => (
      <Path
        d={`M ${cx} ${h*0.05} C ${cx+3} ${h*0.15} ${cx-3} ${h*0.25} ${cx} ${h*0.35} C ${cx+3} ${h*0.45} ${cx-3} ${h*0.55} ${cx} ${h*0.65} C ${cx+3} ${h*0.75} ${cx-3} ${h*0.85} ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2} fill="none" strokeLinecap="round"
      />
    ),
    '2b': () => (
      <Path
        d={`M ${cx} ${h*0.05} C ${cx+6} ${h*0.12} ${cx-6} ${h*0.22} ${cx} ${h*0.3} C ${cx+6} ${h*0.38} ${cx-6} ${h*0.48} ${cx} ${h*0.55} C ${cx+6} ${h*0.62} ${cx-6} ${h*0.72} ${cx} ${h*0.8} C ${cx+6} ${h*0.88} ${cx-3} ${h*0.92} ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2} fill="none" strokeLinecap="round"
      />
    ),
    '2c': () => (
      <Path
        d={`M ${cx} ${h*0.05} C ${cx+10} ${h*0.1} ${cx-10} ${h*0.2} ${cx} ${h*0.28} C ${cx+10} ${h*0.35} ${cx-10} ${h*0.45} ${cx} ${h*0.52} C ${cx+10} ${h*0.6} ${cx-10} ${h*0.7} ${cx} ${h*0.78} C ${cx+10} ${h*0.85} ${cx-5} ${h*0.92} ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
    ),

    // ── Curly: Loop spirals, tightening ──
    '3a': () => (
      <Path
        d={`M ${cx-4} ${h*0.05} C ${cx+8} ${h*0.08} ${cx+8} ${h*0.18} ${cx-4} ${h*0.2} C ${cx-12} ${h*0.22} ${cx-8} ${h*0.32} ${cx} ${h*0.33} C ${cx+10} ${h*0.34} ${cx+8} ${h*0.46} ${cx-4} ${h*0.48} C ${cx-12} ${h*0.5} ${cx-8} ${h*0.6} ${cx} ${h*0.61} C ${cx+10} ${h*0.62} ${cx+8} ${h*0.74} ${cx-4} ${h*0.76} C ${cx-12} ${h*0.78} ${cx-8} ${h*0.88} ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2} fill="none" strokeLinecap="round"
      />
    ),
    '3b': () => (
      <Path
        d={`M ${cx-3} ${h*0.05} C ${cx+8} ${h*0.06} ${cx+8} ${h*0.14} ${cx-3} ${h*0.16} C ${cx-10} ${h*0.18} ${cx-8} ${h*0.24} ${cx+2} ${h*0.25} C ${cx+10} ${h*0.26} ${cx+8} ${h*0.34} ${cx-3} ${h*0.36} C ${cx-10} ${h*0.38} ${cx-8} ${h*0.44} ${cx+2} ${h*0.45} C ${cx+10} ${h*0.46} ${cx+8} ${h*0.54} ${cx-3} ${h*0.56} C ${cx-10} ${h*0.58} ${cx-8} ${h*0.64} ${cx+2} ${h*0.65} C ${cx+10} ${h*0.66} ${cx+8} ${h*0.74} ${cx-3} ${h*0.76} C ${cx-10} ${h*0.78} ${cx-8} ${h*0.84} ${cx+2} ${h*0.85} C ${cx+8} ${h*0.86} ${cx+4} ${h*0.94} ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
    ),
    '3c': () => (
      <Path
        d={`M ${cx-2} ${h*0.05} C ${cx+6} ${h*0.06} ${cx+6} ${h*0.1} ${cx-2} ${h*0.12} C ${cx-8} ${h*0.14} ${cx-6} ${h*0.18} ${cx+2} ${h*0.19} C ${cx+8} ${h*0.2} ${cx+6} ${h*0.24} ${cx-2} ${h*0.26} C ${cx-8} ${h*0.28} ${cx-6} ${h*0.32} ${cx+2} ${h*0.33} C ${cx+8} ${h*0.34} ${cx+6} ${h*0.38} ${cx-2} ${h*0.4} C ${cx-8} ${h*0.42} ${cx-6} ${h*0.46} ${cx+2} ${h*0.47} C ${cx+8} ${h*0.48} ${cx+6} ${h*0.52} ${cx-2} ${h*0.54} C ${cx-8} ${h*0.56} ${cx-6} ${h*0.6} ${cx+2} ${h*0.61} C ${cx+8} ${h*0.62} ${cx+6} ${h*0.66} ${cx-2} ${h*0.68} C ${cx-8} ${h*0.7} ${cx-6} ${h*0.74} ${cx+2} ${h*0.75} C ${cx+8} ${h*0.76} ${cx+6} ${h*0.8} ${cx-2} ${h*0.82} C ${cx-8} ${h*0.84} ${cx-6} ${h*0.88} ${cx+2} ${h*0.89} C ${cx+6} ${h*0.9} ${cx+3} ${h*0.94} ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
    ),

    // ── Coily: Zigzag, increasing density ──
    '4a': () => (
      <Path
        d={`M ${cx} ${h*0.05} L ${cx+6} ${h*0.12} L ${cx-6} ${h*0.19} L ${cx+6} ${h*0.26} L ${cx-6} ${h*0.33} L ${cx+6} ${h*0.4} L ${cx-6} ${h*0.47} L ${cx+6} ${h*0.54} L ${cx-6} ${h*0.61} L ${cx+6} ${h*0.68} L ${cx-6} ${h*0.75} L ${cx+6} ${h*0.82} L ${cx-3} ${h*0.89} L ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
    ),
    '4b': () => (
      <Path
        d={`M ${cx} ${h*0.05} L ${cx+7} ${h*0.1} L ${cx-7} ${h*0.15} L ${cx+7} ${h*0.2} L ${cx-7} ${h*0.25} L ${cx+7} ${h*0.3} L ${cx-7} ${h*0.35} L ${cx+7} ${h*0.4} L ${cx-7} ${h*0.45} L ${cx+7} ${h*0.5} L ${cx-7} ${h*0.55} L ${cx+7} ${h*0.6} L ${cx-7} ${h*0.65} L ${cx+7} ${h*0.7} L ${cx-7} ${h*0.75} L ${cx+7} ${h*0.8} L ${cx-7} ${h*0.85} L ${cx+4} ${h*0.9} L ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
    ),
    '4c': () => (
      <Path
        d={`M ${cx} ${h*0.05} L ${cx+7} ${h*0.08} L ${cx-7} ${h*0.12} L ${cx+7} ${h*0.15} L ${cx-7} ${h*0.19} L ${cx+7} ${h*0.22} L ${cx-7} ${h*0.26} L ${cx+7} ${h*0.29} L ${cx-7} ${h*0.33} L ${cx+7} ${h*0.36} L ${cx-7} ${h*0.4} L ${cx+7} ${h*0.43} L ${cx-7} ${h*0.47} L ${cx+7} ${h*0.5} L ${cx-7} ${h*0.54} L ${cx+7} ${h*0.57} L ${cx-7} ${h*0.61} L ${cx+7} ${h*0.64} L ${cx-7} ${h*0.68} L ${cx+7} ${h*0.71} L ${cx-7} ${h*0.75} L ${cx+7} ${h*0.78} L ${cx-7} ${h*0.82} L ${cx+7} ${h*0.85} L ${cx-7} ${h*0.89} L ${cx+4} ${h*0.92} L ${cx} ${h*0.95}`}
        stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
    ),
  };

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {patterns[type]?.()}
    </Svg>
  );
}
