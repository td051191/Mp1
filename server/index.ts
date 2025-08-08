import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Import new database API routes
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} from "./routes/products";

import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from "./routes/categories";

import {
  getContent,
  getContentById,
  getContentByKey,
  getContentBySection,
  createContent,
  updateContent,
  deleteContent,
  subscribeNewsletter
} from "./routes/content";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Legacy API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Products API routes (specific routes before parameterized ones)
  app.get("/api/products/category/:categoryId", getProductsByCategory);
  app.get("/api/products", getProducts);
  app.get("/api/products/:id", getProductById);
  app.post("/api/products", createProduct);
  app.put("/api/products/:id", updateProduct);
  app.delete("/api/products/:id", deleteProduct);

  // Categories API routes (specific routes before parameterized ones)
  app.get("/api/categories/slug/:slug", getCategoryBySlug);
  app.get("/api/categories", getCategories);
  app.get("/api/categories/:id", getCategoryById);
  app.post("/api/categories", createCategory);
  app.put("/api/categories/:id", updateCategory);
  app.delete("/api/categories/:id", deleteCategory);

  // Content API routes (specific routes before parameterized ones)
  app.get("/api/content/key/:key", getContentByKey);
  app.get("/api/content/section/:section", getContentBySection);
  app.get("/api/content", getContent);
  app.get("/api/content/:id", getContentById);
  app.post("/api/content", createContent);
  app.put("/api/content/:id", updateContent);
  app.delete("/api/content/:id", deleteContent);

  // Newsletter API
  app.post("/api/newsletter/subscribe", subscribeNewsletter);

  return app;
}
