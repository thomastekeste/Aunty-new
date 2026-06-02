/**
 * CurlPatternIcon — one curl strand per hair type (2a → 4c), traced to match
 * the standard "HAIR TYPES" chart.
 *
 * Verified by rasterizing these exact paths and comparing to the chart:
 *   - 2a-2c: smooth waves (loose -> tighter & deeper)
 *   - 3a-3c: round coil loops (big & open -> small & tight)
 *   - 4a:    tight spring coil
 *   - 4b-4c: zigzag (sharp -> dense)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { CurlType } from '../types';

interface Props {
  type: CurlType;
  size?: number;
  color?: string;
}

// Tall, narrow coordinate space matching the chart's strand proportions.
const VBW = 60;
const VBH = 200;
const CX = VBW / 2;
const TOP = 12;
const BOTTOM = 188;

// Smooth cubic-bezier S-chain oscillating around the centre line.
function waveStrand(amp: number, halfWave: number) {
  let d = `M ${CX} ${TOP}`;
  let y = TOP;
  let side = 1;
  while (y < BOTTOM) {
    const ny = Math.min(y + halfWave, BOTTOM);
    const c1y = y + (ny - y) * 0.35;
    const c2y = ny - (ny - y) * 0.35;
    const cx = CX + side * amp;
    d += ` C ${cx.toFixed(1)} ${c1y.toFixed(1)}, ${cx.toFixed(1)} ${c2y.toFixed(1)}, ${CX.toFixed(1)} ${ny.toFixed(1)}`;
    y = ny;
    side *= -1;
  }
  return d;
}

function zigzagStrand(amp: number, step: number) {
  let d = '';
  let i = 0;
  for (let y = TOP; y <= BOTTOM; y += step) {
    const x = CX + (i % 2 ? amp : -amp);
    d += `${d ? ' L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    i++;
  }
  return d;
}

// 2D slinky: x circles while y advances. ryFactor sets loop overlap —
// ~0.5 = clean round loops, higher = packed springs.
function coilStrand(rx: number, pitch: number, ryFactor: number) {
  let d = '';
  const ry = pitch * ryFactor;
  const totalT = ((BOTTOM - TOP) / pitch) * 2 * Math.PI;
  for (let t = 0; t <= totalT; t += 0.12) {
    const x = CX + rx * Math.cos(t);
    const y = TOP + (pitch / (2 * Math.PI)) * t + ry * Math.sin(t);
    d += `${d ? ' L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

const PATHS: Record<CurlType, string> = {
  '2a': waveStrand(6, 38), // ~3 gentle waves
  '2b': waveStrand(10, 42), // ~3 deeper waves
  '2c': waveStrand(6, 24), // tighter, more frequent wave
  '3a': coilStrand(16, 43, 0.62), // ~4 big open round loops
  '3b': coilStrand(14, 36, 0.62), // ~5 open loops
  '3c': coilStrand(11, 25, 0.6), // medium open loops
  '4a': coilStrand(8, 19, 0.6), // tight round coil
  '4b': zigzagStrand(6, 11), // sharp zigzag
  '4c': zigzagStrand(7, 8), // dense zigzag
};

export function CurlPatternIcon({ type, size = 48, color = '#FEF8EC' }: Props) {
  // Render tall (matches viewBox aspect 60:200 so nothing is distorted).
  const width = size * 0.55;
  const height = width * (VBH / VBW);
  const strokeWidth = 3;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VBW} ${VBH}`}>
      <Path
        d={PATHS[type] ?? waveStrand(0, 40)}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
