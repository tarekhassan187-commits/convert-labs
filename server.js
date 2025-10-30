// server.js (CommonJS)
// Convert Labs — Calorie proxy with image resize + macro breakdown + sanity correction

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const FormData = require("form-data");
const axios = require("axios");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health
app.get("/", (req, res) => {
  res.send("✅ Convert Labs calorie proxy (image resize enabled) is running.");
});

// Helper: parse Azumio response into items with macros (defensive)
function parseAzumioItems(apiData) {
  const items = (apiData?.results?.[0]?.items) || [];
  return items.map((it) => {
    const n = it.nutrition || {};
    return {
      name: (it.name || "food").trim(),
      calories: Number(n.calories || 0),
      protein: Number(n.protein || 0),
      carbs: Number(n.totalCarbs || n.carbs || 0),
      fat: Number(n.totalFat || n.fat || 0),
    };
  });
}

// POST /api/calories  (multipart/form-data : image file field name "image")
app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded (field 'image')." });

    const AZUMIO_API_KEY = process.env.AZUMIO_API_KEY;
    if (!AZUMIO_API_KEY) return res.status(500).json({ error: "Missing AZUMIO_API_KEY in environment." });

    // Resize the image to a reasonable max (keeps aspect ratio). Use "inside" to avoid enlarging small images.
    // This avoids rejecting large uploads while keeping reasonable size for the Azumio endpoint.
    const resizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toBuffer();

    // Build outgoing form-data (field name used by Azumio docs: often "media" or "file" or unspecified)
    // The sample curl from Azumio used: -F media=@file
    const form = new FormData();
    form.append("media", resizedBuffer, {
      filename: req.file.originalname || "meal.jpg",
      contentType: "image/jpeg"
    });

    // Azumio endpoint from their docs / example (double-check with your Azumio dashboard)
    // NOTE: if your account uses a different region/endpoint - update this URL accordingly.
    const endpoint = `https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=${AZUMIO_API_KEY}`;

    // Send to Azumio
    const axiosResp = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 30_000
    });

    // Parse returned JSON
    const apiData = axiosResp.data;

    // Build parsed items (calories + macros)
    const parsedItems = parseAzumioItems(apiData);

    // If no items detected
    if (!parsedItems.length) {
      return res.json({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        adjusted: false,
        breakdown: [],
        message: "No recognizable foods detected"
      });
    }

    // Totals
    let totalCalories = parsedItems.reduce((s, it) => s + (it.calories || 0), 0);
    let totalProtein = parsedItems.reduce((s, it) => s + (it.protein || 0), 0);
    let totalCarbs = parsedItems.reduce((s, it) => s + (it.carbs || 0), 0);
    let totalFat = parsedItems.reduce((s, it) => s + (it.fat || 0), 0);

    // --- Sanity correction (optional auto-correct) ---
    // If very large number from API (unrealistic), scale down proportionally.
    // You can tune ABSOLUTE_HIGH and TARGET_TOP as you prefer.
    const ABSOLUTE_HIGH = 40000; // extremely large threshold
    const HIGH_BUT_ALLOW = 4000; // high but somewhat possible for large platters
    const TARGET_TOP = 900; // target when scaling huge values

    let adjusted = false;
    if (totalCalories > ABSOLUTE_HIGH) {
      const factor = TARGET_TOP / totalCalories;
      totalCalories = Math.round(totalCalories * factor);
      totalProtein = Math.round(totalProtein * factor);
      totalCarbs = Math.round(totalCarbs * factor);
      totalFat = Math.round(totalFat * factor);
      adjusted = true;
    } else if (totalCalories > HIGH_BUT_ALLOW) {
      // gentle correction for still-unlikely extremely high values
      const factor = HIGH_BUT_ALLOW / totalCalories;
      totalCalories = Math.round(totalCalories * factor);
      totalProtein = Math.round(totalProtein * factor);
      totalCarbs = Math.round(totalCarbs * factor);
      totalFat = Math.round(totalFat * factor);
      adjusted = true;
    }

    // Prevent zero/too-small unrealistic output; ensure minimum sensible output
    if (totalCalories < 50) {
      totalCalories = Math.max(50, Math.round(totalCalories));
      adjusted = true;
    }

    // Respond with breakdown and totals
    return res.json({
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      adjusted,
      breakdown: parsedItems
    });
  } catch (err) {
    console.error("Proxy Error:", err?.response?.status, err?.response?.data || err.message || err);
    // try to return helpful error to frontend
    const status = err?.response?.status || 500;
    const details = err?.response?.data || err?.message || String(err);
    return res.status(status).json({ error: "Proxy error", details });
  }
});

const PORT = parseInt(process.env.PORT || process.env.PAAS_PORT || "10000", 10);
app.listen(PORT, () => {
  console.log(`🚀 Convert Labs proxy listening on port ${PORT}`);
});
