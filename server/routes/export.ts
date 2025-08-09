import { RequestHandler } from "express";
import { db } from "../database/sqlite-db";

// GET /api/export - Export all data (admin only)
export const exportData: RequestHandler = async (req, res) => {
  try {
    const exportData = await db.exportAllData();

    // Set headers for file download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="minhphat-data-export.json"',
    );

    res.json(exportData);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
};
