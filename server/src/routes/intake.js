const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, respond } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');

const router = express.Router();

// Map intake question_key answers to hair_profile fields
function buildProfileFromResponses(responses) {
  const map = {};
  responses.forEach(({ question_key, answer_value }) => {
    map[question_key] = answer_value;
  });

  return {
    curl_type: null, // filled in after photo analysis
    porosity: null,
    density: null,
    scalp_condition: null,
    damage_level: null,
    primary_goal: map['primary_goal'] || null,
    wash_frequency: map['wash_frequency'] || null,
    heat_use: map['heat_styling'] || null,
    protective_styles: map['protective_styling'] || null,
    water_situation: map['water_situation'] || null,
    previously_relaxed: map['previously_relaxed']
      ? map['previously_relaxed'] !== 'Never relaxed'
      : null,
    transitioning: map['previously_relaxed'] === 'Transitioning',
    failed_before: map['failed_before']
      ? map['failed_before'].split(',').map((s) => s.trim())
      : [],
    scalp_concerns: map['scalp_concerns']
      ? map['scalp_concerns'].split(',').map((s) => s.trim())
      : [],
  };
}

// POST /api/onboarding/intake
router.post('/', requireAuth, async (req, res) => {
  try {
    const { user_id, session_id, responses } = req.body;
    if (!user_id || !responses || !Array.isArray(responses)) {
      return respond(res, false, null, 'Missing required fields', 400);
    }

    const sessionId = session_id || uuidv4();

    // 1. Insert every response as its own row
    const responseRows = responses.map((r) => ({
      user_id,
      session_id: sessionId,
      question_key: r.question_key,
      answer_value: Array.isArray(r.answer_value)
        ? r.answer_value.join(',')
        : r.answer_value,
      answer_type: r.answer_type || 'single',
    }));

    const { error: intakeError } = await supabaseAdmin
      .from('intake_responses')
      .insert(responseRows);
    if (intakeError) throw new Error(`Intake insert failed: ${intakeError.message}`);

    // 2. Build hair profile from responses
    const profileFields = buildProfileFromResponses(
      responses.map((r) => ({
        question_key: r.question_key,
        answer_value: Array.isArray(r.answer_value)
          ? r.answer_value.join(',')
          : r.answer_value,
      }))
    );

    // 3. Upsert hair_profiles
    const { data: existing } = await supabaseAdmin
      .from('hair_profiles')
      .select('id, version_number')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    let profileId;
    if (existing) {
      // Save version snapshot before updating
      await supabaseAdmin.from('hair_profile_versions').insert({
        hair_profile_id: existing.id,
        user_id,
        snapshot: existing,
        version_number: (existing.version_number || 1),
      });

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('hair_profiles')
        .update(profileFields)
        .eq('id', existing.id)
        .select('id')
        .single();
      if (updateError) throw new Error(updateError.message);
      profileId = updated.id;
    } else {
      const { data: created, error: createError } = await supabaseAdmin
        .from('hair_profiles')
        .insert({ user_id, ...profileFields })
        .select('id')
        .single();
      if (createError) throw new Error(createError.message);
      profileId = created.id;
    }

    return respond(res, true, { profile_id: profileId, session_id: sessionId });
  } catch (err) {
    console.error('Intake error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

module.exports = router;
