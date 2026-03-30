const express = require('express');
const multer = require('multer');
const { requireAuth, respond } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabase');
const { uploadHairPhoto, uploadProgressPhoto } = require('../services/storage');
const { analyzeHairPhoto } = require('../services/gemini');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/photos/analyze — intake photo upload + Gemini vision analysis
router.post('/analyze', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { user_id, photo_type, session_id } = req.body;
    const file = req.file;

    if (!file) return respond(res, false, null, 'No photo file provided', 400);
    if (!user_id) return respond(res, false, null, 'user_id required', 400);

    // 1. Upload to Supabase storage
    const { url } = await uploadHairPhoto(file, user_id, 'intake', photo_type || 'front');

    // 2. Gemini vision analysis
    const analysis = await analyzeHairPhoto(file.buffer, file.mimetype);

    // 3. Insert into photos table — full analysis_json never truncated
    const { data: photo, error } = await supabaseAdmin
      .from('photos')
      .insert({
        user_id,
        photo_url: url,
        photo_type: photo_type || 'front',
        upload_session: 'intake',
        session_id,
        analysis_json: analysis,
        curl_type_detected: analysis.curl_type,
        porosity_detected: analysis.porosity,
        damage_detected: analysis.damage_level,
        analysis_confidence: analysis.curl_type_confidence,
      })
      .select('id')
      .single();
    if (error) throw new Error(`Photo insert failed: ${error.message}`);

    // 4. Update hair profile with detected values if confident
    if (analysis.curl_type_confidence === 'high') {
      await supabaseAdmin
        .from('hair_profiles')
        .update({
          curl_type: analysis.curl_type,
          porosity: analysis.porosity,
          density: analysis.density,
          damage_level: analysis.damage_level,
          scalp_condition: analysis.scalp_observations ? 'analyzed' : null,
        })
        .eq('user_id', user_id)
        .is('deleted_at', null);
    }

    return respond(res, true, { photo_id: photo.id, analysis });
  } catch (err) {
    console.error('Photo analyze error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

// POST /api/photos/progress — week check-in progress photo
router.post('/progress', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { user_id, week_number } = req.body;
    const file = req.file;

    if (!file) return respond(res, false, null, 'No photo file provided', 400);
    if (!user_id || !week_number) return respond(res, false, null, 'user_id and week_number required', 400);

    const weekNum = parseInt(week_number, 10);

    // 1. Upload to progress-photos bucket
    const { url } = await uploadProgressPhoto(file, user_id, weekNum);

    // 2. Gemini vision analysis
    const analysis = await analyzeHairPhoto(file.buffer, file.mimetype);

    // 3. Insert photo record
    const { data: photo, error } = await supabaseAdmin
      .from('photos')
      .insert({
        user_id,
        photo_url: url,
        photo_type: 'progress',
        upload_session: 'checkin',
        week_number: weekNum,
        analysis_json: analysis,
        curl_type_detected: analysis.curl_type,
        porosity_detected: analysis.porosity,
        damage_detected: analysis.damage_level,
        analysis_confidence: analysis.curl_type_confidence,
      })
      .select('id')
      .single();
    if (error) throw new Error(`Progress photo insert failed: ${error.message}`);

    // 4. Compare to week 1 baseline if this is week 2+
    let comparison_to_baseline = null;
    if (weekNum > 1) {
      const { data: baseline } = await supabaseAdmin
        .from('photos')
        .select('analysis_json')
        .eq('user_id', user_id)
        .eq('week_number', 1)
        .eq('upload_session', 'checkin')
        .is('deleted_at', null)
        .single();

      if (baseline?.analysis_json) {
        const b = baseline.analysis_json;
        const damageScale = { none: 0, mild: 1, moderate: 2, severe: 3 };
        const moistureScale = { very_dry: 0, dry: 1, normal: 2, moisturized: 3 };
        comparison_to_baseline = {
          damage_change:
            damageScale[b.damage_level] - damageScale[analysis.damage_level] > 0
              ? 'improved'
              : damageScale[b.damage_level] - damageScale[analysis.damage_level] < 0
              ? 'worsened'
              : 'same',
          moisture_change:
            moistureScale[analysis.moisture_level_visual] - moistureScale[b.moisture_level_visual] > 0
              ? 'improved'
              : moistureScale[analysis.moisture_level_visual] - moistureScale[b.moisture_level_visual] < 0
              ? 'declined'
              : 'same',
          baseline_curl_type: b.curl_type,
          current_curl_type: analysis.curl_type,
        };
      }
    }

    return respond(res, true, { photo_id: photo.id, analysis, comparison_to_baseline });
  } catch (err) {
    console.error('Progress photo error:', err);
    return respond(res, false, null, err.message, 500);
  }
});

module.exports = router;
