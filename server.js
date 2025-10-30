// ==========================================
// Convert Labs Calorie Proxy v3
// Now returns full macro breakdown + auto-correction
// ==========================================

import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("✅ Convert Labs smart calorie proxy with macro breakdown is running!");
});

app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing AZUMIO_API_KEY" });

    // Resize uploaded image to reasonable size
    const resizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();

    const formData = new FormData();
    formData.append("media", resizedBuffer, {
      filename: req.file.originalname || "meal.jpg",
      contentType: "image/jpeg",
    });

    const endpoint = `https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("❌ Azumio API Error:", response.status, text);
      return res.status(response.status).json({ error: "Azumio API error", details: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Invalid JSON from API" });
    }

    const items = data?.results?.[0]?.items || [];
    if (items.length === 0) {
      return res.json({ calories: 0, description: "No recognizable food detected" });
    }

    // --- Extract macro data per item ---
    const parsedItems = items.map((item) => {
      const n = item.nutrition || {};
      return {
        name: item.name || "food",
        calories: Number(n.calories || 0),
        protein: Number(n.protein || 0),
        carbs: Number(n.totalCarbs || 0),
        fat: Number(n.totalFat || 0),
      };
    });

    // --- Totals ---
    let totalCalories = parsedItems.reduce((a, b) => a + b.calories, 0);
    let totalProtein = parsedItems.reduce((a, b) => a + b.protein, 0);
    let totalCarbs = parsedItems.reduce((a, b) => a + b.carbs, 0);
    let totalFat = parsedItems.reduce((a, b) => a + b.fat, 0);

    // --- Sanity correction for unrealistic totals ---
    const ABSOLUTE_HIGH = 4000;
    const TARGET_TOP = 800;
    let wasAdjusted = false;

    if (totalCalories > ABSOLUTE_HIGH) {
      const scaleFactor = TARGET_TOP / totalCalories;
      totalCalories = Math.round(totalCalories * scaleFactor);
      totalProtein = Math.round(totalProtein * scaleFactor);
      totalCarbs = Math.round(totalCarbs * scaleFactor);
      totalFat = Math.round(totalFat * scaleFactor);
      wasAdjusted = true;
    }

    if (totalCalories < 120) {
      totalCalories = 150;
      wasAdjusted = true;
    }

    res.json({
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      adjusted: wasAdjusted,
      breakdown: parsedItems,
    });
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).json({ error: "Internal error", details: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Convert Labs macro proxy running on port ${port}`));
