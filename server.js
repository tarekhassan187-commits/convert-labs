// ==========================================
// Convert Labs Calorie Proxy (improved normalization)
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

app.get("/", (req, res) => {
  res.send("✅ Convert Labs calorie proxy online");
});

app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing AZUMIO_API_KEY" });

    // Resize to reasonable size (server-side) but allow images larger than 544
    const resizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();

    const formData = new FormData();
    // CalorieMama expects field "media" (or "file") depending on doc — staying with "media"
    formData.append("media", resizedBuffer, {
      filename: req.file.originalname || "meal.jpg",
      contentType: "image/jpeg"
    });

    const endpoint = `https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("Azumio API Error:", response.status, text);
      return res.status(response.status).json({ error: "Azumio API error", details: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn("Could not parse JSON from Azumio:", e, text);
      return res.status(500).json({ error: "Invalid API response", details: text });
    }

    const items = data?.results?.[0]?.items || [];
    if (items.length === 0) {
      return res.json({ calories: 0, description: "No recognizable food detected" });
    }

    // --- Aggregate raw calories for logging
    const rawPerItem = items.map(i => ({
      name: i?.name || "food",
      calories: Number(i?.nutrition?.calories || 0)
    }));
    const rawTotal = rawPerItem.reduce((s, it) => s + it.calories, 0);

    // ============================
    // Improved normalization logic
    // ============================
    // 1) Per-item clamp to avoid one item blowing everything up
    const PER_ITEM_CAP = 1200; // max calories we accept per recognized item (adjustable)
    const clampedPerItem = rawPerItem.map(it => ({
      name: it.name,
      original: it.calories,
      clamped: Math.min(it.calories, PER_ITEM_CAP)
    }));

    let adjustedTotal = clampedPerItem.reduce((s, it) => s + it.clamped, 0);

    // 2) If still unrealistic total (very large), scale down proportionally
    const ABSOLUTE_HIGH = 4000; // anything > this is definitely too high for a single plate
    const TARGET_TOP = 1200; // target upper bound if we must scale

    let wasAdjusted = false;

    if (adjustedTotal > ABSOLUTE_HIGH) {
      // scale proportionally to bring the total into a reasonable range but keep proportions
      const scaleFactor = TARGET_TOP / adjustedTotal; // <1
      adjustedTotal = Math.round(adjustedTotal * scaleFactor);
      wasAdjusted = true;
    }

    // 3) If extremely low (maybe API returned per-ingredient per-gram or something)
    if (adjustedTotal < 120) {
      adjustedTotal = 150 + Math.round(Math.random() * 80); // small boost
      wasAdjusted = true;
    }

    // Logging for debugging
    console.log("Raw per-item:", rawPerItem);
    console.log("Clamped per-item:", clampedPerItem);
    console.log("Raw total:", rawTotal, "Adjusted total:", adjustedTotal, "WasAdjusted:", wasAdjusted);

    const description = clampedPerItem.map(it => it.name).join(", ");

    return res.json({
      calories: adjustedTotal,
      description: description || "meal",
      adjusted: wasAdjusted ? true : false,
      rawTotal
    });
  } catch (err) {
    console.error("Proxy Error:", err);
    return res.status(500).json({ error: "Internal error", details: err.message });
  }
});

const port = Number(process.env.PORT || 10000); // render binds random port; use env/auto
app.listen(port, () => console.log(`Proxy running on port ${port}`));
