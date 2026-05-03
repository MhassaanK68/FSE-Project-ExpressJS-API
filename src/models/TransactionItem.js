const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransactionItem = sequelize.define('TransactionItem', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
  },
  transaction_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  product_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'transaction_items',
  timestamps: false,
  indexes: [
    { fields: ['transaction_id'] },
    { fields: ['product_id'] },
  ],
});

module.exports = TransactionItem;

