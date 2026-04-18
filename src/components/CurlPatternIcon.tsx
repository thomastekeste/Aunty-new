/**
 * CurlPatternIcon — Drawn curl strands using parametric helix math.
 *
 * The core formula:
 *   x(t) = cx + Rx · sin(t)
 *   y(t) = top + Ry + (range · t / 2πN) − Ry · cos(t)
 *
 * When Ry > (range/N) / 2π  the y-velocity reverses → the path self-
 * intersects and creates genuine crossing loops (a helix in 2D).
 *
 * loopFactor = Ry / advance_per_loop
 *   0          → pure S-wave (2a-2c)
 *   0.25-0.40  → tight spring coil (4a-4c)
 *   0.50-0.65  → open crossing loops (3a-3c)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { CurlType } from '../types';

interface Config {
  loops: number;    // number of full loops / waves
  Rx: number;       // horizontal amplitude as fraction of viewBox width
  lf: number;       // loopFactor  (0 = sine, >0.16 = closed loops)
  sw: number;       // stroke width
}

const C: Record<CurlType, Config> = {
  '2a': { loops: 1.5, Rx: 0.09, lf: 0.00, sw: 2.2 },
  '2b': { loops: 2.5, Rx: 0.17, lf: 0.00, sw: 2.2 },
  '2c': { loops: 3.0, Rx: 0.25, lf: 0.00, sw: 2.4 },

  '3a': { loops: 4,  Rx: 0.40, lf: 0.62, sw: 2.6 },
  '3b': { loops: 6,  Rx: 0.34, lf: 0.55, sw: 2.6 },
  '3c': { loops: 8,  Rx: 0.28, lf: 0.48, sw: 2.6 },

  '4a': { loops: 11, Rx: 0.27, lf: 0.35, sw: 2.4 },
  '4b': { loops: 14, Rx: 0.23, lf: 0.28, sw: 2.4 },
  '4c': { loops: 18, Rx: 0.19, lf: 0.22, sw: 2.4 },
};

/** Build a polyline SVG path string for a helical strand. */
function buildStrand(VW: number, VH: number, cfg: Config, steps = 220): string {
  const { loops, Rx: RxFrac, lf } = cfg;
  const cx    = VW / 2;
  const pad   = VH * 0.03;
  const top   = pad;
  const range = VH - pad * 2;

  const Rx      = VW * RxFrac;
  const advance = range / loops;          // y-advance per full loop
  const Ry      = advance * lf;           // y-oscillation amplitude

  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * loops;
    const x = cx + Rx * Math.sin(t);
    // offset by +Ry so y(0) = top exactly
    const y = top + Ry + (range * i / steps) - Ry * Math.cos(t);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(' ');
}

interface Props {
  type: CurlType;
  /** Height of the rendered strand. Width is auto-calculated from aspect. */
  size?: number;
  color?: string;
}

// ViewBox is 50 wide × 180 tall (narrow portrait, like a real strand)
const VW = 50;
const VH = 180;
const ASPECT = VW / VH;

export function CurlPatternIcon({ type, size = 90, color = '#FEF8EC' }: Props) {
  const cfg = C[type];
  const h = size;
  const w = Math.round(h * ASPECT);

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}>
      <Path
        d={buildStrand(VW, VH, cfg)}
        stroke={color}
        strokeWidth={cfg.sw}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
