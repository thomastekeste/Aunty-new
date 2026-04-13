/**
 * Education content — The Council Teaches.
 *
 * Every article, creator, and Q&A is aunty-voiced.
 * Not generic blog content. Aunty energy.
 */

import type { AuntyId } from './aunties';

// ─── Types ──────────────────────────────────────────────────────

export type ContentCategory = 'method' | 'products' | 'people' | 'qa';

export interface Article {
  id: string;
  category: 'method' | 'products';
  title: string;
  teaser: string;
  body: string;
  auntyId: AuntyId;
  readTime: string;
  isPremium: boolean;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
  focus: string;
  endorsedBy: AuntyId;
  curlTypes: string;
}

export interface QA {
  id: string;
  question: string;
  answer: string;
  auntyId: AuntyId;
}

// ─── The Method ─────────────────────────────────────────────────

export const METHOD_ARTICLES: Article[] = [
  {
    id: 'method-porosity',
    category: 'method',
    title: 'Porosity: The Foundation',
    teaser: 'Everything starts here. Before products, before technique — you need to know how your hair drinks.',
    body: 'Porosity is how open or closed your hair cuticles are. High porosity absorbs fast but loses moisture fast. Low porosity resists absorption — products sit on top. Normal porosity is the sweet spot. Once you know yours, every product choice makes sense. Stop guessing. Test it.',
    auntyId: 'marcia',
    readTime: '3 min',
    isPremium: false,
  },
  {
    id: 'method-loc',
    category: 'method',
    title: 'The LOC Method',
    teaser: 'Liquid, Oil, Cream — in that order. The layering technique that changed the game.',
    body: 'LOC stands for Liquid (water or leave-in), Oil (to seal), Cream (to hold). The order matters because water hydrates, oil locks it in, and cream provides structure. Some hair prefers LCO — cream before oil. Experiment. Your hair will tell you which it wants.',
    auntyId: 'ngozi',
    readTime: '4 min',
    isPremium: false,
  },
  {
    id: 'method-protein-moisture',
    category: 'method',
    title: 'Protein vs. Moisture',
    teaser: 'Your hair needs both. The trick is knowing when it needs which.',
    body: 'Too much moisture makes hair mushy and limp. Too much protein makes it dry and brittle. The balance is everything. Stretchy hair that won\'t snap back? It needs protein. Stiff hair that breaks when you touch it? It needs moisture. Read your hair, not the label.',
    auntyId: 'amara',
    readTime: '4 min',
    isPremium: false,
  },
  {
    id: 'method-wash-day',
    category: 'method',
    title: 'Wash Day Sequencing',
    teaser: 'The order of your wash day matters more than the products you use.',
    body: 'Pre-poo first to protect strands. Clarify or co-wash depending on buildup. Deep condition under heat for penetration. Rinse cool to seal cuticles. Apply leave-in to soaking wet hair. Then style. Skip a step and the whole thing falls apart. Precision is care.',
    auntyId: 'fatou',
    readTime: '5 min',
    isPremium: true,
  },
  {
    id: 'method-scalp',
    category: 'method',
    title: 'Scalp First, Always',
    teaser: 'Healthy hair starts at the root. If your scalp isn\'t right, nothing else matters.',
    body: 'Your scalp is skin. It needs cleansing, exfoliation, and nourishment just like your face. Buildup blocks follicles. Dryness causes flaking. Excess oil suffocates new growth. Weekly scalp massage with the right oil increases blood flow and promotes growth. Start there.',
    auntyId: 'salma',
    readTime: '3 min',
    isPremium: true,
  },
];

// ─── Product School ─────────────────────────────────────────────

export const PRODUCT_ARTICLES: Article[] = [
  {
    id: 'prod-silicones',
    category: 'products',
    title: 'Silicones: The Full Story',
    teaser: 'Not all silicones are bad. But knowing which to avoid — and why — changes everything.',
    body: 'Water-soluble silicones (like cyclomethicone) rinse clean. Non-soluble ones (dimethicone) build up and block moisture. The issue isn\'t silicones themselves — it\'s buildup without clarifying. If you never clarify, avoid non-soluble silicones. If you clarify monthly, you have more flexibility.',
    auntyId: 'ngozi',
    readTime: '4 min',
    isPremium: false,
  },
  {
    id: 'prod-sulfates',
    category: 'products',
    title: 'Not All Sulfates Are Equal',
    teaser: 'SLS strips. SLES is gentler. Cocamidopropyl betaine is mild. Know the spectrum.',
    body: 'Sodium Lauryl Sulfate (SLS) is harsh — it strips natural oils. Sodium Laureth Sulfate (SLES) is milder but still drying for textured hair. Cocamidopropyl betaine is gentle enough for regular use. You don\'t need zero sulfates — you need the right ones at the right frequency.',
    auntyId: 'marcia',
    readTime: '3 min',
    isPremium: false,
  },
  {
    id: 'prod-humectants',
    category: 'products',
    title: 'Humectants: Context Is Everything',
    teaser: 'Glycerin in humidity? Frizz bomb. Glycerin in dry air? Moisture thief. Climate matters.',
    body: 'Humectants pull moisture from the environment into your hair. In humid climates, that means frizz. In dry climates, they pull moisture OUT of your hair into the air. Glycerin, honey, and aloe are all humectants. Use them wisely based on where you live and the season.',
    auntyId: 'salma',
    readTime: '3 min',
    isPremium: true,
  },
  {
    id: 'prod-reading-labels',
    category: 'products',
    title: 'Reading the Back of the Bottle',
    teaser: 'The front is marketing. The back is truth. Learn to read it.',
    body: 'Ingredients are listed by concentration — first five ingredients are the bulk of the formula. Water first is fine. If a silicone or alcohol is in the top five, reconsider. "Natural" on the front means nothing legally. The ingredient list is the only honest part of the packaging.',
    auntyId: 'fatou',
    readTime: '4 min',
    isPremium: true,
  },
  {
    id: 'prod-budget-premium',
    category: 'products',
    title: 'Budget vs. Premium',
    teaser: 'Expensive doesn\'t mean better. But cheap doesn\'t mean good either. Here\'s where to spend.',
    body: 'Spend on deep conditioners and styling creams — you need quality ingredients where they sit on your hair longest. Save on shampoo and rinse-out conditioner — they wash out anyway. A $8 cowash can outperform a $40 one. Know where the money actually matters.',
    auntyId: 'denise',
    readTime: '3 min',
    isPremium: false,
  },
];

// ─── Approved People ────────────────────────────────────────────

export const APPROVED_CREATORS: Creator[] = [
  // Ngozi's picks — moisture experts
  {
    id: 'c-neiicey',
    name: 'NaturalNeiicey',
    handle: '@naturalneiicey',
    platform: 'youtube',
    focus: 'Moisture routines & product reviews',
    endorsedBy: 'ngozi',
    curlTypes: '3c–4c',
  },
  {
    id: 'c-cassidy',
    name: 'Cassidy Fabian',
    handle: '@cassidyfabian',
    platform: 'youtube',
    focus: 'Wash day tutorials & curl definition',
    endorsedBy: 'ngozi',
    curlTypes: '3a–3c',
  },
  // Marcia's picks — roots & growth
  {
    id: 'c-curlyproverbz',
    name: 'Curly Proverbz',
    handle: '@curlyproverbz',
    platform: 'youtube',
    focus: 'Growth journeys & protective styles',
    endorsedBy: 'marcia',
    curlTypes: '4a–4c',
  },
  {
    id: 'c-minimarley',
    name: 'Mini Marley',
    handle: '@minimarley',
    platform: 'youtube',
    focus: 'Transition guides & length retention',
    endorsedBy: 'marcia',
    curlTypes: '3c–4b',
  },
  // Denise's picks — real talk
  {
    id: 'c-naptural85',
    name: 'Naptural85',
    handle: '@naptural85',
    platform: 'youtube',
    focus: 'OG natural hair education',
    endorsedBy: 'denise',
    curlTypes: '4a–4c',
  },
  {
    id: 'c-charyjay',
    name: 'CharyJay',
    handle: '@charyjay',
    platform: 'youtube',
    focus: 'Honest product reviews & wash days',
    endorsedBy: 'denise',
    curlTypes: '3b–4a',
  },
  // Fatou's picks — technique
  {
    id: 'c-manesbymell',
    name: 'Manes by Mell',
    handle: '@manesbymell',
    platform: 'youtube',
    focus: 'Professional technique breakdowns',
    endorsedBy: 'fatou',
    curlTypes: '2c–4c',
  },
  {
    id: 'c-curlmaven',
    name: 'Curl Maven',
    handle: '@curlmaven',
    platform: 'instagram',
    focus: 'Curly Girl Method science',
    endorsedBy: 'fatou',
    curlTypes: '2a–3c',
  },
  // Carmen's picks — celebration & definition
  {
    id: 'c-biancarenee',
    name: 'Bianca Renee Today',
    handle: '@biancareneetoday',
    platform: 'youtube',
    focus: 'Curl definition & volume tips',
    endorsedBy: 'carmen',
    curlTypes: '3a–3c',
  },
  {
    id: 'c-jayme',
    name: 'Jayme Jo',
    handle: '@jaymejo',
    platform: 'tiktok',
    focus: 'Quick styling hacks & curl refresh',
    endorsedBy: 'carmen',
    curlTypes: '2c–3b',
  },
  // Amara's picks — strength & repair
  {
    id: 'c-afrocenchix',
    name: 'Afrocenchix',
    handle: '@afrocenchix',
    platform: 'instagram',
    focus: 'Trichology-backed hair science',
    endorsedBy: 'amara',
    curlTypes: '3c–4c',
  },
  {
    id: 'c-sisterscientist',
    name: 'Sister Scientist',
    handle: '@sisterscientist',
    platform: 'youtube',
    focus: 'Ingredient science & protein deep dives',
    endorsedBy: 'amara',
    curlTypes: 'All types',
  },
  // Salma's picks — holistic
  {
    id: 'c-kindcurls',
    name: 'Kind Curls',
    handle: '@kindcurls',
    platform: 'instagram',
    focus: 'Holistic hair care & scalp health',
    endorsedBy: 'salma',
    curlTypes: '2a–4a',
  },
  {
    id: 'c-lailaloves',
    name: 'Laila Loves',
    handle: '@lailaloves',
    platform: 'youtube',
    focus: 'Clean beauty & natural remedies',
    endorsedBy: 'salma',
    curlTypes: '3a–4b',
  },
];

// ─── Ask the Council — Q&A ──────────────────────────────────────

export const COUNCIL_QA: QA[] = [
  {
    id: 'qa-dry-after-wash',
    question: 'Why does my hair feel dry right after washing?',
    answer: 'You\'re likely using too harsh a shampoo, or not conditioning deeply enough. Switch to a sulfate-free cleanser and deep condition with heat for 15–20 minutes. Apply leave-in to soaking wet hair — not towel-dried. Dry hair after wash day means moisture never got in.',
    auntyId: 'marcia',
  },
  {
    id: 'qa-deep-condition',
    question: 'How often should I deep condition?',
    answer: 'High porosity: every wash. Normal porosity: every other wash. Low porosity: once a month with heat. Deep conditioning without heat is like cooking without turning on the stove — the ingredients are there but they can\'t do their job.',
    auntyId: 'ngozi',
  },
  {
    id: 'qa-clumping',
    question: 'Why won\'t my curls clump together?',
    answer: 'Clumping needs three things: hydrated hair, the right gel or cream, and application technique. Apply product to soaking wet hair in sections. Use praying hands, then scrunch up. If your hair is dry when you apply product, the curls have already separated. Timing is everything.',
    auntyId: 'carmen',
  },
  {
    id: 'qa-protein-porosity',
    question: 'Is protein bad for high porosity hair?',
    answer: 'The opposite. High porosity hair has gaps in the cuticle. Protein fills those gaps temporarily, reducing moisture loss. The key is balance — a light protein treatment every 2 weeks, paired with deep moisture after. Protein isn\'t the enemy. Protein without moisture is.',
    auntyId: 'amara',
  },
  {
    id: 'qa-itchy-scalp',
    question: 'Why is my scalp itchy between washes?',
    answer: 'Buildup. Your scalp is producing oil, collecting dust, and product residue is accumulating. Try a scalp rinse mid-week with diluted apple cider vinegar, or use a scalp brush in the shower. You don\'t need to wash your hair to cleanse your scalp.',
    auntyId: 'salma',
  },
  {
    id: 'qa-second-day',
    question: 'How do I make my curls last past day one?',
    answer: 'Sleep on a satin pillowcase or use a satin bonnet. In the morning, mist lightly — don\'t soak — with water and a tiny bit of leave-in. Scrunch. Don\'t rake, don\'t comb. Day two hair is about refreshing, not restyling. Less is more.',
    auntyId: 'denise',
  },
  {
    id: 'qa-frizz',
    question: 'How do I reduce frizz without weighing my hair down?',
    answer: 'Frizz is individual strands that didn\'t join a curl clump. Prevention starts in the shower: apply styler to dripping wet hair, don\'t touch it while drying. If you diffuse, use low heat and don\'t move the diffuser. Touching your hair while it dries is the number one cause of frizz.',
    auntyId: 'fatou',
  },
];

// ─── Category metadata ──────────────────────────────────────────

export const CATEGORIES: { key: ContentCategory; label: string; count: number }[] = [
  { key: 'method', label: 'Method', count: METHOD_ARTICLES.length },
  { key: 'products', label: 'Products', count: PRODUCT_ARTICLES.length },
  { key: 'people', label: 'People', count: APPROVED_CREATORS.length },
  { key: 'qa', label: 'Q\u0026A', count: COUNCIL_QA.length },
];
