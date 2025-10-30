// ==========================================
// server.js - Convert Labs Calorie Proxy (Official Calorie Mama API)
// ==========================================
import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Convert Labs Calorie Proxy is live and using Calorie Mama API!");
});

app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing AZUMIO_API_KEY in environment" });
    }

    const endpoint = `https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=${apiKey}`;

    // ✅ Send as multipart form with key "media"
    const formData = new FormData();
    formData.append("media", req.file.buffer, {
      filename: req.file.originalname || "meal.jpg",
      contentType: req.file.mimetype,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("❌ Azumio API Error:", response.status, text);
      return res.status(response.status).json({ error: "Azumio API error", details: text });
    }

    let data = {};
    try { data = JSON.parse(text); } catch (err) {
      console.warn("⚠️ Could not parse JSON:", text);
    }

    console.log("✅ Calorie Mama API Response:", data);

    // ✅ Parse simplified summary
    const food = data.results?.[0]?.items?.[0];
    const calories = food?.nutrition?.calories || 0;
    const name = food?.name || "meal";

    res.json({
      calories,
      description: name,
    });

  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Proxy running on port ${port}`));
