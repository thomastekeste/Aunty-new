const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = require('../config');

// Standard client — respects RLS, used for user-scoped operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client — bypasses RLS, used for admin dashboard and server-side writes
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create a user-scoped client using a JWT from the request header
function getUserClient(jwt) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

module.exports = { supabase, supabaseAdmin, getUserClient };
