const express = require('express');
const { requireAuth, respond } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');
const { generateSendoff } = require('../services/gemini');

const router = express.Router();

// POST /api/sendoff/generate
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { user_id, routine_id, user_name } = req.body;
    if (!user_id) return respond(res, false, null, 'user_id required', 400);

    // 1. Fetch hair profile
    const { data: profile } = await supabaseAdmin
      .from('hair_profiles')
      .select('curl_type, porosity, primary_goal, damage_level')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    // 2. Fetch user name if not provided
    let name = user_name;
    if (!name) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('name')
        .eq('id', user_id)
        .single();
      name = user?.name || 'beautiful';
    }

    // 3. Generate sendoff message
    const message = await generateSendoff(name, profile || {});

    // The brand line "Go live and make ya aunty proud." is always hardcoded in the frontend
    return respond(res, true, { message });
  } catch (err) {
    console.error('Sendoff error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

module.exports = router;
