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

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Convert Labs Calorie Proxy is running successfully!");
});

// ✅ Calorie Analysis Route
app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const apiKey = process.env.AZUMIO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not set in environment variables" });
    }

    const response = await fetch("https://api.azumio.com/v2/calories/estimate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/octet-stream"
      },
      body: req.file.buffer
    });

    const result = await response.json();
    res.json(result);

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
