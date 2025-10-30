// ==========================================
// Convert Labs Calorie Proxy (Final Version)
// ==========================================

import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import sharp from "sharp"; // ✅ added for image resizing

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.send("✅ Convert Labs Calorie Proxy is running and connected to Calorie Mama API!");
});

// ==========================================
// 🧠 Main Calorie Analyzer Endpoint
// ==========================================
app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    // --- Basic validation ---
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing AZUMIO_API_KEY environment variable" });
    }

    // --- Resize image automatically if too large ---
    const resizedBuffer = await sharp(req.file.buffer)
      .resize({
        width: 544,
        height: 544,
        fit: "inside", // maintain aspect ratio
        withoutEnlargement: true
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // --- Prepare FormData for Azumio API ---
    const formData = new FormData();
    formData.append("media", resizedBuffer, {
      filename: req.file.originalname || "meal.jpg",
      contentType: "image/jpeg"
    });

    // --- Azumio Calorie Mama API endpoint ---
    const endpoint = `https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=${apiKey}`;

    console.log("📤 Sending image to Calorie Mama API...");

    // --- Send request to Azumio API ---
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("❌ Azumio API Error:", response.status, text);
      return res.status(response.status).json({ error: "Azumio API error", details: text });
    }

    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.warn("⚠️ Could not parse Azumio JSON:", text);
    }

    const items = data.results?.[0]?.items || [];
    if (items.length === 0) {
      return res.json({
        calories: 0,
        description: "No recognizable food detected"
      });
    }

    // --- Aggregate results ---
    let totalCalories = 0;
    const descriptions = [];

    for (const item of items) {
      const cal = item?.nutrition?.calories || 0;
      const name = item?.name || "food";
      totalCalories += cal;
      descriptions.push(name);
    }

    console.log("✅ Successfully analyzed meal. Calories:", totalCalories);

    res.json({
      calories: Math.round(totalCalories),
      description: descriptions.join(", ") || "meal"
    });
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ==========================================
// 🚀 Server Start
// ==========================================
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Convert Labs proxy running on port ${port}`));
