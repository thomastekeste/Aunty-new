// Water hardness data by city
// Measured in mg/L as CaCO3 (calcium carbonate)
// soft: 0–60 | medium: 61–120 | hard: 121–200 | very_hard: 200+

export type WaterHardness = 'soft' | 'medium' | 'hard' | 'very_hard';

export interface CityData {
  name: string;
  country: string;
  region?: string;
  hardness: WaterHardness;
  mgL: number; // approx mg/L CaCO3
}

export const WATER_HARDNESS_LABELS: Record<WaterHardness, string> = {
  soft: 'Soft Water',
  medium: 'Medium Water',
  hard: 'Hard Water',
  very_hard: 'Very Hard Water',
};

export const WATER_HARDNESS_COLORS: Record<WaterHardness, string> = {
  soft: '#00B4D8',      // soft blue — gentle, easy on hair
  medium: '#F5C542',    // gold — balanced
  hard: '#FB5607',      // orange — takes more effort
  very_hard: '#E0142C', // red — serious impact on hair
};

export const WATER_HARDNESS_TIPS: Record<WaterHardness, string> = {
  soft: 'Soft water is gentle on your hair — products lather well and moisture absorbs easily.',
  medium: 'Balanced water — most routines work well, minimal mineral buildup.',
  hard: 'Hard water leaves mineral deposits. Regular clarifying and acidic rinses will help.',
  very_hard: 'Very hard water can block moisture absorption and cause significant buildup. A shower filter is your best friend.',
};

export const CITIES: CityData[] = [
  // United States
  { name: 'New York', country: 'USA', region: 'NY', hardness: 'soft', mgL: 55 },
  { name: 'Los Angeles', country: 'USA', region: 'CA', hardness: 'hard', mgL: 300 },
  { name: 'Chicago', country: 'USA', region: 'IL', hardness: 'hard', mgL: 145 },
  { name: 'Houston', country: 'USA', region: 'TX', hardness: 'medium', mgL: 115 },
  { name: 'Phoenix', country: 'USA', region: 'AZ', hardness: 'very_hard', mgL: 350 },
  { name: 'Philadelphia', country: 'USA', region: 'PA', hardness: 'medium', mgL: 85 },
  { name: 'San Antonio', country: 'USA', region: 'TX', hardness: 'very_hard', mgL: 270 },
  { name: 'San Diego', country: 'USA', region: 'CA', hardness: 'hard', mgL: 200 },
  { name: 'Dallas', country: 'USA', region: 'TX', hardness: 'hard', mgL: 140 },
  { name: 'San Francisco', country: 'USA', region: 'CA', hardness: 'soft', mgL: 45 },
  { name: 'Austin', country: 'USA', region: 'TX', hardness: 'very_hard', mgL: 225 },
  { name: 'Seattle', country: 'USA', region: 'WA', hardness: 'soft', mgL: 20 },
  { name: 'Denver', country: 'USA', region: 'CO', hardness: 'hard', mgL: 130 },
  { name: 'Nashville', country: 'USA', region: 'TN', hardness: 'medium', mgL: 110 },
  { name: 'Oklahoma City', country: 'USA', region: 'OK', hardness: 'hard', mgL: 155 },
  { name: 'Las Vegas', country: 'USA', region: 'NV', hardness: 'very_hard', mgL: 410 },
  { name: 'Washington DC', country: 'USA', region: 'DC', hardness: 'soft', mgL: 50 },
  { name: 'Boston', country: 'USA', region: 'MA', hardness: 'soft', mgL: 18 },
  { name: 'Portland', country: 'USA', region: 'OR', hardness: 'soft', mgL: 22 },
  { name: 'Atlanta', country: 'USA', region: 'GA', hardness: 'soft', mgL: 28 },
  { name: 'Miami', country: 'USA', region: 'FL', hardness: 'hard', mgL: 195 },
  { name: 'Minneapolis', country: 'USA', region: 'MN', hardness: 'hard', mgL: 150 },
  { name: 'Baltimore', country: 'USA', region: 'MD', hardness: 'medium', mgL: 80 },
  { name: 'Charlotte', country: 'USA', region: 'NC', hardness: 'soft', mgL: 35 },
  { name: 'Raleigh', country: 'USA', region: 'NC', hardness: 'soft', mgL: 25 },
  { name: 'Columbus', country: 'USA', region: 'OH', hardness: 'hard', mgL: 150 },
  { name: 'Indianapolis', country: 'USA', region: 'IN', hardness: 'hard', mgL: 165 },
  { name: 'Detroit', country: 'USA', region: 'MI', hardness: 'medium', mgL: 90 },
  { name: 'Memphis', country: 'USA', region: 'TN', hardness: 'soft', mgL: 60 },
  { name: 'New Orleans', country: 'USA', region: 'LA', hardness: 'soft', mgL: 45 },
  { name: 'Richmond', country: 'USA', region: 'VA', hardness: 'soft', mgL: 40 },
  { name: 'Tampa', country: 'USA', region: 'FL', hardness: 'hard', mgL: 200 },
  { name: 'Orlando', country: 'USA', region: 'FL', hardness: 'hard', mgL: 180 },
  { name: 'Jacksonville', country: 'USA', region: 'FL', hardness: 'hard', mgL: 140 },
  { name: 'St. Louis', country: 'USA', region: 'MO', hardness: 'hard', mgL: 125 },
  { name: 'Kansas City', country: 'USA', region: 'MO', hardness: 'medium', mgL: 120 },
  { name: 'Sacramento', country: 'USA', region: 'CA', hardness: 'medium', mgL: 75 },
  { name: 'Oakland', country: 'USA', region: 'CA', hardness: 'soft', mgL: 35 },
  { name: 'Pittsburgh', country: 'USA', region: 'PA', hardness: 'soft', mgL: 55 },
  { name: 'Cincinnati', country: 'USA', region: 'OH', hardness: 'hard', mgL: 155 },
  { name: 'Cleveland', country: 'USA', region: 'OH', hardness: 'medium', mgL: 100 },
  { name: 'Tucson', country: 'USA', region: 'AZ', hardness: 'very_hard', mgL: 300 },
  { name: 'Albuquerque', country: 'USA', region: 'NM', hardness: 'hard', mgL: 160 },
  { name: 'Fresno', country: 'USA', region: 'CA', hardness: 'medium', mgL: 80 },
  { name: 'Omaha', country: 'USA', region: 'NE', hardness: 'hard', mgL: 170 },
  { name: 'Tulsa', country: 'USA', region: 'OK', hardness: 'hard', mgL: 130 },
  { name: 'Milwaukee', country: 'USA', region: 'WI', hardness: 'hard', mgL: 145 },

  // United Kingdom
  { name: 'London', country: 'UK', hardness: 'hard', mgL: 275 },
  { name: 'Manchester', country: 'UK', hardness: 'soft', mgL: 50 },
  { name: 'Birmingham', country: 'UK', hardness: 'medium', mgL: 100 },
  { name: 'Leeds', country: 'UK', hardness: 'soft', mgL: 40 },
  { name: 'Glasgow', country: 'UK', hardness: 'soft', mgL: 20 },
  { name: 'Liverpool', country: 'UK', hardness: 'soft', mgL: 70 },
  { name: 'Edinburgh', country: 'UK', hardness: 'soft', mgL: 35 },
  { name: 'Bristol', country: 'UK', hardness: 'hard', mgL: 190 },
  { name: 'Sheffield', country: 'UK', hardness: 'soft', mgL: 55 },
  { name: 'Leicester', country: 'UK', hardness: 'hard', mgL: 165 },
  { name: 'Coventry', country: 'UK', hardness: 'hard', mgL: 155 },
  { name: 'Nottingham', country: 'UK', hardness: 'medium', mgL: 110 },
  { name: 'Cardiff', country: 'UK', hardness: 'soft', mgL: 45 },
  { name: 'Belfast', country: 'UK', hardness: 'soft', mgL: 30 },
  { name: 'Cambridge', country: 'UK', hardness: 'very_hard', mgL: 310 },
  { name: 'Oxford', country: 'UK', hardness: 'hard', mgL: 250 },

  // Canada
  { name: 'Toronto', country: 'Canada', hardness: 'hard', mgL: 130 },
  { name: 'Montreal', country: 'Canada', hardness: 'soft', mgL: 75 },
  { name: 'Vancouver', country: 'Canada', hardness: 'soft', mgL: 15 },
  { name: 'Calgary', country: 'Canada', hardness: 'hard', mgL: 185 },
  { name: 'Ottawa', country: 'Canada', hardness: 'medium', mgL: 105 },
  { name: 'Edmonton', country: 'Canada', hardness: 'medium', mgL: 95 },
  { name: 'Winnipeg', country: 'Canada', hardness: 'hard', mgL: 170 },
  { name: 'Halifax', country: 'Canada', hardness: 'soft', mgL: 30 },

  // Africa — West
  { name: 'Lagos', country: 'Nigeria', hardness: 'soft', mgL: 35 },
  { name: 'Abuja', country: 'Nigeria', hardness: 'medium', mgL: 85 },
  { name: 'Accra', country: 'Ghana', hardness: 'medium', mgL: 100 },
  { name: 'Kumasi', country: 'Ghana', hardness: 'soft', mgL: 50 },
  { name: 'Dakar', country: 'Senegal', hardness: 'medium', mgL: 90 },
  { name: 'Abidjan', country: 'Ivory Coast', hardness: 'soft', mgL: 30 },
  { name: 'Conakry', country: 'Guinea', hardness: 'soft', mgL: 25 },
  { name: 'Freetown', country: 'Sierra Leone', hardness: 'soft', mgL: 20 },
  { name: 'Monrovia', country: 'Liberia', hardness: 'soft', mgL: 15 },
  { name: 'Bamako', country: 'Mali', hardness: 'medium', mgL: 95 },
  { name: 'Ouagadougou', country: 'Burkina Faso', hardness: 'medium', mgL: 110 },

  // Africa — East
  { name: 'Nairobi', country: 'Kenya', hardness: 'hard', mgL: 145 },
  { name: 'Mombasa', country: 'Kenya', hardness: 'hard', mgL: 165 },
  { name: 'Dar es Salaam', country: 'Tanzania', hardness: 'medium', mgL: 100 },
  { name: 'Addis Ababa', country: 'Ethiopia', hardness: 'medium', mgL: 80 },
  { name: 'Kampala', country: 'Uganda', hardness: 'soft', mgL: 55 },
  { name: 'Kigali', country: 'Rwanda', hardness: 'soft', mgL: 30 },
  { name: 'Asmara', country: 'Eritrea', hardness: 'medium', mgL: 95 },

  // Africa — South
  { name: 'Johannesburg', country: 'South Africa', hardness: 'hard', mgL: 170 },
  { name: 'Cape Town', country: 'South Africa', hardness: 'soft', mgL: 30 },
  { name: 'Durban', country: 'South Africa', hardness: 'medium', mgL: 100 },
  { name: 'Pretoria', country: 'South Africa', hardness: 'hard', mgL: 155 },
  { name: 'Harare', country: 'Zimbabwe', hardness: 'soft', mgL: 45 },
  { name: 'Lusaka', country: 'Zambia', hardness: 'soft', mgL: 40 },
  { name: 'Maputo', country: 'Mozambique', hardness: 'medium', mgL: 85 },

  // Africa — North
  { name: 'Cairo', country: 'Egypt', hardness: 'hard', mgL: 220 },
  { name: 'Alexandria', country: 'Egypt', hardness: 'hard', mgL: 190 },
  { name: 'Casablanca', country: 'Morocco', hardness: 'hard', mgL: 230 },
  { name: 'Rabat', country: 'Morocco', hardness: 'hard', mgL: 210 },
  { name: 'Tunis', country: 'Tunisia', hardness: 'very_hard', mgL: 320 },
  { name: 'Algiers', country: 'Algeria', hardness: 'hard', mgL: 195 },
  { name: 'Tripoli', country: 'Libya', hardness: 'very_hard', mgL: 380 },
  { name: 'Khartoum', country: 'Sudan', hardness: 'hard', mgL: 160 },

  // Caribbean
  { name: 'Kingston', country: 'Jamaica', hardness: 'medium', mgL: 110 },
  { name: 'Port of Spain', country: 'Trinidad & Tobago', hardness: 'medium', mgL: 95 },
  { name: 'Bridgetown', country: 'Barbados', hardness: 'hard', mgL: 150 },
  { name: 'Nassau', country: 'Bahamas', hardness: 'hard', mgL: 220 },
  { name: 'Santo Domingo', country: 'Dominican Republic', hardness: 'medium', mgL: 120 },
  { name: 'Havana', country: 'Cuba', hardness: 'medium', mgL: 105 },
  { name: 'Port-au-Prince', country: 'Haiti', hardness: 'medium', mgL: 90 },
  { name: 'Georgetown', country: 'Guyana', hardness: 'soft', mgL: 40 },
  { name: 'Paramaribo', country: 'Suriname', hardness: 'soft', mgL: 35 },

  // Latin America
  { name: 'São Paulo', country: 'Brazil', hardness: 'soft', mgL: 45 },
  { name: 'Rio de Janeiro', country: 'Brazil', hardness: 'soft', mgL: 30 },
  { name: 'Brasília', country: 'Brazil', hardness: 'soft', mgL: 25 },
  { name: 'Salvador', country: 'Brazil', hardness: 'soft', mgL: 40 },
  { name: 'Bogotá', country: 'Colombia', hardness: 'soft', mgL: 50 },
  { name: 'Medellín', country: 'Colombia', hardness: 'soft', mgL: 35 },
  { name: 'Mexico City', country: 'Mexico', hardness: 'hard', mgL: 175 },
  { name: 'Guadalajara', country: 'Mexico', hardness: 'hard', mgL: 140 },
  { name: 'Monterrey', country: 'Mexico', hardness: 'very_hard', mgL: 280 },
  { name: 'Lima', country: 'Peru', hardness: 'soft', mgL: 55 },
  { name: 'Buenos Aires', country: 'Argentina', hardness: 'medium', mgL: 90 },
  { name: 'Santiago', country: 'Chile', hardness: 'soft', mgL: 45 },

  // Europe
  { name: 'Paris', country: 'France', hardness: 'hard', mgL: 280 },
  { name: 'Lyon', country: 'France', hardness: 'soft', mgL: 55 },
  { name: 'Marseille', country: 'France', hardness: 'hard', mgL: 195 },
  { name: 'Berlin', country: 'Germany', hardness: 'hard', mgL: 250 },
  { name: 'Munich', country: 'Germany', hardness: 'soft', mgL: 55 },
  { name: 'Hamburg', country: 'Germany', hardness: 'soft', mgL: 45 },
  { name: 'Amsterdam', country: 'Netherlands', hardness: 'medium', mgL: 120 },
  { name: 'Rotterdam', country: 'Netherlands', hardness: 'soft', mgL: 60 },
  { name: 'Brussels', country: 'Belgium', hardness: 'medium', mgL: 110 },
  { name: 'Madrid', country: 'Spain', hardness: 'medium', mgL: 100 },
  { name: 'Barcelona', country: 'Spain', hardness: 'very_hard', mgL: 360 },
  { name: 'Rome', country: 'Italy', hardness: 'very_hard', mgL: 310 },
  { name: 'Milan', country: 'Italy', hardness: 'medium', mgL: 115 },
  { name: 'Stockholm', country: 'Sweden', hardness: 'soft', mgL: 40 },
  { name: 'Oslo', country: 'Norway', hardness: 'soft', mgL: 15 },
  { name: 'Copenhagen', country: 'Denmark', hardness: 'soft', mgL: 60 },
  { name: 'Helsinki', country: 'Finland', hardness: 'soft', mgL: 30 },
  { name: 'Zurich', country: 'Switzerland', hardness: 'soft', mgL: 45 },
  { name: 'Vienna', country: 'Austria', hardness: 'soft', mgL: 25 },
  { name: 'Warsaw', country: 'Poland', hardness: 'medium', mgL: 100 },
  { name: 'Prague', country: 'Czech Republic', hardness: 'medium', mgL: 100 },
  { name: 'Budapest', country: 'Hungary', hardness: 'hard', mgL: 175 },
  { name: 'Lisbon', country: 'Portugal', hardness: 'soft', mgL: 50 },
  { name: 'Athens', country: 'Greece', hardness: 'hard', mgL: 190 },
  { name: 'Dublin', country: 'Ireland', hardness: 'soft', mgL: 40 },

  // Middle East
  { name: 'Dubai', country: 'UAE', hardness: 'very_hard', mgL: 400 },
  { name: 'Abu Dhabi', country: 'UAE', hardness: 'very_hard', mgL: 380 },
  { name: 'Riyadh', country: 'Saudi Arabia', hardness: 'very_hard', mgL: 440 },
  { name: 'Jeddah', country: 'Saudi Arabia', hardness: 'hard', mgL: 190 },
  { name: 'Doha', country: 'Qatar', hardness: 'very_hard', mgL: 350 },
  { name: 'Kuwait City', country: 'Kuwait', hardness: 'very_hard', mgL: 420 },
  { name: 'Beirut', country: 'Lebanon', hardness: 'hard', mgL: 175 },
  { name: 'Amman', country: 'Jordan', hardness: 'hard', mgL: 165 },
  { name: 'Tel Aviv', country: 'Israel', hardness: 'hard', mgL: 200 },

  // Asia
  { name: 'Mumbai', country: 'India', hardness: 'soft', mgL: 50 },
  { name: 'Delhi', country: 'India', hardness: 'hard', mgL: 175 },
  { name: 'Bangalore', country: 'India', hardness: 'medium', mgL: 90 },
  { name: 'Chennai', country: 'India', hardness: 'medium', mgL: 110 },
  { name: 'Kolkata', country: 'India', hardness: 'soft', mgL: 55 },
  { name: 'Singapore', country: 'Singapore', hardness: 'soft', mgL: 35 },
  { name: 'Kuala Lumpur', country: 'Malaysia', hardness: 'soft', mgL: 30 },
  { name: 'Jakarta', country: 'Indonesia', hardness: 'soft', mgL: 40 },
  { name: 'Manila', country: 'Philippines', hardness: 'medium', mgL: 85 },
  { name: 'Bangkok', country: 'Thailand', hardness: 'soft', mgL: 40 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', hardness: 'soft', mgL: 50 },
  { name: 'Tokyo', country: 'Japan', hardness: 'soft', mgL: 60 },
  { name: 'Osaka', country: 'Japan', hardness: 'soft', mgL: 45 },
  { name: 'Seoul', country: 'South Korea', hardness: 'soft', mgL: 70 },
  { name: 'Shanghai', country: 'China', hardness: 'soft', mgL: 60 },
  { name: 'Beijing', country: 'China', hardness: 'hard', mgL: 190 },
  { name: 'Hong Kong', country: 'China', hardness: 'soft', mgL: 40 },

  // Australia & New Zealand
  { name: 'Sydney', country: 'Australia', hardness: 'soft', mgL: 45 },
  { name: 'Melbourne', country: 'Australia', hardness: 'soft', mgL: 30 },
  { name: 'Brisbane', country: 'Australia', hardness: 'soft', mgL: 50 },
  { name: 'Perth', country: 'Australia', hardness: 'hard', mgL: 175 },
  { name: 'Adelaide', country: 'Australia', hardness: 'hard', mgL: 145 },
  { name: 'Auckland', country: 'New Zealand', hardness: 'soft', mgL: 25 },
];

export function searchCities(query: string): CityData[] {
  if (!query || query.trim().length < 2) return [];
  const lower = query.toLowerCase().trim();
  return CITIES.filter(
    c =>
      c.name.toLowerCase().includes(lower) ||
      c.country.toLowerCase().includes(lower) ||
      (c.region && c.region.toLowerCase().includes(lower))
  ).slice(0, 8);
}
