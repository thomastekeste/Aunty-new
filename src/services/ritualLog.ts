/**
 * ritualLog — Persistent ritual completion and streak tracking.
 *
 * Single source of truth for whether each day's ritual was completed or skipped.
 * Persisted to AsyncStorage under `ritual_log_v1`.
 *
 * Streak rule: completed OR skipped counts as "showed up". A missed day breaks it.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ritual_log_v1';

export type RitualLogEntry = {
  date: string;        // 'YYYY-MM-DD'
  completed: boolean;
  skipped?: boolean;
  skipReason?: string; // 'traveling' | 'busy' | 'not-feeling-it'
  completedAt?: string;
};

export type StreakResult = {
  current: number;  // consecutive days up to today
  longest: number;  // longest streak ever
};

export type WeekStats = {
  done: number;   // completed days in current Mon–Sun week
  total: number;  // calendar days passed in current week up to today
};

// ─── YYYY-MM-DD helper ─────────────────────────────────────────

export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── Persistence ───────────────────────────────────────────────

export async function getRitualLog(): Promise<Record<string, RitualLogEntry>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, RitualLogEntry>;
  } catch {
    return {};
  }
}

async function saveLog(log: Record<string, RitualLogEntry>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // silent — data stays in memory for the session
  }
}

export async function markRitualComplete(date: string = toDateKey()): Promise<void> {
  const log = await getRitualLog();
  log[date] = {
    date,
    completed: true,
    skipped: false,
    completedAt: new Date().toISOString(),
  };
  await saveLog(log);
}

export async function markRitualSkipped(
  date: string = toDateKey(),
  skipReason?: string,
): Promise<void> {
  const log = await getRitualLog();
  log[date] = {
    date,
    completed: false,
    skipped: true,
    skipReason,
  };
  await saveLog(log);
}

export async function clearRitualForDate(date: string): Promise<void> {
  const log = await getRitualLog();
  delete log[date];
  await saveLog(log);
}

// ─── Streak computation ────────────────────────────────────────

/**
 * A day "counts" toward the streak if completed or skipped (intentional action).
 * Missed days (no entry or entry with completed=false && skipped=false) break it.
 * Future days are ignored.
 */
export function computeStreak(log: Record<string, RitualLogEntry>): StreakResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function counts(dateStr: string): boolean {
    const e = log[dateStr];
    if (!e) return false;
    return e.completed === true || e.skipped === true;
  }

  // Walk backwards from today to find current streak
  let current = 0;
  const cursor = new Date(today);
  while (true) {
    const key = toDateKey(cursor);
    if (counts(key)) {
      current++;
    } else {
      // Allow today to be incomplete without breaking streak
      if (cursor.getTime() === today.getTime() && !log[key]) {
        // no entry yet for today — don't break streak
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
    // Safety: don't scan more than 365 days
    if (current > 365) break;
  }

  // Find longest streak across all log entries
  const dates = Object.keys(log).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const d of dates) {
    if (!counts(d)) { run = 0; prev = null; continue; }
    const cur = new Date(d);
    if (prev) {
      const diff = (cur.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        run++;
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = cur;
  }

  return { current, longest: Math.max(longest, current) };
}

// ─── Week stats ────────────────────────────────────────────────

/**
 * Returns count of completed+skipped days in the current Mon–Sun week,
 * up to and including today.
 */
export function computeWeekStats(log: Record<string, RitualLogEntry>): WeekStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find Monday of the current week
  const day = today.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  let done = 0;
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d > today) break;
    total++;
    const key = toDateKey(d);
    const e = log[key];
    if (e && (e.completed || e.skipped)) done++;
  }

  return { done, total };
}

// ─── Today's completion status ─────────────────────────────────

export function getTodayStatus(
  log: Record<string, RitualLogEntry>,
): 'completed' | 'skipped' | 'none' {
  const key = toDateKey();
  const e = log[key];
  if (!e) return 'none';
  if (e.completed) return 'completed';
  if (e.skipped) return 'skipped';
  return 'none';
}
