// ==========================================
// server.js - Render proxy for Azumio Calorie API
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

// ✅ Root route for quick health check
app.get("/", (req, res) => {
  res.send("✅ Convert Labs Calorie Proxy is running successfully!");
});

// ✅ Calorie Analysis Proxy Endpoint
app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing AZUMIO_API_KEY in environment variables");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // ✅ Use Azumio endpoint for food recognition
    const response = await fetch("https://api.azumio.com/v2/foodrecognition", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/octet-stream"
      },
      body: req.file.buffer
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Azumio API Error:", response.status, errText);
      return res.status(response.status).json({ error: "Azumio API request failed", details: errText });
    }

    const data = await response.json();
    console.log("✅ Azumio API response received:", data);

    res.json({
      calories: data?.totalCalories || 0,
      description: data?.foodName || "meal"
    });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Proxy server running on port ${port}`));
