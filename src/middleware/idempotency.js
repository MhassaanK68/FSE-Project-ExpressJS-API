const syncService = require('../services/syncService');

/**
 * Idempotency Middleware
 * Checks if a request with the same idempotency key has already been processed
 * Prevents duplicate processing even with network retries
 */
async function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.body?.idempotency_key;

  if (!idempotencyKey) {
    return res.status(400).json({
      success: false,
      error: 'idempotency_key is required',
      code: 'MISSING_IDEMPOTENCY_KEY',
    });
  }

  try {
    // Check if this idempotency key has been processed
    const existing = await syncService.checkIdempotency(idempotencyKey);

    if (existing) {
      // Already processed - return success (idempotent behavior)
      return res.status(200).json({
        success: true,
        message: 'Already processed',
        idempotent: true,
        processed_at: existing.processed_at,
      });
    }

    // Store idempotency key in request for later use
    req.idempotencyKey = idempotencyKey;
    next();
  } catch (error) {
    console.error('Idempotency check failed:', error);
    next(error);
  }
}

/**
 * Log successful sync operation for idempotency tracking
 * Delegates to syncService
 */
async function logIdempotency(transaction, idempotencyKey, entityType, entityId, operation) {
  await syncService.logIdempotency(transaction, idempotencyKey, entityType, entityId, operation);
}

module.exports = {
  idempotencyMiddleware,
  logIdempotency,
};


