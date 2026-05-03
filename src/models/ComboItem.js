const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ComboItem = sequelize.define('ComboItem', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
  },
  combo_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  product_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'combo_items',
  timestamps: false, // We manage timestamps manually
  indexes: [
    { fields: ['combo_id'] },
    { fields: ['product_id'] },
    { fields: ['combo_id', 'product_id'], unique: true },
  ],
});

module.exports = ComboItem;

