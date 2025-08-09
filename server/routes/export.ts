import { RequestHandler } from "express";
import { db } from "../database/memory-db";

// GET /api/export - Export all data (admin only)
export const exportData: RequestHandler = (req, res) => {
  try {
    const exportData = db.exportAllData();
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="minhphat-data-export.json"');
    
    res.json(exportData);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
};
