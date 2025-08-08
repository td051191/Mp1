import { RequestHandler } from "express";
import { db } from "../database/memory-db";
import { ProductsResponse, CreateProductRequest, UpdateProductRequest } from "@shared/database";

// GET /api/products - Get all products with optional filtering
export const getProducts: RequestHandler = (req, res) => {
  try {
    const { 
      category, 
      featured, 
      organic, 
      seasonal, 
      page = "1", 
      limit = "12",
      search 
    } = req.query;

    let products = db.getAllProducts();

    // Apply filters
    if (category && typeof category === 'string') {
      products = products.filter(p => p.category === category);
    }

    if (featured === 'true') {
      products = db.getFeaturedProducts(parseInt(limit as string));
    }

    if (organic === 'true') {
      products = products.filter(p => p.isOrganic);
    }

    if (seasonal === 'true') {
      products = products.filter(p => p.isSeasonal);
    }

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.en.toLowerCase().includes(searchLower) ||
        p.name.vi.toLowerCase().includes(searchLower) ||
        p.description.en.toLowerCase().includes(searchLower) ||
        p.description.vi.toLowerCase().includes(searchLower)
      );
    }

    // Filter only in-stock products for public API (skip for admin)
    const isAdminRequest = req.headers['x-admin'] === 'true';
    if (!isAdminRequest) {
      products = products.filter(p => p.inStock);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);

    const response: ProductsResponse = {
      products: paginatedProducts,
      total: products.length,
      page: pageNum,
      limit: limitNum
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/products/:id - Get product by ID
export const getProductById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const product = db.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/products - Create new product (admin only)
export const createProduct: RequestHandler = (req, res) => {
  try {
    const productData: CreateProductRequest = req.body;

    // Validate required fields
    if (!productData.name?.en || !productData.name?.vi) {
      return res.status(400).json({ error: 'Product name in both languages is required' });
    }

    if (!productData.price || productData.price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    if (!productData.category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Create product with defaults
    const newProduct = db.createProduct({
      ...productData,
      rating: 0,
      reviews: 0,
      inStock: true
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/products/:id - Update product (admin only)
export const updateProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<UpdateProductRequest> = req.body;

    const updatedProduct = db.updateProduct(id, updates);

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/products/:id - Delete product (admin only)
export const deleteProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/products/category/:categoryId - Get products by category
export const getProductsByCategory: RequestHandler = (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = db.getProductsByCategory(categoryId);

    res.json({
      products: products.filter(p => p.inStock),
      total: products.length,
      categoryId
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
