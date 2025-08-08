import { RequestHandler } from "express";
import { db } from "../database/memory-db";
import {
  CategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@shared/database";

// GET /api/categories - Get all categories
export const getCategories: RequestHandler = (req, res) => {
  try {
    const categories = db.getAllCategories().filter((c) => c.isActive);

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
export const getCategoryById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const category = db.getCategoryById(id);

    if (!category || !category.isActive) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/categories/slug/:slug - Get category by slug
export const getCategoryBySlug: RequestHandler = (req, res) => {
  try {
    const { slug } = req.params;
    const category = db.getCategoryBySlug(slug);

    if (!category || !category.isActive) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Get products count for this category
    const products = db.getProductsByCategory(category.id);
    const categoryWithCount = {
      ...category,
      count: products.filter((p) => p.inStock).length,
    };

    res.json(categoryWithCount);
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/categories - Create new category (admin only)
export const createCategory: RequestHandler = (req, res) => {
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
    const existingCategory = db.getCategoryBySlug(categoryData.slug);
    if (existingCategory) {
      return res.status(400).json({ error: "Category slug already exists" });
    }

    // Create category with defaults
    const newCategory = db.createCategory({
      ...categoryData,
      isActive: true,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/categories/:id - Update category (admin only)
export const updateCategory: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<UpdateCategoryRequest> = req.body;

    // If updating slug, check for conflicts
    if (updates.slug) {
      const existingCategory = db.getCategoryBySlug(updates.slug);
      if (existingCategory && existingCategory.id !== id) {
        return res.status(400).json({ error: "Category slug already exists" });
      }
    }

    const updatedCategory = db.updateCategory(id, updates);

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
export const deleteCategory: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const products = db.getProductsByCategory(id);
    if (products.length > 0) {
      return res.status(400).json({
        error:
          "Cannot delete category with existing products. Move or delete products first.",
      });
    }

    const deleted = db.deleteCategory(id);

    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
