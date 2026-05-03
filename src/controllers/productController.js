const productService = require('../services/productService');

/**
 * Product Controller
 * Handles HTTP requests and responses for product management operations
 */
class ProductController {
  /**
   * POST /api/products
   * Create a new product
   */
  async createProduct(req, res, next) {
    try {
      const productData = req.body;

      // Validate required fields
      if (!productData.name || !productData.price || !productData.category) {
        return res.status(400).json({
          success: false,
          message: 'Name, price, and category are required',
        });
      }

      // Validate price is a number
      if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number',
        });
      }

      const product = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('required') || error.message.includes('does not exist')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while creating product',
      });
    }
  }

  /**
   * GET /api/products
   * List all products with optional filtering
   */
  async listProducts(req, res, next) {
    try {
      const {
        category,
        is_active,
        product_type,
        page = 1,
        limit = 50,
        search,
      } = req.query;

      const options = {
        category: category || null,
        is_active: is_active !== undefined ? (is_active === 'true' || is_active === '1') : null,
        product_type: product_type || null,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        search: search || null,
      };

      const result = await productService.listProducts(options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error listing products:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching products',
      });
    }
  }

  /**
   * GET /api/products/:id
   * Get a single product by ID
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while fetching product',
      });
    }
  }

  /**
   * PUT /api/products/:id
   * Update a product
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;

      // Validate price if provided
      if (productData.price !== undefined) {
        if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) < 0) {
          return res.status(400).json({
            success: false,
            message: 'Price must be a valid positive number',
          });
        }
      }

      const product = await productService.updateProduct(id, productData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('does not exist')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while updating product',
      });
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete a product (soft delete)
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const result = await productService.deleteProduct(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while deleting product',
      });
    }
  }

  /**
   * GET /api/products/categories
   * Get all available categories from products table
   */
  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();

      res.json({
        success: true,
        data: {
          categories,
          count: categories.length,
        },
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching categories',
      });
    }
  }
}

module.exports = new ProductController();

