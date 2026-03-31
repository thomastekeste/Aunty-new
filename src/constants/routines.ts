import { DailyRoutine, CouncilResponse } from '@/types';

// Fallback routines when Gemini is unavailable
export const DEFAULT_ROUTINE: DailyRoutine = {
  wash_day: {
    day_name: 'Wash Day',
    hosted_by_aunty_id: '1',
    purpose: 'Deep cleanse and hydrate',
    estimated_time_minutes: 60,
    steps: [
      {
        step_number: 1,
        name: 'Pre-poo treatment',
        description: 'Apply oil or conditioner to dry hair for 15-20 minutes to protect strands.',
        duration_minutes: 20,
        product_category: 'oil',
      },
      {
        step_number: 2,
        name: 'Shampoo',
        description: 'Cleanse scalp and hair gently using lukewarm water.',
        duration_minutes: 10,
        product_category: 'shampoo',
      },
      {
        step_number: 3,
        name: 'Deep condition',
        description: 'Apply deep conditioning treatment and leave for 15-20 minutes under heat if possible.',
        duration_minutes: 20,
        product_category: 'conditioner',
      },
      {
        step_number: 4,
        name: 'Rinse and detangle',
        description: 'Rinse thoroughly, detangle gently with fingers or wide-tooth comb while wet.',
        duration_minutes: 10,
        product_category: 'leave_in',
      },
    ],
  },
  style_day: {
    day_name: 'Style Day',
    hosted_by_aunty_id: '4',
    purpose: 'Create defined curls',
    estimated_time_minutes: 45,
    steps: [
      {
        step_number: 1,
        name: 'Apply leave-in conditioner',
        description: 'Distribute leave-in conditioner through damp hair.',
        duration_minutes: 5,
        product_category: 'leave_in',
      },
      {
        step_number: 2,
        name: 'Apply styling cream',
        description: 'Apply curl cream or gel for hold and definition.',
        duration_minutes: 10,
        product_category: 'styling',
      },
      {
        step_number: 3,
        name: 'Diffuse or air dry',
        description: 'Dry hair with diffuser on low heat or air dry for enhanced curl definition.',
        duration_minutes: 25,
        product_category: 'styling',
      },
      {
        step_number: 4,
        name: 'Separate and fluff',
        description: 'Gently separate curls and add volume at the roots.',
        duration_minutes: 5,
        product_category: 'leave_in',
      },
    ],
  },
  refresh_day: {
    day_name: 'Refresh Day',
    hosted_by_aunty_id: '5',
    purpose: 'Revive curls between washes',
    estimated_time_minutes: 20,
    steps: [
      {
        step_number: 1,
        name: 'Lightly mist with water',
        description: 'Spray hair lightly with water to dampen curls.',
        duration_minutes: 3,
        product_category: 'leave_in',
      },
      {
        step_number: 2,
        name: 'Apply refresh spray',
        description: 'Use refresh spray or light leave-in to reactivate curls.',
        duration_minutes: 5,
        product_category: 'leave_in',
      },
      {
        step_number: 3,
        name: 'Add lightweight oil or serum',
        description: 'Apply a small amount of oil to smooth frizz and add shine.',
        duration_minutes: 5,
        product_category: 'oil',
      },
      {
        step_number: 4,
        name: 'Scrunch and arrange',
        description: 'Scrunch curls into place and use fingers to reshape.',
        duration_minutes: 7,
        product_category: 'leave_in',
      },
    ],
  },
  rest_day: {
    day_name: 'Rest Day',
    hosted_by_aunty_id: '6',
    purpose: 'Protect and nourish scalp',
    estimated_time_minutes: 10,
    steps: [
      {
        step_number: 1,
        name: 'Scalp massage',
        description: 'Massage scalp gently to stimulate blood flow and relax.',
        duration_minutes: 5,
        product_category: 'oil',
      },
      {
        step_number: 2,
        name: 'Apply scalp treatment',
        description: 'Use scalp oil, serum, or light conditioner on scalp.',
        duration_minutes: 3,
        product_category: 'oil',
      },
      {
        step_number: 3,
        name: 'Protective styling',
        description: 'Braid, twist, or protective style hair for the night.',
        duration_minutes: 2,
        product_category: 'styling',
      },
    ],
  },
};

export const DEFAULT_COUNCIL_RESPONSE: CouncilResponse = {
  '1': {
    aunty_id: '1',
    aunty_name: 'Ngozi',
    message: 'Your hair needs moisture and consistency. Use this routine to show your curls the care they deserve.',
    timestamp: new Date().toISOString(),
  },
  '2': {
    aunty_id: '2',
    aunty_name: 'Marcia',
    message: "Your roots are the foundation. Keep them healthy and strong, and the rest will follow.",
    timestamp: new Date().toISOString(),
  },
  '3': {
    aunty_id: '3',
    aunty_name: 'Denise',
    message: "I've seen what patience and technique can do. Your routine respects both.",
    timestamp: new Date().toISOString(),
  },
  '4': {
    aunty_id: '4',
    aunty_name: 'Fatou',
    message: 'Every step in this routine has a purpose. Execute them with intention.',
    timestamp: new Date().toISOString(),
  },
  '5': {
    aunty_id: '5',
    aunty_name: 'Carmen',
    message: 'Mija, your curls are a gift. This routine will help them shine.',
    timestamp: new Date().toISOString(),
  },
  '6': {
    aunty_id: '6',
    aunty_name: 'Amara',
    message: 'Strong foundations make strong hair. Build your routine on that principle.',
    timestamp: new Date().toISOString(),
  },
  '7': {
    aunty_id: '7',
    aunty_name: 'Salma',
    message: 'Nature gave us everything we need. Use these steps to unlock that potential.',
    timestamp: new Date().toISOString(),
  },
  consensus: 'The council has spoken. Your personalized routine is ready.',
};
