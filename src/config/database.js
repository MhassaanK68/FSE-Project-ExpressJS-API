const { Sequelize } = require('sequelize');
// Static require so Vercel/serverless dependency tracing includes the driver;
// Sequelize loads mysql2 dynamically and that import is often omitted from the bundle.
require('mysql2');

// SSL Configuration for cloud databases (TiDB Cloud, AWS RDS, etc.)
const enableSSL = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    dialectOptions: {
      // SSL configuration for secure connections
      ssl: enableSSL ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      } : false,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: false, // We manage timestamps manually
      underscored: false,
    },
  }
);

// Test connection on startup
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✓ MySQL database connected successfully (Sequelize)');
    return true;
  } catch (error) {
    console.error('✗ MySQL connection failed:', error);
    return false;
  }
}

// Legacy query function for backwards compatibility (if needed)
async function query(sql, params = []) {
  const [results] = await sequelize.query(sql, {
    replacements: params,
  });
  return results;
}

// Execute transaction with automatic rollback on error
async function transaction(callback) {
  const t = await sequelize.transaction();
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

module.exports = {
  sequelize,
  query,
  transaction,
  testConnection,
};


