import { OnboardingStackParamList, OnboardingPhase } from '@/types';

/**
 * Phase-based routing configuration for onboarding.
 * Screens within each phase are listed in navigation order.
 *
 * Phase structure:
 *   welcome    → Splash, MeetCouncil
 *   know-you   → Name, SignUp, Location
 *   hair       → PorosityTest (HairTestSuite), PhotoUpload, CurlTypeReveal
 *   story      → Marcia phase: WashFrequency→HeatUse→RelaxerHistory→ScalpConcerns
 *                Ngozi phase:  PrimaryGoal→Failures→ProtectiveStyling
 *                Fatou phase:  TimeAvailable
 *   reveal     → CouncilConvening, CouncilSpeaks, Routine, SendOff
 */

export type OnboardingScreenName = keyof OnboardingStackParamList;

export interface PhaseConfig {
  id: OnboardingPhase;
  label: string;
  icon: string;
  screens: OnboardingScreenName[];
  auntyId?: string;
  timeEstimateMinutes: number;
}

export const ONBOARDING_PHASES: Record<OnboardingPhase, PhaseConfig> = {
  'welcome': {
    id: 'welcome',
    label: 'Meet',
    icon: '👋',
    screens: ['Splash', 'MeetCouncil'],
    timeEstimateMinutes: 2,
  },
  'know-you': {
    id: 'know-you',
    label: 'Know You',
    icon: '📝',
    screens: ['Name', 'SignUp', 'Location'],
    timeEstimateMinutes: 3,
  },
  'hair': {
    id: 'hair',
    label: 'Your Hair',
    icon: '🔬',
    screens: ['PorosityTest', 'PhotoUpload', 'CurlTypeReveal'],
    timeEstimateMinutes: 6,
  },
  'story': {
    id: 'story',
    label: 'Build',
    icon: '🎯',
    // Grouped by aunty phase:
    // Marcia (Root Whisperer): wash → heat → relaxer history → scalp
    // Ngozi (Moisture Authority): goal → failures → protective styling
    // Fatou (Technician): time available
    screens: [
      'WashFrequency',
      'HeatUse',
      'RelaxerHistory',
      'ScalpConcerns',
      'PrimaryGoal',
      'Failures',
      'ProtectiveStyling',
      'TimeAvailable',
    ],
    timeEstimateMinutes: 8,
  },
  'reveal': {
    id: 'reveal',
    label: 'Reveal',
    icon: '🎉',
    screens: ['CouncilConvening', 'CouncilSpeaks', 'Routine', 'SendOff'],
    timeEstimateMinutes: 3,
  },
};

/** Aunty assignments per sub-phase within the story phase */
export const STORY_PHASE_AUNTIES: Record<string, string> = {
  WashFrequency: '2',    // Marcia
  HeatUse: '2',          // Marcia
  RelaxerHistory: '2',   // Marcia
  ScalpConcerns: '2',    // Marcia
  PrimaryGoal: '1',      // Ngozi
  Failures: '1',         // Ngozi
  ProtectiveStyling: '1', // Ngozi
  TimeAvailable: '4',    // Fatou
};

/**
 * Get the phase that contains a specific screen
 */
export function getPhaseByScreen(screenName: OnboardingScreenName): OnboardingPhase | null {
  for (const [phaseId, config] of Object.entries(ONBOARDING_PHASES)) {
    if (config.screens.includes(screenName)) {
      return phaseId as OnboardingPhase;
    }
  }
  return null;
}

/**
 * Get all screens in a specific phase
 */
export function getPhaseScreens(phaseId: OnboardingPhase): OnboardingScreenName[] {
  return ONBOARDING_PHASES[phaseId].screens;
}

/**
 * Get the next screen in the phase, or first screen of next phase
 */
export function getNextScreen(
  currentScreen: OnboardingScreenName,
  currentPhase: OnboardingPhase
): { screen: OnboardingScreenName; phase: OnboardingPhase } | null {
  const phaseConfig = ONBOARDING_PHASES[currentPhase];
  const currentIndex = phaseConfig.screens.indexOf(currentScreen);

  if (currentIndex < phaseConfig.screens.length - 1) {
    return {
      screen: phaseConfig.screens[currentIndex + 1],
      phase: currentPhase,
    };
  }

  const phases: OnboardingPhase[] = ['welcome', 'know-you', 'hair', 'story', 'reveal'];
  const currentPhaseIndex = phases.indexOf(currentPhase);
  if (currentPhaseIndex < phases.length - 1) {
    const nextPhase = phases[currentPhaseIndex + 1];
    return {
      screen: ONBOARDING_PHASES[nextPhase].screens[0],
      phase: nextPhase,
    };
  }

  return null;
}

/**
 * Calculate completion percentage based on current screen
 */
export function getCompletionPercentage(currentScreen: OnboardingScreenName): number {
  const allScreens = Object.values(ONBOARDING_PHASES)
    .flatMap(phase => phase.screens);

  const currentIndex = allScreens.indexOf(currentScreen);
  if (currentIndex === -1) return 0;

  return Math.round(((currentIndex + 1) / allScreens.length) * 100);
}

/**
 * Calculate time remaining based on current phase
 */
export function getTimeRemaining(currentPhase: OnboardingPhase): number {
  const phases: OnboardingPhase[] = ['welcome', 'know-you', 'hair', 'story', 'reveal'];
  const currentIndex = phases.indexOf(currentPhase);

  let totalTime = 0;
  for (let i = currentIndex; i < phases.length; i++) {
    totalTime += ONBOARDING_PHASES[phases[i]].timeEstimateMinutes;
  }

  return totalTime;
}

/**
 * Get the milestone percentage nearest to the current screen, if crossing a boundary
 * Returns 25, 50, or 75 if the user just crossed that threshold, else null
 */
export function checkMilestone(
  prevScreen: OnboardingScreenName,
  currentScreen: OnboardingScreenName
): 25 | 50 | 75 | null {
  const prev = getCompletionPercentage(prevScreen);
  const curr = getCompletionPercentage(currentScreen);

  for (const milestone of [25, 50, 75] as const) {
    if (prev < milestone && curr >= milestone) {
      return milestone;
    }
  }
  return null;
}

/**
 * Phase-specific UI configuration
 */
export const PHASE_UI_CONFIG: Record<OnboardingPhase, {
  primaryAuntyId?: string;
  backgroundColor?: string;
}> = {
  'welcome': { backgroundColor: undefined },
  'know-you': { backgroundColor: undefined },
  'hair': { backgroundColor: undefined },
  'story': { primaryAuntyId: '2' }, // Starts with Marcia
  'reveal': { backgroundColor: undefined },
};
