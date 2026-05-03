const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

/**
 * GET /api/analytics/transactions/filter
 * Get transactions filtered by period (today, 7days, 30days, or specific date YYYY-MM-DD)
 */
router.get('/transactions/filter', analyticsController.getTransactionsByPeriod.bind(analyticsController));

/**
 * GET /api/analytics/transactions/date-range
 * Get transactions by custom date range
 */
router.get('/transactions/date-range', analyticsController.getTransactionsByDateRange.bind(analyticsController));

/**
 * GET /api/analytics/stats
 * Get general statistics (today's orders, today's sales, total orders)
 */
router.get('/stats', analyticsController.getStatistics.bind(analyticsController));

module.exports = router;

