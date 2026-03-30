const express = require('express');
const { requireAuth, respond } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');
const { generateCheckinResponse } = require('../services/gemini');
const { scheduleCheckinNotification } = require('../services/notifications');

const router = express.Router();

function selectRespondingAunty(data) {
  const { moisture_rating, frizz_rating, condition_rating, routine_followed } = data;

  if (
    routine_followed === 'Yes' &&
    moisture_rating >= 4 &&
    frizz_rating <= 2 &&
    condition_rating >= 4
  ) {
    return 'ngozi'; // Celebration — Ngozi leads the collective cheer
  }
  if (routine_followed === 'No') return 'denise';
  if (moisture_rating <= 2) return 'ngozi';
  if (frizz_rating >= 4) return 'carmen';
  if (condition_rating <= 2) return 'marcia';
  return 'amara'; // Default
}

// POST /api/checkin/submit
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const {
      user_id,
      routine_id,
      checkin_week,
      routine_followed,
      moisture_rating,
      frizz_rating,
      condition_rating,
      products_used,
      notes,
    } = req.body;

    if (!user_id || !checkin_week) {
      return respond(res, false, null, 'user_id and checkin_week required', 400);
    }

    // 1. Insert checkin record (initial, without response yet)
    const { data: checkin, error: insertError } = await supabaseAdmin
      .from('checkins')
      .insert({
        user_id,
        routine_id: routine_id || null,
        checkin_week,
        routine_followed,
        moisture_rating,
        frizz_rating,
        condition_rating,
        products_used: products_used || [],
        notes: notes || null,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (insertError) throw new Error(insertError.message);

    // 2. Fetch hair profile for context
    const { data: profile } = await supabaseAdmin
      .from('hair_profiles')
      .select('curl_type, porosity, primary_goal')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    // 3. Determine which aunty responds
    const respondingAunty = selectRespondingAunty({
      moisture_rating,
      frizz_rating,
      condition_rating,
      routine_followed,
    });

    // 4. Generate aunty response from Gemini
    const auntyMessage = await generateCheckinResponse(respondingAunty, {
      checkin_week,
      routine_followed,
      moisture_rating,
      frizz_rating,
      condition_rating,
      notes,
    }, profile);

    // 5. Update checkin with aunty response
    await supabaseAdmin
      .from('checkins')
      .update({
        aunty_response_aunty: respondingAunty,
        aunty_response_text: auntyMessage,
      })
      .eq('id', checkin.id);

    // 6. Schedule next check-in notification if not week 4
    if (checkin_week < 4) {
      await scheduleCheckinNotification(user_id, checkin_week + 1).catch(
        (err) => console.error('Notification schedule error:', err.message)
      );
    }

    return respond(res, true, {
      checkin_id: checkin.id,
      aunty_response: { aunty_id: respondingAunty, message: auntyMessage },
    });
  } catch (err) {
    console.error('Checkin error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

module.exports = router;
