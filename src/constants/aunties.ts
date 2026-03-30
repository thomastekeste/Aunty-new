import { Aunty } from '@/types';

export const AUNTIES: Record<string, Aunty> = {
  '1': {
    id: '1',
    name: 'Ngozi',
    region: 'Nigerian',
    specialty: 'Moisture and deep conditioning',
    quote: "Ahn ahn! Dis hair need shea, not excuse o.",
    dialect: 'Nigerian Pidgin',
    personality: 'Direct, urgent, deeply caring',
    title: 'The Moisture Authority',
    ingredient: 'Shea butter, hot oil, steam',
    win: "Ah ah! Now we dey talk o! Dis is what I been waiting for.",
    fail: "Dis hair dey cry and you no dey listen — abeg, we do this together.",
    greeting: "Ahn ahn, let me see what we're working with o.",
  },
  '2': {
    id: '2',
    name: 'Marcia',
    region: 'Jamaican',
    specialty: 'Scalp health and growth',
    quote: "Roots first, yuh hear mi? Always.",
    dialect: 'Jamaican Patois',
    personality: 'Patient, methodical, growth-obsessed',
    title: 'The Root Whisperer',
    ingredient: 'Jamaican black castor oil, scalp massage, fenugreek',
    win: "Yes pickney, di roots dem singing! Mi so proud a yuh.",
    fail: "Roots first. Yuh forget already? Come back to di beginning.",
    greeting: "Tell mi now — how di roots dem feeling?",
  },
  '3': {
    id: '3',
    name: 'Denise',
    region: 'African American',
    specialty: 'Retention and protective styling',
    quote: "Chile, I been natural before it was a whole trend.",
    dialect: 'AAVE',
    personality: 'Confident, no excuses, culturally proud',
    title: 'The Cultural Elder',
    ingredient: 'LOC method, satin bonnet, protective styling',
    win: "Now THAT'S what I'm talking about. You did that.",
    fail: "Uh uh. We not doing this. Get back on the routine.",
    greeting: "Chile, let me ask you something real quick.",
  },
  '4': {
    id: '4',
    name: 'Fatou',
    region: 'Senegalese',
    specialty: 'Length retention and technique',
    quote: "La technique, ma chérie, c'est tout.",
    dialect: 'French-accented English',
    personality: 'Methodical, elegant, teaches process over product',
    title: 'The Technician',
    ingredient: 'Thread stretching, karité butter, braiding technique',
    win: "Voilà. C'est parfait, ma chérie. The technique, it never lies.",
    fail: "La patience. Sans technique, rien n'est possible. We start again.",
    greeting: "Tell me, ma chérie — how are you treating your hair?",
  },
  '5': {
    id: '5',
    name: 'Carmen',
    region: 'Afro-Latina',
    specialty: 'Curl definition and wash-and-go',
    quote: "Ay mija, esos rizos son un regalo de Dios.",
    dialect: 'Spanglish',
    personality: 'Warm, buoyant, sees the beauty before anyone else',
    title: 'The Joy Bringer',
    ingredient: 'Flaxseed gel, finger coiling, wash-and-go',
    win: "¡Ay! Those curls came OUT today, mami! I knew it!",
    fail: "Oye, we try again. It's okay, corazón. Your curls still beautiful.",
    greeting: "Mija, cuéntame — how are those curls doing?",
  },
  '6': {
    id: '6',
    name: 'Amara',
    region: 'East African',
    specialty: 'Scalp nourishment and hair strengthening',
    quote: "Konjo, strong roots, strong hair. Abatochihn yawqu neberu.",
    dialect: 'East African lilt — Amharic mixed with English',
    personality: 'Quiet authority, long-game thinker, builds from within',
    title: 'The Strength Builder',
    ingredient: 'Fenugreek protein mask, castor oil, strengthening treatments',
    win: "Strong hair. Like I knew it would be, konjo. Your roots thank you.",
    fail: "The roots know. Keep going. Betam — it takes time.",
    greeting: "Konjo, tell me — how is the hair feeling from the inside?",
  },
  '7': {
    id: '7',
    name: 'Salma',
    region: 'North African',
    specialty: 'Natural remedies and moisture sealing',
    quote: "Yalla habibti — argan, haba saouda, ghassoul. Allah gave us everything.",
    dialect: 'North African — Darija Arabic lilt',
    personality: 'Ancient wisdom meets modern application, remedy-keeper',
    title: 'The Remedy Keeper',
    ingredient: 'Argan oil, ghassoul clay, henna, black seed',
    win: "Mashallah. This is what the plants promised, habibti. Look at this hair.",
    fail: "Sabr habibti. Patience is its own treatment. We don't rush nature.",
    greeting: "Yalla habibti — show me what we're working with.",
  },
};

export const AUNTY_IDS = ['1', '2', '3', '4', '5', '6', '7'] as const;

export const getAunty = (id: string): Aunty => AUNTIES[id] ?? AUNTIES['1'];

// Which aunty hosts each onboarding screen
export const SCREEN_HOST: Record<number, string> = {
  3: '3',  // Denise: Name
  4: '2',  // Marcia: Sign Up
  5: '7',  // Salma: Location
  6: '2',  // Marcia: Porosity Test
  7: '6',  // Amara: Elasticity Test
  8: '6',  // Amara: Density Test
  9: '1',  // Ngozi: Photos
  10: '1', // Ngozi: Curl reveal
  11: '2', // Marcia: Wash frequency
  12: '5', // Carmen: Primary goal
  13: '3', // Denise: Failures
  14: '4', // Fatou: Heat use
  15: '3', // Denise: Relaxer history
  16: '4', // Fatou: Protective styling
  17: '6', // Amara: Scalp concerns
  18: '5', // Carmen: Time available
};

// Notification copy per aunty — full character voice
export const NOTIFICATION_COPY: Record<string, { title: string; bodies: string[] }> = {
  '1': {
    title: 'Ngozi checking in',
    bodies: [
      "Ahn ahn — I need a progress report o. Don't make me ask twice.",
      "Di shea butter should be working by now. Come show me.",
      "Abeg, your hair is waiting on you. Check in.",
    ],
  },
  '2': {
    title: 'Marcia here',
    bodies: [
      "It's been a week, pickney. How are those roots feeling?",
      "Roots first. Always. Come let me see.",
      "Di routine dey wait for you. Let's check in.",
    ],
  },
  '3': {
    title: 'Denise checking in',
    bodies: [
      "You better not be skipping that satin bonnet, chile.",
      "Week check — show me that retention. Don't ghost me.",
      "I built this routine for you. The least you can do is check in.",
    ],
  },
  '4': {
    title: 'Fatou checking in',
    bodies: [
      "La patience produit des résultats. Come show me yours.",
      "Technique check, ma chérie. Upload your progress.",
      "I need to see if the method is working. Come.",
    ],
  },
  '5': {
    title: 'Carmen checking in',
    bodies: [
      "Mija, show me those curls. Don't keep me waiting!",
      "¡Oye! How are those waves doing today?",
      "Your rizos miss you. Check in, corazón.",
    ],
  },
  '6': {
    title: 'Amara checking in',
    bodies: [
      "Konjo — your roots need attention. Come back.",
      "Strong roots, strong hair. Show me what's happening.",
      "The fenugreek is working. Come let me see.",
    ],
  },
  '7': {
    title: 'Salma checking in',
    bodies: [
      "Yalla habibti — the argan oil is working. Come show us.",
      "Check in with nature's remedies, habibti.",
      "Mashallah — I think you have progress. Let me see.",
    ],
  },
};

export const getRandomNotifCopy = (auntyId: string) => {
  const t = NOTIFICATION_COPY[auntyId];
  return {
    title: t.title,
    body: t.bodies[Math.floor(Math.random() * t.bodies.length)],
  };
};

// Deep avatar background colors — rich jewel tones for strong presence
export const AUNTY_COLORS: Record<string, string> = {
  '1': '#8B4F1C', // Ngozi — deep amber
  '2': '#1A5C34', // Marcia — deep forest
  '3': '#0D3348', // Denise — deep teal
  '4': '#4A1E2A', // Fatou — deep burgundy
  '5': '#8B1C42', // Carmen — deep rose
  '6': '#7A3800', // Amara — deep burnt orange
  '7': '#0D3D5E', // Salma — deep navy
};

// Light accent colors for initials text — contrast against deep avatar backgrounds
export const AUNTY_ACCENT: Record<string, string> = {
  '1': '#F5C48A', // Ngozi — light gold on deep amber
  '2': '#A8D5B5', // Marcia — light green on deep forest
  '3': '#9DD4EE', // Denise — light teal on deep teal
  '4': '#E8A8B8', // Fatou — light rose on deep burgundy
  '5': '#F2A8C4', // Carmen — light pink on deep rose
  '6': '#F5B87A', // Amara — light orange on deep burnt
  '7': '#9ACCE8', // Salma — light blue on deep navy
};

// Bubble background tints — warm cream base with aunty signature tint
export const AUNTY_BUBBLE_BG: Record<string, string> = {
  '1': 'rgba(139, 79, 28, 0.06)',    // Ngozi deep amber tint
  '2': 'rgba(26, 92, 52, 0.06)',     // Marcia forest tint
  '3': 'rgba(13, 51, 72, 0.06)',     // Denise teal tint
  '4': 'rgba(74, 30, 42, 0.06)',     // Fatou burgundy tint
  '5': 'rgba(139, 28, 66, 0.06)',    // Carmen rose tint
  '6': 'rgba(122, 56, 0, 0.06)',     // Amara burnt orange tint
  '7': 'rgba(13, 61, 94, 0.06)',     // Salma navy tint
};
