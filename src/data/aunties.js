import { auntyColors } from '../theme';

export const aunties = {
  ngozi: {
    id: 'ngozi',
    name: 'Aunty Ngozi',
    shortName: 'Ngozi',
    initials: 'N',
    region: 'Nigerian',
    specialty: 'Moisture and deep conditioning',
    quote: 'Ahn ahn! Dis hair need shea, not excuse o.',
    colors: auntyColors.ngozi,
    // Portrait spec: Deep warm brown skin. High cheekbones. Dark almond-shaped eyes.
    // 4C natural hair in a large full puff or wrapped in gele. Vibrant Ankara print.
    // Gold stud earrings. Warm authoritative expression.
  },
  marcia: {
    id: 'marcia',
    name: 'Aunty Marcia',
    shortName: 'Marcia',
    initials: 'M',
    region: 'Jamaican',
    specialty: 'Scalp health and growth',
    quote: 'Roots first, yuh hear mi? Always.',
    colors: auntyColors.marcia,
    // Portrait spec: Medium-deep warm brown skin. Bright warm eyes. Long locs or large natural hair.
    // Wide bright smile. Colorful headwrap or headband in yellow and green.
  },
  denise: {
    id: 'denise',
    name: 'Aunty Denise',
    shortName: 'Denise',
    initials: 'D',
    region: 'African American',
    specialty: 'Retention and protective styling',
    quote: 'Chile, I been natural before it was a whole trend.',
    colors: auntyColors.denise,
    // Portrait spec: Deep brown skin. 4B natural hair in a full twist out or puff.
    // Gold hoop earrings. Direct confident expression. Wearing something purple.
  },
  fatou: {
    id: 'fatou',
    name: 'Aunty Fatou',
    shortName: 'Fatou',
    initials: 'F',
    region: 'Senegalese',
    specialty: 'Length retention and technique',
    quote: 'La technique, ma chérie, c\'est tout.',
    colors: auntyColors.fatou,
    // Portrait spec: Very deep rich brown skin. High elegant forehead. Sharp refined bone structure.
    // Tall grand boubou headwrap in purple and gold. Regal calm expression.
  },
  carmen: {
    id: 'carmen',
    name: 'Aunty Carmen',
    shortName: 'Carmen',
    initials: 'C',
    region: 'Afro-Latina',
    specialty: 'Curl definition and wash-and-go',
    quote: 'Ay mija, esos rizos son un regalo de Dios.',
    colors: auntyColors.carmen,
    // Portrait spec: Medium warm brown skin. 3C/4A curls loose and full and wild.
    // Gold hoop earrings. Warm joyful bright expression. Wearing red or rose.
  },
  amara: {
    id: 'amara',
    name: 'Aunty Amara',
    shortName: 'Amara',
    initials: 'A',
    region: 'East African',
    specialty: 'Scalp nourishment and hair strengthening',
    quote: 'Konjo, strong roots, strong hair. Abatochihn yawqu neberu.',
    colors: auntyColors.amara,
    // Portrait spec: Warm reddish-brown skin with cool undertones. Sharp defined features.
    // Long natural hair or traditional habesha kemis. Gold cross or traditional jewelry.
  },
  salma: {
    id: 'salma',
    name: 'Aunty Salma',
    shortName: 'Salma',
    initials: 'S',
    region: 'North African',
    specialty: 'Natural remedies and moisture sealing',
    quote: 'Yalla habibti — argan, haba saouda, ghassoul. Allah gave us everything.',
    colors: auntyColors.salma,
    // Portrait spec: Olive-warm brown skin. Dark kohl-lined eyes. Thick wavy or coily natural hair.
    // Gold statement jewelry. Expressive warm face with a knowing smile.
  },
};

export const auntyOrder = ['ngozi', 'marcia', 'denise', 'fatou', 'carmen', 'amara', 'salma'];

export const getAunty = (id) => aunties[id];
export const getAllAunties = () => auntyOrder.map((id) => aunties[id]);
