const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
  },
  product_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'regular',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
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
  tableName: 'products',
  timestamps: false, // We manage timestamps manually
  indexes: [
    { fields: ['category'] },
    { fields: ['is_active'] },
    { fields: ['product_type'] },
    { fields: ['updated_at'] },
    { fields: ['client_synced_at'] },
  ],
});

module.exports = Product;

