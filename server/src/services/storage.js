const { supabaseAdmin } = require('./supabase');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10mb

function validatePhoto(file) {
  if (!file) throw new Error('No file provided');
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
}

async function uploadHairPhoto(file, userId, sessionType, photoType) {
  validatePhoto(file);
  const timestamp = Date.now();
  const path = `${userId}/${sessionType}/${timestamp}_${photoType}.jpg`;
  const { data, error } = await supabaseAdmin.storage
    .from('hair-photos')
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: urlData } = supabaseAdmin.storage
    .from('hair-photos')
    .getPublicUrl(path);
  return { path, url: urlData.publicUrl };
}

async function uploadProgressPhoto(file, userId, weekNumber) {
  validatePhoto(file);
  const timestamp = Date.now();
  const path = `${userId}/week_${weekNumber}/${timestamp}.jpg`;
  const { data, error } = await supabaseAdmin.storage
    .from('progress-photos')
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: urlData } = supabaseAdmin.storage
    .from('progress-photos')
    .getPublicUrl(path);
  return { path, url: urlData.publicUrl };
}

module.exports = { uploadHairPhoto, uploadProgressPhoto, validatePhoto };
