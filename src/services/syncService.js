const { Product, Transaction, TransactionItem, SyncLog, ComboItem } = require('../models');
const { transaction } = require('../config/database');
const { Sequelize } = require('sequelize');

/**
 * Sync Service
 * Business logic layer for sync operations
 */
class SyncService {
  /**
   * Sync a single transaction
   */
  async syncTransaction(txData, idempotencyKey, operation = 'create') {
    return await transaction(async (t) => {
      // UPSERT transaction
      await Transaction.upsert({
        id: txData.id,
        transaction_number: txData.transaction_number,
        total_amount: txData.total_amount,
        discount_percentage: txData.discount_percentage || null,
        discount_amount: txData.discount_amount || null,
        payment_method: txData.payment_method,
        status: txData.status || 'completed',
        created_at: txData.created_at,
        client_synced_at: new Date(),
      }, { transaction: t });

      // UPSERT transaction items
      if (txData.items && Array.isArray(txData.items)) {
        for (const item of txData.items) {
          await TransactionItem.upsert({
            id: item.id,
            transaction_id: item.transaction_id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
            created_at: item.created_at,
          }, { transaction: t });
        }
      }

      // Log idempotency
      await this.logIdempotency(t, idempotencyKey, 'transaction', txData.id, operation);
    });
  }

  /**
   * Sync multiple transactions in batch
   */
  async syncTransactionsBatch(items) {
    const results = [];

    for (const item of items) {
      const { idempotency_key, transaction: txData, operation } = item;

      try {
        // Check idempotency
        const existing = await SyncLog.findOne({
          where: { idempotency_key },
        });

        if (existing) {
          results.push({ id: txData.id, success: true, message: 'Already synced' });
          continue;
        }

        await this.syncTransaction(txData, idempotency_key, operation || 'create');
        results.push({ id: txData.id, success: true });
      } catch (error) {
        results.push({ id: txData?.id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Sync a single product
   */
  async syncProduct(product, idempotencyKey, operation = 'create') {
    return await transaction(async (t) => {
      if (operation === 'delete') {
        // Soft delete - set is_active to 0
        await Product.update(
          {
            is_active: 0,
            updated_at: new Date(),
            client_synced_at: new Date(),
          },
          {
            where: { id: product.id },
            transaction: t,
          }
        );
      } else {
        // Normalize product_type - ensure it's a valid string, default to 'regular'
        // If combo_items are present, treat as combo even if product_type is missing
        let productType = (product.product_type && typeof product.product_type === 'string' && product.product_type.trim() !== '') 
          ? product.product_type.trim().toLowerCase() 
          : 'regular';
        
        // If combo_items are present but product_type wasn't set to 'combo', fix it
        if (product.combo_items && Array.isArray(product.combo_items) && product.combo_items.length > 0) {
          productType = 'combo';
        }
        
        // Debug logging
        console.log(`[SyncService] Syncing product ${product.id}:`, {
          received_product_type: product.product_type,
          normalized_product_type: productType,
          has_combo_items: product.combo_items && Array.isArray(product.combo_items) && product.combo_items.length > 0,
          combo_items_count: product.combo_items ? product.combo_items.length : 0,
          full_product_data: JSON.stringify(product, null, 2).substring(0, 500), // First 500 chars for debugging
        });
        
        // Find existing product or create new one - explicit approach to ensure product_type is always set
        const existingProduct = await Product.findOne({
          where: { id: product.id },
          transaction: t,
        });
        
        const productData = {
          id: product.id,
          name: product.name,
          description: product.description || null,
          price: product.price,
          category: product.category,
          image_url: product.image_url || null,
          is_active: product.is_active !== undefined ? (product.is_active === 1 || product.is_active === true ? 1 : 0) : 1,
          product_type: productType, // Always use normalized product_type - this is critical!
          created_at: product.created_at,
          updated_at: product.updated_at,
          client_synced_at: new Date(),
        };
        
        if (existingProduct) {
          // Update existing product - explicitly set product_type to ensure it's updated
          const updateResult = await Product.update(productData, {
            where: { id: product.id },
            transaction: t,
          });
          console.log(`[SyncService] Updated product ${product.id}, rows affected: ${updateResult[0]}, product_type set to: ${productType}`);
        } else {
          // Create new product
          const createdProduct = await Product.create(productData, { transaction: t });
          console.log(`[SyncService] Created product ${product.id} with product_type: ${createdProduct.product_type}`);
        }

        // If combo, sync combo items
        if (productType === 'combo' && product.combo_items && Array.isArray(product.combo_items) && product.combo_items.length > 0) {
          // Delete existing combo items
          await ComboItem.destroy({
            where: { combo_id: product.id },
            transaction: t,
          });

          // Insert new combo items
          for (const item of product.combo_items) {
            await ComboItem.create({
              id: item.id,
              combo_id: item.combo_id || product.id, // Use product.id as fallback if combo_id is missing
              product_id: item.product_id,
              quantity: item.quantity || 1,
              created_at: item.created_at || new Date(),
            }, { transaction: t });
          }
        } else if (productType !== 'combo') {
          // If product type is not combo (or changed from combo to regular), delete combo items
          await ComboItem.destroy({
            where: { combo_id: product.id },
            transaction: t,
          });
        }
      }

      // Log idempotency
      await this.logIdempotency(t, idempotencyKey, 'product', product.id, operation);
    });
  }

  /**
   * Sync multiple products in batch
   */
  async syncProductsBatch(items) {
    const results = [];

    for (const item of items) {
      const { idempotency_key, product, operation } = item;

      try {
        // Check idempotency
        const existing = await SyncLog.findOne({
          where: { idempotency_key },
        });

        if (existing) {
          results.push({ id: product.id, success: true, message: 'Already synced' });
          continue;
        }

        await this.syncProduct(product, idempotency_key, operation);
        results.push({ id: product.id, success: true });
      } catch (error) {
        results.push({ id: product?.id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Pull products from server (for client download)
   */
  async pullProducts(since = null) {
    let effectiveSince = null;
    if (since != null && String(since).trim() !== '') {
      const raw = String(since).trim();
      if (raw !== 'undefined' && raw !== 'null') {
        const ms = Date.parse(raw);
        if (Number.isNaN(ms)) {
          const err = new Error('Invalid since parameter; use an ISO 8601 datetime string');
          err.status = 400;
          throw err;
        }
        effectiveSince = new Date(ms);
      }
    }

    const whereClause = effectiveSince
      ? { updated_at: { [Sequelize.Op.gt]: effectiveSince } }
      : {};

    const products = await Product.findAll({
      where: whereClause,
      order: [['updated_at', 'ASC']],
      limit: 1000,
      attributes: [
        'id',
        'name',
        'description',
        'price',
        'category',
        'image_url',
        'is_active',
        'product_type',
        'created_at',
        'updated_at',
      ],
      include: [{
        model: ComboItem,
        as: 'comboItems',
        attributes: ['id', 'combo_id', 'product_id', 'quantity', 'created_at'],
        required: false, // Left join - include products even without combo items
      }],
    });

    // Convert to client format with combo_items array
    return products.map((p) => {
      const productData = p.toJSON();
      
      // Convert is_active from number to boolean
      productData.is_active = productData.is_active === 1;

      // If it's a combo, include combo_items array (even if empty)
      if (productData.product_type === 'combo') {
        if (productData.comboItems && Array.isArray(productData.comboItems)) {
          productData.combo_items = productData.comboItems.map((ci) => ({
            id: ci.id,
            combo_id: ci.combo_id,
            product_id: ci.product_id,
            quantity: ci.quantity,
            created_at: ci.created_at,
          }));
        } else {
          productData.combo_items = []; // Empty array if no combo items
        }
        delete productData.comboItems; // Remove the Sequelize association key
      }

      return productData;
    });
  }

  /**
   * Log idempotency for tracking
   */
  async logIdempotency(transaction, idempotencyKey, entityType, entityId, operation) {
    await SyncLog.create({
      idempotency_key: idempotencyKey,
      entity_type: entityType,
      entity_id: entityId,
      operation: operation,
      processed_at: new Date(),
    }, { transaction });
  }

  /**
   * Check if idempotency key exists
   */
  async checkIdempotency(idempotencyKey) {
    return await SyncLog.findOne({
      where: { idempotency_key: idempotencyKey },
      attributes: ['id', 'entity_type', 'entity_id', 'processed_at'],
    });
  }
}

module.exports = new SyncService();

