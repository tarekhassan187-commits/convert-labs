// ==========================================
// server.js - Convert Labs Calorie Proxy (Final Fixed Version)
// ==========================================
import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Convert Labs Calorie Proxy is running successfully!");
});

// ✅ Main API endpoint
app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing AZUMIO_API_KEY");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // ✅ Prepare multipart data
    const formData = new FormData();
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname || "meal.jpg",
      contentType: req.file.mimetype,
    });

    // ✅ Correct Azumio endpoint for API key authentication
    const response = await fetch("https://api.azumio.com/v1/foodrecognition/analyze", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
      },
      body: formData,
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("❌ Azumio API Error:", response.status, text);
      return res.status(response.status).json({ error: "Azumio API error", details: text });
    }

    // ✅ Parse JSON safely
    let data = {};
    try { data = JSON.parse(text); } catch (err) {
      console.error("⚠️ Could not parse JSON:", text);
    }

    console.log("✅ Azumio Response:", data);

    res.json({
      calories: data?.summary?.totalCalories || data?.totalCalories || 0,
      description: data?.foods?.map(f => f.name).join(", ") || "meal"
    });

  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Proxy running on port ${port}`));
