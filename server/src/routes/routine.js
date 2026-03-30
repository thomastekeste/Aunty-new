const express = require('express');
const { requireAuth, respond } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');
const { generateRoutine } = require('../services/gemini');

const router = express.Router();

// POST /api/routine/generate
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { user_id, hair_profile_id, council_session_id } = req.body;
    if (!user_id) return respond(res, false, null, 'user_id required', 400);

    // 1. Fetch hair profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('hair_profiles')
      .select('*')
      .eq(hair_profile_id ? 'id' : 'user_id', hair_profile_id || user_id)
      .is('deleted_at', null)
      .single();
    if (profileError) throw new Error(`Hair profile not found: ${profileError.message}`);

    // 2. Fetch council messages (most recent session)
    const query = supabaseAdmin
      .from('council_messages')
      .select('aunty_id, message_text')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(7);

    const { data: councilMessages } = await query;

    // 3. Generate routine via Gemini
    const routineData = await generateRoutine(profile, councilMessages || []);

    // 4. Deactivate previous routines for this user
    await supabaseAdmin
      .from('routines')
      .update({ is_active: false })
      .eq('user_id', user_id)
      .is('deleted_at', null);

    // 5. Insert new routine
    const { data: routine, error: routineError } = await supabaseAdmin
      .from('routines')
      .insert({
        user_id,
        routine_json: routineData,
        generated_by_aunties: ['ngozi', 'marcia', 'denise', 'fatou', 'carmen', 'amara', 'salma'],
        curl_type_at_generation: profile.curl_type,
        porosity_at_generation: profile.porosity,
        is_active: true,
      })
      .select('id')
      .single();
    if (routineError) throw new Error(routineError.message);

    // 6. Insert each product into product_interactions (shown: true)
    if (routineData.products?.length) {
      const productRows = routineData.products.map((p) => ({
        user_id,
        routine_id: routine.id,
        product_name: p.name,
        brand: p.brand,
        aunty_recommended_by: p.recommended_by,
        curl_type_context: profile.curl_type,
        shown: true,
      }));
      await supabaseAdmin.from('product_interactions').insert(productRows);
    }

    return respond(res, true, { routine_id: routine.id, routine: routineData });
  } catch (err) {
    console.error('Routine generate error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

module.exports = router;
