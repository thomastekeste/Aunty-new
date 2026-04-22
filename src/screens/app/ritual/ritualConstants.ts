/**
 * Shared ritual calendar data: weekly pattern, type colors, step copy.
 */
import { Dimensions } from 'react-native';

import { colors, spacing } from '../../../constants/theme';
import type { RitualDayType } from '../../../types';

const { width: SCREEN_W } = Dimensions.get('window');
export const RITUAL_GRID_PAD = spacing.lg;
export const RITUAL_GAP = 6;
export const RITUAL_CELL_SIZE = Math.floor(
  (SCREEN_W - RITUAL_GRID_PAD * 2 - RITUAL_GAP * 6) / 7,
);

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKLY_PATTERN: Record<number, { type: RitualDayType; label: string }> = {
  0: { type: 'rest', label: 'Rest' },
  1: { type: 'wash', label: 'Wash' },
  2: { type: 'scalp', label: 'Scalp' },
  3: { type: 'protect', label: 'Protect' },
  4: { type: 'refresh', label: 'Refresh' },
  5: { type: 'style', label: 'Style' },
  6: { type: 'protein', label: 'Strength' },
};

export const TYPE_COLORS: Record<RitualDayType, string> = {
  wash: colors.jewel.amber,
  style: colors.jewel.rose,
  refresh: colors.jewel.plum,
  rest: colors.jewel.teal,
  scalp: colors.jewel.emerald,
  protein: colors.jewel.sienna,
  protect: colors.jewel.indigo,
};

export const TYPE_GRADIENTS: Record<RitualDayType, readonly [string, string]> = {
  wash: ['#D4A04A', '#B8862E'],
  style: ['#C2456E', '#9E3058'],
  refresh: ['#7B3F6B', '#5C2A4E'],
  rest: ['#2A7B7B', '#1A5C5C'],
  scalp: ['#1A7A4A', '#0A5C30'],
  protein: ['#B85C2A', '#8A3A10'],
  protect: ['#3D5A99', '#2A4070'],
};

export const TYPE_DETAILS: Record<RitualDayType, { purpose: string; time: string; steps: string[] }> = {
  wash: { purpose: 'Deep cleanse & moisture reset', time: '45 min', steps: ['Pre-poo with oil', 'Sulfate-free shampoo', 'Deep condition under cap', 'Rinse, detangle, seal'] },
  style: { purpose: 'Define & celebrate your curls', time: '25 min', steps: ['Take down style', 'Fluff & shape', 'Define with gel', 'Diffuse or air dry'] },
  refresh: { purpose: 'Mid-week touch-up', time: '10 min', steps: ['Light mist', 'Re-twist edges', 'Seal ends with oil'] },
  rest: { purpose: 'Let your hair breathe', time: '5 min', steps: ['Gentle scalp massage', 'Refresh edges if needed'] },
  scalp: { purpose: 'Nourish the roots', time: '15 min', steps: ['Apply scalp oil blend', 'Firm circular massage'] },
  protein: { purpose: 'Rebuild & strengthen', time: '20 min', steps: ['Protein treatment on lengths', 'Rinse & light condition'] },
  protect: { purpose: 'Low-manipulation styling', time: '30 min', steps: ['Moisturize sections', 'Twist or braid', 'Edge care & silk wrap'] },
};

export function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}
