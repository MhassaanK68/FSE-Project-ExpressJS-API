const Product = require('./Product');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');
const SyncLog = require('./SyncLog');
const ComboItem = require('./ComboItem');

// Define associations
Transaction.hasMany(TransactionItem, {
  foreignKey: 'transaction_id',
  as: 'items',
  onDelete: 'CASCADE',
});

TransactionItem.belongsTo(Transaction, {
  foreignKey: 'transaction_id',
  as: 'transaction',
});

// TransactionItem to Product association
TransactionItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// ComboItem associations
Product.hasMany(ComboItem, {
  foreignKey: 'combo_id',
  as: 'comboItems',
  onDelete: 'CASCADE',
});

ComboItem.belongsTo(Product, {
  foreignKey: 'combo_id',
  as: 'combo',
});

ComboItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

module.exports = {
  Product,
  Transaction,
  TransactionItem,
  SyncLog,
  ComboItem,
};

