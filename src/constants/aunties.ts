/**
 * The Council of Seven Aunties
 *
 * Each aunty is a fully realized character with cultural identity,
 * specialty, voice, and emotional energy. They are NOT interchangeable.
 * They are orchestrated — each hosts specific phases and topics.
 */

export interface Aunty {
  id: string;
  name: string;
  region: string;
  title: string;
  specialty: string;
  focus: string;
  dialect: string;
  personality: string;
  quote: string;
  greeting: string;
  ingredient: string;
  win: string;
  fail: string;
  emoji: string; // for internal reference only, never rendered as icon
}

export const AUNTIES: Record<string, Aunty> = {
  ngozi: {
    id: 'ngozi',
    name: 'Ngozi',
    region: 'West Africa',
    title: 'The Bold One',
    specialty: 'Tells it like it is. No sugarcoating, all love.',
    focus: 'direct',
    dialect: 'Nigerian Pidgin',
    personality: 'Bold, warm, no-nonsense. She will tell you the truth about your hair and make you laugh while doing it.',
    quote: 'Ahn ahn! Dis hair need shea, not excuse o.',
    greeting: 'Come sit, let Aunty see this hair.',
    ingredient: 'Shea butter, hot oil treatments, steam therapy',
    win: 'Ah ah! Now we dey talk o! Dis is what I been waiting for.',
    fail: 'Dis hair dey cry and you no dey listen — abeg, we do this together.',
    emoji: '✨',
  },
  marcia: {
    id: 'marcia',
    name: 'Marcia',
    region: 'Caribbean',
    title: 'The Patient One',
    specialty: 'Takes her time. Believes in the long game.',
    focus: 'patience',
    dialect: 'Jamaican Patois',
    personality: 'Grounded, patient, never rushes. She believes good things take time and she will wait with you.',
    quote: 'Everyting start from di root, baby. Feed di root, watch it grow.',
    greeting: 'Wah gwaan, love? Mek we check dem roots.',
    ingredient: 'Jamaican black castor oil, scalp massage, peppermint',
    win: 'Yuh see it? Root strong, everything else follow.',
    fail: 'Nuh rush di process. Come, we go back to basics.',
    emoji: '🌱',
  },
  denise: {
    id: 'denise',
    name: 'Denise',
    region: 'Southern US',
    title: 'The Wise One',
    specialty: 'Been there, done that. Generational wisdom.',
    focus: 'wisdom',
    dialect: 'AAVE',
    personality: 'Wise, protective, deeply rooted. She carries generational knowledge and will share it all.',
    quote: 'Baby, I been doing this since before YouTube tutorials. Trust the process.',
    greeting: 'Hey sugar. Let me see what we working with.',
    ingredient: 'LOC method, satin bonnets, twist-outs, protective styling',
    win: 'Now THAT is what I\'m talking about. Look at that growth, baby.',
    fail: 'We don\'t give up in this house. We adjust and we keep going.',
    emoji: '👑',
  },
  fatou: {
    id: 'fatou',
    name: 'Fatou',
    region: 'West Africa',
    title: 'The Precise One',
    specialty: 'Detail-oriented. Every section matters.',
    focus: 'precision',
    dialect: 'French-accented English',
    personality: 'Precise, elegant, methodical. She approaches everything with care and intention.',
    quote: 'Technique is not optional, chérie. It is ze difference between breakage and beauty.',
    greeting: 'Bonjour, ma chérie. Show me your technique.',
    ingredient: 'Karité butter, thread stretching, precision sectioning',
    win: 'Magnifique! Your technique, it is becoming art.',
    fail: 'Non, non — we must be more gentle, more precise. Again, with care.',
    emoji: '🎯',
  },
  carmen: {
    id: 'carmen',
    name: 'Carmen',
    region: 'Latin America',
    title: 'The Hype One',
    specialty: 'Your biggest cheerleader. Celebrates every win.',
    focus: 'energy',
    dialect: 'Spanglish',
    personality: 'Joyful, vibrant, celebrates everything. She makes the whole journey feel like a party.',
    quote: 'Mira, every curl has its own personalidad. You just gotta let it sing!',
    greeting: 'Hola mi amor! Let\'s make those curls pop!',
    ingredient: 'Flaxseed gel, finger coiling, diffusing technique',
    win: 'Ay mami, LOOK at those curls! That\'s what I\'m talking about!',
    fail: 'No te preocupes, we try again. Every curl day is different.',
    emoji: '💃',
  },
  amara: {
    id: 'amara',
    name: 'Amara',
    region: 'East Africa',
    title: 'The Steady One',
    specialty: 'Calm strength. Never panics, always delivers.',
    focus: 'steadiness',
    dialect: 'East African English',
    personality: 'Strong, steady, nurturing. When you feel like giving up, she holds it together.',
    quote: 'Strength is not force. It is patience. It is protein. It is rest.',
    greeting: 'Welcome, dear one. Let us build something strong.',
    ingredient: 'Fenugreek protein treatments, castor oil, henna',
    win: 'Feel that strength? That is your hair remembering what it is.',
    fail: 'Your hair is tired, not broken. We will restore it, step by step.',
    emoji: '💪',
  },
  salma: {
    id: 'salma',
    name: 'Salma',
    region: 'North Africa',
    title: 'The Calm One',
    specialty: 'Holistic. Sees the whole picture, not just hair.',
    focus: 'balance',
    dialect: 'Darija-accented English',
    personality: 'Calm, wise, holistic. She connects your hair to your whole well-being.',
    quote: 'The hair speaks what the body whispers. We must listen to both.',
    greeting: 'As-salaam, habibi. Come, let us find balance.',
    ingredient: 'Argan oil, ghassoul clay, rose water, henna',
    win: 'See how calm your hair is now? When we are balanced, everything flows.',
    fail: 'Do not worry. Healing is not linear. We adjust the remedy.',
    emoji: '🌿',
  },
};

// Ordered council (the order they appear in ceremonies)
export const COUNCIL_ORDER = [
  'ngozi', 'marcia', 'denise', 'fatou', 'carmen', 'amara', 'salma',
] as const;

export type AuntyId = (typeof COUNCIL_ORDER)[number];

// Which aunty hosts which onboarding phase
export const PHASE_HOSTS: Record<string, AuntyId> = {
  welcome: 'denise', // Cultural elder opens the ceremony
  meet: 'denise', // She introduces the council
  hairType: 'ngozi', // Moisture authority assesses first
  porosity: 'marcia', // Root whisperer tests foundations
  goals: 'carmen', // Joy bringer asks what you dream of
  habits: 'fatou', // Technician reviews your methods
  struggles: 'amara', // Strength builder hears your pain
  photos: 'salma', // Remedy keeper observes holistically
  convening: 'denise', // Elder calls the council together
  verdict: 'denise', // Elder delivers the collective word
  ritual: 'ngozi', // Moisture authority presents the plan
  sendoff: 'denise', // Elder sends you off
};

// Which aunty hosts which ritual day type
export const RITUAL_HOSTS: Record<string, AuntyId> = {
  wash: 'ngozi', // Moisture authority owns wash day
  style: 'carmen', // Joy bringer owns style day
  refresh: 'fatou', // Technician owns maintenance
  rest: 'salma', // Remedy keeper owns restoration
  scalp: 'marcia', // Root whisperer owns scalp days
  protein: 'amara', // Strength builder owns protein treatments
  protect: 'denise', // Cultural elder owns protective styling
};
