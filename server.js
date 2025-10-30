// server.js  (ESM version)
// Works when package.json has  "type": "module"

import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Convert Labs proxy (ESM) is running fine!");
});

app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing AZUMIO_API_KEY" });

    const resizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toBuffer();

    const form = new FormData();
    form.append("media", resizedBuffer, {
      filename: req.file.originalname || "meal.jpg",
      contentType: "image/jpeg",
    });

    const endpoint = `https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=${apiKey}`;
    const response = await axios.post(endpoint, form, { headers: form.getHeaders(), timeout: 30000 });

    // Parse top results only
let items = response.data?.results?.[0]?.items || [];

// Sort by confidence score if available
items = items.sort((a, b) => (b.score || 0) - (a.score || 0));

// Keep only the top 3 likely items
items = items.slice(0, 3);

// Normalize names to remove duplicates
const seen = new Set();
items = items.filter(i => {
  const name = (i.name || "").toLowerCase();
  if (seen.has(name)) return false;
  seen.add(name);
  return true;
});

const parsedItems = items.map(i => ({
  name: i.name || "Food",
  calories: Number(i.nutrition?.calories || 0),
  protein: Number(i.nutrition?.protein || 0),
  carbs: Number(i.nutrition?.totalCarbs || 0),
  fat: Number(i.nutrition?.totalFat || 0),
}));

// Sum nutrition
let totalCalories = parsedItems.reduce((a, b) => a + b.calories, 0);
let totalProtein = parsedItems.reduce((a, b) => a + b.protein, 0);
let totalCarbs = parsedItems.reduce((a, b) => a + b.carbs, 0);
let totalFat = parsedItems.reduce((a, b) => a + b.fat, 0);

// sanity correction
const ABSURD = 40000;
const TARGET = 900;
let adjusted = false;
if (totalCalories > ABSURD || totalCalories === 0) {
  const factor = TARGET / (totalCalories || 1);
  totalCalories *= factor;
  totalProtein *= factor;
  totalCarbs *= factor;
  totalFat *= factor;
  adjusted = true;
}

res.json({
  calories: Math.round(totalCalories),
  protein: Math.round(totalProtein),
  carbs: Math.round(totalCarbs),
  fat: Math.round(totalFat),
  adjusted,
  breakdown: parsedItems,
});

    res.json({
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      adjusted,
      breakdown: parsedItems,
    });
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({ error: "Internal error", details: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Convert Labs proxy running on port ${port}`));
