const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SyncLog = sequelize.define('SyncLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  idempotency_key: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true,
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  operation: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'sync_log',
  timestamps: false,
  indexes: [
    { fields: ['idempotency_key'], unique: true },
    { fields: ['entity_type', 'entity_id'] },
    { fields: ['processed_at'] },
  ],
});

module.exports = SyncLog;

