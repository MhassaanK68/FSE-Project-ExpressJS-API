require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Import models to initialize associations
require('./models');

// Import routes
const healthRoutes = require('./routes/health');
const syncRoutes = require('./routes/sync');
const analyticsRoutes = require('./routes/analytics');
const productRoutes = require('./routes/products');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Export app for serverless deployment
module.exports = app;

// Start server (only if not in serverless mode)
const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  async function startServer() {
    // Test database connection (non-blocking)
    testConnection().catch(() => {
      // Connection failure is logged in testConnection
      // Server will still start to allow health checks
    });

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  }

  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
