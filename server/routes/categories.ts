import { RequestHandler } from "express";
import { db } from "../database/sqlite-db";
import {
  CategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@shared/database";

// GET /api/categories - Get all categories
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await db.getAllCategories();

    const response: CategoriesResponse = {
      categories,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/categories/:id - Get category by ID
export const getCategoryById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.getCategoryById(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/categories/slug/:slug - Get category by slug
export const getCategoryBySlug: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await db.getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Get products in this category
    const products = await db.getProductsByCategory(category.id);

    res.json({
      category,
      products: products.filter((p) => p.inStock),
      productCount: products.length,
    });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/categories - Create new category (admin only)
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const categoryData: CreateCategoryRequest = req.body;

    // Validate required fields
    if (!categoryData.name?.en || !categoryData.name?.vi) {
      return res
        .status(400)
        .json({ error: "Category name in both languages is required" });
    }

    if (!categoryData.slug) {
      return res.status(400).json({ error: "Category slug is required" });
    }

    // Check if slug already exists
    const existingCategory = await db.getCategoryBySlug(categoryData.slug);
    if (existingCategory) {
      return res.status(400).json({ error: "Category slug already exists" });
    }

    // Create category
    const newCategory = await db.createCategory({
      ...categoryData,
      count: 0,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/categories/:id - Update category (admin only)
export const updateCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<UpdateCategoryRequest> = req.body;

    // If updating slug, check for conflicts
    if (updates.slug) {
      const existingCategory = await db.getCategoryBySlug(updates.slug);
      if (existingCategory && existingCategory.id !== id) {
        return res.status(400).json({ error: "Category slug already exists" });
      }
    }

    const updatedCategory = await db.updateCategory(id, updates);

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/categories/:id - Delete category (admin only)
export const deleteCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const products = await db.getProductsByCategory(id);
    if (products.length > 0) {
      return res.status(400).json({
        error:
          "Cannot delete category with products. Move or delete products first.",
      });
    }

    await db.deleteCategory(id);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
