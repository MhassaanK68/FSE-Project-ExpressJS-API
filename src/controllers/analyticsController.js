const analyticsService = require('../services/analyticsService');

/**
 * Analytics Controller
 * Handles HTTP requests and responses for analytics operations
 */
class AnalyticsController {
  /**
   * GET /api/analytics/transactions/filter
   * Get transactions filtered by period
   */
  async getTransactionsByPeriod(req, res, next) {
    try {
      const { period = 'today' } = req.query;

      // Validate period
      const validPeriods = ['today', '7days', '30days'];
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      
      if (!validPeriods.includes(period) && !datePattern.test(period)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Use: today, 7days, 30days, or specific date (YYYY-MM-DD)',
        });
      }

      const data = await analyticsService.getTransactionsByPeriod(period);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error fetching transactions by period:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching transactions',
      });
    }
  }

  /**
   * GET /api/analytics/transactions/date-range
   * Get transactions by date range
   */
  async getTransactionsByDateRange(req, res, next) {
    try {
      const { from_date, to_date } = req.query;

      // Validate required parameters
      if (!from_date || !to_date) {
        return res.status(400).json({
          success: false,
          message: 'Both from_date and to_date are required (format: YYYY-MM-DD)',
        });
      }

      // Validate date format
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(from_date) || !datePattern.test(to_date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD format for both from_date and to_date',
        });
      }

      const data = await analyticsService.getTransactionsByDateRange(from_date, to_date);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      
      if (error.message === 'from_date cannot be after to_date') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      
      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while fetching transactions',
      });
    }
  }

  /**
   * GET /api/analytics/stats
   * Get general statistics (today's orders, today's sales, total orders)
   */
  async getStatistics(req, res, next) {
    try {
      const data = await analyticsService.getStatistics();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching statistics',
      });
    }
  }
}

module.exports = new AnalyticsController();

