/**
 * API Key Authentication Middleware
 * Validates the X-API-Key header against the configured API key
 */
function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    console.warn('Warning: API_KEY not configured in environment');
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      code: 'MISSING_API_KEY',
    });
  }

  if (apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
    });
  }

  next();
}

module.exports = authMiddleware;


