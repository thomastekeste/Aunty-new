/**
 * CurlPatternIcon — Curl pattern illustrations matching the standard chart.
 *
 * Visual approach mirrors the reference texture chart:
 *   2a-2c → smooth S-waves, low → high amplitude
 *   3a-3c → stacked oval loops (phone-cord coil), loose → tight
 *   4a    → small dense coils (tight spring)
 *   4b    → angular Z-pattern (sharp zigzag)
 *   4c    → micro zigzag (high frequency, low amplitude — shrinkage)
 *
 * Each variant renders inside a square viewport and breathes with ~6% top/bottom
 * padding so it sits comfortably in a card without crowding label text.
 */

import React from 'react';
import Svg, { Path, Ellipse, G } from 'react-native-svg';
import type { CurlType } from '../types';

interface Props {
  type: CurlType;
  size?: number;
  color?: string;
  /** Override stroke weight; defaults to size * 0.05 (clamped 1.6 - 3). */
  strokeWidth?: number;
}

export function CurlPatternIcon({
  type,
  size = 48,
  color = '#FEF8EC',
  strokeWidth,
}: Props) {
  const w = size;
  const h = size;
  const cx = w / 2;
  const sw = strokeWidth ?? Math.min(3, Math.max(1.6, size * 0.05));

  /** Top / bottom padding so strands don't touch the card edges. */
  const top = h * 0.06;
  const bottom = h * 0.94;
  const range = bottom - top;

  // ── Coil: stack of overlapping ovals (phone-cord look) ─────────
  const coil = (
    count: number,
    ovalW: number,
    overlapPct = 0.35,
    stroke = sw,
  ) => {
    const ovalH = range / (count - (count - 1) * overlapPct);
    const stride = ovalH * (1 - overlapPct);
    const startCy = top + ovalH / 2;
    return (
      <G>
        {Array.from({ length: count }, (_, i) => (
          <Ellipse
            key={i}
            cx={cx}
            cy={startCy + i * stride}
            rx={ovalW / 2}
            ry={ovalH / 2}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
          />
        ))}
      </G>
    );
  };

  // ── Sine wave for 2a-2c ────────────────────────────────────────
  const wave = (amplitude: number, periods: number, stroke = sw) => {
    const steps = 80;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = top + t * range;
      const x = cx + Math.sin(t * Math.PI * 2 * periods) * amplitude;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return (
      <Path
        d={pts.join(' ')}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  // ── Sharp zigzag for 4b / 4c ───────────────────────────────────
  const zigzag = (amplitude: number, segments: number, stroke = sw) => {
    const stepY = range / segments;
    const pts: string[] = [`M ${cx.toFixed(2)} ${top.toFixed(2)}`];
    for (let i = 1; i <= segments; i++) {
      const x = cx + (i % 2 === 0 ? -amplitude : amplitude);
      const y = top + i * stepY;
      pts.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    pts.push(`L ${cx.toFixed(2)} ${bottom.toFixed(2)}`);
    return (
      <Path
        d={pts.join(' ')}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="miter"
        strokeMiterlimit={4}
      />
    );
  };

  const patterns: Record<CurlType, () => React.ReactNode> = {
    // Wavy: gentle → deep S-curves
    '2a': () => wave(w * 0.05, 3.5),
    '2b': () => wave(w * 0.10, 3.5),
    '2c': () => wave(w * 0.16, 3.5),

    // Curly: open → tight phone-cord coils
    '3a': () => coil(5, w * 0.58, 0.32),
    '3b': () => coil(7, w * 0.48, 0.36),
    '3c': () => coil(9, w * 0.40, 0.38),

    // Coily: dense small coil
    '4a': () => coil(12, w * 0.34, 0.42),

    // Coily: zigzag patterns
    '4b': () => zigzag(w * 0.20, 9),
    '4c': () => zigzag(w * 0.14, 16),
  };

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {patterns[type]?.()}
    </Svg>
  );
}
