const express = require('express');
const { requireAuth, respond } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');
const { generateAllAuntyMessages, AUNTY_PROMPTS, TEXT_MODEL } = require('../services/gemini');

const router = express.Router();

// POST /api/council/generate — all 7 aunty messages in parallel
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { user_id, routine_id, intake_session_id } = req.body;
    if (!user_id || !intake_session_id) {
      return respond(res, false, null, 'user_id and intake_session_id required', 400);
    }

    // 1. Fetch all intake responses for this session
    const { data: responses, error: respError } = await supabaseAdmin
      .from('intake_responses')
      .select('question_key, answer_value')
      .eq('user_id', user_id)
      .eq('session_id', intake_session_id)
      .is('deleted_at', null);
    if (respError) throw new Error(respError.message);

    // 2. Fetch hair profile
    const { data: profile } = await supabaseAdmin
      .from('hair_profiles')
      .select('*')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    // 3. Fetch photo analyses for this session
    const { data: photos } = await supabaseAdmin
      .from('photos')
      .select('analysis_json, photo_type')
      .eq('user_id', user_id)
      .eq('upload_session', 'intake')
      .is('deleted_at', null);

    // 4. Fetch user record for water hardness and location
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('water_hardness, city, country')
      .eq('id', user_id)
      .single();

    // Build intake map
    const intakeMap = {};
    (responses || []).forEach(({ question_key, answer_value }) => {
      intakeMap[question_key] = answer_value;
    });

    // 5. Build hair_context
    const hair_context = {
      curl_type: profile?.curl_type || 'unknown',
      curl_type_crown: profile?.curl_type_crown || null,
      curl_type_nape: profile?.curl_type_nape || null,
      porosity: profile?.porosity || 'unknown',
      density: profile?.density || 'unknown',
      damage_level: profile?.damage_level || 'unknown',
      scalp_condition: profile?.scalp_condition || 'unknown',
      primary_goal: profile?.primary_goal || intakeMap['primary_goal'] || 'moisture',
      wash_frequency: intakeMap['wash_frequency'] || null,
      heat_use: intakeMap['heat_styling'] || null,
      previously_relaxed: profile?.previously_relaxed || false,
      protective_styles: intakeMap['protective_styling'] || null,
      water_hardness: user?.water_hardness || intakeMap['water_situation'] || 'unknown',
      location: user?.city || null,
      failed_before: intakeMap['failed_before'] || null,
      scalp_concerns: intakeMap['scalp_concerns'] || null,
      photo_observations: (photos || []).map(
        (p) => p.analysis_json?.notable_observations || ''
      ),
    };

    // 6. Generate all 7 messages in parallel
    const messages = await generateAllAuntyMessages(hair_context);

    // 7. Store every message in council_messages table
    const insertRows = messages.map((m) => ({
      user_id,
      routine_id: routine_id || null,
      aunty_id: m.aunty_id,
      message_text: m.message_text,
      prompt_used: AUNTY_PROMPTS[m.aunty_id],
      model_used: TEXT_MODEL,
      intake_data_snapshot: hair_context,
      photo_analysis_snapshot: (photos || []).map((p) => p.analysis_json),
    }));

    const { error: msgError } = await supabaseAdmin
      .from('council_messages')
      .insert(insertRows);
    if (msgError) console.error('Council message insert error:', msgError.message);

    return respond(res, true, { messages });
  } catch (err) {
    console.error('Council generate error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

module.exports = router;
