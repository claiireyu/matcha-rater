import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: "10mb" }));

// Database configuration with proper environment variable handling
const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "matcha",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // Use standard PostgreSQL port
};

// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  console.error("Please set DB_PASSWORD in your .env file");
  process.exit(1);
}

const db = new pg.Client(dbConfig);

// Improved database connection with error handling
db.connect()
  .then(() => {
    console.log("Connected to PostgreSQL database successfully");
  })
  .catch((err) => {
    console.error("Failed to connect to PostgreSQL:", err.message);
    console.error("Please check your database configuration and environment variables");
    process.exit(1);
  });

app.post("/post", async (req, res) => {
    console.log("=== RECEIVED POST REQUEST ===");  
    const { imageBase64, rating, comment, analysis, confidence, recommendations, detailedAnalysis } = req.body;
    
    if (!imageBase64 || !imageBase64.startsWith("data:image")) {
        return res.status(400).json({ error: "Invalid image data." });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({ error: "Rating is required." });
    }
    
    try {
        const result = await db.query(
          "INSERT INTO matcha_ratings (image_base64, rating, comment, color_analysis, texture_analysis, froth_analysis, overall_analysis, confidence_score, recommendations, detailed_color_analysis, detailed_texture_analysis, detailed_froth_analysis, detailed_overall_quality, grade_estimate, improvement_tips, detailed_confidence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id, created_at",
          [
            imageBase64, 
            rating, 
            comment || null,
            analysis?.color || null,
            analysis?.texture || null,
            analysis?.froth || null,
            analysis?.overall || null,
            confidence || null,
            recommendations ? JSON.stringify(recommendations) : null,
            detailedAnalysis?.colorAnalysis || null,
            detailedAnalysis?.textureAnalysis || null,
            detailedAnalysis?.frothAnalysis || null,
            detailedAnalysis?.overallQuality || null,
            detailedAnalysis?.gradeEstimate || null,
            detailedAnalysis?.improvementTips ? JSON.stringify(detailedAnalysis.improvementTips) : null,
            detailedAnalysis?.detailedConfidence || null
          ]
        );
        res.status(201).json({
          message: "Image and rating saved successfully.",
          id: result.rows[0].id,
          timestamp: result.rows[0].created_at,
        });
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to save image." });
      }
  });

  app.get("/ratings", async (req, res) => {
    console.log("=== RECEIVED GET REQUEST ==="); 
    try {
      const result = await db.query(
        "SELECT id, image_base64, rating, comment, created_at, color_analysis, texture_analysis, froth_analysis, overall_analysis, confidence_score, recommendations, detailed_color_analysis, detailed_texture_analysis, detailed_froth_analysis, detailed_overall_quality, grade_estimate, improvement_tips, detailed_confidence FROM matcha_ratings ORDER BY created_at DESC LIMIT 20"
      );
      
      const rows = result.rows.map(row => {
        // Safely parse recommendations JSON
        let recommendations = [];
        if (row.recommendations) {
          try {
            recommendations = JSON.parse(row.recommendations);
          } catch (parseError) {
            console.warn(`Failed to parse recommendations for row ${row.id}:`, parseError);
            recommendations = [];
          }
        }

        // Safely parse improvement tips JSON
        let improvementTips = [];
        if (row.improvement_tips) {
          try {
            improvementTips = JSON.parse(row.improvement_tips);
          } catch (parseError) {
            console.warn(`Failed to parse improvement tips for row ${row.id}:`, parseError);
            improvementTips = [];
          }
        }

        return {
          id: row.id,
          image_base64: row.image_base64,
          created_at: row.created_at,
          rating: row.rating,
          comment: row.comment,
          analysis: {
            color: row.color_analysis || null,
            texture: row.texture_analysis || null,
            froth: row.froth_analysis || null,
            overall: row.overall_analysis || null
          },
          confidence: row.confidence_score || null,
          recommendations: recommendations,
          detailedAnalysis: {
            colorAnalysis: row.detailed_color_analysis || null,
            textureAnalysis: row.detailed_texture_analysis || null,
            frothAnalysis: row.detailed_froth_analysis || null,
            overallQuality: row.detailed_overall_quality || null,
            gradeEstimate: row.grade_estimate || null,
            improvementTips: improvementTips,
            confidence: row.detailed_confidence || null
          }
        };
      });

      res.json(rows);
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ error: "Failed to retrieve images." });
    }
  });

  app.delete("/ratings/:id", async (req, res) => {
    console.log("=== RECEIVED DELETE REQUEST ===");
    const { id } = req.params;
    console.log("Attempting to delete rating with ID:", id);
    
    try {
      const result = await db.query(
        "DELETE FROM matcha_ratings WHERE id = $1 RETURNING id",
        [id]
      );
      
      console.log("Delete query result:", result.rows);
      
      if (result.rows.length === 0) {
        console.log("No rating found with ID:", id);
        return res.status(404).json({ error: "Rating not found." });
      }
      
      console.log("Successfully deleted rating with ID:", result.rows[0].id);
      res.json({ message: "Rating deleted successfully." });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete rating." });
    }
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
