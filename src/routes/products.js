const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', productController.createProduct.bind(productController));

/**
 * GET /api/products
 * List all products with optional filtering (category, is_active, product_type, search, pagination)
 */
router.get('/', productController.listProducts.bind(productController));

/**
 * GET /api/products/categories
 * Get all available categories from products table
 */
router.get('/categories', productController.getCategories.bind(productController));

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', productController.getProductById.bind(productController));

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', productController.updateProduct.bind(productController));

/**
 * DELETE /api/products/:id
 * Delete a product (soft delete - sets is_active to 0)
 */
router.delete('/:id', productController.deleteProduct.bind(productController));

module.exports = router;

