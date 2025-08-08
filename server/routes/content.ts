import { RequestHandler } from "express";
import { db } from "../database/memory-db";
import {
  ContentResponse,
  CreateContentRequest,
  UpdateContentRequest,
} from "@shared/database";

// GET /api/content - Get all content
export const getContent: RequestHandler = (req, res) => {
  try {
    const { section, key } = req.query;

    let content = db.getAllContent();

    // Filter by section if provided
    if (section && typeof section === "string") {
      content = db.getContentBySection(section);
    }

    // Filter by key if provided
    if (key && typeof key === "string") {
      const singleContent = db.getContentByKey(key);
      content = singleContent ? [singleContent] : [];
    }

    const response: ContentResponse = {
      content,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/content/:id - Get content by ID
export const getContentById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const content = db.getAllContent().find((c) => c.id === id);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/content/key/:key - Get content by key
export const getContentByKey: RequestHandler = (req, res) => {
  try {
    const { key } = req.params;
    const content = db.getContentByKey(key);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(content);
  } catch (error) {
    console.error("Error fetching content by key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/content/section/:section - Get content by section
export const getContentBySection: RequestHandler = (req, res) => {
  try {
    const { section } = req.params;
    const content = db.getContentBySection(section);

    res.json({
      content,
      section,
      total: content.length,
    });
  } catch (error) {
    console.error("Error fetching content by section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/content - Create new content (admin only)
export const createContent: RequestHandler = (req, res) => {
  try {
    const contentData: CreateContentRequest = req.body;

    // Validate required fields
    if (!contentData.key) {
      return res.status(400).json({ error: "Content key is required" });
    }

    if (!contentData.value?.en || !contentData.value?.vi) {
      return res
        .status(400)
        .json({ error: "Content value in both languages is required" });
    }

    if (!contentData.section) {
      return res.status(400).json({ error: "Content section is required" });
    }

    // Check if key already exists
    const existingContent = db.getContentByKey(contentData.key);
    if (existingContent) {
      return res.status(400).json({ error: "Content key already exists" });
    }

    // Create content with defaults
    const newContent = db.createContent({
      ...contentData,
      type: contentData.type || "text",
    });

    res.status(201).json(newContent);
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/content/:id - Update content (admin only)
export const updateContent: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<UpdateContentRequest> = req.body;

    // If updating key, check for conflicts
    if (updates.key) {
      const existingContent = db.getContentByKey(updates.key);
      if (existingContent && existingContent.id !== id) {
        return res.status(400).json({ error: "Content key already exists" });
      }
    }

    const updatedContent = db.updateContent(id, updates);

    if (!updatedContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(updatedContent);
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/content/:id - Delete content (admin only)
export const deleteContent: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteContent(id);

    if (!deleted) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/newsletter/subscribe - Subscribe to newsletter
export const subscribeNewsletter: RequestHandler = (req, res) => {
  try {
    const { email, language = "en" } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (!["en", "vi"].includes(language)) {
      return res.status(400).json({ error: 'Language must be "en" or "vi"' });
    }

    const subscription = db.subscribeNewsletter(email, language);

    res.status(201).json({
      message: "Successfully subscribed to newsletter",
      subscription: {
        id: subscription.id,
        email: subscription.email,
        language: subscription.language,
      },
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
