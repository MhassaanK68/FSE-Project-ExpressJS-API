const syncService = require('../services/syncService');

/**
 * Sync Controller
 * Handles HTTP requests and responses for sync operations
 */
class SyncController {
  /**
   * POST /api/sync/transaction
   * Sync a single transaction
   */
  async syncTransaction(req, res, next) {
    try {
      const { transaction: txData, operation } = req.body;
      const idempotencyKey = req.idempotencyKey;

      if (!txData || !txData.id) {
        return res.status(400).json({
          success: false,
          error: 'Transaction data with id is required',
        });
      }

      await syncService.syncTransaction(txData, idempotencyKey, operation || 'create');

      res.status(201).json({
        success: true,
        message: 'Transaction synced',
        id: txData.id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/sync/transactions/batch
   * Sync multiple transactions
   */
  async syncTransactionsBatch(req, res, next) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: 'items array is required',
        });
      }

      const results = await syncService.syncTransactionsBatch(items);

      res.json({
        success: results.every((r) => r.success),
        results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/sync/products/batch
   * Sync multiple products
   */
  async syncProductsBatch(req, res, next) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: 'items array is required',
        });
      }

      const results = await syncService.syncProductsBatch(items);

      res.json({
        success: results.every((r) => r.success),
        results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sync/products/pull
   * Download products from server
   */
  async pullProducts(req, res, next) {
    try {
      const { since } = req.query;
      const products = await syncService.pullProducts(since);

      res.json({
        success: true,
        products,
        count: products.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/sync/product
   * Sync a single product
   */
  async syncProduct(req, res, next) {
    try {
      const { product, operation } = req.body;
      const idempotencyKey = req.idempotencyKey;

      if (!product || !product.id) {
        return res.status(400).json({
          success: false,
          error: 'Product data with id is required',
        });
      }

      await syncService.syncProduct(product, idempotencyKey, operation || 'create');

      res.status(201).json({
        success: true,
        message: 'Product synced',
        id: product.id,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SyncController();

