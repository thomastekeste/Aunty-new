/**
 * Sanitize user input before embedding in AI prompts.
 * Strips characters that could be used for prompt injection.
 */
export function sanitizeForPrompt(value, maxLen = 50) {
  if (!value) return 'not specified';
  return String(value)
    .replace(/['"`;\\{}()\[\]]/g, '')
    .replace(/\n|\r/g, ' ')
    .replace(/ignore.*instructions/gi, '')
    .replace(/system.*prompt/gi, '')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeProfileForPrompt(profile) {
  if (!profile) return {};
  return {
    curlType: sanitizeForPrompt(profile.curlType, 5),
    porosity: sanitizeForPrompt(profile.porosity, 10),
    elasticity: sanitizeForPrompt(profile.elasticity, 10),
    density: sanitizeForPrompt(profile.density, 10),
    primaryGoal: sanitizeForPrompt(profile.primaryGoal, 30),
    washFrequency: sanitizeForPrompt(profile.washFrequency, 20),
    heatUse: sanitizeForPrompt(profile.heatUse, 10),
    productBudget: sanitizeForPrompt(profile.productBudget, 20),
    productScope: sanitizeForPrompt(profile.productScope, 20),
    scalpConcerns: Array.isArray(profile.scalpConcerns)
      ? profile.scalpConcerns.map(s => sanitizeForPrompt(s, 50)).slice(0, 5)
      : [],
    failedAttempts: Array.isArray(profile.failedAttempts)
      ? profile.failedAttempts.map(s => sanitizeForPrompt(s, 50)).slice(0, 10)
      : [],
  };
}
