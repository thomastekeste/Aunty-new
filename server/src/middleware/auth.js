const { getUserClient } = require('../services/supabase');

function respond(res, success, data, error, status = 200) {
  return res.status(status).json({ success, data: data || null, error: error || null });
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return respond(res, false, null, 'Missing authorization token', 401);
  }

  const jwt = authHeader.replace('Bearer ', '');
  const client = getUserClient(jwt);

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    return respond(res, false, null, 'Invalid or expired token', 401);
  }

  req.user = user;
  req.jwt = jwt;
  req.supabase = client;
  next();
}

function requireAdmin(req, res, next) {
  const { adminPassword } = require('../config');
  const provided = req.headers['x-admin-password'] || req.query.password;
  if (provided !== adminPassword) {
    return res.status(401).send('Unauthorized');
  }
  next();
}

module.exports = { requireAuth, requireAdmin, respond };
