const express = require('express');
const { idempotencyMiddleware } = require('../middleware/idempotency');
const syncController = require('../controllers/syncController');

const router = express.Router();

/**
 * POST /api/sync/transaction
 * Sync a single transaction from client to server
 * Uses idempotency key to prevent duplicate processing
 */
router.post('/transaction', idempotencyMiddleware, syncController.syncTransaction.bind(syncController));

/**
 * POST /api/sync/transactions/batch
 * Sync multiple transactions at once
 */
router.post('/transactions/batch', syncController.syncTransactionsBatch.bind(syncController));

/**
 * POST /api/sync/products/batch
 * Sync multiple products at once (create/update/delete)
 */
router.post('/products/batch', syncController.syncProductsBatch.bind(syncController));

/**
 * GET /api/sync/products/pull
 * Download products from server (for bidirectional sync)
 * Query param: since - ISO timestamp to get products updated after this time
 */
router.get('/products/pull', syncController.pullProducts.bind(syncController));

/**
 * POST /api/sync/product
 * Sync a single product
 */
router.post('/product', idempotencyMiddleware, syncController.syncProduct.bind(syncController));

module.exports = router;


