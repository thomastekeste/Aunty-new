import { Product } from '@/types';

// Seed product database — affiliate links use Amazon Associates tag 'auntyco-20'
// Replace ASINs and affiliate links with real ones before launch
export const PRODUCTS: Product[] = [
  // FREE TIER (first 3 shown to free users)
  {
    id: 'p1',
    asin: 'B000QSNYC6',
    name: 'Cantu Shea Butter Leave-In Conditioner',
    brand: 'Cantu',
    category: 'leave_in',
    recommended_by_aunty_id: '1',
    free_tier_shown: true,
    affiliate_link: 'https://amazon.com/dp/B000QSNYC6?tag=auntyco-20',
    price_usd: 8.99,
  },
  {
    id: 'p2',
    asin: 'B003WBY0EW',
    name: 'SheaMoisture Jamaican Black Castor Oil Shampoo',
    brand: 'SheaMoisture',
    category: 'shampoo',
    recommended_by_aunty_id: '2',
    free_tier_shown: true,
    affiliate_link: 'https://amazon.com/dp/B003WBY0EW?tag=auntyco-20',
    price_usd: 11.99,
  },
  {
    id: 'p3',
    asin: 'B01LZM4H5J',
    name: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
    brand: 'Mielle',
    category: 'oil',
    recommended_by_aunty_id: '6',
    free_tier_shown: true,
    affiliate_link: 'https://amazon.com/dp/B01LZM4H5J?tag=auntyco-20',
    price_usd: 9.99,
  },
  // PAID TIER
  {
    id: 'p4',
    asin: 'B00CBIXOAK',
    name: 'As I Am Coconut CoWash',
    brand: 'As I Am',
    category: 'conditioner',
    recommended_by_aunty_id: '5',
    free_tier_shown: false,
    affiliate_link: 'https://amazon.com/dp/B00CBIXOAK?tag=auntyco-20',
    price_usd: 10.99,
  },
  {
    id: 'p5',
    asin: 'B0046JDVFG',
    name: 'Kinky-Curly Knot Today Leave In Conditioner',
    brand: 'Kinky-Curly',
    category: 'leave_in',
    recommended_by_aunty_id: '5',
    free_tier_shown: false,
    affiliate_link: 'https://amazon.com/dp/B0046JDVFG?tag=auntyco-20',
    price_usd: 12.99,
  },
  {
    id: 'p6',
    asin: 'B01LTBJ6OF',
    name: 'Camille Rose Naturals Curl Maker',
    brand: 'Camille Rose',
    category: 'styler',
    recommended_by_aunty_id: '3',
    free_tier_shown: false,
    affiliate_link: 'https://amazon.com/dp/B01LTBJ6OF?tag=auntyco-20',
    price_usd: 16.99,
  },
  {
    id: 'p7',
    asin: 'B0019LPKWY',
    name: 'Aphogee Two-Step Protein Treatment',
    brand: 'Aphogee',
    category: 'treatment',
    recommended_by_aunty_id: '4',
    free_tier_shown: false,
    affiliate_link: 'https://amazon.com/dp/B0019LPKWY?tag=auntyco-20',
    price_usd: 13.99,
  },
];

export const getFreeProducts = () => PRODUCTS.filter(p => p.free_tier_shown);
export const getAllProducts = () => PRODUCTS;
