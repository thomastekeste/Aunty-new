/**
 * Shared motion pacing for onboarding narrative screens.
 * Keeps reveal cadence and auto-advance behavior consistent.
 */

export const onboardingMotion = {
  wordStaggerMs: 50,
  linePauseMs: 450,
  shortPauseMs: 350,
  autoAdvanceMs: 750,
} as const;
