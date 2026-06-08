import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env'), override: true });

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  appleClientId: process.env.APPLE_CLIENT_ID || 'com.auntycurl.app',
  appleTeamId: process.env.APPLE_TEAM_ID,
  appleKeyId: process.env.APPLE_KEY_ID,
  applePrivateKey: process.env.APPLE_PRIVATE_KEY,
  port: parseInt(process.env.PORT, 10) || 3001,
};

// Validate required vars in production
const required = ['supabaseUrl', 'supabaseAnonKey', 'supabaseServiceKey', 'anthropicApiKey'];
for (const key of required) {
  if (!config[key]) {
    console.warn(`Warning: Missing required env var for config.${key}`);
  }
}

export default config;
