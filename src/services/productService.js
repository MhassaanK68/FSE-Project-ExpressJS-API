const { Product, ComboItem } = require('../models');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { v4: uuidv4 } = require('uuid');
const { transaction } = require('../config/database');

/**
 * Product Service
 * Business logic layer for product management operations
 */
class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData) {
    return await transaction(async (t) => {
      const now = new Date();
      const productId = productData.id || uuidv4();

      // Normalize product_type
      let productType = (productData.product_type && typeof productData.product_type === 'string' && productData.product_type.trim() !== '')
        ? productData.product_type.trim().toLowerCase()
        : 'regular';

      // If combo_items are present, treat as combo
      if (productData.combo_items && Array.isArray(productData.combo_items) && productData.combo_items.length > 0) {
        productType = 'combo';
      }

      // Validate required fields
      if (!productData.name || !productData.price || !productData.category) {
        throw new Error('Name, price, and category are required');
      }

      // Check if product with this ID already exists
      const existingProduct = await Product.findOne({
        where: { id: productId },
        transaction: t,
      });

      if (existingProduct) {
        throw new Error(`Product with ID ${productId} already exists`);
      }

      // Create product
      const product = await Product.create({
        id: productId,
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        category: productData.category,
        image_url: productData.image_url || null,
        is_active: productData.is_active !== undefined ? (productData.is_active === 1 || productData.is_active === true ? 1 : 0) : 1,
        product_type: productType,
        created_at: productData.created_at || now,
        updated_at: now,
        server_created_at: now,
      }, { transaction: t });

      // If combo, create combo items
      if (productType === 'combo' && productData.combo_items && Array.isArray(productData.combo_items) && productData.combo_items.length > 0) {
        for (const item of productData.combo_items) {
          const comboItemId = item.id || uuidv4();
          
          // Validate that the referenced product exists
          const referencedProduct = await Product.findOne({
            where: { id: item.product_id },
            transaction: t,
          });

          if (!referencedProduct) {
            throw new Error(`Referenced product with ID ${item.product_id} does not exist`);
          }

          await ComboItem.create({
            id: comboItemId,
            combo_id: productId,
            product_id: item.product_id,
            quantity: item.quantity || 1,
            created_at: item.created_at || now,
          }, { transaction: t });
        }
      }

      // Fetch the created product with combo items
      const createdProduct = await Product.findOne({
        where: { id: productId },
        include: [{
          model: ComboItem,
          as: 'comboItems',
          attributes: ['id', 'combo_id', 'product_id', 'quantity', 'created_at'],
          required: false,
        }],
        transaction: t,
      });

      return this.formatProductForResponse(createdProduct);
    });
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId) {
    const product = await Product.findOne({
      where: { id: productId },
      include: [{
        model: ComboItem,
        as: 'comboItems',
        attributes: ['id', 'combo_id', 'product_id', 'quantity', 'created_at'],
        required: false,
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'category'],
          required: false,
        }],
      }],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return this.formatProductForResponse(product);
  }

  /**
   * List all products with optional filtering
   */
  async listProducts(options = {}) {
    const {
      category = null,
      is_active = null,
      product_type = null,
      page = 1,
      limit = 50,
      search = null,
    } = options;

    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (is_active !== null) {
      whereClause.is_active = is_active === true || is_active === 1 || is_active === '1' ? 1 : 0;
    }

    if (product_type) {
      whereClause.product_type = product_type.toLowerCase();
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{
        model: ComboItem,
        as: 'comboItems',
        attributes: ['id', 'combo_id', 'product_id', 'quantity', 'created_at'],
        required: false,
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'category'],
          required: false,
        }],
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      products: rows.map(p => this.formatProductForResponse(p)),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Update a product
   */
  async updateProduct(productId, productData) {
    return await transaction(async (t) => {
      const now = new Date();

      // Check if product exists
      const existingProduct = await Product.findOne({
        where: { id: productId },
        transaction: t,
      });

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Normalize product_type
      let productType = existingProduct.product_type;
      if (productData.product_type !== undefined) {
        productType = (productData.product_type && typeof productData.product_type === 'string' && productData.product_type.trim() !== '')
          ? productData.product_type.trim().toLowerCase()
          : 'regular';
      }

      // If combo_items are present, treat as combo
      if (productData.combo_items && Array.isArray(productData.combo_items) && productData.combo_items.length > 0) {
        productType = 'combo';
      }

      // Prepare update data
      const updateData = {
        updated_at: now,
      };

      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.description !== undefined) updateData.description = productData.description || null;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.image_url !== undefined) updateData.image_url = productData.image_url || null;
      if (productData.is_active !== undefined) {
        updateData.is_active = productData.is_active === 1 || productData.is_active === true ? 1 : 0;
      }
      if (productData.product_type !== undefined) updateData.product_type = productType;

      // Update product
      await Product.update(updateData, {
        where: { id: productId },
        transaction: t,
      });

      // Handle combo items if product type is combo
      if (productType === 'combo' && productData.combo_items !== undefined) {
        // Delete existing combo items
        await ComboItem.destroy({
          where: { combo_id: productId },
          transaction: t,
        });

        // Create new combo items
        if (Array.isArray(productData.combo_items) && productData.combo_items.length > 0) {
          for (const item of productData.combo_items) {
            const comboItemId = item.id || uuidv4();

            // Validate that the referenced product exists
            const referencedProduct = await Product.findOne({
              where: { id: item.product_id },
              transaction: t,
            });

            if (!referencedProduct) {
              throw new Error(`Referenced product with ID ${item.product_id} does not exist`);
            }

            await ComboItem.create({
              id: comboItemId,
              combo_id: productId,
              product_id: item.product_id,
              quantity: item.quantity || 1,
              created_at: item.created_at || now,
            }, { transaction: t });
          }
        }
      } else if (productType !== 'combo') {
        // If product type is not combo, delete combo items
        await ComboItem.destroy({
          where: { combo_id: productId },
          transaction: t,
        });
      }

      // Fetch updated product
      const updatedProduct = await Product.findOne({
        where: { id: productId },
        include: [{
          model: ComboItem,
          as: 'comboItems',
          attributes: ['id', 'combo_id', 'product_id', 'quantity', 'created_at'],
          required: false,
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'category'],
            required: false,
          }],
        }],
        transaction: t,
      });

      return this.formatProductForResponse(updatedProduct);
    });
  }

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(productId) {
    return await transaction(async (t) => {
      const product = await Product.findOne({
        where: { id: productId },
        transaction: t,
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Soft delete - set is_active to 0
      await Product.update(
        {
          is_active: 0,
          updated_at: new Date(),
        },
        {
          where: { id: productId },
          transaction: t,
        }
      );

      return { success: true, message: 'Product deleted successfully' };
    });
  }

  /**
   * Format product for API response
   */
  formatProductForResponse(product) {
    const productData = product.toJSON();

    // Convert is_active from number to boolean
    productData.is_active = productData.is_active === 1;

    // Format price as string
    productData.price = productData.price.toString();

    // If it's a combo, include combo_items array
    if (productData.product_type === 'combo' && productData.comboItems) {
      productData.combo_items = productData.comboItems.map((ci) => ({
        id: ci.id,
        combo_id: ci.combo_id,
        product_id: ci.product_id,
        quantity: ci.quantity,
        created_at: ci.created_at,
        product: ci.product ? {
          id: ci.product.id,
          name: ci.product.name,
          price: ci.product.price.toString(),
          category: ci.product.category,
        } : null,
      }));
      delete productData.comboItems;
    } else {
      productData.combo_items = [];
    }

    return productData;
  }

  /**
   * Get all unique categories from products table
   */
  async getCategories() {
    // Get all active products with category field
    const products = await Product.findAll({
      attributes: ['category'],
      where: {
        is_active: 1, // Only get categories from active products
      },
      raw: true,
    });

    // Extract unique categories, filter out null/empty values, and sort them
    const uniqueCategories = [...new Set(
      products
        .map(p => p.category)
        .filter(category => category !== null && category !== undefined && category.trim() !== '')
    )].sort();

    return uniqueCategories;
  }
}

module.exports = new ProductService();

