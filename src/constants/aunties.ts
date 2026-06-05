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
  quotes: string[]; // rotating wisdom lines
  tips: string[]; // daily tips in character voice
  /** Signature terms of endearment she calls you, lightly seasoned/readable. First is primary. */
  endearments: string[];
  greeting: string;
  ingredient: string;
  win: string;
  fail: string;
  /** One-line sign-off used under her name on dashboards and verdicts. */
  signOff: string;
  emoji: string; // for internal reference only, never rendered as icon
}

export const AUNTIES: Record<string, Aunty> = {
  ngozi: {
    id: 'ngozi',
    name: 'Ngozi',
    region: 'Nigerian',
    title: 'The Bold One',
    specialty: 'Tells it like it is. No sugarcoating, all love.',
    focus: 'direct',
    dialect: 'Nigerian Pidgin',
    personality: 'Bold, warm, no-nonsense. She will tell you the truth about your hair and make you laugh while doing it.',
    quote: 'Ahn ahn! Dis hair need shea, not excuse o.',
    quotes: [
      'Ahn ahn! Dis hair need shea, not excuse o.',
      'You think shea butter na play? Na serious medicine o.',
      'When your hair dey talk, you better listen.',
      'Every strand get potential. Na you go unlock am.',
    ],
    tips: [
      'Your ends called — they said send shea butter, not excuses.',
      'Hot oil treatment tonight. No negotiation.',
      'Seal those ends before bed or we will have words tomorrow.',
      'Deep condition for 30 minutes, not 5. Your hair knows the difference.',
      'Steam is your secret weapon. Use it this week.',
      'Drink water. Your hair is thirsty because YOU are thirsty.',
    ],
    endearments: ['my dear', 'nne'],
    greeting: 'Come sit, let Aunty see this hair.',
    ingredient: 'Shea butter, hot oil treatments, steam therapy',
    win: 'Ah ah! Now we dey talk o! Dis is what I been waiting for.',
    fail: 'Dis hair dey cry and you no dey listen — abeg, we do this together.',
    signOff: 'No excuses, only shea.',
    emoji: '✨',
  },
  marcia: {
    id: 'marcia',
    name: 'Marcia',
    region: 'Jamaican',
    title: 'The Patient One',
    specialty: 'Takes her time. Believes in the long game.',
    focus: 'patience',
    dialect: 'Jamaican Patois',
    personality: 'Grounded, patient, never rushes. She believes good things take time and she will wait with you.',
    quote: 'Everyting start from di root, baby. Feed di root, watch it grow.',
    quotes: [
      'Everyting start from di root, baby. Feed di root, watch it grow.',
      'Patience nuh mean doing nothing. It mean doing right tings, steady.',
      'Your scalp is di soil. Healthy soil, healthy plant.',
      'One month of consistency beat one year of product hopping.',
    ],
    tips: [
      'Massage that scalp for 5 minutes today. Your roots will thank you.',
      'JBCO on the edges tonight. Consistency is the secret.',
      'Stop checking for growth every day. Watch, it will surprise you.',
      'Peppermint oil in your scalp mix. It wakes up the follicles.',
      'Your hair grows whether you watch or not. Just keep feeding it.',
      'Protective style this week. Let your ends rest.',
    ],
    endearments: ['love', 'mi dear'],
    greeting: 'Wah gwaan, love? Mek we check dem roots.',
    ingredient: 'Jamaican black castor oil, scalp massage, peppermint',
    win: 'Yuh see it? Root strong, everything else follow.',
    fail: 'Nuh rush di process. Come, we go back to basics.',
    signOff: 'Feed the root. Trust the grow.',
    emoji: '🌱',
  },
  denise: {
    id: 'denise',
    name: 'Denise',
    region: 'African American',
    title: 'The Wise One',
    specialty: 'Been there, done that. Generational wisdom.',
    focus: 'wisdom',
    dialect: 'AAVE',
    personality: 'Wise, protective, deeply rooted. She carries generational knowledge and will share it all.',
    quote: 'Baby, I been doing this since before YouTube tutorials. Trust the process.',
    quotes: [
      'Baby, I been doing this since before YouTube tutorials. Trust the process.',
      'Your grandma knew what she was doing. Some of that old wisdom still works.',
      'Protective styling ain\'t lazy. It\'s strategic.',
      'The LOC method changed my life. Let it change yours.',
    ],
    tips: [
      'Wrap that hair in satin tonight. No cotton pillowcases in this house.',
      'LOC method today: liquid, oil, cream. In that order.',
      'Twist-out Tuesday. Set it tonight, slay tomorrow.',
      'Your bonnet is your crown at night. Wear it proudly.',
      'Detangle from ends to roots. Always. No exceptions.',
      'Protective style check: is it too tight? Your edges matter more than the look.',
    ],
    endearments: ['baby', 'sugar'],
    greeting: 'Hey sugar. Let me see what we working with.',
    ingredient: 'LOC method, satin bonnets, twist-outs, protective styling',
    win: 'Now THAT is what I\'m talking about. Look at that growth, baby.',
    fail: 'We don\'t give up in this house. We adjust and we keep going.',
    signOff: 'Wisdom is the long way round.',
    emoji: '👑',
  },
  fatou: {
    id: 'fatou',
    name: 'Fatou',
    region: 'Senegalese',
    title: 'The Precise One',
    specialty: 'Detail-oriented. Every section matters.',
    focus: 'precision',
    dialect: 'French-accented English',
    personality: 'Precise, elegant, methodical. She approaches everything with care and intention.',
    quote: 'Technique is not optional, chérie. It is ze difference between breakage and beauty.',
    quotes: [
      'Technique is not optional, chérie. It is ze difference between breakage and beauty.',
      'Every section deserves attention. Do not rush through ze middle.',
      'Precision is love. When you section with care, your hair responds.',
      'Ze best products in ze world cannot fix bad technique.',
    ],
    tips: [
      'Section your hair in 4 before you start. Precision begins with preparation.',
      'Your wide-tooth comb is your best friend. Use it gently, from ends up.',
      'Apply product section by section, not all at once. Each curl needs attention.',
      'Thread stretching tonight for length without heat. Trust ze technique.',
      'Clip each section as you work. Organization prevents tangles.',
      'Rinse with cool water at the end. It seals the cuticle. Always.',
    ],
    endearments: ['chérie', 'ma chérie'],
    greeting: 'Bonjour, ma chérie. Show me your technique.',
    ingredient: 'Karité butter, thread stretching, precision sectioning',
    win: 'Magnifique! Your technique, it is becoming art.',
    fail: 'Non, non — we must be more gentle, more precise. Again, with care.',
    signOff: 'Precision is a form of love.',
    emoji: '🎯',
  },
  carmen: {
    id: 'carmen',
    name: 'Carmen',
    region: 'Afro-Latina',
    title: 'The Hype One',
    specialty: 'Your biggest cheerleader. Celebrates every win.',
    focus: 'energy',
    dialect: 'Spanglish',
    personality: 'Joyful, vibrant, celebrates everything. She makes the whole journey feel like a party.',
    quote: 'Mira, every curl has its own personalidad. You just gotta let it sing!',
    quotes: [
      'Mira, every curl has its own personalidad. You just gotta let it sing!',
      'Bad hair day? No such thing. Just a curl finding its rhythm.',
      'Your curls are a celebration. Treat them like one.',
      'Confidence is the best styling product. Wear it daily.',
    ],
    tips: [
      'Scrunch with flaxseed gel today and let those curls LIVE.',
      'Diffuse on low heat, cup each section. Let the curls bounce.',
      'Finger coil your front pieces tonight. Tomorrow you will shine.',
      'Dance while your hair air dries. It actually helps the curl pattern.',
      'Refresh spray: water + leave-in + good vibes. Shake and spray.',
      'Take a selfie of your curls today. Future you will love looking back.',
    ],
    endearments: ['mi amor', 'mija'],
    greeting: 'Hola mi amor! Let\'s make those curls pop!',
    ingredient: 'Flaxseed gel, finger coiling, diffusing technique',
    win: 'Ay mami, LOOK at those curls! That\'s what I\'m talking about!',
    fail: 'No te preocupes, we try again. Every curl day is different.',
    signOff: 'Every curl gets to sing.',
    emoji: '💃',
  },
  amara: {
    id: 'amara',
    name: 'Senayt',
    region: 'Ethiopian-Eritrean',
    title: 'The Steady One',
    specialty: 'Calm strength. Never panics, always delivers.',
    focus: 'steadiness',
    dialect: 'East African English',
    personality: 'Strong, steady, nurturing. When you feel like giving up, she holds it together.',
    quote: 'Strength is not force. It is patience. It is protein. It is rest.',
    quotes: [
      'Strength is not force. It is patience. It is protein. It is rest.',
      'Your hair is resilient. It just needs you to believe in it.',
      'Breakage is not failure. It is information. Listen to it.',
      'Strong roots grow strong hair. We build from the foundation.',
    ],
    tips: [
      'Protein treatment this week if your hair feels mushy or limp.',
      'Fenugreek soak overnight. Blend it tomorrow. Your hair will thank you.',
      'Balance is everything: protein without moisture is brittleness.',
      'Check your elasticity: stretch a wet strand. Does it bounce back? Good.',
      'Rest day means rest. Do not touch, twist, or fuss. Let it be.',
      'Henna strengthens without chemicals. Consider it for your next treatment.',
    ],
    endearments: ['yene', 'yene konjo'],
    greeting: 'Selam, yene. Come, sit — let us build something strong.',
    ingredient: 'Fenugreek protein treatments, castor oil, henna',
    win: 'Feel that strength? That is your hair remembering what it is.',
    fail: 'Your hair is tired, not broken. We will restore it, step by step.',
    signOff: 'Strong roots, steady hands.',
    emoji: '💪',
  },
  salma: {
    id: 'salma',
    name: 'Salma',
    region: 'Moroccan',
    title: 'The Calm One',
    specialty: 'Holistic. Sees the whole picture, not just hair.',
    focus: 'balance',
    dialect: 'Darija-accented English',
    personality: 'Calm, wise, holistic. She connects your hair to your whole well-being.',
    quote: 'The hair speaks what the body whispers. We must listen to both.',
    quotes: [
      'The hair speaks what the body whispers. We must listen to both.',
      'Balance in life brings balance to your hair. They are connected.',
      'Argan oil is ancient wisdom in a bottle. Use it wisely.',
      'Stress shows in your hair before anywhere else. Be gentle with yourself.',
    ],
    tips: [
      'Argan oil on your ends before bed. Ancient remedy, modern results.',
      'Ghassoul clay mask this week. Let the earth draw out what does not serve you.',
      'Rose water spritz in the morning. Your hair and your spirit will thank you.',
      'Did you sleep well? Your hair knows when you did not. Rest is treatment.',
      'Scalp massage with warm oil. Close your eyes. Breathe. This is medicine.',
      'Your hair reflects your stress. If it is acting up, check in with yourself first.',
    ],
    endearments: ['habibti', 'habibi'],
    greeting: 'As-salaam, habibti. Come, let us find balance.',
    ingredient: 'Argan oil, ghassoul clay, rose water, henna',
    win: 'See how calm your hair is now? When we are balanced, everything flows.',
    fail: 'Do not worry. Healing is not linear. We adjust the remedy.',
    signOff: 'Balance is the whole remedy.',
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

// ─── Rotating Content Helpers ──────────────────────────────────

/** Pick a daily tip that changes each day */
export function getAuntyTipForToday(auntyId: AuntyId): string {
  const aunty = AUNTIES[auntyId];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return aunty.tips[dayOfYear % aunty.tips.length];
}

/** Pick a wisdom quote that rotates every 4 hours */
export function getAuntyQuoteForSession(auntyId: AuntyId): string {
  const aunty = AUNTIES[auntyId];
  const session = Math.floor(Date.now() / (1000 * 60 * 60 * 4));
  return aunty.quotes[session % aunty.quotes.length];
}
