require('dotenv').config();

module.exports = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  revenueCatApiKey: process.env.REVENUECAT_API_KEY,
  expoProjectId: process.env.EXPO_PROJECT_ID,
  adminPassword: process.env.ADMIN_PASSWORD || 'aunty_admin_2025',
  port: parseInt(process.env.PORT || '3001', 10),
};
