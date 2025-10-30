// ==========================================
// Convert Labs Calorie Proxy (Final Fixed Version)
// ==========================================
import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data"; // ✅ use node form-data explicitly
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ Convert Labs Calorie Proxy is live and using Calorie Mama API!");
});

// ✅ Calorie endpoint
app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing AZUMIO_API_KEY environment variable" });
    }

    // ✅ Azumio official endpoint
    const endpoint = `https://api-2445582032290.production.gw.apicast.io/v1/foodrecognition?user_key=${apiKey}`;

    // ✅ Use form-data library (not native) and append Buffer directly
    const formData = new FormData();
    formData.append("media", Buffer.from(req.file.buffer), {
      filename: req.file.originalname || "meal.jpg",
      contentType: req.file.mimetype || "image/jpeg"
    });

    // ✅ POST request
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
    try { data = JSON.parse(text); } catch { console.warn("⚠️ Could not parse JSON:", text); }

    const items = data.results?.[0]?.items || [];
    let totalCalories = 0;
    const descriptions = [];

    for (const item of items) {
      const cal = item?.nutrition?.calories || 0;
      const name = item?.name || "food";
      totalCalories += cal;
      descriptions.push(name);
    }

    res.json({
      calories: Math.round(totalCalories),
      description: descriptions.join(", ") || "meal"
    });

  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Proxy running on port ${port}`));
