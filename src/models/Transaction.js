const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
  },
  transaction_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'completed',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  client_synced_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  server_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'transactions',
  timestamps: false,
  indexes: [
    { fields: ['transaction_number'], unique: true },
    { fields: ['created_at'] },
    { fields: ['status'] },
    { fields: ['client_synced_at'] },
  ],
});

module.exports = Transaction;

