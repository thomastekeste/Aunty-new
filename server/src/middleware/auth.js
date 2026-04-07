import { createClient } from '@supabase/supabase-js';
import config from '../config.js';

/**
 * Auth middleware — verifies the JWT from the Authorization header
 * using Supabase's auth.getUser() and attaches the user to req.user.
 */
const supabaseAuth = createClient(config.supabaseUrl, config.supabaseAnonKey);

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
