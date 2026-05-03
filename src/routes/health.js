const express = require('express');
const { testConnection } = require('../config/database');

const router = express.Router();

/**
 * GET /health
 * Health check endpoint - used by clients to verify server connectivity
 */
router.get('/', async (req, res) => {
  const dbHealthy = await testConnection();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      api: 'up',
      database: dbHealthy ? 'up' : 'down',
    },
  });
});

module.exports = router;


